package com.ecommerce.EcommerceApplication.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.ProductDto;

public interface ProductService {
    ProductDto create(ProductDto req);
    Optional<com.ecommerce.EcommerceApplication.entity.Product> updateProduct(Long id, com.ecommerce.EcommerceApplication.entity.Product patch);
    boolean deleteProduct(Long id);

    Page<ProductDto> search(String q, Long categoryId, String status, Pageable pageable);
    ProductDto getBySlug(String slug);
}
