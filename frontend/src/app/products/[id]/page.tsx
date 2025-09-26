'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Package,
  Tag,
  Star,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import ProductCartControls from '../../../components/ProductCartControls'
import { ProductVariantSelector } from '../../../components/ProductVariantSelector'
import { Product, ProductVariant, AddToCartRequest } from '../../../types/product'
import { CartService } from '../../../lib/cartService'
import CartSidebar from '../../../components/CartSidebar'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

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
  shopId?: number
  hasVariants?: boolean
  minPrice?: number
  maxPrice?: number
  totalStock?: number
  variants?: ProductVariant[]
  ratingAvg?: number
  ratingCount?: number
  weightGram?: number
  status?: string
  createdAt?: string
  images?: any[]
}

async function fetchProduct(id: string): Promise<ProductDto | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchProductVariants(id: string): Promise<ProductVariant[]> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}/variants`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<ProductDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const [productData, variants] = await Promise.all([
          fetchProduct(params.id),
          fetchProductVariants(params.id)
        ])

        if (!productData) {
          setError('Product not found')
          return
        }

        // Merge variants into product if they exist
        if (variants.length > 0) {
          productData.variants = variants
          productData.hasVariants = true

          // Calculate price range from variants
          const prices = variants.map(v => v.effectivePrice || v.price)
          productData.minPrice = Math.min(...prices)
          productData.maxPrice = Math.max(...prices)
          productData.totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0)
        }

        setProduct(productData)
      } catch (err) {
        setError('Failed to load product')
        console.error('Error loading product:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl p-6">
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
            <p className="text-gray-600">กำลังโหลดข้อมูลสินค้า...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              กลับหน้าหลัก
            </Link>
          </div>

          {/* Error State */}
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบสินค้า</h1>
            <p className="text-gray-600 mb-8">ขออภัย ไม่พบสินค้าที่คุณต้องการ อาจถูกลบหรือย้ายแล้ว</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับไปหน้าหลัก
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // For variant products, use min price for discount calculation
  const effectivePrice = product.hasVariants ? (product.minPrice ?? product.price) : product.price
  const effectiveComparePrice = product.comparePrice

  const hasDiscount = effectiveComparePrice && effectiveComparePrice > effectivePrice
  const discountPercentage = hasDiscount
    ? Math.round(((effectiveComparePrice! - effectivePrice) / effectiveComparePrice!) * 100)
    : 0

  const getStockStatus = () => {
    const stockQuantity = product.hasVariants ? (product.totalStock ?? 0) : (product.stockQuantity ?? 0)
    if (stockQuantity === 0) return 'out'
    if (stockQuantity <= 5) return 'low'
    return 'available'
  }

  const stockStatus = getStockStatus()

  // Convert ProductDto to Product type for components
  const productForSelector: Product = {
    ...product,
    shopId: product.shopId ?? 0,
    categoryId: product.categoryId ?? 0,
    stockQuantity: product.stockQuantity ?? 0,
    hasVariants: product.hasVariants ?? false,
    ratingAvg: product.ratingAvg ?? 0,
    ratingCount: product.ratingCount ?? 0,
    status: (product.status as 'active' | 'inactive' | 'draft') ?? 'active',
    createdAt: product.createdAt ?? new Date().toISOString(),
    images: product.images ?? []
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors">หน้าหลัก</Link>
          <span>/</span>
          <span className="text-gray-900">รายละเอียดสินค้า</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <Package className="h-32 w-32 text-gray-400" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {hasDiscount && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{discountPercentage}%
                    </div>
                  )}
                  {stockStatus === 'low' && (
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      เหลือน้อย
                    </div>
                  )}
                  {stockStatus === 'out' && (
                    <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                      สินค้าหมด
                    </div>
                  )}
                </div>

                {/* Wishlist & Share */}
                <div className="absolute top-4 right-4 space-y-2">
                  <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg opacity-50"></div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight flex-1">
                  {product.name}
                </h1>
                {stockStatus === 'available' && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    พร้อมส่ง
                  </div>
                )}
              </div>
              
              {/* Rating Placeholder */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) • 156 รีวิว</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                {product.hasVariants ? (
                  <span className="text-4xl font-bold text-gray-900">
                    ฿{Number(product.minPrice).toLocaleString()} - ฿{Number(product.maxPrice).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    ฿{Number(product.price).toLocaleString()}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xl line-through text-gray-400">
                    ฿{Number(effectiveComparePrice!).toLocaleString()}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-green-600 font-medium">
                  ประหยัด ฿{Number(effectiveComparePrice! - effectivePrice).toLocaleString()}
                </p>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {product.sku && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">SKU: <span className="font-mono">{product.sku}</span></span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  สต็อก: {product.hasVariants
                    ? `${product.totalStock ?? 0} ชิ้น (รวมทุกรูปแบบ)`
                    : product.stockQuantity !== undefined
                      ? `${product.stockQuantity} ชิ้น`
                      : 'ไม่ระบุ'}
                </span>
              </div>

              {product.categoryId && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">หมวดหมู่: {product.categoryId}</span>
                </div>
              )}
            </div>

            {/* Stock Status Alert */}
            {stockStatus === 'low' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">เหลือไม่เยอะแล้ว!</p>
                  <p className="text-sm text-orange-700">
                    สินค้าชิ้นนี้เหลือเพียง {product.hasVariants ? product.totalStock : product.stockQuantity} ชิ้น
                  </p>
                </div>
              </div>
            )}

            {/* Variant Selection and Action Buttons */}
            <div className="space-y-6">
              {product.hasVariants ? (
                <ProductVariantSelector
                  product={productForSelector}
                  onAddToCart={async (request: AddToCartRequest) => {
                    try {
                      console.log('Adding to cart:', request)
                      await CartService.addToCart(request, 1) // Using default userId = 1
                      console.log('Successfully added to cart, opening sidebar...')
                      // Open cart sidebar after successful addition
                      setCartSidebarOpen(true)
                    } catch (error) {
                      console.error('Failed to add to cart:', error)
                      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้'}`)
                    }
                  }}
                  onVariantChange={(variantId) => {
                    // Handle variant change if needed for analytics or other purposes
                    console.log('Variant changed:', variantId)
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {stockStatus === 'out' ? (
                    <button
                      disabled
                      className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gray-200 text-gray-400 cursor-not-allowed"
                    >
                      สินค้าหมด
                    </button>
                  ) : (
                    <ProductCartControls productId={product.id} redirectToCart={false} />
                  )}

                  <button className="w-full py-3 px-6 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                    ซื้อทันที
                  </button>
                </div>
              )}
            </div>

            {/* Shipping & Service Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Truck className="h-4 w-4" />
                <span>จัดส่งฟรี สำหรับคำสั่งซื้อขั้นต่ำ ฿500</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <RotateCcw className="h-4 w-4" />
                <span>คืนสินค้าได้ภายใน 7 วัน</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Shield className="h-4 w-4" />
                <span>รับประกันคุณภาพสินค้า</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">รายละเอียดสินค้า</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {product.description}
              </p>
            </div>
          </div>
        )}

        {/* Related Products Section Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปเลือกสินค้าอื่น
          </Link>
        </div>

        {/* Cart Sidebar */}
        <CartSidebar
          isOpen={cartSidebarOpen}
          onClose={() => setCartSidebarOpen(false)}
          userId={1}
        />
      </div>
    </main>
  )
}