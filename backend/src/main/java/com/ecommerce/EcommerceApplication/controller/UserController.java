package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.dto.ChangePasswordRequest;
import com.ecommerce.EcommerceApplication.dto.UpdateMeRequest;
import com.ecommerce.EcommerceApplication.model.User;
import com.ecommerce.EcommerceApplication.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Long userId) {
        User u = userService.getMe(userId);
        return Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole()
        );
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal Long userId,
                                      @RequestBody UpdateMeRequest req) {
        var u = userService.updateUsername(userId, req);
        return ResponseEntity.ok(Map.of("message", "updated", "username", u.getUsername()));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal Long userId,
                                            @RequestBody ChangePasswordRequest req) {
        userService.changePassword(userId, req);
        return ResponseEntity.ok(Map.of("message", "password changed"));
    }
}
