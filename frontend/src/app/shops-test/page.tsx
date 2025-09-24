'use client'

import React, { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

type Shop = {
  id: number
  sellerUserId: number
  name: string
  slug: string
  logoUrl?: string | null
  description?: string | null
  status?: string | null
}

export default function ShopsTestPage() {
  const [sellerUserId, setSellerUserId] = useState<string>('1')
  const [name, setName] = useState<string>('My Test Shop')
  const [slug, setSlug] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [status, setStatus] = useState<string>('active')

  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<Shop | null>(null)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const payload: any = {
        sellerUserId: Number(sellerUserId),
        name,
      }
      if (slug.trim()) payload.slug = slug.trim()
      if (logoUrl.trim()) payload.logoUrl = logoUrl.trim()
      if (description.trim()) payload.description = description.trim()
      if (status.trim()) payload.status = status.trim()

      const res = await fetch(`${API_BASE}/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
      const data = (await res.json()) as Shop
      setResult(data)
    } catch (err: any) {
      setError(err?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">ทดสอบสร้างร้านค้า (POST /api/shops)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Seller User ID</label>
          <input
            type="number"
            value={sellerUserId}
            onChange={(e) => setSellerUserId(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
            min={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shop Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug (เว้นว่างให้ระบบสร้างอัตโนมัติได้)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="เช่น my-shop"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Logo URL (ไม่บังคับ)</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (ไม่บังคับ)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="active"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'กำลังส่ง...' : 'สร้างร้านค้า'}
        </button>
      </form>

      {error ? (
        <p className="text-red-600 text-sm break-words">{error}</p>
      ) : null}

      {result ? (
        <div className="rounded border p-4">
          <div className="font-semibold mb-2">สร้างสำเร็จ</div>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}

      <div className="text-xs text-gray-600">
        เรียกใช้งานไปที่: {`${API_BASE}/shops`}
      </div>
    </main>
  )
}


