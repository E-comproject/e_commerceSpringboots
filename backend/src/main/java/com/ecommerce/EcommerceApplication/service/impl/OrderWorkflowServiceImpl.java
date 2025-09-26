package com.ecommerce.EcommerceApplication.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.OrderStatusHistory;
import com.ecommerce.EcommerceApplication.repository.OrderRepository;
import com.ecommerce.EcommerceApplication.repository.OrderStatusHistoryRepository;
import com.ecommerce.EcommerceApplication.service.OrderWorkflowService;

@Service
@Transactional
public class OrderWorkflowServiceImpl implements OrderWorkflowService {

    private static final Logger logger = LoggerFactory.getLogger(OrderWorkflowServiceImpl.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository statusHistoryRepository;

    @Override
    public boolean changeOrderStatus(Long orderId, OrderStatus newStatus, String reason, Long userId, String role) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                logger.error("Order not found with ID: {}", orderId);
                return false;
            }

            Order order = orderOpt.get();
            boolean success = order.changeStatus(newStatus, reason, userId, role);

            if (success) {
                orderRepository.save(order);
                logger.info("Order {} status changed from {} to {} by user {} ({})",
                    orderId, order.getStatus(), newStatus, userId, role);
                return true;
            } else {
                logger.warn("Invalid status transition for order {} from {} to {}",
                    orderId, order.getStatus(), newStatus);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error changing order status for order {}: {}", orderId, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean changeOrderStatusAutomatically(Long orderId, OrderStatus newStatus, String reason) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                logger.error("Order not found with ID: {}", orderId);
                return false;
            }

            Order order = orderOpt.get();
            boolean success = order.changeStatusAutomatically(newStatus, reason);

