import React from 'react'
import Link from 'next/link'
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

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)

  if (!product) {
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

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0

  const getStockStatus = () => {
    if (product.stockQuantity === undefined) return null
    if (product.stockQuantity === 0) return 'out'
    if (product.stockQuantity <= 5) return 'low'
    return 'available'
  }

  const stockStatus = getStockStatus()

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
                <span className="text-4xl font-bold text-gray-900">
                  ฿{Number(product.price).toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xl line-through text-gray-400">
                    ฿{Number(product.comparePrice!).toLocaleString()}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-green-600 font-medium">
                  ประหยัด ฿{Number(product.comparePrice! - product.price).toLocaleString()}
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
                  สต็อก: {product.stockQuantity !== undefined ? `${product.stockQuantity} ชิ้น` : 'ไม่ระบุ'}
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
                  <p className="text-sm text-orange-700">สินค้าชิ้นนี้เหลือเพียง {product.stockQuantity} ชิ้น</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {stockStatus === 'out' ? (
                <button 
                  disabled
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg bg-gray-200 text-gray-400 cursor-not-allowed`}
                >
                  สินค้าหมด
                </button>
              ) : (
                <ProductCartControls productId={product.id} />
              )}

              <button className="w-full py-3 px-6 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                ซื้อทันที
              </button>
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
      </div>
    </main>
  )
}