'use client'

import React, { useState } from 'react'
import CartView from '../../../components/CartView'

// สำหรับตัวอย่างนี้ ฉันจะรวม components ไว้ในไฟล์เดียว
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

// AddToCartButton Component
function AddToCartButton({ productId, defaultUserId = 1, onCartUpdate }: {
  productId: number
  defaultUserId?: number
  onCartUpdate?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  const addToCart = async () => {
    setLoading(true)
    setMessage('')
    try {
      // 1) Get or create cart by userId
      const cartRes = await fetch(`${API_BASE}/cart?userId=${defaultUserId}`, { cache: 'no-store' })
      if (!cartRes.ok) throw new Error(`โหลดตะกร้าไม่สำเร็จ: ${cartRes.status}`)
      const cart = await cartRes.json()
      const cartId = cart?.id || cart?.cartId || cart?.data?.id
      if (!cartId) throw new Error('ไม่พบ cartId จาก API')

      // 2) Add item to cart
      const form = new URLSearchParams()
      form.set('cartId', String(cartId))
      form.set('productId', String(productId))
      form.set('quantity', '1')

      const addRes = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
      if (!addRes.ok) {
        const text = await addRes.text()
        throw new Error(`เพิ่มสินค้าไม่สำเร็จ: ${addRes.status} ${text}`)
      }

      setMessage('เพิ่มสินค้าลงตะกร้าสำเร็จ')
      onCartUpdate?.() // อัปเดตจำนวนสินค้าในตะกร้า
    } catch (err: any) {
      setMessage(err?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={addToCart}
        disabled={loading}
        className="w-full py-3 px-6 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
      >
        {loading ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
      </button>
      {message && (
        <div className="text-sm text-gray-700">{message}</div>
      )}
    </div>
  )
}

// Cart Header Component
function CartHeader({ userId = 1, onCartClick }: {
  userId?: number
  onCartClick: () => void
}) {
  const [cartCount, setCartCount] = useState<number>(0)

  const fetchCartCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart?userId=${userId}`, { 
        cache: 'no-store' 
      })
      if (response.ok) {
        const cart = await response.json()
        const count = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        setCartCount(count)
      }
    } catch (err) {
      console.error('Error fetching cart count:', err)
    }
  }

  React.useEffect(() => {
    fetchCartCount()
  }, [userId])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ร้านค้าออนไลน์</h1>
        
        <button
          onClick={() => {
            fetchCartCount() // อัปเดตจำนวนก่อนเปิด
            onCartClick()
          }}
          className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

// Main Product Page Component
export default function ProductPageWithCart() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // ตัวอย่างข้อมูลสินค้า
  const sampleProducts = [
    { id: 1, name: 'iPhone 15 Pro', price: 45900, image: '📱' },
    { id: 2, name: 'MacBook Air M2', price: 42900, image: '💻' },
    { id: 3, name: 'AirPods Pro', price: 8900, image: '🎧' },
  ]

  const handleCartUpdate = () => {
    // ฟังก์ชันนี้จะถูกเรียกเมื่อมีการเพิ่มสินค้าลงตะกร้า
    // สามารถใช้อัปเดตจำนวนสินค้าใน header ได้
    console.log('Cart updated!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CartHeader 
        userId={1}
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  ฿{product.price.toLocaleString()}
                </p>
                <AddToCartButton 
                  productId={product.id}
                  defaultUserId={1}
                  onCartUpdate={handleCartUpdate}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartView userId={1} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}