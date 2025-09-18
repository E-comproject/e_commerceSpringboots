
package com.ecommerce.EcommerceApplication.dto;

import jakarta.validation.constraints.NotBlank;

public record ShipmentStatusUpdateRequest(
  @NotBlank String status,   // allowed: preparing, picked_up, in_transit, delivered, failed
  String notes               // optional note when status changes
) {}
