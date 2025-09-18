package com.ecommerce.EcommerceApplication.dto;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import java.time.OffsetDateTime;

public record PaymentWebhookEvent(
  Long paymentId, String transactionId, PaymentStatus status, OffsetDateTime paidAt
) {}