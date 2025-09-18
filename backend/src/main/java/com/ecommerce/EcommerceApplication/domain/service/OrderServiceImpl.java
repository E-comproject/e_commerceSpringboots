
package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.dto.OrderResponse;
import com.ecommerce.EcommerceApplication.exception.NotFoundException;
import com.ecommerce.EcommerceApplication.mapper.OrderMapper;
import com.ecommerce.EcommerceApplication.repository.OrderJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
class OrderServiceImpl implements OrderService {
  private final OrderJpaRepository repo;

  @Override
  public OrderResponse getByCode(String orderNumber) {
    var e = repo.findByOrderNumber(orderNumber).orElseThrow(() -> new NotFoundException("order not found"));
    return OrderMapper.toResponse(e);
  }

  @Override
  public Page<OrderResponse> listMine(Long userId, Pageable pageable) {
    return repo.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(OrderMapper::toResponse);
  }
}
