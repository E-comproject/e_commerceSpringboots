'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package
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

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/cart?userId=1`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      const cartData = await response.json()
      console.log('Cart data received:', cartData)
      console.log('Cart data type:', typeof cartData)
      console.log('Cart items:', cartData.items)
      if (cartData.items && cartData.items.length > 0) {
        console.log('First item:', cartData.items[0])
      }
      setCart(cartData)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl p-6">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              กลับหน้าหลัก
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดตะกร้าสินค้า...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl p-6">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              กลับหน้าหลัก
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={fetchCart}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                กลับหน้าหลัก
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
          </div>

          {/* Empty Cart */}
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ตะกร้าสินค้าว่างเปล่า</h2>
            <p className="text-gray-600 mb-8">ยังไม่มีสินค้าในตะกร้า เริ่มเลือกซื้อสินค้าได้เลย</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="h-4 w-4" />
              เลือกซื้อสินค้า
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              กลับหน้าหลัก
            </Link>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
            <p className="text-sm text-gray-600">{cart.totalQty || cart.totalItems || 0} รายการ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {item.productName || 'ไม่ระบุชื่อสินค้า'}
                    </h3>

                    {item.variantTitle && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.variantTitle}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 mb-2">
                      SKU: {item.effectiveSku || item.productSku || 'ไม่ระบุ'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          onClick={() => {
                            // TODO: Implement decrease quantity
                            console.log('Decrease quantity for item:', item.id)
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity || 0}</span>
                        <button
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          onClick={() => {
                            // TODO: Implement increase quantity
                            console.log('Increase quantity for item:', item.id)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          ฿{(item.unitPrice || 0).toLocaleString()} × {item.quantity || 0}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ฿{(item.lineTotal || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    className="text-red-500 hover:text-red-700 p-2"
                    onClick={() => {
                      // TODO: Implement remove item
                      console.log('Remove item:', item.id)
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">สรุปคำสั่งซื้อ</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>จำนวนสินค้า:</span>
                  <span>{cart.totalQty || cart.itemCount || 0} รายการ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ยอดรวม:</span>
                  <span>฿{(cart.subtotal || cart.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ค่าจัดส่ง:</span>
                  <span className="text-green-600">ฟรี</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>ยอดชำระทั้งหมด:</span>
                  <span>฿{(cart.subtotal || cart.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                ดำเนินการสั่งซื้อ
              </button>

              <Link
                href="/"
                className="block text-center text-blue-600 hover:text-blue-700 mt-4 transition-colors"
              >
                เลือกซื้อสินค้าเพิ่ม
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}