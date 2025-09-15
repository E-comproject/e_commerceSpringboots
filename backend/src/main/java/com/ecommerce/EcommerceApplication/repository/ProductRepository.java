package com.ecommerce.EcommerceApplication.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.EcommerceApplication.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("""
       SELECT p FROM Product p
       WHERE (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:categoryId IS NULL OR p.categoryId = :categoryId)
         AND (:status IS NULL OR p.status = :status)
    """)
    Page<Product> search(
        @Param("q") String q,
        @Param("categoryId") Long categoryId,
        @Param("status") String status,
        Pageable pageable
    );
}
