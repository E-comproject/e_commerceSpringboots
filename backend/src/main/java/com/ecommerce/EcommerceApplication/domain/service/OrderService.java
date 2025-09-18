package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.dto.OrderResponse;
import org.springframework.data.domain.*;

public interface OrderService {
  OrderResponse getByCode(String orderNumber);
  Page<OrderResponse> listMine(Long userId, Pageable pageable);
}
