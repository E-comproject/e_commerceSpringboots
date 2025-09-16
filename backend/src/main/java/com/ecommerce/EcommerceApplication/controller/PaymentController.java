package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.domain.service.PaymentService;
import com.ecommerce.EcommerceApplication.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/payments", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService service;

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<PaymentResponse> create(@Valid @RequestBody PaymentCreateRequest req) {
    var res = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(res);
  }

  @GetMapping("/{id}")
  public PaymentResponse get(@PathVariable Long id) {
    return service.getById(id);
  }

  @GetMapping
  public Page<PaymentResponse> list(
      @RequestParam(required = false) Long orderId,
      @RequestParam(required = false) PaymentStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size
  ) {
    return service.list(orderId, status, PageRequest.of(page, size));
  }

  @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
  public PaymentResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody PaymentStatusUpdateRequest req) {
    return service.updateStatus(id, req);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
