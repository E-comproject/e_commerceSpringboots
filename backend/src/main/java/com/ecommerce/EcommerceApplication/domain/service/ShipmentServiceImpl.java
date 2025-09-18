
package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.dto.*;
import com.ecommerce.EcommerceApplication.entity.ShipmentEntity;
import com.ecommerce.EcommerceApplication.exception.BadRequestException;
import com.ecommerce.EcommerceApplication.exception.NotFoundException;
import com.ecommerce.EcommerceApplication.mapper.ShipmentMapper;
import com.ecommerce.EcommerceApplication.repository.OrderJpaRepository;
import com.ecommerce.EcommerceApplication.repository.ShipmentJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Set;

@Service @RequiredArgsConstructor @Transactional
class ShipmentServiceImpl implements ShipmentService {
  private final ShipmentJpaRepository repo;
  private final OrderJpaRepository orderRepo;

  private static final Set<String> ALLOWED = Set.of(
      "preparing", "picked_up", "in_transit", "delivered", "failed"
  );

  @Override
  public ShipmentResponse createForOrder(Long orderId, ShipmentCreateRequest req) {
    orderRepo.findById(orderId).orElseThrow(() -> new NotFoundException("order not found"));
    var s = new ShipmentEntity();
    s.setOrderId(orderId);
    s.setTrackingNumber(req.trackingNumber());
    s.setCarrier(req.carrier());
    s.setNotes(req.notes());
    s.setStatus("picked_up");
    s.setShippedAt(OffsetDateTime.now());
    return ShipmentMapper.toResponse(repo.save(s));
  }

  @Override @Transactional(readOnly = true)
  public ShipmentResponse getById(Long id) {
    var s = repo.findById(id).orElseThrow(() -> new NotFoundException("shipment not found"));
    return ShipmentMapper.toResponse(s);
  }

  @Override
  public ShipmentResponse updateStatus(Long id, ShipmentStatusUpdateRequest req) {
    var s = repo.findById(id).orElseThrow(() -> new NotFoundException("shipment not found"));

    var newStatus = req.status().trim().toLowerCase();
    if (!ALLOWED.contains(newStatus)) {
      throw new BadRequestException("invalid status: " + newStatus);
    }

    // ป้องกันการย้อนสถานะ (ง่าย ๆ ตามลำดับ index)
    int rank = rankOf(s.getStatus());
    int next = rankOf(newStatus);
    if (next < rank && !newStatus.equals("failed")) {
      throw new BadRequestException("cannot move status backward");
    }

    // เซ็ต timestamp อัตโนมัติเมื่อถึงสถานะสำคัญ
    if (newStatus.equals("picked_up") && s.getShippedAt() == null) {
      s.setShippedAt(OffsetDateTime.now());
    }
    if (newStatus.equals("delivered")) {
      s.setDeliveredAt(OffsetDateTime.now());
    }

    if (req.notes() != null && !req.notes().isBlank()) {
      s.setNotes(req.notes());
    }

    s.setStatus(newStatus);
    var saved = repo.save(s);

    // อัปเดตสถานะ Order ให้สัมพันธ์ (ถ้ามี)
    orderRepo.findById(saved.getOrderId()).ifPresent(o -> {
      switch (newStatus) {
        case "picked_up", "in_transit" -> {
          // ตั้งเป็น shipped ถ้ายังต่ำกว่า
          if (!o.getStatus().name().equalsIgnoreCase("shipped")
              && !o.getStatus().name().equalsIgnoreCase("delivered")) {
            o.setStatus(com.ecommerce.EcommerceApplication.domain.model.OrderStatus.shipped);
          }
        }
        case "delivered" -> o.setStatus(com.ecommerce.EcommerceApplication.domain.model.OrderStatus.delivered);
        default -> {} // preparing/failed ไม่บังคับเปลี่ยน order
      }
      o.setUpdatedAt(OffsetDateTime.now());
      orderRepo.save(o);
    });

    return ShipmentMapper.toResponse(saved);
  }

  private int rankOf(String st) {
    return switch (st == null ? "" : st.toLowerCase()) {
      case "preparing" -> 0;
      case "picked_up" -> 1;
      case "in_transit" -> 2;
      case "delivered" -> 3;
      case "failed" -> 99; // ทางแยก
      default -> -1;
    };
  }
}
