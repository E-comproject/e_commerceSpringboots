
package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.dto.*;
import org.springframework.data.domain.*;

public interface PaymentService {
  PaymentResponse create(PaymentCreateRequest req);
  PaymentIntentResponse createIntent(PaymentIntentRequest req, PaymentIntentMode mode);
  void handleWebhook(PaymentWebhookEvent event);

  PaymentResponse getById(Long id);
  Page<PaymentResponse> list(Long orderId, PaymentStatus status, Pageable pageable);
  PaymentResponse updateStatus(Long id, PaymentStatusUpdateRequest req);
  void delete(Long id);
}
