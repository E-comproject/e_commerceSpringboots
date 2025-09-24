package com.ecommerce.EcommerceApplication.service.impl;

import com.ecommerce.EcommerceApplication.dto.ReviewCreateReq;
import com.ecommerce.EcommerceApplication.dto.ReviewDto;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.entity.Review;
import com.ecommerce.EcommerceApplication.exception.ReviewAlreadyExistsException;
import com.ecommerce.EcommerceApplication.repository.OrderItemRepository;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.repository.ReviewRepository;
import com.ecommerce.EcommerceApplication.service.ReviewService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;
    private final OrderItemRepository orderItemRepo;
    private final ObjectMapper om = new ObjectMapper();

    public ReviewServiceImpl(ReviewRepository reviewRepo,
                             ProductRepository productRepo,
                             OrderItemRepository orderItemRepo) {
        this.reviewRepo = reviewRepo;
        this.productRepo = productRepo;
        this.orderItemRepo = orderItemRepo;
    }

    @Override
    public ReviewDto create(Long userId, ReviewCreateReq req) {
        // Validate input
        if (req.productId == null) throw new IllegalArgumentException("productId is required");
        if (req.rating == null || req.rating < 1 || req.rating > 5)
            throw new IllegalArgumentException("rating must be between 1 and 5");

        // Check if product exists
        Product product = productRepo.findById(req.productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Check for duplicate reviews
        if (req.orderItemId != null) {
            // ตรวจสอบว่าเคยรีวิว order_item_id นี้แล้วหรือไม่
            if (reviewRepo.existsByUserIdAndOrderItemId(userId, req.orderItemId)) {
                throw new ReviewAlreadyExistsException("You have already reviewed this order item");
            }
        } else {
            // ตรวจสอบว่าเคยรีวิวสินค้านี้แล้วหรือไม่ (กรณีไม่มี orderItemId)
            if (reviewRepo.existsByUserIdAndProduct_Id(userId, req.productId)) {
                throw new ReviewAlreadyExistsException("You have already reviewed this product");
            }
        }

        // Verify purchase if orderItemId is provided
        boolean verified = false;
        if (req.orderItemId != null) {
            verified = orderItemRepo.isOrderItemOwned(req.orderItemId, req.productId, userId);
        }

        // Create review
        Review review = new Review();
        review.setProduct(product);
        review.setUserId(userId);
        review.setOrderItemId(req.orderItemId);
        review.setRating(req.rating);
        review.setTitle(req.title);
        review.setComment(req.comment);
        review.setIsVerified(verified);
        
        // Serialize optional review images into JSON for storage
        try {
            review.setImages(req.images == null ? null : om.writeValueAsString(req.images));
        } catch (Exception e) {
            throw new IllegalArgumentException("images must be a JSON array of URLs");
        }

        reviewRepo.save(review);

        // Keep the denormalised rating stats on Product in sync
        refreshProductRating(product.getId());

        return toDto(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto> listByProduct(Long productId, Pageable pageable) {
        return reviewRepo.findByProduct_IdAndIsApprovedTrueOrderByCreatedAtDesc(productId, pageable)
                .map(this::toDto);
    }

    @Override
    public boolean delete(Long reviewId, Long userId) {
        Review review = reviewRepo.findById(reviewId).orElse(null);
        if (review == null) return false;
        if (!review.getUserId().equals(userId)) return false; // owner-only; moderators handled elsewhere
        Long productId = review.getProduct().getId();
        reviewRepo.delete(review);
        refreshProductRating(productId);
        return true;
    }

    @Override
    public ReviewDto setApproved(Long reviewId, boolean approved) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        review.setIsApproved(approved);
        reviewRepo.save(review);
        refreshProductRating(review.getProduct().getId());
        return toDto(review);
    }

    // ---------- helpers ----------
    private void refreshProductRating(Long productId) {
        Double avg = reviewRepo.avgApprovedRating(productId);
        Long cnt = reviewRepo.countByProduct_IdAndIsApprovedTrue(productId);

        Product product = productRepo.findById(productId).orElseThrow();
        product.setRatingAvg(BigDecimal.valueOf(avg == null ? 0.0 : avg).setScale(2, BigDecimal.ROUND_HALF_UP));
        product.setRatingCount(cnt == null ? 0 : cnt.intValue());
        productRepo.save(product);
    }

    private ReviewDto toDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.id = review.getId();
        dto.productId = review.getProduct() == null ? null : review.getProduct().getId();
        dto.userId = review.getUserId();
        dto.orderItemId = review.getOrderItemId();
        dto.rating = review.getRating();
        dto.title = review.getTitle();
        dto.comment = review.getComment();
        dto.isVerified = review.getIsVerified();
        dto.isApproved = review.getIsApproved();
        dto.createdAt = review.getCreatedAt();

        try {
            dto.images = review.getImages() == null
                    ? Collections.emptyList()
                    : om.readValue(review.getImages(), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            dto.images = Collections.emptyList();
        }
        return dto;
    }
}