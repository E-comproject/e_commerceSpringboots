package com.ecommerce.EcommerceApplication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.EcommerceApplication.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // อ่านรายการในตะกร้า
    List<CartItem> findByCartId(Long cartId);

    // ล้างทั้งตะกร้า
    void deleteByCartId(Long cartId);

    // หา/เช็คสินค้าที่ซ้ำในตะกร้า
    boolean existsByCartIdAndProductId(Long cartId, Long productId);
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    // ลบแบบผูก cartId ให้ปลอดภัยและอะตอมมิก
    long deleteByIdAndCartId(Long itemId, Long cartId);

    // (เผื่ออยากคืนข้อมูลก่อนลบ)
    Optional<CartItem> findByIdAndCartId(Long itemId, Long cartId);
}
