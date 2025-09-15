package com.ecommerce.EcommerceApplication.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;

public interface OrderService {
    OrderDto checkout(Long userId, CheckoutReq req);      // แปลง cart → order
    OrderDto getById(Long orderId);
    Page<OrderDto> listByUser(Long userId, Pageable pageable);
}
