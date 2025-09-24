package com.ecommerce.EcommerceApplication.controller;

import java.net.URI;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.entity.Shop;
import com.ecommerce.EcommerceApplication.repository.ShopRepository;

@RestController
@RequestMapping("/shops")             // จะได้เป็น /api/shops เพราะโปรเจกต์คุณมี prefix /api อยู่แล้ว
@CrossOrigin(origins = "http://localhost:3000")
public class ShopController {

    private final ShopRepository repo;
    public ShopController(ShopRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Shop> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Shop> create(@RequestBody Shop shop) {
        // จำกัด 1 ร้านต่อ 1 ผู้ขาย
        if (shop.getSellerUserId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        if (repo.existsBySellerUserId(shop.getSellerUserId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        // สร้าง slug อัตโนมัติถ้าไม่ส่งมา
        if (shop.getSlug() == null || shop.getSlug().isBlank()) {
            shop.setSlug(slugify(shop.getName()));
        }
        // กัน slug ซ้ำแบบง่าย
        String base = slugify(shop.getSlug());
        String s = base; int i = 2;
        while (repo.existsBySlug(s)) s = base + "-" + (i++);

        shop.setSlug(s);
        Shop saved = repo.save(shop);
        return ResponseEntity.created(URI.create("/api/shops/" + saved.getId()))
                             .body(saved);
    }

    private String slugify(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "");
        return slug.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }
}
