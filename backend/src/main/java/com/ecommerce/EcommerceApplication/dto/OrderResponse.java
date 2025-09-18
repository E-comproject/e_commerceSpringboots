package com.ecommerce.EcommerceApplication.dto;

import com.ecommerce.EcommerceApplication.domain.model.OrderStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record OrderResponse(
  Long id, String orderNumber, OrderStatus status, BigDecimal totalAmount, OffsetDateTime createdAt
) {}