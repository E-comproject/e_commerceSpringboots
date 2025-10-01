package com.ecommerce.EcommerceApplication.controller;

import com.ecommerce.EcommerceApplication.repository.SellerApplicationRepository;
import com.ecommerce.EcommerceApplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // ทุก endpoint ใน controller นี้ต้องเป็น ADMIN
public class AdminController {

    private final SellerApplicationRepository sellerAppRepo;
    private final UserRepository userRepo;

    @PutMapping("/sellers/{userId}/approve")
    public ResponseEntity<?> approve(@PathVariable Long userId) {
        var user = userRepo.findById(userId).orElseThrow();

        sellerAppRepo.findTopByUserIdOrderByIdDesc(userId).ifPresent(app -> {
            app.setStatus("APPROVED");
            sellerAppRepo.save(app);
        });

        user.setRole("SELLER");
        userRepo.save(user);

        return ResponseEntity.ok().build();
    }
}
