package com.ecommerce.EcommerceApplication.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.EcommerceApplication.entity.Shop;

public interface ShopRepository extends JpaRepository<Shop, Long> {
    Optional<Shop> findBySlug(String slug);
    boolean existsBySlug(String slug);
}

