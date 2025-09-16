package com.ecommerce.EcommerceApplication.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PaymentCreateRequest(
    @NotNull Long orderId,
    @NotBlank String paymentMethod,
    String provider,
    @Size(max = 255) String transactionId,
    @NotNull @DecimalMin("0.00") BigDecimal amount
) {}
