package com.ecommerce.EcommerceApplication.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.EcommerceApplication.entity.Inventory;
import com.ecommerce.EcommerceApplication.entity.InventoryReservation;
import com.ecommerce.EcommerceApplication.entity.InventoryReservation.ReservationStatus;
import com.ecommerce.EcommerceApplication.repository.InventoryRepository;
import com.ecommerce.EcommerceApplication.repository.InventoryReservationRepository;
import com.ecommerce.EcommerceApplication.service.InventoryService;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, InventoryReservationRepository reservationRepository) {
        this.inventoryRepository = inventoryRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public boolean reserveStock(Long variantId, int quantity, String reservationId) {
        Inventory inventory = inventoryRepository.findByVariantId(variantId).orElse(null);
        if (inventory == null) return false;
        int available = inventory.getAvailableQuantity();
        if (quantity <= 0 || available < quantity) return false;
        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);
        inventoryRepository.save(inventory);
        reservationRepository.save(new InventoryReservation(reservationId, variantId, quantity));
        return true;
    }

    @Override
    public boolean releaseStock(String reservationId) {
        InventoryReservation res = reservationRepository.findByReservationId(reservationId).orElse(null);
        if (res == null || res.getStatus() != ReservationStatus.RESERVED) return false;
        Inventory inventory = inventoryRepository.findByVariantId(res.getVariantId()).orElse(null);
        if (inventory == null) return false;
        inventory.setQuantityReserved(Math.max(0, inventory.getQuantityReserved() - res.getQuantity()));
        inventoryRepository.save(inventory);
        res.setStatus(ReservationStatus.RELEASED);
        reservationRepository.save(res);
        return true;
    }

    @Override
    public boolean commitStock(String reservationId) {
        InventoryReservation res = reservationRepository.findByReservationId(reservationId).orElse(null);
        if (res == null || res.getStatus() != ReservationStatus.RESERVED) return false;
        Inventory inventory = inventoryRepository.findByVariantId(res.getVariantId()).orElse(null);
        if (inventory == null) return false;
        // move reserved -> consumed (decrease on hand, decrease reserved)
        if (inventory.getQuantityOnHand() < res.getQuantity()) return false;
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() - res.getQuantity());
        inventory.setQuantityReserved(Math.max(0, inventory.getQuantityReserved() - res.getQuantity()));
        inventoryRepository.save(inventory);
        res.setStatus(ReservationStatus.COMMITTED);
        reservationRepository.save(res);
        return true;
    }

    @Override
    public int getAvailable(Long variantId) {
        return inventoryRepository.findByVariantId(variantId)
            .map(Inventory::getAvailableQuantity)
            .orElse(0);
    }
}


