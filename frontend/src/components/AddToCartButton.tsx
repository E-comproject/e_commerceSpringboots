'use client'

import React, { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

type Props = {
  productId: number
  defaultUserId?: number
  onAdded?: () => void
}

export default function AddToCartButton({ productId, defaultUserId = 1, onAdded }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  const addToCart = async () => {
    console.log('AddToCartButton: Starting addToCart for product:', productId)
    setLoading(true)
    setMessage('')
    try {
      console.log('AddToCartButton: Fetching cart for user:', defaultUserId)
      const cartRes = await fetch(`${API_BASE}/cart?userId=${defaultUserId}`, { cache: 'no-store' })
      if (!cartRes.ok) throw new Error(`โหลดตะกร้าไม่สำเร็จ: ${cartRes.status}`)
      const cart = await cartRes.json()
      console.log('AddToCartButton: Cart response:', cart)
      const cartId = cart?.id || cart?.cartId || cart?.data?.id
      if (!cartId) throw new Error('ไม่พบ cartId จาก API')

      console.log('AddToCartButton: Adding to cart with params - cartId:', cartId, 'productId:', productId)
      const addRes = await fetch(`${API_BASE}/cart/items/simple?cartId=${cartId}&productId=${productId}&quantity=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!addRes.ok) {
        const text = await addRes.text()
        console.log('AddToCartButton: Add to cart failed:', addRes.status, text)
        throw new Error(`เพิ่มสินค้าไม่สำเร็จ: ${addRes.status} ${text}`)
      }

      console.log('AddToCartButton: Successfully added to cart')
      setMessage('เพิ่มสินค้าลงตะกร้าสำเร็จ')
      onAdded?.()
    } catch (err: any) {
      console.error('AddToCartButton: Error:', err)
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


