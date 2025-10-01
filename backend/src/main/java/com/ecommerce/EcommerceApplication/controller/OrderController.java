package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.service.OrderService;
import com.ecommerce.EcommerceApplication.util.AuthUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService service;
    private final AuthUtils authUtils;

    public OrderController(OrderService service, AuthUtils authUtils) {
        this.service = service;
        this.authUtils = authUtils;
    }

    private Long getUserId(Authentication auth) {
        return authUtils.getUserIdFromUsername(auth.getName());
    }

    // แปลง Cart → Order (ใช้ userId จาก JWT)
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(Authentication auth, @RequestBody CheckoutReq req) {
        try {
            Long userId = getUserId(auth);
            OrderDto dto = service.checkout(userId, req);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // cart/product not found / invalid input
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // stock not enough / product inactive / cart empty
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(Authentication auth, @PathVariable Long id) {
        try {
            Long userId = getUserId(auth);
            OrderDto order = service.getById(id);

            // ตรวจสอบว่า order เป็นของ user คนนี้หรือไม่
            if (!order.userId.equals(userId)) {
                return ResponseEntity.status(403).body("Forbidden: Not your order");
            }

            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public Page<OrderDto> list(Authentication auth,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserId(auth);
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
