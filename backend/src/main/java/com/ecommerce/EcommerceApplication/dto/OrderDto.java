package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {
    public Long id;
    public String orderNumber;
    public Long userId;
    public String status;

    public BigDecimal subtotal;
    public BigDecimal shippingFee;
    public BigDecimal taxAmount;
   
    public BigDecimal totalAmount;

    public String shippingAddressJson;
    public String billingAddressJson;
    public String notes;
    public String code;
    public LocalDateTime createdAt;
    public List<OrderItemDto> items;

    public static class OrderItemDto {
        public Long id;
        public Long productId;
        public Long shopId;
        public String productName;
        public String productSku;
        public BigDecimal unitPrice;
        public Integer quantity;
        public BigDecimal totalPrice;
        public String status;
    }
}
