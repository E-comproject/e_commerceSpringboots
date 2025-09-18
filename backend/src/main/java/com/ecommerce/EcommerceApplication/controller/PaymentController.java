
package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.domain.service.*;
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

  @PostMapping(value="/intent", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<PaymentIntentResponse> createIntent(
      @RequestParam(defaultValue = "mock") PaymentIntentMode mode,
      @Valid @RequestBody PaymentIntentRequest req) {
    var res = service.createIntent(req, mode);
    return ResponseEntity.status(HttpStatus.CREATED).body(res);
  }

  @PostMapping(value="/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Void> webhook(
      @RequestHeader(value="X-Signature", required=false) String signature,
      @Valid @RequestBody PaymentWebhookEvent event) {
    service.handleWebhook(event);
    return ResponseEntity.ok().build();
  }

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<PaymentResponse> create(@Valid @RequestBody PaymentCreateRequest req) {
    var res = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(res);
  }

  @GetMapping("/{id}")
  public PaymentResponse get(@PathVariable Long id) { return service.getById(id); }

  @GetMapping
  public Page<PaymentResponse> list(
      @RequestParam(required = false) Long orderId,
      @RequestParam(required = false) PaymentStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return service.list(orderId, status, PageRequest.of(page, size));
  }
}
