package com.ecommerce.EcommerceApplication.domain.validation;

import com.ecommerce.EcommerceApplication.dto.PaymentCreateRequest;

public interface PaymentValidator {
  void validate(PaymentCreateRequest req);
}
