package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
  PaymentResponse create(PaymentCreateRequest req);
  PaymentResponse getById(Long id);
  Page<PaymentResponse> list(Long orderId, PaymentStatus status, Pageable pageable);
  PaymentResponse updateStatus(Long id, PaymentStatusUpdateRequest req);
  void delete(Long id);
}
