package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.ShopCreateRequest;
import com.ecommerce.EcommerceApplication.dto.ShopResponse;
import com.ecommerce.EcommerceApplication.dto.ShopUpdateRequest;
import com.ecommerce.EcommerceApplication.service.ShopService;
import com.ecommerce.EcommerceApplication.util.AuthUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ShopController {

    private final ShopService shopService;
    private final AuthUtils authUtils;

    public ShopController(ShopService shopService, AuthUtils authUtils) {
        this.shopService = shopService;
        this.authUtils = authUtils;
    }

    // Public
    @GetMapping("/shops")
    public ResponseEntity<List<ShopResponse>> listActive() {
        return ResponseEntity.ok(shopService.listActive());
    }

    // Public
    @GetMapping("/shops/{id}")
    public ResponseEntity<ShopResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(shopService.get(id));
    }

    // Seller creates own shop (ควบคุม 1 ผู้ขาย 1 ร้าน ใน service)
    @PreAuthorize("hasRole('SELLER')")
    @PostMapping("/seller/shops")
    public ResponseEntity<ShopResponse> create(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody ShopCreateRequest req) {
        Long userId = authUtils.getUserIdFromUsername(username);
        return ResponseEntity.ok(shopService.create(userId, req));
    }

    // Seller/Admin updates
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    @PutMapping("/seller/shops/{id}")
    public ResponseEntity<ShopResponse> update(
            @AuthenticationPrincipal String username,
            @PathVariable Long id,
            @RequestBody ShopUpdateRequest req) {
        Long userId = authUtils.getUserIdFromUsername(username);
        boolean isAdmin = false; // ให้ service ตัดสินใจเพิ่มได้ภายหลังถ้าต้อง
        return ResponseEntity.ok(shopService.update(userId, id, req, isAdmin));
    }

    // Admin suspend
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/shops/{id}/suspend")
    public ResponseEntity<ShopResponse> suspend(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        return ResponseEntity.ok(shopService.suspendByAdmin(adminId, id, reason));
    }
}
