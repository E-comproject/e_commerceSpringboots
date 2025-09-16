package com.ecommerce.EcommerceApplication.domain.service;

import com.ecommerce.EcommerceApplication.domain.model.PaymentStatus;
import com.ecommerce.EcommerceApplication.domain.validation.PaymentValidator;
import com.ecommerce.EcommerceApplication.dto.*;
import com.ecommerce.EcommerceApplication.entity.PaymentEntity;
import com.ecommerce.EcommerceApplication.exception.NotFoundException;
import com.ecommerce.EcommerceApplication.mapper.PaymentMapper;
import com.ecommerce.EcommerceApplication.repository.PaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
class PaymentServiceImpl implements PaymentService {

  private final PaymentJpaRepository repo;
  private final List<PaymentValidator> validators;

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
    if (status != null)  return repo.findByStatus(status, pageable).map(PaymentMapper::toResponse);
    return repo.findAll(pageable).map(PaymentMapper::toResponse);
  }

  @Override
  public PaymentResponse updateStatus(Long id, PaymentStatusUpdateRequest req) {
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("payment not found"));

    var tx = PaymentMapper.normalize(req.transactionId());
    if (tx != null && !tx.equals(e.getTransactionId()) && repo.existsByTransactionId(tx)) {
      // ยังคงกฎ duplicate ที่ชั้น service สำหรับ patch
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
}
