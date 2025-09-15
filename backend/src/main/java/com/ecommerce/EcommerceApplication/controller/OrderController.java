package com.ecommerce.EcommerceApplication.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.CheckoutReq;
import com.ecommerce.EcommerceApplication.dto.OrderDto;
import com.ecommerce.EcommerceApplication.service.OrderService;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    // แปลง Cart → Order
    @PostMapping("/checkout")
    public OrderDto checkout(
            @RequestParam Long userId,
            @RequestBody CheckoutReq req
    ) {
        return service.checkout(userId, req);
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<OrderDto> myOrders(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.listByUser(userId, PageRequest.of(page, size));
    }
}
