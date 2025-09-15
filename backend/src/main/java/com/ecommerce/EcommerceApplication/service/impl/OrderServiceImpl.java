package com.ecommerce.EcommerceApplication.service.impl;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

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
        // 1) โหลดตะกร้า
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        if (items.isEmpty()) throw new IllegalStateException("Cart is empty");

        // 2) ตรวจ stock + สถานะสินค้า
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : items) {
            Product p = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + ci.getProductId()));

            if (!"active".equalsIgnoreCase(p.getStatus())) {
                throw new IllegalStateException("Product not available: " + p.getName());
            }
            if (p.getStockQuantity() == null || p.getStockQuantity() < ci.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for: " + p.getName());
            }

            BigDecimal lineTotal = ci.getPriceSnapshot().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem oi = new OrderItem();
           
            oi.setProductName(p.getName());
            oi.setProductSku(p.getSku());
            oi.setUnitPrice(ci.getPriceSnapshot());
            oi.setQuantity(ci.getQuantity());
            oi.setTotalPrice(lineTotal);
            orderItems.add(oi);
        }

        // 3) คำนวณยอดรวม
        BigDecimal shipping = (req.shippingFee == null) ? BigDecimal.ZERO : req.shippingFee;
        BigDecimal tax = (req.taxAmount == null) ? BigDecimal.ZERO : req.taxAmount;
        BigDecimal discount = (req.discountAmount == null) ? BigDecimal.ZERO : req.discountAmount;
        BigDecimal total = subtotal.add(shipping).add(tax).subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        // 4) สร้าง Order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUserId(userId);
        order.setStatus("pending");
        order.setSubtotal(subtotal);
        order.setShippingFee(shipping);
        order.setTaxAmount(tax);
        order.setDiscountAmount(discount);
        order.setTotalAmount(total);
        order.setShippingAddress(req.shippingAddressJson);
        order.setBillingAddress(req.billingAddressJson);
        order.setNotes(req.notes);

        // attach items
        for (OrderItem oi : orderItems) {
            order.addItem(oi); // setOrder(this) ภายใน
        }

        // 5) หัก stock
        for (CartItem ci : items) {
            Product p = productRepository.findById(ci.getProductId()).orElseThrow();
            p.setStockQuantity(p.getStockQuantity() - ci.getQuantity());
            productRepository.save(p);
        }

        // 6) บันทึก Order + เคลียร์ตะกร้า
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

    // ------- helpers -------
    private String generateOrderNumber() {
        // รูปแบบง่าย: YYYYMMDD-รันไทม์-นับสั้น ๆ
        String date = java.time.LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String rand = Integer.toHexString((int)(System.nanoTime() & 0xffff)).toUpperCase();
        return "ORD-" + date + "-" + rand;
    }

    private OrderDto toDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.id = o.getId();
        dto.orderNumber = o.getOrderNumber();
        dto.userId = o.getUserId();
        dto.status = o.getStatus();
        dto.subtotal = o.getSubtotal();
        dto.shippingFee = o.getShippingFee();
        dto.taxAmount = o.getTaxAmount();
        dto.discountAmount = o.getDiscountAmount();
        dto.totalAmount = o.getTotalAmount();
        dto.shippingAddressJson = o.getShippingAddress();
        dto.billingAddressJson = o.getBillingAddress();
        dto.notes = o.getNotes();
        dto.createdAt = o.getCreatedAt();

        dto.items = o.getItems().stream().map(oi -> {
            OrderDto.OrderItemDto x = new OrderDto.OrderItemDto();
            x.id = oi.getId();
           
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
