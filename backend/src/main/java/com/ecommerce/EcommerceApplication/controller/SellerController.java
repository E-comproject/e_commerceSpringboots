package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.SellerApplicationResponse;
import com.ecommerce.EcommerceApplication.dto.SellerApplyRequest;
import com.ecommerce.EcommerceApplication.service.SellerService;
import com.ecommerce.EcommerceApplication.util.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

//import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final AuthUtils authUtils;

    @PostMapping("/seller/apply")
    public ResponseEntity<?> apply(@AuthenticationPrincipal String username,
                                   @Valid @RequestBody SellerApplyRequest req) {
        Long userId = authUtils.getUserIdFromUsername(username);
        SellerApplicationResponse res = sellerService.apply(userId, req);
        return ResponseEntity.ok(res);
    }

    /*@PutMapping("/admin/sellers/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(@AuthenticationPrincipal Long adminId,
                                     @PathVariable Long userId) {
        sellerService.approve(adminId, userId);
        return ResponseEntity.ok(Map.of("message", "seller approved"));
    }*/
}
