package com.ecommerce.EcommerceApplication.dto;

import lombok.Data;

@Data
public class ShopUpdateRequest {
    private String name;
    private String description;
    private String logoUrl;
}
