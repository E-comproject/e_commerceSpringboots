import React, { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

// Types ตรงกับ CartController.toItemDto()
type CartItem = {
  id: number
  productId: number
  productName?: string
  productSku?: string
  unitPrice?: number
  quantity: number
  lineTotal?: number
  // imageUrl?: string // ถ้าภายหลัง backend ส่งมาก็ค่อยใช้
}

type Cart = {
  id: number
  userId: number
  items: CartItem[]
}

// ---------------- Cart Button ----------------
function CartButton({ userId = 1, onCartOpen }: {
  userId?: number
  onCartOpen: () => void
}) {
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart?userId=${userId}`, { cache: 'no-store' })
      if (response.ok) {
        const cart = await response.json()
        const count = cart?.items?.reduce((sum: number, item: CartItem) => sum + (item.quantity || 0), 0) || 0
        setCartCount(count)
      }
    } catch (err) {
      console.error('Error fetching cart count:', err)
    }
  }

  useEffect(() => {
    fetchCartCount()
    const interval = setInterval(fetchCartCount, 2000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <button
      onClick={onCartOpen}
      className="fixed top-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors flex items-center gap-2"
    >
      <span className="text-xl">🛒</span>
      <span>ตะกร้า</span>
      {cartCount > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  )
}

// ---------------- Cart View ----------------
function CartView({ userId = 1, isOpen, onClose }: {
  userId?: number
  isOpen: boolean
  onClose: () => void
}) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchCart = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/cart?userId=${userId}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`โหลดตะกร้าไม่สำเร็จ: ${response.status}`)
      const data: Cart = await response.json()
      setCart(data)
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการโหลดตะกร้า')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (!cart) return
    if (newQuantity < 1) return await removeItem(itemId)

    setUpdating(itemId)
    setError('')
    try {
      const url = `${API_BASE}/cart/items/${itemId}?cartId=${cart.id}&quantity=${newQuantity}`
      const response = await fetch(url, { method: 'PUT' })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`อัปเดตจำนวนไม่สำเร็จ: ${response.status} ${text}`)
      }
      await fetchCart()
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการอัปเดต')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: number) => {
    if (!cart) return
    setUpdating(itemId)
    try {
      const response = await fetch(`${API_BASE}/cart/${cart.id}/items/${itemId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`ลบสินค้าไม่สำเร็จ: ${response.status}`)
      await fetchCart()
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการลบสินค้า')
    } finally {
      setUpdating(null)
    }
  }

  // รวมยอด: ใช้ lineTotal ถ้ามี ตกกลับไป unitPrice*quantity
  const calculateTotal = () =>
    (cart?.items || []).reduce((sum, it) => {
      const line = (it.lineTotal ?? ((it.unitPrice ?? 0) * (it.quantity || 0)))
      return sum + line
    }, 0)

  useEffect(() => {
    if (isOpen) fetchCart()
  }, [isOpen, userId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">ตะกร้าสินค้า</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">กำลังโหลดตะกร้า...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">เกิดข้อผิดพลาด</p>
              <p className="text-sm mt-1">{error}</p>
              <button onClick={fetchCart} className="mt-3 text-red-600 hover:text-red-800 underline text-sm">ลองใหม่</button>
            </div>
          ) : !cart?.items?.length ? (
            <div className="text-center py-16">
              <div className="text-gray-300 text-8xl mb-4">🛒</div>
              <p className="text-xl text-gray-500 mb-2">ตะกร้าของคุณว่างเปล่า</p>
              <p className="text-gray-400">เพิ่มสินค้าเพื่อเริ่มช็อปปิ้ง</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => {
                  const unit = item.unitPrice ?? 0
                  const line = item.lineTotal ?? unit * item.quantity
                  return (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {/* ถ้ามี imageUrl ภายหลังค่อยใช้ <img src={item.imageUrl} .../> */}
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">📦</div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {item.productName || `สินค้า ID: ${item.productId}`}
                        </h4>
                        <p className="text-lg font-semibold text-blue-600 mb-3">
                          ฿{unit.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-16 text-center font-semibold text-lg">
                            {updating === item.id ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updating === item.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="ลบสินค้า"
                        >
                          🗑️
                        </button>
                        <div className="font-bold text-lg text-gray-900">
                          ฿{line.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-700">รวมทั้งหมด:</span>
                  <span className="text-2xl text-blue-600">฿{calculateTotal().toLocaleString()}</span>
                </div>

                <button
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
                  onClick={() => alert(`ไปยังหน้าชำระเงิน\nยอดรวม: ฿${calculateTotal().toLocaleString()}`)}
                >
                  ดำเนินการชำระเงิน
                </button>

                <button onClick={onClose} className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  ช็อปปิ้งต่อ
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default CartView

// ---------------- Floating Button + Overlay ----------------
export function CartWithButton() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const userId = 1
  return (
    <>
      <CartButton userId={userId} onCartOpen={() => setIsCartOpen(true)} />
      <CartView userId={userId} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
