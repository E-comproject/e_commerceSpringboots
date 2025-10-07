package com.ecommerce.EcommerceApplication.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        
        // Check database connection
        try {
            if (jdbcTemplate != null) {
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                health.put("database", "UP");
            } else {
                health.put("database", "NOT_CONFIGURED");
            }
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("database_error", e.getMessage());
        }
        
        return health;
    }
}
