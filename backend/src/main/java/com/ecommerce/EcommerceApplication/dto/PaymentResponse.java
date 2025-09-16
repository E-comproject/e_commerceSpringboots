package com.ecommerce.EcommerceApplication.dto;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
    Long id,
    Long orderId,
    String paymentMethod,
    String provider,
    String transactionId,
    BigDecimal amount,
    PaymentStatus status,
    OffsetDateTime paidAt,
    OffsetDateTime createdAt
) {}
