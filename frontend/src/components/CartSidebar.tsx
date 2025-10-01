'use client'

import React, { useEffect, useState } from 'react'
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  Loader2
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

interface CartItem {
  id: number
  productId: number
  productName?: string
  productSku?: string
  variantId?: number
  variantSku?: string
  variantTitle?: string
  effectiveSku?: string
  unitPrice?: number
  quantity?: number
  lineTotal?: number
}

interface Cart {
  id: number
  userId: number
  items: CartItem[]
  totalAmount?: number
  totalItems?: number
  subtotal?: number
  itemCount?: number
  totalQty?: number
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  userId?: number
}

export default function CartSidebar({ isOpen, onClose, userId = 1 }: CartSidebarProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<number | null>(null) // Track which item is being updated

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE}/cart?userId=${userId}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      const cartData = await response.json()
      console.log('Cart sidebar data:', cartData)
      setCart(cartData)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const updateItemQuantity = async (itemId: number, newQuantity: number) => {
    if (!cart || newQuantity < 0) return

    setUpdating(itemId)
    try {
      const response = await fetch(`${API_BASE}/cart/items/${itemId}?quantity=${newQuantity}&cartId=${cart.id}`, {
        method: 'PUT'
      })

      if (response.status === 204) {
        // Item was removed (quantity <= 0)
        await fetchCart() // Refresh the cart
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.status}`)
      }

      const updatedCartData = await response.json()
      setCart(updatedCartData)
    } catch (err) {
      console.error('Error updating item quantity:', err)
      setError(err instanceof Error ? err.message : 'Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: number) => {
    if (!cart) return

    setUpdating(itemId)
    try {
      const response = await fetch(`${API_BASE}/cart/${cart.id}/items/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok || response.status === 204) {
        // Item removed successfully
        await fetchCart() // Refresh the cart
      } else {
        throw new Error(`Failed to remove item: ${response.status}`)
      }
    } catch (err) {
      console.error('Error removing item:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    if (!cart) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/cart/items?cartId=${cart.id}`, {
        method: 'DELETE'
      })

      if (response.ok || response.status === 204) {
        // Cart cleared successfully
        await fetchCart()
      } else {
        throw new Error(`Failed to clear cart: ${response.status}`)
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear cart')
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCart()
    }
  }, [isOpen, userId])

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalItems = cart?.totalQty || cart?.itemCount || 0
  const totalAmount = cart?.subtotal || cart?.totalAmount || 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">ตะกร้าสินค้า</h2>
                <p className="text-sm text-gray-600">{totalItems} รายการ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">กำลังโหลด...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-600 mb-4">
                  <Package className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">เกิดข้อผิดพลาด</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  onClick={fetchCart}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ลองใหม่
                </button>
              </div>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ตะกร้าสินค้าว่างเปล่า</h3>
                <p className="text-gray-600 text-center mb-6">ยังไม่มีสินค้าในตะกร้า เริ่มเลือกซื้อสินค้าได้เลย</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  เลือกซื้อสินค้า
                </button>
              </div>
            ) : (
              <div className="p-4">
                {/* Clear Cart Button */}
                {cart.items.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      ล้างตะกร้าทั้งหมด
                    </button>
                  </div>
                )}

                {/* Cart Items */}
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {/* Product Image Placeholder */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {item.productName || 'ไม่ระบุชื่อสินค้า'}
                          </h4>

                          {item.variantTitle && (
                            <p className="text-sm text-gray-600 mb-1">
                              {item.variantTitle}
                            </p>
                          )}

                          <p className="text-xs text-gray-500 mb-2">
                            SKU: {item.effectiveSku || item.productSku || 'ไม่ระบุ'}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItemQuantity(item.id, (item.quantity || 1) - 1)}
                                disabled={updating === item.id || (item.quantity || 0) <= 1}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {updating === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </button>

                              <span className="w-8 text-center font-medium">
                                {item.quantity || 0}
                              </span>

                              <button
                                onClick={() => updateItemQuantity(item.id, (item.quantity || 0) + 1)}
                                disabled={updating === item.id}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {updating === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            {/* Price and Remove */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                  ฿{(item.lineTotal || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ฿{(item.unitPrice || 0).toLocaleString()} × {item.quantity || 0}
                                </p>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                disabled={updating === item.id}
                                className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {updating === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Order Summary and Checkout */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="border-t bg-white p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span>จำนวนสินค้า:</span>
                  <span>{totalItems} รายการ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ค่าจัดส่ง:</span>
                  <span className="text-green-600">ฟรี</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>ยอดรวมทั้งหมด:</span>
                  <span>฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3">
                ดำเนินการสั่งซื้อ
              </button>

              <button
                onClick={onClose}
                className="w-full text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                เลือกซื้อสินค้าเพิ่ม
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}