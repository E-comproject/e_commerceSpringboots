package com.ecommerce.EcommerceApplication.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PaymentIntentRequest(
  @NotNull Long orderId,
  @NotBlank String paymentMethod,
  String provider,
  @NotNull @DecimalMin("0.00") BigDecimal amount,
  String description
) {}