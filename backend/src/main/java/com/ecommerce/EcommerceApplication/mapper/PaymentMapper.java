package com.ecommerce.EcommerceApplication.mapper;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.dto.PaymentCreateRequest;
import com.ecommerce.EcommerceApplication.dto.PaymentResponse;
import com.ecommerce.EcommerceApplication.entity.PaymentEntity;

public final class PaymentMapper {

  private PaymentMapper() {}

  public static PaymentEntity toEntity(PaymentCreateRequest req) {
    var e = new PaymentEntity();
    e.setOrderId(req.orderId());
    e.setPaymentMethod(req.paymentMethod());
    e.setProvider(req.provider());
    e.setTransactionId(normalize(req.transactionId()));
    e.setAmount(req.amount());
    e.setStatus(PaymentStatus.pending);
    return e;
  }

  public static PaymentResponse toResponse(PaymentEntity e) {
    return new PaymentResponse(
        e.getId(),
        e.getOrderId(),
        e.getPaymentMethod(),
        e.getProvider(),
        e.getTransactionId(),
        e.getAmount(),
        e.getStatus(),
        e.getPaidAt(),
        e.getCreatedAt()
    );
  }

  public static String normalize(String tx) {
    if (tx == null) return null;
    tx = tx.trim();
    return tx.isEmpty() ? null : tx;
  }
}
