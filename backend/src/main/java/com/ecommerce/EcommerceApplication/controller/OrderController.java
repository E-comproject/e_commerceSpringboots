package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.service.OrderService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    // แปลง Cart → Order
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestParam Long userId, @RequestBody CheckoutReq req) {
        try {
            OrderDto dto = service.checkout(userId, req);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // cart/product not found / invalid input
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // stock not enough / product inactive / cart empty
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public Page<OrderDto> list(@RequestParam Long userId,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        return service.listByUser(userId, PageRequest.of(page, size));
    }

    // (ต่อยอด) อัปเดตสถานะ
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(service.updateStatus(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
