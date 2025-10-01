package com.ecommerce.EcommerceApplication.repository;

import com.ecommerce.EcommerceApplication.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    boolean existsByOwnerId(Long ownerId);

    List<Shop> findByStatus(String status);

    Optional<Shop> findByIdAndOwnerId(Long id, Long ownerId);

    Optional<Shop> findFirstByOwnerId(Long ownerId);
    
}
