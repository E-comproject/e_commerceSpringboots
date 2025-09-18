package com.ecommerce.EcommerceApplication.domain.validation;

import com.ecommerce.EcommerceApplication.dto.PaymentCreateRequest;
import com.ecommerce.EcommerceApplication.exception.BadRequestException;
import com.ecommerce.EcommerceApplication.mapper.PaymentMapper;
import com.ecommerce.EcommerceApplication.repository.PaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component @RequiredArgsConstructor
public class TransactionIdValidator implements PaymentValidator {
  private final PaymentJpaRepository repo;
  @Override public void validate(PaymentCreateRequest req) {
    var tx = PaymentMapper.normalize(req.transactionId());
    if (tx != null && repo.existsByTransactionId(tx)) {
      throw new BadRequestException("transaction_id duplicated");
    }
  }
}