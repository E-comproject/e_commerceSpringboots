package com.ecommerce.EcommerceApplication.controller;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.EcommerceApplication.dto.OrderStatusHistoryDto;
import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.OrderStatusHistory;
import com.ecommerce.EcommerceApplication.service.OrderWorkflowService;

/**
 * REST Controller for managing order workflow and status transitions
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderWorkflowController {

    @Autowired
    private OrderWorkflowService orderWorkflowService;

    /**
     * Get all available order statuses
     */
    @GetMapping("/statuses")
    public ResponseEntity<OrderStatus[]> getAllOrderStatuses() {
        return ResponseEntity.ok(OrderStatus.values());
    }

    /**
     * Get allowed status transitions for an order
     */
    @GetMapping("/{orderId}/allowed-transitions")
    public ResponseEntity<Set<OrderStatus>> getAllowedTransitions(@PathVariable Long orderId) {
        Set<OrderStatus> transitions = orderWorkflowService.getAllowedTransitions(orderId);
        return ResponseEntity.ok(transitions);
    }

    /**
     * Check if a status transition is valid
     */
    @GetMapping("/{orderId}/can-transition/{status}")
    public ResponseEntity<Boolean> canTransitionTo(@PathVariable Long orderId,
                                                  @PathVariable OrderStatus status) {
        boolean canTransition = orderWorkflowService.canTransitionTo(orderId, status);
        return ResponseEntity.ok(canTransition);
    }

    /**
     * Get order status history
     */
    @GetMapping("/{orderId}/status-history")
    public ResponseEntity<List<OrderStatusHistoryDto>> getOrderStatusHistory(@PathVariable Long orderId) {
        List<OrderStatusHistory> history = orderWorkflowService.getOrderStatusHistory(orderId);
        List<OrderStatusHistoryDto> historyDto = history.stream()
                .map(OrderStatusHistoryDto::new)
                .toList();
        return ResponseEntity.ok(historyDto);
    }

    /**
     * Get latest status change for an order
     */
    @GetMapping("/{orderId}/latest-status-change")
    public ResponseEntity<OrderStatusHistoryDto> getLatestStatusChange(@PathVariable Long orderId) {
        OrderStatusHistory latest = orderWorkflowService.getLatestStatusChange(orderId);
        if (latest == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new OrderStatusHistoryDto(latest));
    }

    /**
     * Change order status manually
     */
    @PostMapping("/{orderId}/change-status")
    public ResponseEntity<String> changeOrderStatus(@PathVariable Long orderId,
                                                   @RequestBody ChangeStatusRequest request) {
        boolean success = orderWorkflowService.changeOrderStatus(
            orderId, request.newStatus, request.reason, request.userId, request.role
        );

        if (success) {
            return ResponseEntity.ok("Order status changed successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to change order status");
        }
    }

    /**
     * Confirm order (merchant action)
     */
    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<String> confirmOrder(@PathVariable Long orderId,
                                             @RequestBody ConfirmOrderRequest request) {
        boolean success = orderWorkflowService.confirmOrder(orderId, request.merchantId, request.notes);

        if (success) {
            return ResponseEntity.ok("Order confirmed successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to confirm order");
        }
    }

    /**
     * Mark order as ready to ship
     */
    @PostMapping("/{orderId}/ready-to-ship")
    public ResponseEntity<String> markReadyToShip(@PathVariable Long orderId,
                                                @RequestBody MerchantActionRequest request) {
        boolean success = orderWorkflowService.markReadyToShip(orderId, request.merchantId);

        if (success) {
            return ResponseEntity.ok("Order marked as ready to ship");
        } else {
            return ResponseEntity.badRequest().body("Failed to mark order as ready to ship");
        }
    }

    /**
     * Mark order as shipped
     */
    @PostMapping("/{orderId}/ship")
    public ResponseEntity<String> markAsShipped(@PathVariable Long orderId,
                                              @RequestBody ShipOrderRequest request) {
        boolean success = orderWorkflowService.markAsShipped(orderId, request.trackingNumber, request.merchantId);

        if (success) {
            return ResponseEntity.ok("Order marked as shipped");
        } else {
            return ResponseEntity.badRequest().body("Failed to mark order as shipped");
        }
    }

    /**
     * Mark order as delivered
     */
    @PostMapping("/{orderId}/deliver")
    public ResponseEntity<String> markAsDelivered(@PathVariable Long orderId,
                                                @RequestBody DeliveryRequest request) {
        boolean success = orderWorkflowService.markAsDelivered(orderId, request.deliveryProof);

        if (success) {
            return ResponseEntity.ok("Order marked as delivered");
        } else {
            return ResponseEntity.badRequest().body("Failed to mark order as delivered");
        }
    }

    /**
     * Complete order (customer action)
     */
    @PostMapping("/{orderId}/complete")
    public ResponseEntity<String> completeOrder(@PathVariable Long orderId,
                                              @RequestBody CustomerActionRequest request) {
        boolean success = orderWorkflowService.completeOrder(orderId, request.customerId);

        if (success) {
            return ResponseEntity.ok("Order completed successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to complete order");
        }
    }

    /**
     * Cancel order
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId,
                                            @RequestBody CancelOrderRequest request) {
        boolean success = orderWorkflowService.cancelOrder(
            orderId, request.reason, request.userId, request.role
        );

        if (success) {
            return ResponseEntity.ok("Order cancelled successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to cancel order");
        }
    }

    /**
     * Put order on hold (admin action)
     */
    @PostMapping("/{orderId}/hold")
    public ResponseEntity<String> putOrderOnHold(@PathVariable Long orderId,
                                               @RequestBody HoldOrderRequest request) {
        boolean success = orderWorkflowService.putOrderOnHold(orderId, request.reason, request.adminId);

        if (success) {
            return ResponseEntity.ok("Order put on hold");
        } else {
            return ResponseEntity.badRequest().body("Failed to put order on hold");
        }
    }

    /**
     * Resume order from hold
     */
    @PostMapping("/{orderId}/resume")
    public ResponseEntity<String> resumeOrderFromHold(@PathVariable Long orderId,
                                                    @RequestBody ResumeOrderRequest request) {
        boolean success = orderWorkflowService.resumeOrderFromHold(orderId, request.resumeReason, request.adminId);

        if (success) {
            return ResponseEntity.ok("Order resumed from hold");
        } else {
            return ResponseEntity.badRequest().body("Failed to resume order from hold");
        }
    }

    /**
     * Get order with workflow summary
     */
    @GetMapping("/{orderId}/workflow-summary")
    public ResponseEntity<Order> getOrderWithWorkflowSummary(@PathVariable Long orderId) {
        Order order = orderWorkflowService.getOrderWithWorkflowSummary(orderId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }

    /**
     * Validate order workflow consistency
     */
    @GetMapping("/{orderId}/validate-workflow")
    public ResponseEntity<Boolean> validateOrderWorkflow(@PathVariable Long orderId) {
        boolean isValid = orderWorkflowService.validateOrderWorkflow(orderId);
        return ResponseEntity.ok(isValid);
    }

    // ===== Request DTOs =====

    public static class ChangeStatusRequest {
        public OrderStatus newStatus;
        public String reason;
        public Long userId;
        public String role;
    }

    public static class ConfirmOrderRequest {
        public Long merchantId;
        public String notes;
    }

    public static class MerchantActionRequest {
        public Long merchantId;
    }

    public static class ShipOrderRequest {
        public String trackingNumber;
        public Long merchantId;
    }

    public static class DeliveryRequest {
        public String deliveryProof;
    }

    public static class CustomerActionRequest {
        public Long customerId;
    }

    public static class CancelOrderRequest {
        public String reason;
        public Long userId;
        public String role;
    }

    public static class HoldOrderRequest {
        public String reason;
        public Long adminId;
    }

    public static class ResumeOrderRequest {
        public String resumeReason;
        public Long adminId;
    }
}