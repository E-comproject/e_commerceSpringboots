'use client'

import React, { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

export default function CartTestPage() {
  const [userId, setUserId] = useState<string>('1')
  const [cart, setCart] = useState<any>(null)
  const [productId, setProductId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('1')
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const loadCart = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/cart?userId=${userId}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`โหลดตะกร้าไม่สำเร็จ: ${res.status}`)
      const data = await res.json()
      setCart(data)
    } catch (e: any) {
      setMessage(e?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const addItem = async () => {
    if (!cart) {
      setMessage('โปรดกดโหลดตะกร้าก่อน')
      return
    }
    const cartId = cart?.id || cart?.cartId || cart?.data?.id
    if (!cartId) {
      setMessage('ไม่พบ cartId จาก API')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const form = new URLSearchParams()
      form.set('cartId', String(cartId))
      form.set('productId', String(productId))
      form.set('quantity', String(quantity))
      const res = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`เพิ่มสินค้าไม่สำเร็จ: ${res.status} ${text}`)
      }
      setMessage('เพิ่มลงตะกร้าสำเร็จ')
      await loadCart()
    } catch (e: any) {
      setMessage(e?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Cart Test</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">User ID</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <button
          onClick={loadCart}
          disabled={loading}
          className="rounded bg-gray-800 text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'กำลังโหลด...' : 'โหลด/สร้างตะกร้า'}
        </button>
      </div>

      {cart && (
        <div className="rounded border p-4 bg-white">
          <div className="font-medium mb-2">Cart</div>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(cart, null, 2)}</pre>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Product ID</label>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <label className="block text-sm font-medium">Quantity</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <button
          onClick={addItem}
          disabled={loading}
          className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'กำลังเพิ่ม...' : 'เพิ่มสินค้าเข้าตะกร้า'}
        </button>
      </div>

      {message && <div className="text-sm text-gray-700">{message}</div>}
    </main>
  )
}


