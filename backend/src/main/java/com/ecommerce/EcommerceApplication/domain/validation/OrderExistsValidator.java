
package com.ecommerce.EcommerceApplication.domain.validation;

import com.ecommerce.EcommerceApplication.dto.PaymentCreateRequest;
import com.ecommerce.EcommerceApplication.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class OrderExistsValidator implements PaymentValidator {
 
  @Override public void validate(PaymentCreateRequest req) {
    if (req.orderId() == null) throw new BadRequestException("order_id required");
  }
}
