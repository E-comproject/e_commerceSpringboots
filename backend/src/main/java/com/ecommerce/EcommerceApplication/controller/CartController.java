package com.ecommerce.EcommerceApplication.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.AddToCartReq;
import com.ecommerce.EcommerceApplication.dto.CartDto;
import com.ecommerce.EcommerceApplication.dto.CartItemDto;
import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;
import com.ecommerce.EcommerceApplication.service.CartService;
import com.ecommerce.EcommerceApplication.util.AuthUtils;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;
    private final AuthUtils authUtils;

    public CartController(CartService cartService, AuthUtils authUtils) {
        this.cartService = cartService;
        this.authUtils = authUtils;
    }

    private Long getUserId(Authentication auth) {
        return authUtils.getUserIdFromUsername(auth.getName());
    }

    // ดึง userId จาก JWT Authentication
    @GetMapping
    public ResponseEntity<CartDto> getOrCreate(Authentication auth) {
        Long userId = getUserId(auth);
        Cart cart = cartService.getOrCreateCart(userId);
        return ResponseEntity.ok(toDto(cart, cartService.listItems(cart.getId())));
    }

    // ดึงรายการในตะกร้า (ใช้ userId จาก JWT)
    @GetMapping("/items")
    public ResponseEntity<CartDto> listItems(Authentication auth) {
        Long userId = getUserId(auth);
        Cart cart = cartService.getOrCreateCart(userId);
        List<CartItem> items = cartService.listItems(cart.getId());
        return ResponseEntity.ok(toDto(cart, items));
    }

    // เพิ่มสินค้าเข้าตะกร้า (รองรับทั้ง product และ variant)
    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(Authentication auth,
                                         @RequestBody AddToCartReq request) {
        try {
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }

            Long userId = getUserId(auth);
            Cart cart = cartService.getOrCreateCart(userId);

            CartItem addedItem;
            if (request.hasVariant()) {
                // Add product variant to cart
                addedItem = cartService.addItemWithVariant(cart.getId(), request.getProductId(),
                                                         request.getVariantId(), request.getQuantity());
            } else {
                // Add regular product to cart
                addedItem = cartService.addItem(cart.getId(), request.getProductId(), request.getQuantity());
            }

            List<CartItem> items = cartService.listItems(cart.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toDto(cart, items));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // เพิ่มสินค้าแบบเดิม (backward compatibility)
    @PostMapping("/items/simple")
    public ResponseEntity<CartDto> addItemSimple(Authentication auth,
                                               @RequestParam Long productId,
                                               @RequestParam int quantity) {
        try {
            Long userId = getUserId(auth);
            Cart cart = cartService.getOrCreateCart(userId);

            cartService.addItem(cart.getId(), productId, quantity);
            List<CartItem> items = cartService.listItems(cart.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toDto(cart, items));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // เปลี่ยนจำนวน (ถ้า <= 0 จะลบ และส่ง 204)
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(Authentication auth,
                                    @PathVariable Long itemId,
                                    @RequestParam int quantity) {
        Long userId = getUserId(auth);
        Cart cart = cartService.getOrCreateCart(userId);

        var updated = cartService.updateItem(itemId, quantity);
        if (updated == null) return ResponseEntity.noContent().build();

        List<CartItem> items = cartService.listItems(cart.getId());
        return ResponseEntity.ok(toDto(cart, items));
    }

    // ลบ item (ตรวจสอบว่าเป็นของ user คนนี้)
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(Authentication auth, @PathVariable Long itemId) {
        Long userId = getUserId(auth);
        Cart cart = cartService.getOrCreateCart(userId);

        return cartService.removeItem(cart.getId(), itemId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ล้างทั้งตะกร้า
    @DeleteMapping("/items")
    public ResponseEntity<Void> clear(Authentication auth) {
        Long userId = getUserId(auth);
        Cart cart = cartService.getOrCreateCart(userId);

        return cartService.clearCart(cart.getId())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.badRequest().build();
    }

    // ---------------- Mapping helpers ----------------
    private CartDto toDto(Cart cart, List<CartItem> items) {
        CartDto dto = new CartDto();
        dto.id = cart.getId();
        dto.userId = cart.getUserId();
        dto.createdAt = cart.getCreatedAt();
        dto.updatedAt = cart.getUpdatedAt();

        dto.items = items.stream().map(this::toItemDto).toList();
        dto.itemCount = dto.items.size();
        dto.totalQty = dto.items.stream().map(i -> i.quantity).reduce(0, Integer::sum);
        dto.subtotal = dto.items.stream()
                .map(i -> i.lineTotal != null ? i.lineTotal : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return dto;
    }

    private CartItemDto toItemDto(CartItem e) {
        CartItemDto d = new CartItemDto();
        d.id = e.getId();
        // ใช้ shadow id ให้แน่ใจว่ามีค่า แม้ relation ยัง LAZY
        d.productId = e.getProductId() != null
                ? e.getProductId()
                : (e.getProduct() != null ? e.getProduct().getId() : null);
        d.productName = (e.getProduct() != null) ? e.getProduct().getName() : null;
        d.productSku = (e.getProduct() != null) ? e.getProduct().getSku() : null;

        d.unitPrice = e.getPriceSnapshot();
        d.quantity = e.getQuantity();
        d.lineTotal = (e.getPriceSnapshot() == null || e.getQuantity() == null)
                ? BigDecimal.ZERO
                : e.getPriceSnapshot().multiply(BigDecimal.valueOf(e.getQuantity()));

        // Add variant information if exists
        if (e.hasVariant()) {
            d.variantId = e.getVariantId();
            d.variantSku = e.getVariant() != null ? e.getVariant().getSku() : null;
            d.variantTitle = e.getVariant() != null ? e.getVariant().getDisplayName() : null;
            d.productName = e.getDisplayName(); // This will include variant info
            d.effectiveSku = e.getEffectiveSku(); // Variant SKU if available
        } else {
            d.effectiveSku = d.productSku;
        }

        return d;
    }
}