            if (success) {
                orderRepository.save(order);
                logger.info("Order {} status automatically changed to {} - reason: {}",
                    orderId, newStatus, reason);
                return true;
            } else {
                logger.warn("Invalid automatic status transition for order {} from {} to {}",
                    orderId, order.getStatus(), newStatus);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error automatically changing order status for order {}: {}", orderId, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean changeOrderStatusWithReference(Long orderId, OrderStatus newStatus, String reason,
                                                 Long userId, String role, String externalReference) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                logger.error("Order not found with ID: {}", orderId);
                return false;
            }

            Order order = orderOpt.get();

            // Validate transition
            if (!order.getStatus().canTransitionTo(newStatus)) {
                logger.warn("Invalid status transition for order {} from {} to {}",
                    orderId, order.getStatus(), newStatus);
                return false;
            }

            OrderStatus previousStatus = order.getStatus();
            order.setStatus(newStatus);

            // Create history with external reference
            OrderStatusHistory history = userId != null ?
                OrderStatusHistory.createUserChange(order, previousStatus, newStatus, reason, userId, role) :
                OrderStatusHistory.createSystemChange(order, previousStatus, newStatus, reason);

            history.setExternalReference(externalReference);
            order.addStatusHistory(history);

            orderRepository.save(order);
            logger.info("Order {} status changed to {} with external reference: {}",
                orderId, newStatus, externalReference);
            return true;

        } catch (Exception e) {
            logger.error("Error changing order status with reference for order {}: {}", orderId, e.getMessage());
            return false;
        }
    }

    @Override
    public Set<OrderStatus> getAllowedTransitions(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return Set.of();
        }

        Order order = orderOpt.get();
        return order.getStatus() != null ? order.getStatus().getAllowedTransitions() : Set.of();
    }

    @Override
    public boolean canTransitionTo(Long orderId, OrderStatus newStatus) {
        return getAllowedTransitions(orderId).contains(newStatus);
    }

    @Override
    public List<OrderStatusHistory> getOrderStatusHistory(Long orderId) {
        return statusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    @Override
    public OrderStatusHistory getLatestStatusChange(Long orderId) {
        return statusHistoryRepository.findLatestByOrderId(orderId);
    }

    @Override
    public boolean markOrderAsPaid(Long orderId, String paymentId) {
        return changeOrderStatusWithReference(orderId, OrderStatus.PAID,
            "Payment completed", null, "SYSTEM", "PAYMENT_" + paymentId);
    }

    @Override
    public boolean confirmOrder(Long orderId, Long merchantId, String notes) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return false;
            }

            Order order = orderOpt.get();
            boolean success = order.changeStatus(OrderStatus.CONFIRMED,
                "Order confirmed by merchant", merchantId, "MERCHANT");

            if (success && notes != null && !notes.trim().isEmpty()) {
                // Add notes to the latest history entry
                List<OrderStatusHistory> history = order.getStatusHistory();
                if (!history.isEmpty()) {
                    OrderStatusHistory latest = history.get(history.size() - 1);
                    latest.setNotes(notes);
                }
            }

            if (success) {
                orderRepository.save(order);
            }

            return success;

        } catch (Exception e) {
            logger.error("Error confirming order {}: {}", orderId, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean markReadyToShip(Long orderId, Long merchantId) {
        return changeOrderStatus(orderId, OrderStatus.READY_TO_SHIP,
            "Items prepared and ready for shipment", merchantId, "MERCHANT");
    }

    @Override
    public boolean markAsShipped(Long orderId, String trackingNumber, Long merchantId) {
        return changeOrderStatusWithReference(orderId, OrderStatus.SHIPPED,
            "Order shipped", merchantId, "MERCHANT", "TRACKING_" + trackingNumber);
    }

    @Override
    public boolean markAsDelivered(Long orderId, String deliveryProof) {
        return changeOrderStatusWithReference(orderId, OrderStatus.DELIVERED,
            "Order delivered to customer", null, "SYSTEM", "DELIVERY_" + deliveryProof);
    }

    @Override
    public boolean completeOrder(Long orderId, Long customerId) {
        return changeOrderStatus(orderId, OrderStatus.COMPLETED,
            "Order completed successfully", customerId, "CUSTOMER");
    }

    @Override
    public boolean cancelOrder(Long orderId, String reason, Long userId, String role) {
        return changeOrderStatus(orderId, OrderStatus.CANCELLED, reason, userId, role);
    }

    @Override
    public boolean putOrderOnHold(Long orderId, String reason, Long adminId) {
        return changeOrderStatus(orderId, OrderStatus.ON_HOLD, reason, adminId, "ADMIN");
    }

    @Override
    public boolean resumeOrderFromHold(Long orderId, String resumeReason, Long adminId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return false;
            }

            Order order = orderOpt.get();
            if (order.getStatus() != OrderStatus.ON_HOLD) {
                logger.warn("Cannot resume order {} - current status is not ON_HOLD", orderId);
                return false;
            }

            // Determine the appropriate status to return to based on order state
            OrderStatus resumeStatus = determineResumeStatus(order);
            return changeOrderStatus(orderId, resumeStatus, resumeReason, adminId, "ADMIN");

        } catch (Exception e) {
            logger.error("Error resuming order from hold {}: {}", orderId, e.getMessage());
            return false;
        }
    }

    private OrderStatus determineResumeStatus(Order order) {
        // Logic to determine appropriate status based on order state
        if (order.requiresPayment()) {
            return OrderStatus.PENDING;
        } else if (order.isFullyPaid()) {
            return OrderStatus.CONFIRMED;
        } else {
            return OrderStatus.PROCESSING;
        }
    }

    @Override
    public Order getOrderWithWorkflowSummary(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    @Override
    public boolean validateOrderWorkflow(Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return false;
            }

            Order order = orderOpt.get();
            List<OrderStatusHistory> history = getOrderStatusHistory(orderId);

            // Validate that all status transitions in history were valid
            for (int i = 0; i < history.size() - 1; i++) {
                OrderStatusHistory current = history.get(i);
                OrderStatusHistory next = history.get(i + 1);

                if (current.getPreviousStatus() != null &&
                    !current.getPreviousStatus().canTransitionTo(current.getNewStatus())) {
                    logger.error("Invalid transition found in order {} history: {} -> {}",
                        orderId, current.getPreviousStatus(), current.getNewStatus());
                    return false;
                }
            }

            // Validate current status matches latest history
            if (!history.isEmpty()) {
                OrderStatusHistory latest = history.get(0); // Most recent (DESC order)
                if (!order.getStatus().equals(latest.getNewStatus())) {
                    logger.error("Order {} current status {} doesn't match latest history {}",
                        orderId, order.getStatus(), latest.getNewStatus());
                    return false;
                }
            }

            return true;

        } catch (Exception e) {
            logger.error("Error validating workflow for order {}: {}", orderId, e.getMessage());
            return false;
        }
    }
}