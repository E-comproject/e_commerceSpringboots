package com.ecommerce.EcommerceApplication.dto;

import lombok.Builder; import lombok.Data;

@Data @Builder
public class ShopResponse {
    private Long id;
    private Long ownerId;
    private String name;
    private String description;
    private String logoUrl;
    private String status;
}
