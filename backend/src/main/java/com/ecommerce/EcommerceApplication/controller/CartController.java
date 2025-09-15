package com.ecommerce.EcommerceApplication.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.CartDto;
import com.ecommerce.EcommerceApplication.dto.CartItemDto;
import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;
import com.ecommerce.EcommerceApplication.service.CartService;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // สมมติรับ userId จากพารามิเตอร์ (โปรดักชันควรดึงจาก auth)
    @GetMapping
    public ResponseEntity<CartDto> getOrCreate(@RequestParam Long userId) {
        Cart cart = cartService.getOrCreateCart(userId);
        return ResponseEntity.ok(toDto(cart, cartService.listItems(cart.getId())));
    }

    // ดึงรายการในตะกร้า (ส่งรวมเป็น CartDto เช่นกัน)
   @GetMapping("/items")
    public ResponseEntity<CartDto> listItems(@RequestParam Long cartId) {
    Cart cart = cartService.getCart(cartId);                 // <-- โหลดจริง
    List<CartItem> items = cartService.listItems(cartId);
    return ResponseEntity.ok(toDto(cart, items));
}

    // เพิ่มสินค้าเข้าตะกร้า
    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(@RequestParam Long cartId,
                                       @RequestParam Long productId,
                                       @RequestParam int quantity) {
    cartService.addItem(cartId, productId, quantity);
    Cart cart = cartService.getCart(cartId);                 // <-- โหลดจริง
    List<CartItem> items = cartService.listItems(cartId);
    return ResponseEntity.status(HttpStatus.CREATED).body(toDto(cart, items));
}

    // เปลี่ยนจำนวน (ถ้า <= 0 จะลบ และส่ง 204)
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@PathVariable Long itemId,
                                    @RequestParam int quantity,
                                    @RequestParam Long cartId) {
    var updated = cartService.updateItem(itemId, quantity);
    if (updated == null) return ResponseEntity.noContent().build();
    Cart cart = cartService.getCart(cartId);                 // <-- โหลดจริง
    List<CartItem> items = cartService.listItems(cartId);
    return ResponseEntity.ok(toDto(cart, items));
}

    // ลบ item โดยยึด cartId + itemId (กันลบของคนอื่น)
    @DeleteMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long cartId, @PathVariable Long itemId) {
        return cartService.removeItem(cartId, itemId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ล้างทั้งตะกร้า
    @DeleteMapping("/items")
    public ResponseEntity<Void> clear(@RequestParam Long cartId) {
        return cartService.clearCart(cartId)
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
        return d;
    }
}
