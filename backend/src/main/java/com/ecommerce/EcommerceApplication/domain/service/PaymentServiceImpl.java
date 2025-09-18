
package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.domain.model.OrderStatus;
import com.ecommerce.EcommerceApplication.domain.validation.PaymentValidator;
import com.ecommerce.EcommerceApplication.dto.*;
import com.ecommerce.EcommerceApplication.entity.PaymentEntity;
import com.ecommerce.EcommerceApplication.exception.NotFoundException;
import com.ecommerce.EcommerceApplication.mapper.PaymentMapper;
import com.ecommerce.EcommerceApplication.repository.PaymentJpaRepository;
import com.ecommerce.EcommerceApplication.repository.OrderJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service @Transactional @RequiredArgsConstructor
class PaymentServiceImpl implements PaymentService {
  private final PaymentJpaRepository repo;
  private final List<PaymentValidator> validators;
  private final OrderJpaRepository orderRepo;

  @Override
  public PaymentResponse create(PaymentCreateRequest req) {
    validators.forEach(v -> v.validate(req));
    PaymentEntity entity = PaymentMapper.toEntity(req);
    var saved = repo.save(entity);
    return PaymentMapper.toResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PaymentResponse getById(Long id) {
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("payment not found"));
    return PaymentMapper.toResponse(e);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PaymentResponse> list(Long orderId, PaymentStatus status, Pageable pageable) {
    if (orderId != null) return repo.findByOrderId(orderId, pageable).map(PaymentMapper::toResponse);
    if (status != null) return repo.findByStatus(status, pageable).map(PaymentMapper::toResponse);
    return repo.findAll(pageable).map(PaymentMapper::toResponse);
  }

  @Override
  public PaymentResponse updateStatus(Long id, PaymentStatusUpdateRequest req) {
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("payment not found"));
    var tx = PaymentMapper.normalize(req.transactionId());
    if (tx != null && !tx.equals(e.getTransactionId()) && repo.existsByTransactionId(tx)) {
      throw new com.ecommerce.EcommerceApplication.exception.BadRequestException("transaction_id duplicated");
    }
    if (tx != null) e.setTransactionId(tx);
    e.setStatus(req.status());
    if (req.paidAt() != null) e.setPaidAt(req.paidAt());
    return PaymentMapper.toResponse(repo.save(e));
  }

  @Override
  public void delete(Long id) {
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("payment not found"));
    repo.delete(e);
  }

  @Override
  public PaymentIntentResponse createIntent(PaymentIntentRequest req, PaymentIntentMode mode) {
    var order = orderRepo.findById(req.orderId())
        .orElseThrow(() -> new NotFoundException("order not found"));
    if (req.amount() == null || req.amount().compareTo(order.getTotalAmount()) != 0) {
      throw new com.ecommerce.EcommerceApplication.exception.BadRequestException("amount mismatch with order total");
    }
    var pc = new PaymentCreateRequest(req.orderId(), req.paymentMethod(), req.provider(), null, req.amount());
    validators.forEach(v -> v.validate(pc));
    var payment = PaymentMapper.toEntity(pc);
    var saved = repo.save(payment);

    // mock intent
    String clientSecret = "mock_" + UUID.randomUUID();
    return new PaymentIntentResponse(saved.getId(), clientSecret, null);
  }

  @Override
  public void handleWebhook(PaymentWebhookEvent event) {
    var e = repo.findById(event.paymentId())
      .orElseThrow(() -> new NotFoundException("payment not found"));

    if (event.transactionId() != null) e.setTransactionId(PaymentMapper.normalize(event.transactionId()));
    if (event.paidAt() != null) e.setPaidAt(event.paidAt());
    e.setStatus(event.status());
    repo.save(e);

    var order = orderRepo.findById(e.getOrderId()).orElse(null);
    if (order != null) {
      if (event.status() == PaymentStatus.completed) {
        order.setStatus(OrderStatus.paid);
        order.setUpdatedAt(OffsetDateTime.now());
        orderRepo.save(order);
      }
    }
  }
}
