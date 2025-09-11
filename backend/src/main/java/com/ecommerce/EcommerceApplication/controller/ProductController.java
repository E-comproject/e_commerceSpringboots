package com.ecommerce.EcommerceApplication.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @GetMapping
    public String getAllProducts() {
        return "รายการสินค้าทั้งหมดจากดลnicky5555";
    }

    @GetMapping("/{id}")
    public String getProductById(@PathVariable Long id) {
        return "สินค้า ID: " + id;
    }

    @PostMapping
    public String createProduct(@RequestBody String product) {
        return "สร้างสินค้าใหม่: " + product;
    }

    @PutMapping("/{id}")
    public String updateProduct(@PathVariable Long id, @RequestBody String product) {
        return "อัปเดตสินค้า ID: " + id;
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        return "ลบสินค้า ID: " + id;
    }
}
