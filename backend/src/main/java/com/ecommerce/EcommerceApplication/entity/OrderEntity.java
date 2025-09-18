
package com.ecommerce.EcommerceApplication.entity;

import com.ecommerce.EcommerceApplication.domain.model.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "orders",
       indexes = {
         @Index(name="idx_orders_user_id", columnList="user_id"),
         @Index(name="idx_orders_status", columnList="status")
       })
@Getter @Setter @NoArgsConstructor
public class OrderEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="order_number", nullable=false, unique=true)
  private String orderNumber;

  @Column(name="user_id")
  private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false)
  private OrderStatus status = OrderStatus.pending;

  @Column(name="total_amount", nullable=false, precision=12, scale=2)
  private BigDecimal totalAmount = BigDecimal.ZERO;

  @Column(name="created_at")
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @Column(name="updated_at")
  private OffsetDateTime updatedAt = OffsetDateTime.now();
}
