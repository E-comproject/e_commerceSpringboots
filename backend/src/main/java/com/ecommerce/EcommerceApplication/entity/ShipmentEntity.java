
package com.ecommerce.EcommerceApplication.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name="shipments")
@Getter @Setter @NoArgsConstructor
public class ShipmentEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="order_id", nullable=false)
  private Long orderId;

  @Column(name="tracking_number")
  private String trackingNumber;

  private String carrier;

  @Column(nullable=false)
  private String status = "preparing"; // preparing, picked_up, in_transit, delivered, failed

  @Column(name="shipped_at")
  private OffsetDateTime shippedAt;

  @Column(name="delivered_at")
  private OffsetDateTime deliveredAt;

  private String notes;

  @Column(name="created_at")
  private OffsetDateTime createdAt = OffsetDateTime.now();
}