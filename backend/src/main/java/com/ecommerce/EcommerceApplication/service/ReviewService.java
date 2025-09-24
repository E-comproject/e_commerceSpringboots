package com.ecommerce.EcommerceApplication.service;

import com.ecommerce.EcommerceApplication.dto.ReviewCreateReq;
import com.ecommerce.EcommerceApplication.dto.ReviewDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewDto create(Long userId, ReviewCreateReq req);
    Page<ReviewDto> listByProduct(Long productId, Pageable pageable);
    boolean delete(Long reviewId, Long userId);               // เจ้าของลบเองได้
    ReviewDto setApproved(Long reviewId, boolean approved);   // สำหรับแอดมิน/ผู้ขาย
}
