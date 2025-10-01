package com.ecommerce.EcommerceApplication.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.ReviewCreateReq;
import com.ecommerce.EcommerceApplication.dto.ReviewDto;
import com.ecommerce.EcommerceApplication.exception.ReviewAlreadyExistsException;
import com.ecommerce.EcommerceApplication.service.ReviewService;
import com.ecommerce.EcommerceApplication.util.AuthUtils;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService service;
    private final AuthUtils authUtils;

    public ReviewController(ReviewService service, AuthUtils authUtils) {
        this.service = service;
        this.authUtils = authUtils;
    }

    private Long getUserId(Authentication auth) {
        return authUtils.getUserIdFromUsername(auth.getName());
    }

    // สร้างรีวิว (ใช้ userId จาก JWT)
    @PostMapping
    public ResponseEntity<?> create(Authentication auth, @RequestBody ReviewCreateReq req) {
        try {
            Long userId = getUserId(auth);
            ReviewDto review = service.create(userId, req);
            return ResponseEntity.status(HttpStatus.CREATED).body(review); // 201 Created
        } catch (ReviewAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage()); // 409 Conflict
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); // 400 Bad Request
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error occurred"); // 500 Internal Server Error
        }
    }

    // รีวิวของสินค้า (เฉพาะที่ approved)
    @GetMapping
    public Page<ReviewDto> list(@RequestParam Long productId,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size) {
        return service.listByProduct(productId, PageRequest.of(page, size));
    }

    // ร้านค้าตอบกลับรีวิว
    @PostMapping("/{id}/reply")
    public ResponseEntity<?> reply(@PathVariable Long id, @RequestParam Long shopId, @RequestBody String replyText) {
        try {
            return ResponseEntity.ok(service.addShopReply(id, shopId, replyText));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}