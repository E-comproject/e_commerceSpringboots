package com.ecommerce.EcommerceApplication.service;

import java.util.List;
import java.util.Optional;

import com.ecommerce.EcommerceApplication.entity.Review;

public interface ReviewService {
    List<Review> listProductReviews(Long productId);
    Optional<Review> writeReview(Long productId, Long userId, Review review);
    Optional<Review> approveReview(Long reviewId);
}


