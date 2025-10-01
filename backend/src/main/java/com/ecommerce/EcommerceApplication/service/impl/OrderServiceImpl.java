package com.ecommerce.EcommerceApplication.service.impl;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;
import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderItem;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.repository.CartItemRepository;
import com.ecommerce.EcommerceApplication.repository.CartRepository;
import com.ecommerce.EcommerceApplication.repository.OrderItemRepository;
import com.ecommerce.EcommerceApplication.repository.OrderRepository;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.service.OrderService;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public OrderDto checkout(Long userId, CheckoutReq req) {
        if (req.shippingAddressJson == null || req.shippingAddressJson.isBlank()) {
            throw new IllegalArgumentException("shippingAddress is required");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        if (items.isEmpty()) throw new IllegalStateException("Cart is empty");

        Map<Long, Product> lockedProducts = new HashMap<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : items) {
            Product product = lockedProducts.computeIfAbsent(ci.getProductId(), productId ->
                    productRepository.findByIdForUpdate(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId))
            );

            if (!"active".equalsIgnoreCase(product.getStatus())) {
                throw new IllegalStateException("Product not available: " + product.getName());
            }

            Integer stockQuantity = product.getStockQuantity();
            if (stockQuantity == null || stockQuantity < ci.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for: " + product.getName());
            }

            BigDecimal lineTotal = ci.getPriceSnapshot().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem oi = new OrderItem();
            oi.setProductId(product.getId());
            oi.setShopId(product.getShopId());
            oi.setProductName(product.getName());
            oi.setProductSku(product.getSku());
            oi.setUnitPrice(ci.getPriceSnapshot());
            oi.setQuantity(ci.getQuantity());
            oi.setTotalPrice(lineTotal);
            orderItems.add(oi);

            product.setStockQuantity(stockQuantity - ci.getQuantity());
        }

        BigDecimal shipping = nz(req.shippingFee);
        BigDecimal tax = nz(req.taxAmount);
       
       BigDecimal total = subtotal.add(shipping).add(tax);
        if (total.signum() < 0) total = BigDecimal.ZERO;

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
         // กันพลาดให้มีค่าเสมอ แม้มี trigger/PrePersist แล้ว
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        order.setSubtotal(subtotal);
        order.setShippingFee(shipping);
        order.setTaxAmount(tax);
         // <- ฟิลด์นี้แม็ปกับ discount_total แล้วใน Entity
        order.setTotalAmount(total);
        order.setShippingAddress(req.shippingAddressJson);
        order.setBillingAddress(req.billingAddressJson);
        order.setNotes(req.notes);

        for (OrderItem oi : orderItems) {
            order.addItem(oi);
        }

        if (!lockedProducts.isEmpty()) {
            productRepository.saveAll(lockedProducts.values());
        }
        orderRepository.save(order);
        cartItemRepository.deleteByCartId(cart.getId());

        return toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getById(Long orderId) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return toDto(o);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> listByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    @Override
    public OrderDto updateStatus(Long orderId, String newStatus) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        OrderStatus newOrderStatus = OrderStatus.fromString(newStatus);

        if (!o.getStatus().canTransitionTo(newOrderStatus)) {
            throw new IllegalStateException("Invalid status transition: " + o.getStatus() + " -> " + newOrderStatus);
        }

        o.setStatus(newOrderStatus);
        orderRepository.save(o);
        return toDto(o);
    }

    // -------- helpers --------
    private String generateOrderNumber() {
        String date = java.time.LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String rand = Integer.toHexString((int)(System.nanoTime() & 0xffff)).toUpperCase();
        return "ORD-" + date + "-" + rand;
    }

    private BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    private OrderDto toDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.id = o.getId();
        dto.orderNumber = o.getOrderNumber();
        dto.userId = o.getUserId();
        dto.status = o.getStatus().name();
        dto.subtotal = o.getSubtotal();
        dto.shippingFee = o.getShippingFee();
        dto.taxAmount = o.getTaxAmount();
         // อ่านจาก discount_total
        dto.totalAmount = o.getTotalAmount();
        dto.shippingAddressJson = o.getShippingAddress();
        dto.billingAddressJson = o.getBillingAddress();
        dto.notes = o.getNotes();
        dto.createdAt = o.getCreatedAt();
        

        dto.items = o.getItems().stream().map(oi -> {
            OrderDto.OrderItemDto x = new OrderDto.OrderItemDto();
            x.id = oi.getId();
            x.productId = oi.getProductId();
            x.shopId = oi.getShopId();
            x.productName = oi.getProductName();
            x.productSku = oi.getProductSku();
            x.unitPrice = oi.getUnitPrice();
            x.quantity = oi.getQuantity();
            x.totalPrice = oi.getTotalPrice();
            x.status = oi.getStatus();
            return x;
        }).toList();

        return dto;
    }
}
