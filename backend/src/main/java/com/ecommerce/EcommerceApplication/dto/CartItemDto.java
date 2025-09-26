package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;

public class CartItemDto {
    public Long id;
    public Long productId;
    public String productName;
    public String productSku;

    public BigDecimal unitPrice;   // = priceSnapshot
    public Integer quantity;
    public BigDecimal lineTotal;   // unitPrice * quantity

    // Variant-related fields
    public Long variantId;
    public String variantSku;
    public String variantTitle;
    public String effectiveSku;    // variantSku if available, otherwise productSku
}
