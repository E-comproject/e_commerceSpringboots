
package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.dto.*;

public interface ShipmentService {
  ShipmentResponse createForOrder(Long orderId, ShipmentCreateRequest req);
  ShipmentResponse getById(Long id);
  ShipmentResponse updateStatus(Long id, ShipmentStatusUpdateRequest req); // << เพิ่ม
}
