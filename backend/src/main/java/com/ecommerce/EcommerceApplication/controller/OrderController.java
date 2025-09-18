
package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.domain.service.OrderService;
import com.ecommerce.EcommerceApplication.domain.service.ShipmentService;
import com.ecommerce.EcommerceApplication.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;
  private final ShipmentService shipmentService;

  @GetMapping(value="/orders/{code}", produces = MediaType.APPLICATION_JSON_VALUE)
  public OrderResponse getByCode(@PathVariable("code") String code){
    return orderService.getByCode(code);
  }

  // แบบง่าย ใช้ header แทน auth
  @GetMapping(value="/me/orders", produces = MediaType.APPLICATION_JSON_VALUE)
  public Page<OrderResponse> listMine(
      @RequestHeader("X-User-Id") Long userId,
      @RequestParam(defaultValue="0") int page,
      @RequestParam(defaultValue="10") int size){
    return orderService.listMine(userId, PageRequest.of(page, size));
  }

  // << ตามสเปก >> POST /orders/:id/ship (seller)
  @PostMapping(value="/orders/{orderId}/ship", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<ShipmentResponse> ship(
      @PathVariable Long orderId,
      @Valid @RequestBody ShipmentCreateRequest req){
    var res = shipmentService.createForOrder(orderId, req);
    return ResponseEntity.status(HttpStatus.CREATED).body(res);
  }
}
