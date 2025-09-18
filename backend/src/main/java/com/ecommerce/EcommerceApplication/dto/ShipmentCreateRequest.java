
package com.ecommerce.EcommerceApplication.dto;

public record ShipmentCreateRequest(
  String trackingNumber, String carrier, String notes
) {}
