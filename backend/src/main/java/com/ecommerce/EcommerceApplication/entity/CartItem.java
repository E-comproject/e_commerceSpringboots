package com.ecommerce.EcommerceApplication.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // อ่านค่า ID ได้โดยไม่ต้องโหลด relation (read-only shadow columns)
    @Column(name = "cart_id", insertable = false, updatable = false)
    private Long cartId;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price_snapshot", precision = 12, scale = 2, nullable = false)
    private BigDecimal priceSnapshot;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    // -------- Relationships (owning side) --------
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // -------- Constructors --------
    public CartItem() {}

    public CartItem(Cart cart, Product product, Integer quantity, BigDecimal priceSnapshot) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.priceSnapshot = priceSnapshot;
    }

    // -------- Getters/Setters --------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCartId() { return cartId; } // read-only
    public Long getProductId() { return productId; } // read-only

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPriceSnapshot() { return priceSnapshot; }
    public void setPriceSnapshot(BigDecimal priceSnapshot) { this.priceSnapshot = priceSnapshot; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    // -------- Business helpers --------
    public BigDecimal getTotalPrice() {
        int qty = (quantity == null) ? 0 : quantity;
        BigDecimal price = (priceSnapshot == null) ? BigDecimal.ZERO : priceSnapshot;
        return price.multiply(BigDecimal.valueOf(qty));
    }
}
