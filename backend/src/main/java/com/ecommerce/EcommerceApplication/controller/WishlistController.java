package com.ecommerce.EcommerceApplication.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.WishlistDto;
import com.ecommerce.EcommerceApplication.service.WishlistService;

import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // เพิ่มสินค้าเข้า wishlist
    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestParam Long userId, @RequestParam Long productId) {
        try {
            WishlistDto wishlist = wishlistService.addToWishlist(userId, productId);
            return ResponseEntity.status(HttpStatus.CREATED).body(wishlist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error occurred");
        }
    }

    // ลบสินค้าออกจาก wishlist
    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromWishlist(@RequestParam Long userId, @RequestParam Long productId) {
        boolean removed = wishlistService.removeFromWishlist(userId, productId);
        if (removed) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ดู wishlist ของ user
    @GetMapping
    public Page<WishlistDto> getUserWishlist(@RequestParam Long userId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return wishlistService.getUserWishlist(userId, PageRequest.of(page, size));
    }

    // ตรวจสอบว่าสินค้าอยู่ใน wishlist หรือไม่
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkInWishlist(@RequestParam Long userId, @RequestParam Long productId) {
        boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
        return ResponseEntity.ok(Map.of("isInWishlist", isInWishlist));
    }

    // นับจำนวน items ใน wishlist
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getWishlistCount(@RequestParam Long userId) {
        long count = wishlistService.getWishlistCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ดูสินค้าที่ได้รับความสนใจมากที่สุด
    @GetMapping("/most-wishlisted")
    public Page<Object[]> getMostWishlistedProducts(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return wishlistService.getMostWishlistedProducts(PageRequest.of(page, size));
    }

    // Toggle wishlist (เพิ่ม/ลบ ในการกดเดียว)
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleWishlist(@RequestParam Long userId, @RequestParam Long productId) {
        try {
            if (wishlistService.isInWishlist(userId, productId)) {
                // ลบออกจาก wishlist
                wishlistService.removeFromWishlist(userId, productId);
                return ResponseEntity.ok(Map.of("action", "removed", "isInWishlist", false));
            } else {
                // เพิ่มเข้า wishlist
                WishlistDto wishlist = wishlistService.addToWishlist(userId, productId);
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(Map.of("action", "added", "isInWishlist", true, "wishlist", wishlist));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error occurred");
        }
    }
}