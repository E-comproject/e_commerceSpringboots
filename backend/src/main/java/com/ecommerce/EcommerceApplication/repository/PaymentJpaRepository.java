package com.ecommerce.EcommerceApplication.repository;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.entity.PaymentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentJpaRepository extends JpaRepository<PaymentEntity, Long> {
  boolean existsByTransactionId(String transactionId);
  Optional<PaymentEntity> findByTransactionId(String transactionId);

  Page<PaymentEntity> findByOrderId(Long orderId, Pageable pageable);
  Page<PaymentEntity> findByStatus(PaymentStatus status, Pageable pageable);
}
