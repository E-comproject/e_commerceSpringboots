package com.ecommerce.EcommerceApplication.dto;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record PaymentStatusUpdateRequest(
  @NotNull PaymentStatus status, String transactionId, OffsetDateTime paidAt
) {}