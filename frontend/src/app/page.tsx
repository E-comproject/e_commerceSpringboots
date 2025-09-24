'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, ShoppingBag, Tag, Star, Filter } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

type CategoryDto = {
  id: number
  parentId: number | null
  name: string
  slug: string
  path?: string | null
  isActive?: boolean
}

type ProductDto = {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  sku?: string
  stockQuantity?: number
  categoryId?: number
}

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [products, setProducts] = useState<ProductDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [rawCategories, rawProducts] = await Promise.all([
          fetchJson<unknown>(`${API_BASE}/categories?page=0&size=20`).catch(() => []),
          fetchJson<unknown>(`${API_BASE}/products`).catch(() => []),
        ])

        const toArray = <T,>(v: unknown): T[] => {
          if (Array.isArray(v)) return v as T[]
          const anyV: any = v as any
          if (anyV && Array.isArray(anyV.data)) return anyV.data as T[]
          if (anyV && Array.isArray(anyV.content)) return anyV.content as T[]
          return []
        }

        setCategories(toArray<CategoryDto>(rawCategories))
        setProducts(toArray<ProductDto>(rawProducts))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategoryId === null || 
        product.categoryId === selectedCategoryId

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategoryId])

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategoryId(null)
  }

  const hasDiscount = (product: ProductDto) => {
    return product.comparePrice && product.comparePrice > product.price
  }

  const getDiscountPercentage = (product: ProductDto) => {
    if (!hasDiscount(product)) return 0
    return Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ร้านค้าออนไลน์
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ค้นหาและเลือกซื้อสินค้าคุณภาพดีจากหมวดหมู่ที่หลากหลาย
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            ตัวกรอง
          </button>
          
          {(searchTerm || selectedCategoryId) && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Categories Filter */}
        {showFilters && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              หมวดหมู่
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategoryId === null
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategoryId === category.id
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(searchTerm || selectedCategory) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">กรองโดย:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                ค้นหา: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                หมวด: {selectedCategory.name}
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          สินค้า ({filteredProducts.length} รายการ)
        </h2>
        
        {categories.length > 0 && (
          <div className="text-sm text-gray-500">
            หมวดหมู่ทั้งหมด: {categories.length} หมวด
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบสินค้า</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || selectedCategory 
              ? 'ลองเปลี่ยนคำค้นหาหรือหมวดหมู่'
              : 'ยังไม่มีสินค้าในระบบ'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                <ShoppingBag className="h-16 w-16 text-gray-400" />
                {hasDiscount(product) && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    -{getDiscountPercentage(product)}%
                  </div>
                )}
                {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    เหลือน้อย
                  </div>
                )}
                {product.stockQuantity === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">สินค้าหมด</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Product Name */}
                <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                {/* Product Details */}
                <div className="space-y-2">
                  {product.sku && (
                    <div className="text-xs text-gray-500">
                      SKU: {product.sku}
                    </div>
                  )}
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Stock Info */}
                {product.stockQuantity !== undefined && (
                  <div className="text-xs text-gray-500">
                    คงเหลือ: {product.stockQuantity} ชิ้น
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ฿{Number(product.price).toLocaleString()}
                  </span>
                  {hasDiscount(product) && (
                    <span className="text-sm line-through text-gray-400">
                      ฿{Number(product.comparePrice!).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                {product.categoryId && (
                  <div className="pt-2">
                    {(() => {
                      const category = categories.find(c => c.id === product.categoryId)
                      return category ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          <Tag className="h-3 w-3" />
                          {category.name}
                        </span>
                      ) : null
                    })()}
                  </div>
                )}

                {/* Action Button */}
                <a 
                  href={`/products/${product.id}`}
                  className={`block text-center w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    product.stockQuantity === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {product.stockQuantity === 0 ? 'สินค้าหมด' : 'ดูรายละเอียด'}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories Overview (แสดงเมื่อไม่มีการกรอง) */}
      {!searchTerm && !selectedCategoryId && categories.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id)
                  setShowFilters(true)
                }}
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-300 group"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                    <Tag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {products.filter(p => p.categoryId === category.id).length} สินค้า
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}