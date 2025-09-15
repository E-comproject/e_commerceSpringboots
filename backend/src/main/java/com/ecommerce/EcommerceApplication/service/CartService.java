package com.ecommerce.EcommerceApplication.service;

import java.util.List;

import com.ecommerce.EcommerceApplication.entity.Cart;
import com.ecommerce.EcommerceApplication.entity.CartItem;

public interface CartService {
    Cart getOrCreateCart(Long userId);
    List<CartItem> listItems(Long cartId);
    CartItem addItem(Long cartId, Long productId, int quantity);
    CartItem updateItem(Long itemId, int quantity);
    boolean removeItem(Long cartId, Long itemId);  // ✅ ยึด cartId ด้วย
    boolean clearCart(Long cartId);
    // CartService.java
Cart getCart(Long cartId);

}
