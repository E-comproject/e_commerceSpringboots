package com.ecommerce.EcommerceApplication.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewDto {
    public Long id;
    public Long productId;
    public Long userId;
    public Long orderItemId;
    public Integer rating;
    public String title;
    public String comment;
    public List<String> images; // แปลงจาก/เป็น JSON array
    public Boolean isVerified;
    public Boolean isApproved;
    public LocalDateTime createdAt;
}
