package com.ecommerce.EcommerceApplication.mapper;

import com.ecommerce.EcommerceApplication.dto.ShipmentResponse;
import com.ecommerce.EcommerceApplication.entity.ShipmentEntity;

public final class ShipmentMapper {
  private ShipmentMapper(){}
  public static ShipmentResponse toResponse(ShipmentEntity s){
    return new ShipmentResponse(
      s.getId(), s.getOrderId(), s.getTrackingNumber(), s.getCarrier(), s.getStatus(),
      s.getShippedAt(), s.getDeliveredAt(), s.getNotes(), s.getCreatedAt()
    );
  }
}