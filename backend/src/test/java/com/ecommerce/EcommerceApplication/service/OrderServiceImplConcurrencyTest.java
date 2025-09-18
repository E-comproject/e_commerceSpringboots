package com.ecommerce.EcommerceApplication.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.context.ActiveProfiles;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.entity.Shop;
import com.ecommerce.EcommerceApplication.repository.CartItemRepository;
import com.ecommerce.EcommerceApplication.repository.CartRepository;
import com.ecommerce.EcommerceApplication.repository.OrderRepository;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.repository.ShopRepository;
import com.ecommerce.EcommerceApplication.service.impl.OrderServiceImpl;

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceImplConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @SpyBean
    private OrderServiceImpl orderServiceImpl;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShopRepository shopRepository;

    @AfterEach
    void tearDown() {
        cartItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        shopRepository.deleteAll();
        Mockito.reset(orderServiceImpl);
    }

    @Test
    void concurrentCheckoutPreventsOversell() throws Exception {
        Shop shop = new Shop();
        shop.setName("Test Shop");
        shop.setSlug("test-shop");
        shop.setSellerUserId(500L);
        shopRepository.save(shop);

        Product product = new Product();
        product.setName("Test Product");
        product.setSlug("test-product");
        product.setSku("SKU-1");
        product.setPrice(new BigDecimal("10.00"));
        product.setStockQuantity(1);
        product.setShopId(shop.getId());
        productRepository.save(product);

        Cart cartA = new Cart(101L);
        cartRepository.save(cartA);
        CartItem itemA = new CartItem(cartA, product, 1, new BigDecimal("10.00"));
        cartItemRepository.save(itemA);

        Cart cartB = new Cart(202L);
        cartRepository.save(cartB);
        CartItem itemB = new CartItem(cartB, product, 1, new BigDecimal("10.00"));
        cartItemRepository.save(itemB);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch proceed = new CountDownLatch(1);
        Mockito.doAnswer(invocation -> {
            ready.countDown();
            boolean released = proceed.await(5, TimeUnit.SECONDS);
            assertTrue(released, "Latch release timed out");
            return invocation.callRealMethod();
        }).when(orderServiceImpl).checkout(Mockito.anyLong(), Mockito.any(CheckoutReq.class));

        Callable<OrderDto> checkoutA = () -> orderService.checkout(cartA.getUserId(), buildRequest());
        Callable<OrderDto> checkoutB = () -> orderService.checkout(cartB.getUserId(), buildRequest());

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<OrderDto> futureA = executor.submit(checkoutA);
            Future<OrderDto> futureB = executor.submit(checkoutB);

            assertTrue(ready.await(5, TimeUnit.SECONDS), "Both threads should reach the lock point");
            proceed.countDown();

            OrderDto resultA = null;
            OrderDto resultB = null;
            Throwable failureA = null;
            Throwable failureB = null;

            try {
                resultA = futureA.get(10, TimeUnit.SECONDS);
            } catch (ExecutionException e) {
                failureA = e.getCause();
            }

            try {
                resultB = futureB.get(10, TimeUnit.SECONDS);
            } catch (ExecutionException e) {
                failureB = e.getCause();
            }

            boolean firstSucceeded = resultA != null;
            boolean secondSucceeded = resultB != null;
            assertTrue(firstSucceeded ^ secondSucceeded, "Exactly one checkout should succeed (first=" + firstSucceeded + ", second=" + secondSucceeded + ")");

            Throwable failure = failureA != null ? failureA : failureB;
            assertTrue(failure instanceof IllegalStateException, "Failure should be due to stock validation");
            assertTrue(failure.getMessage().contains("Insufficient stock"));

            assertEquals(1, orderRepository.count(), "Only one order should be stored");
            Product refreshed = productRepository.findById(product.getId()).orElseThrow();
            assertEquals(0, refreshed.getStockQuantity());

            boolean cartAEmptied = cartItemRepository.findByCartId(cartA.getId()).isEmpty();
            boolean cartBEmptied = cartItemRepository.findByCartId(cartB.getId()).isEmpty();
            assertTrue(cartAEmptied ^ cartBEmptied, "Exactly one cart should be cleared");
        } finally {
            executor.shutdownNow();
            executor.awaitTermination(5, TimeUnit.SECONDS);
        }
    }

    private CheckoutReq buildRequest() {
        CheckoutReq req = new CheckoutReq();
        req.shippingAddressJson = "{\"line1\":\"123 Main\"}";
        req.billingAddressJson = req.shippingAddressJson;
        req.shippingFee = BigDecimal.ZERO;
        req.taxAmount = BigDecimal.ZERO;
        req.discountAmount = BigDecimal.ZERO;
        req.notes = "test";
        return req;
    }
}
