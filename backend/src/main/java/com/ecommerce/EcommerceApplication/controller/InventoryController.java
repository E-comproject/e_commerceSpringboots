package com.ecommerce.EcommerceApplication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.service.InventoryService;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/available/{variantId}")
    public ResponseEntity<Integer> getAvailable(@PathVariable Long variantId) {
        return ResponseEntity.ok(inventoryService.getAvailable(variantId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<Void> reserve(@RequestParam Long variantId, @RequestParam int quantity, @RequestParam String reservationId) {
        return inventoryService.reserveStock(variantId, quantity, reservationId)
            ? ResponseEntity.ok().build()
            : ResponseEntity.badRequest().build();
    }

    @PostMapping("/release")
    public ResponseEntity<Void> release(@RequestParam String reservationId) {
        return inventoryService.releaseStock(reservationId)
            ? ResponseEntity.ok().build()
            : ResponseEntity.badRequest().build();
    }

    @PostMapping("/commit")
    public ResponseEntity<Void> commit(@RequestParam String reservationId) {
        return inventoryService.commitStock(reservationId)
            ? ResponseEntity.ok().build()
            : ResponseEntity.badRequest().build();
    }
}


