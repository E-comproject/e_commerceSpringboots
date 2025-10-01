package com.ecommerce.EcommerceApplication.repository;

import com.ecommerce.EcommerceApplication.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    // สำหรับ slug/SEO
    Optional<Shop> findBySlug(String slug);
    boolean existsBySlug(String slug);

    // บังคับ 1 ผู้ขาย 1 ร้าน / ตรวจความเป็นเจ้าของ
    boolean existsBySellerUserId(Long sellerUserId);
    Optional<Shop> findByIdAndSellerUserId(Long id, Long sellerUserId);

    // เผื่อใช้หน้า Public listing / Admin
    List<Shop> findByStatus(String status);

    // ถ้าต้องการร้านแรกของ seller (optional)
    Optional<Shop> findFirstBySellerUserId(Long sellerUserId);
}
