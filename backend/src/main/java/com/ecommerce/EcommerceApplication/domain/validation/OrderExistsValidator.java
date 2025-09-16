package com.ecommerce.EcommerceApplication.domain.validation;

import com.ecommerce.EcommerceApplication.dto.PaymentCreateRequest;
import com.ecommerce.EcommerceApplication.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class OrderExistsValidator implements PaymentValidator {
  // TODO: inject OrderRepository ถ้ามี
  @Override
  public void validate(PaymentCreateRequest req) {
    // สมมติผ่านไปก่อน หรือโยน BadRequest ถ้าไม่มีออเดอร์
    if (req.orderId() == null) {
      throw new BadRequestException("order_id required");
    }
  }
}
