
package com.ecommerce.EcommerceApplication.mapper;

import com.ecommerce.EcommerceApplication.dto.OrderResponse;
import com.ecommerce.EcommerceApplication.entity.OrderEntity;

public final class OrderMapper {
  private OrderMapper(){}
  public static OrderResponse toResponse(OrderEntity e){
    return new OrderResponse(e.getId(), e.getOrderNumber(), e.getStatus(), e.getTotalAmount(), e.getCreatedAt());
  }
}