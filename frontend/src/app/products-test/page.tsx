'use client'

import React, { useMemo, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

type Product = {
  id: number
  shopId?: number | null
  categoryId?: number | null
  name: string
  slug: string
  description?: string | null
  price: number
  comparePrice?: number | null
  sku?: string | null
  stockQuantity?: number | null
  weightGram?: number | null
  status?: string | null
}

type OperationType = 'POST' | 'PUT' | 'DELETE'

export default function ProductsTestPage() {
  const [operation, setOperation] = useState<OperationType>('POST')
  const [productId, setProductId] = useState<string>('')
  const [shopId, setShopId] = useState<string>('1')
  const [categoryId, setCategoryId] = useState<string>('')
  const [name, setName] = useState<string>('Product A')
  const [slug, setSlug] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [price, setPrice] = useState<string>('199.00')
  const [comparePrice, setComparePrice] = useState<string>('')
  const [sku, setSku] = useState<string>('')
  const [stockQuantity, setStockQuantity] = useState<string>('10')
  const [weightGram, setWeightGram] = useState<string>('')
  const [status, setStatus] = useState<string>('active')

  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const suggestedSlug = useMemo(() => {
    const base = (slug || name).trim().toLowerCase()
    return base
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }, [name, slug])

  const resetForm = () => {
    setProductId('')
    setShopId('1')
    setCategoryId('')
    setName('Product A')
    setSlug('')
    setDescription('')
    setPrice('199.00')
    setComparePrice('')
    setSku('')
    setStockQuantity('10')
    setWeightGram('')
    setStatus('active')
    setResult(null)
    setError('')
  }

  const handleOperationChange = (newOperation: OperationType) => {
    setOperation(newOperation)
    if (newOperation === 'POST') {
      resetForm()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      let url = `${API_BASE}/products`
      let method = operation
      let body: any = null

      if (operation === 'POST') {
        // Validation for POST
        if (!name.trim()) throw new Error('ชื่อสินค้าจำเป็น')
        const finalSlug = (slug || suggestedSlug).trim()
        if (!finalSlug) throw new Error('ต้องระบุ slug หรือให้ระบบแนะนำ')
        if (!price.trim() || isNaN(Number(price))) throw new Error('ราคาไม่ถูกต้อง')

        const payload: any = {
          name: name.trim(),
          slug: finalSlug,
          price: Number(price),
        }
        if (shopId.trim()) payload.shopId = Number(shopId)
        if (categoryId.trim()) payload.categoryId = Number(categoryId)
        if (description.trim()) payload.description = description.trim()
        if (comparePrice.trim()) payload.comparePrice = Number(comparePrice)
        if (sku.trim()) payload.sku = sku.trim()
        if (stockQuantity.trim()) payload.stockQuantity = Number(stockQuantity)
        if (weightGram.trim()) payload.weightGram = Number(weightGram)
        if (status.trim()) payload.status = status.trim()

        body = JSON.stringify(payload)
      } else if (operation === 'PUT') {
        // Validation for PUT
        if (!productId.trim()) throw new Error('Product ID จำเป็นสำหรับการอัปเดต')
        if (!name.trim()) throw new Error('ชื่อสินค้าจำเป็น')
        const finalSlug = (slug || suggestedSlug).trim()
        if (!finalSlug) throw new Error('ต้องระบุ slug หรือให้ระบบแนะนำ')
        if (!price.trim() || isNaN(Number(price))) throw new Error('ราคาไม่ถูกต้อง')

        url += `/${productId}`
        const payload: any = {
          name: name.trim(),
          slug: finalSlug,
          price: Number(price),
        }
        if (shopId.trim()) payload.shopId = Number(shopId)
        if (categoryId.trim()) payload.categoryId = Number(categoryId)
        if (description.trim()) payload.description = description.trim()
        if (comparePrice.trim()) payload.comparePrice = Number(comparePrice)
        if (sku.trim()) payload.sku = sku.trim()
        if (stockQuantity.trim()) payload.stockQuantity = Number(stockQuantity)
        if (weightGram.trim()) payload.weightGram = Number(weightGram)
        if (status.trim()) payload.status = status.trim()

        body = JSON.stringify(payload)
      } else if (operation === 'DELETE') {
        // Validation for DELETE
        if (!productId.trim()) throw new Error('Product ID จำเป็นสำหรับการลบ')
        url += `/${productId}`
      }

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (body) {
        options.body = body
      }

      const res = await fetch(url, options)

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }

      if (operation === 'DELETE') {
        setResult({ message: 'ลบสินค้าสำเร็จ', deletedId: productId })
      } else {
        const data = (await res.json()) as Product
        setResult(data)
      }
    } catch (err: any) {
      setError(err?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const applySuggestedSlug = () => setSlug(suggestedSlug)

  const operationLabels = {
    POST: 'เพิ่มสินค้าใหม่',
    PUT: 'อัปเดตสินค้า',
    DELETE: 'ลบสินค้า'
  }

  const operationColors = {
    POST: 'bg-green-600',
    PUT: 'bg-blue-600',
    DELETE: 'bg-red-600'
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">ทดสอบจัดการสินค้า (CRUD Operations)</h1>

      {/* Operation Selection */}
      <div className="flex gap-2 p-4 bg-gray-50 rounded">
        {(['POST', 'PUT', 'DELETE'] as OperationType[]).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => handleOperationChange(op)}
            className={`px-4 py-2 rounded text-white ${
              operation === op ? operationColors[op] : 'bg-gray-400'
            }`}
          >
            {op} - {operationLabels[op]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product ID Field - Required for PUT and DELETE */}
        {(operation === 'PUT' || operation === 'DELETE') && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <label className="block text-sm font-medium mb-1 text-yellow-800">
              Product ID *
            </label>
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="เช่น 1, 2, 3"
              required
            />
            <p className="text-xs text-yellow-700 mt-1">
              จำเป็นต้องระบุ ID ของสินค้าที่ต้องการ{operation === 'PUT' ? 'อัปเดต' : 'ลบ'}
            </p>
          </div>
        )}

        {/* Form Fields - Hide for DELETE operation */}
        {operation !== 'DELETE' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shop ID</label>
                <input
                  type="number"
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="เช่น 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category ID</label>
                <input
                  type="number"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="เว้นว่างได้"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ชื่อสินค้า *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder={suggestedSlug || 'เช่น product-a'}
                />
                <button
                  type="button"
                  onClick={applySuggestedSlug}
                  className="whitespace-nowrap rounded bg-gray-200 px-3 py-2 hover:bg-gray-300"
                >
                  ใช้คำแนะนำ
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">แนะนำ: {suggestedSlug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">รายละเอียด</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border px-3 py-2"
                rows={3}
                placeholder="รายละเอียดของสินค้า"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ราคา (฿) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compare Price (฿)</label>
                <input
                  type="number"
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="เว้นว่างได้"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="เว้นว่างได้"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">จำนวนสต็อก</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="เว้นว่างได้"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">น้ำหนัก (กรัม)</label>
                <input
                  type="number"
                  value={weightGram}
                  onChange={(e) => setWeightGram(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="เว้นว่างได้"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สถานะ</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* DELETE Confirmation */}
        {operation === 'DELETE' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">⚠️ คำเตือน</p>
            <p className="text-red-700 text-sm mt-1">
              การดำเนินการนี้จะลบสินค้า ID: {productId} อย่างถาวร และไม่สามารถยกเลิกได้
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded px-4 py-2 text-white disabled:opacity-50 ${operationColors[operation]}`}
        >
          {loading ? 'กำลังดำเนินการ...' : operationLabels[operation]}
        </button>
      </form>

      {/* Reset Button */}
      <button
        type="button"
        onClick={resetForm}
        className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        รีเซ็ตฟอร์ม
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-red-600 text-sm break-words">{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <div className="font-semibold mb-2 text-green-800">
            {operation === 'POST' && 'เพิ่มสินค้าสำเร็จ'}
            {operation === 'PUT' && 'อัปเดตสินค้าสำเร็จ'}
            {operation === 'DELETE' && 'ลบสินค้าสำเร็จ'}
          </div>
          <pre className="text-xs whitespace-pre-wrap text-green-700 bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* API Endpoint Info */}
      <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded">
        <div className="font-medium mb-1">API Endpoints:</div>
        <div>POST: {`${API_BASE}/products`}</div>
        <div>PUT: {`${API_BASE}/products/{id}`}</div>
        <div>DELETE: {`${API_BASE}/products/{id}`}</div>
      </div>
    </main>
  )
}