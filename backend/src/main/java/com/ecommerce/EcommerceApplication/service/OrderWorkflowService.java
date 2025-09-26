package com.ecommerce.EcommerceApplication.service;

import java.util.List;
import java.util.Set;

import com.ecommerce.EcommerceApplication.entity.Order;
import com.ecommerce.EcommerceApplication.entity.OrderStatus;
import com.ecommerce.EcommerceApplication.entity.OrderStatusHistory;

/**
 * Service interface for managing order status workflow and transitions
 */
public interface OrderWorkflowService {

    /**
     * Change order status with validation and history tracking
     *
     * @param orderId the order ID
     * @param newStatus the new status to transition to
     * @param reason the reason for status change
     * @param userId the user making the change (null for system changes)
     * @param role the role of the user making the change
     * @return true if status change was successful, false otherwise
     */
    boolean changeOrderStatus(Long orderId, OrderStatus newStatus, String reason, Long userId, String role);

    /**
     * Change order status automatically (system-triggered)
     *
     * @param orderId the order ID
     * @param newStatus the new status to transition to
     * @param reason the reason for automatic status change
     * @return true if status change was successful, false otherwise
     */
    boolean changeOrderStatusAutomatically(Long orderId, OrderStatus newStatus, String reason);

    /**
     * Change order status with external reference
     *
     * @param orderId the order ID
     * @param newStatus the new status
     * @param reason the reason for change
     * @param userId the user making the change
     * @param role the user's role
     * @param externalReference external reference (payment ID, tracking number, etc.)
     * @return true if successful
     */
    boolean changeOrderStatusWithReference(Long orderId, OrderStatus newStatus, String reason,
                                         Long userId, String role, String externalReference);

    /**
     * Get allowed next statuses for an order
     *
     * @param orderId the order ID
     * @return set of allowed status transitions
     */
    Set<OrderStatus> getAllowedTransitions(Long orderId);

    /**
     * Check if a status transition is valid for an order
     *
     * @param orderId the order ID
     * @param newStatus the status to check
     * @return true if transition is allowed
     */
    boolean canTransitionTo(Long orderId, OrderStatus newStatus);

    /**
     * Get order status history
     *
     * @param orderId the order ID
     * @return list of status history entries
     */
    List<OrderStatusHistory> getOrderStatusHistory(Long orderId);

    /**
     * Get the latest status change for an order
     *
     * @param orderId the order ID
     * @return the most recent status history entry
     */
    OrderStatusHistory getLatestStatusChange(Long orderId);

    /**
     * Mark order as paid (when payment is completed)
     *
     * @param orderId the order ID
     * @param paymentId the payment ID for reference
     * @return true if successful
     */
    boolean markOrderAsPaid(Long orderId, String paymentId);

    /**
     * Confirm order (merchant confirms they can fulfill the order)
     *
     * @param orderId the order ID
     * @param merchantId the merchant confirming the order
     * @param notes any additional notes
     * @return true if successful
     */
    boolean confirmOrder(Long orderId, Long merchantId, String notes);

    /**
     * Mark order as ready to ship
     *
     * @param orderId the order ID
     * @param merchantId the merchant preparing shipment
     * @return true if successful
     */
    boolean markReadyToShip(Long orderId, Long merchantId);

    /**
     * Mark order as shipped
     *
     * @param orderId the order ID
     * @param trackingNumber the shipment tracking number
     * @param merchantId the merchant shipping the order
     * @return true if successful
     */
    boolean markAsShipped(Long orderId, String trackingNumber, Long merchantId);

    /**
     * Mark order as delivered
     *
     * @param orderId the order ID
     * @param deliveryProof proof of delivery (photo, signature, etc.)
     * @return true if successful
     */
    boolean markAsDelivered(Long orderId, String deliveryProof);

    /**
     * Complete order (final successful state)
     *
     * @param orderId the order ID
     * @param customerId the customer completing the order
     * @return true if successful
     */
    boolean completeOrder(Long orderId, Long customerId);

    /**
     * Cancel order
     *
     * @param orderId the order ID
     * @param reason reason for cancellation
     * @param userId user cancelling the order
     * @param role role of the user
     * @return true if successful
     */
    boolean cancelOrder(Long orderId, String reason, Long userId, String role);

    /**
     * Put order on hold
     *
     * @param orderId the order ID
     * @param reason reason for putting on hold
     * @param adminId admin putting order on hold
     * @return true if successful
     */
    boolean putOrderOnHold(Long orderId, String reason, Long adminId);

    /**
     * Resume order from hold
     *
     * @param orderId the order ID
     * @param resumeReason reason for resuming
     * @param adminId admin resuming the order
     * @return true if successful
     */
    boolean resumeOrderFromHold(Long orderId, String resumeReason, Long adminId);

    /**
     * Get order workflow summary for dashboard
     *
     * @param orderId the order ID
     * @return order with status summary
     */
    Order getOrderWithWorkflowSummary(Long orderId);

    /**
     * Validate order workflow consistency
     *
     * @param orderId the order ID
     * @return true if workflow is consistent
     */
    boolean validateOrderWorkflow(Long orderId);
}