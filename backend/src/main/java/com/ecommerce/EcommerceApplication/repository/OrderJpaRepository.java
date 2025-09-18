package com.ecommerce.EcommerceApplication.repository;

import com.ecommerce.EcommerceApplication.entity.OrderEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrderJpaRepository extends JpaRepository<OrderEntity, Long> {
  Optional<OrderEntity> findByOrderNumber(String orderNumber);
  Page<OrderEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}