
package com.ecommerce.EcommerceApplication.entity;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payments",
  indexes = {
    @Index(name = "idx_payments_order_id", columnList = "order_id"),
    @Index(name = "idx_payments_status", columnList = "status")
  }
)
@Getter @Setter @NoArgsConstructor
public class PaymentEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "order_id", nullable = false)
  private Long orderId;

  @Column(name = "payment_method", nullable = false)
  private String paymentMethod;

  private String provider;

  @Column(name = "transaction_id", unique = true)
  private String transactionId;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PaymentStatus status = PaymentStatus.pending;

  private OffsetDateTime paidAt;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();
}
