package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.*;
import com.ecommerce.EcommerceApplication.service.AddressService;
import com.ecommerce.EcommerceApplication.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final AuthUtils authUtils;

    private Long getUserId(String username) {
        return authUtils.getUserIdFromUsername(username);
    }

    @GetMapping("/addresses")
    public List<AddressResponse> list(@AuthenticationPrincipal String username) {
        Long userId = getUserId(username);
        return addressService.list(userId);
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> create(@AuthenticationPrincipal String username,
                                    @RequestBody CreateAddressRequest req) {
        Long userId = getUserId(username);
        var res = addressService.create(userId, req);
        return ResponseEntity.ok(Map.of("id", res.getId()));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<?> update(@AuthenticationPrincipal String username,
                                    @PathVariable Long id,
                                    @RequestBody UpdateAddressRequest req) {
        Long userId = getUserId(username);
        addressService.update(userId, id, req);
        return ResponseEntity.ok(Map.of("message", "updated"));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal String username,
                                    @PathVariable Long id) {
        Long userId = getUserId(username);
        addressService.delete(userId, id);
        return ResponseEntity.ok(Map.of("message", "deleted"));
    }
}
