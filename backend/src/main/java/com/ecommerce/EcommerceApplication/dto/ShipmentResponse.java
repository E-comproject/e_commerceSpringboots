package com.ecommerce.EcommerceApplication.dto;

import java.time.OffsetDateTime;

public record ShipmentResponse(
  Long id, Long orderId, String trackingNumber, String carrier, String status,
  OffsetDateTime shippedAt, OffsetDateTime deliveredAt, String notes, OffsetDateTime createdAt
) {}