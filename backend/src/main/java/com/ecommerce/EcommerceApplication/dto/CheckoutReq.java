package com.ecommerce.EcommerceApplication.dto;

import java.math.BigDecimal;

public class CheckoutReq {
    public String shippingAddressJson; // JSON string
    public String billingAddressJson;  // optional
    public String notes;
    public BigDecimal shippingFee;     // optional (default 0)
    public BigDecimal taxAmount;       // optional (default 0)
    public BigDecimal discountAmount;  // optional (default 0)
}
