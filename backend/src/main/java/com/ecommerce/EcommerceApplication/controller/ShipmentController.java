// controller/ShipmentController.java
package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.domain.service.ShipmentService;
import com.ecommerce.EcommerceApplication.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping(value="/shipments", produces = MediaType.APPLICATION_JSON_VALUE)
public class ShipmentController {
  private final ShipmentService service;

  @GetMapping("/{id}")
  public ShipmentResponse get(@PathVariable Long id){ return service.getById(id); }

  // << เพิ่ม >>
  @PatchMapping(value="/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ShipmentResponse updateStatus(@PathVariable Long id,
                                       @Valid @RequestBody ShipmentStatusUpdateRequest req) {
    return service.updateStatus(id, req);
  }
}
