package com.ecommerce.EcommerceApplication.controller;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.ProductDto;
import com.ecommerce.EcommerceApplication.dto.ProductImageDto;
import com.ecommerce.EcommerceApplication.entity.Product;
import com.ecommerce.EcommerceApplication.repository.ProductRepository;
import com.ecommerce.EcommerceApplication.service.ProductService;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductService productService;

    public ProductController(ProductRepository productRepository, ProductService productService) {
        this.productRepository = productRepository;
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(p -> ResponseEntity.ok(this.toDto(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public Page<ProductDto> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return productService.search(q, categoryId, status, org.springframework.data.domain.PageRequest.of(page, size));
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity
                .created(URI.create("/products/" + saved.getId()))
                .body(this.toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product)
                .map(updated -> ResponseEntity.ok(this.toDto(updated)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // -------- Mapping helpers (Entity -> DTO) --------
    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.id = p.getId();
        dto.shopId = p.getShopId();
        dto.categoryId = p.getCategoryId();
        dto.name = p.getName();
        dto.slug = p.getSlug();
        dto.description = p.getDescription();
        dto.price = p.getPrice();
        dto.comparePrice = p.getComparePrice();
        dto.sku = p.getSku();
        dto.stockQuantity = p.getStockQuantity();
        dto.weightGram = p.getWeightGram();
        dto.status = p.getStatus();
        dto.ratingAvg = p.getRatingAvg();
        dto.ratingCount = p.getRatingCount();
        dto.createdAt = p.getCreatedAt();

        if (p.getImages() != null) {
            dto.images = p.getImages().stream().map(img -> {
                ProductImageDto idto = new ProductImageDto();
                idto.id = img.getId();
                idto.url = img.getUrl();
                idto.sortOrder = img.getSortOrder();
                idto.altText = img.getAltText();
                return idto;
            }).collect(Collectors.toList());
        }
        return dto;
    }
}
