package com.ecommerce.EcommerceApplication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShopCreateRequest {
    @NotBlank
    private String name;
    private String description;
    private String logoUrl;
}
