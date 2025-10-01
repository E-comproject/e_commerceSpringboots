package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.LoginRequest;
import com.ecommerce.EcommerceApplication.dto.LoginResponse;
import com.ecommerce.EcommerceApplication.dto.RefreshRequest;
import com.ecommerce.EcommerceApplication.dto.RegisterRequest;
import com.ecommerce.EcommerceApplication.service.AuthService;
import com.ecommerce.EcommerceApplication.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.ok(Map.of("message", "registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        var res = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        var res = authService.refresh(req.getRefreshToken());
        return ResponseEntity.ok(res);
    }
}
