
'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Search, ShoppingBag, Tag, Star, Filter } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

async function fetchProductVariants(productId: number): Promise<ProductVariantDto[]> {
  try {
    const variants = await fetchJson<ProductVariantDto[]>(`${API_BASE}/products/${productId}/variants`)
    return Array.isArray(variants) ? variants : []
  } catch (error) {
    console.error(`Failed to fetch variants for product ${productId}:`, error)
    return []
  }
}

async function enrichProductsWithVariants(products: ProductDto[]): Promise<ProductDto[]> {
  const enrichedProducts = await Promise.all(
    products.map(async (product) => {
      try {
        const variants = await fetchProductVariants(product.id)

        if (variants.length > 0) {
          // Calculate price range from variants
          const availableVariants = variants.filter(v => v.available)
          const prices = availableVariants.map(v => v.price)

          return {
            ...product,
            hasVariants: true,
            variants: variants,
            minPrice: availableVariants.length > 0 ? Math.min(...prices) : product.price,
            maxPrice: availableVariants.length > 0 ? Math.max(...prices) : product.price,
            totalStock: variants.reduce((sum, v) => sum + v.stockQuantity, 0)
          }
        }

        return {
          ...product,
          hasVariants: false,
          minPrice: product.price,
          maxPrice: product.price,
          totalStock: product.stockQuantity || 0
        }
      } catch (error) {
        console.error(`Error enriching product ${product.id}:`, error)
        return {
          ...product,
          hasVariants: false,
          minPrice: product.price,
          maxPrice: product.price,
          totalStock: product.stockQuantity || 0
        }
      }
    })

  )

  return enrichedProducts
}

async function fetchFeaturedProducts(): Promise<ProductDto[]> {
  try {
    console.log('Fetching featured products...')

    // Try multiple strategies to get featured products
    const strategies = [
      // Strategy 1: Get products sorted by popularity/rating
      () => fetchJson<any>(`${API_BASE}/products/search?size=8&sort=popularity,desc`),

      // Strategy 2: Get newest products (fallback)
      () => fetchJson<any>(`${API_BASE}/products/search?size=8&sort=created,desc`),

      // Strategy 3: Get first 8 products (final fallback)
      () => fetchJson<any>(`${API_BASE}/products?size=8`)
    ]

    for (const strategy of strategies) {
      try {
        const response = await strategy()

        let productsData: ProductDto[] = []
        if (Array.isArray(response)) {
          productsData = response
        } else if (response.content && Array.isArray(response.content)) {
          productsData = response.content
        } else if (response.data && Array.isArray(response.data)) {
          productsData = response.data
        }

        if (productsData.length > 0) {
          console.log(`Found ${productsData.length} featured products`)

          // Enrich with variants (limit to first 6 to avoid too many API calls)
          const limitedProducts = productsData.slice(0, 6)
          return await enrichProductsWithVariants(limitedProducts)
        }
      } catch (error) {
        console.log('Strategy failed, trying next...', error)
        continue
      }
    }

    return []
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

async function searchProducts(params: {
  query?: string
  categoryId?: number
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  minPrice?: number
  maxPrice?: number
}): Promise<{ products: ProductDto[], pagination: PaginationInfo }> {
  try {
    const searchParams = new URLSearchParams()

    if (params.query && params.query.trim()) searchParams.set('q', params.query.trim())
    if (params.categoryId) searchParams.set('categoryId', params.categoryId.toString())
    searchParams.set('page', (params.page || 0).toString())
    searchParams.set('size', (params.size || 12).toString())

    // Note: Backend might not support all these params yet, but we prepare for future
    if (params.sortBy) searchParams.set('sort', `${params.sortBy},${params.sortOrder || 'desc'}`)
    // Remove price params for now since backend doesn't support them
    // if (params.minPrice !== undefined && params.minPrice !== null) searchParams.set('minPrice', params.minPrice.toString())
    // if (params.maxPrice !== undefined && params.maxPrice !== null) searchParams.set('maxPrice', params.maxPrice.toString())

    console.log('Searching products with params:', searchParams.toString())

    const response = await fetchJson<any>(`${API_BASE}/products/search?${searchParams}`)
    console.log('Search response:', response)

    // Handle different response formats
    let productsData: ProductDto[] = []
    let paginationData: PaginationInfo = {
      currentPage: params.page || 0,
      totalPages: 1,
      totalElements: 0,
      size: params.size || 12,
      hasNext: false,
      hasPrevious: false
    }

    if (Array.isArray(response)) {
      // Simple array response
      productsData = response
      paginationData.totalElements = response.length
    } else if (response.content && Array.isArray(response.content)) {
      // Spring Boot Page response
      productsData = response.content
      paginationData = {
        currentPage: response.number || 0,
        totalPages: response.totalPages || 1,
        totalElements: response.totalElements || 0,
        size: response.size || 12,
        hasNext: !response.last,
        hasPrevious: !response.first
      }
    } else if (response.data && Array.isArray(response.data)) {
      // Custom wrapper response
      productsData = response.data
      paginationData.totalElements = response.data.length
    }

    // Enrich with variants - ลด API calls โดยแค่ enrich สินค้าที่จำเป็น
    let enrichedProducts = productsData.length <= 12
      ? await enrichProductsWithVariants(productsData)
      : productsData.map(product => ({
          ...product,
          hasVariants: false,
          minPrice: product.price,
          maxPrice: product.price,
          totalStock: product.stockQuantity || 0
        }))

    // Client-side price filtering since backend doesn't support it yet
    if (params.minPrice !== undefined && params.minPrice !== null) {
      enrichedProducts = enrichedProducts.filter(product => {
        const productMinPrice = product.hasVariants ? product.minPrice : product.price
        return productMinPrice >= params.minPrice!
      })
    }

    if (params.maxPrice !== undefined && params.maxPrice !== null) {
      enrichedProducts = enrichedProducts.filter(product => {
        const productMaxPrice = product.hasVariants ? product.maxPrice : product.price
        return productMaxPrice <= params.maxPrice!
      })
    }

    // Update pagination to reflect filtered results
    const filteredPaginationData = {
      ...paginationData,
      totalElements: enrichedProducts.length,
      totalPages: Math.ceil(enrichedProducts.length / (params.size || 12))
    }

    return {
      products: enrichedProducts,
      pagination: filteredPaginationData
    }
  } catch (error) {
    console.error('Error searching products:', error)
    return {
      products: [],
      pagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        size: 12,
        hasNext: false,
        hasPrevious: false
      }
    }
  }
}

type CategoryDto = {
  id: number
  parentId: number | null
  name: string
  slug: string
  path?: string | null
  isActive?: boolean
}

type ProductVariantDto = {
  id: number
  productId: number
  sku: string
  variantTitle: string
  variantOptions: Record<string, string>
  price: number
  comparePrice?: number
  stockQuantity: number
  available: boolean
  displayName: string
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
  shopId?: number
  // Variant support
  hasVariants?: boolean
  minPrice?: number
  maxPrice?: number
  totalStock?: number
  variants?: ProductVariantDto[]
  ratingAvg?: number
  ratingCount?: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function HomePage() {
  // State management
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [products, setProducts] = useState<ProductDto[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<ProductDto[]>([])
  const [loading, setLoading] = useState(false)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(12)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12,
    hasNext: false,
    hasPrevious: false
  })

  // Advanced filters
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created' | 'popularity'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)

  // Debounced values
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')


  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])


  // Load initial data (categories and featured products) - only once
  useEffect(() => {
    let mounted = true

    const loadInitialData = async () => {
      try {
        console.log('Loading initial data...')

        const [rawCategories, featured] = await Promise.all([
          fetchJson<unknown>(`${API_BASE}/categories?page=0&size=50`).catch(() => []),
          fetchFeaturedProducts()
        ])

        if (!mounted) return

        const toArray = <T,>(v: unknown): T[] => {
          if (Array.isArray(v)) return v as T[]
          const anyV: any = v as any
          if (anyV && Array.isArray(anyV.data)) return anyV.data as T[]
          if (anyV && Array.isArray(anyV.content)) return anyV.content as T[]
          return []
        }

        const categoriesData = toArray<CategoryDto>(rawCategories)
        setCategories(categoriesData)
        setFeaturedProducts(featured)
        setFeaturedLoading(false)

        console.log('Initial data loaded:', {
          categories: categoriesData.length,
          featured: featured.length
        })
      } catch (error) {
        console.error('Error loading initial data:', error)
        if (mounted) {
          setFeaturedLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      mounted = false
    }
  }, []) // Empty dependency array - run only once

  // Search products when filters change
  useEffect(() => {
    let mounted = true

    const loadProducts = async () => {
      if (!mounted) return

      try {
        setLoading(true)
        console.log('Searching products with:', {
          debouncedSearchTerm,
          selectedCategoryId,
          currentPage,
          sortBy,
          sortOrder,
          minPrice,
          maxPrice
        })

        const result = await searchProducts({
          query: debouncedSearchTerm || undefined,
          categoryId: selectedCategoryId || undefined,
          page: currentPage,
          size: pageSize,
          sortBy: sortBy,
          sortOrder: sortOrder
          // Remove price params - will filter client-side
        })

        if (!mounted) return

        setProducts(result.products)
        setPagination(result.pagination)
        console.log(`Found ${result.products.length} products, page ${result.pagination.currentPage + 1}/${result.pagination.totalPages}`)
      } catch (error) {
        console.error('Error loading products:', error)
        if (mounted) {
          setProducts([])
          setPagination({
            currentPage: 0,
            totalPages: 0,
            totalElements: 0,
            size: pageSize,
            hasNext: false,
            hasPrevious: false
          })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      mounted = false
    }
  }, [debouncedSearchTerm, selectedCategoryId, currentPage, sortBy, sortOrder, pageSize])

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    // Reset page to 0 when search changes, but don't do it immediately
    // Let the debounce handle it
  }, [])

  // Reset page when search term changes (silent reset - no scroll)
  useEffect(() => {
    setCurrentPage(0)
  }, [debouncedSearchTerm])

  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId)
    setCurrentPage(0)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Only scroll when user explicitly clicks pagination
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setSelectedCategoryId(null)
    setMinPrice(null)
    setMaxPrice(null)
    setSortBy('created')
    setSortOrder('desc')
    setCurrentPage(0)
  }, [])

  const handleSortChange = useCallback((newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(0)
  }, [])

  const handlePriceFilterChange = useCallback((newMinPrice: number | null, newMaxPrice: number | null) => {
    setMinPrice(newMinPrice)
    setMaxPrice(newMaxPrice)
    setCurrentPage(0)
  }, [])

  // Computed values
  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === selectedCategoryId), [categories, selectedCategoryId]
  )

  const hasDiscount = useCallback((product: ProductDto) => {
    return product.comparePrice && product.comparePrice > product.price
  }, [])

  const getDiscountPercentage = useCallback((product: ProductDto) => {
    if (!hasDiscount(product)) return 0
    return Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
  }, [hasDiscount])

  const isSearching = searchTerm !== debouncedSearchTerm

  // Filter products by price range (client-side)
  const filteredProducts = useMemo(() => {
    let filtered = products

    if (minPrice !== null) {
      filtered = filtered.filter(product => {
        const productMinPrice = product.hasVariants ? product.minPrice : product.price
        return productMinPrice >= minPrice
      })
    }

    if (maxPrice !== null) {
      filtered = filtered.filter(product => {
        const productMaxPrice = product.hasVariants ? product.maxPrice : product.price
        return productMaxPrice <= maxPrice
      })
    }

    return filtered
  }, [products, minPrice, maxPrice])

  if (loading && products.length === 0) {
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

      {/* Featured Products Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">✨ สินค้าแนะนำ</h2>
            <p className="text-gray-600">สินค้ายอดนิยมและแนะนำสำหรับคุณ</p>
          </div>
          {featuredProducts.length > 0 && (
            <div className="text-sm text-gray-500">
              {featuredProducts.length} รายการ
            </div>
          )}
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">ไม่มีสินค้าแนะนำในขณะนี้</p>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Grid */}
            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
                  {/* Product Image Placeholder */}
                  <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />

                    {/* Featured Badge */}
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      แนะนำ
                    </div>

                    {/* Discount Badge */}
                    {hasDiscount(product) && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        -{getDiscountPercentage(product)}%
                      </div>
                    )}

                    {/* Stock Status */}
                    {(() => {
                      const totalStock = product.hasVariants ? product.totalStock : product.stockQuantity || 0
                      const isOutOfStock = totalStock === 0

                      return isOutOfStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">สินค้าหมด</span>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="p-3 space-y-2">
                    {/* Product Name */}
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Variant Info */}
                    {product.hasVariants && product.variants && product.variants.length > 0 && (
                      <div className="text-xs text-blue-600 font-medium">
                        {product.variants.length} รูปแบบ
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      {product.hasVariants && product.minPrice !== product.maxPrice ? (
                        <span className="text-sm font-bold text-gray-900">
                          ฿{Number(product.minPrice).toLocaleString()} - ฿{Number(product.maxPrice).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
                          ฿{Number(product.hasVariants ? product.minPrice : product.price).toLocaleString()}
                        </span>
                      )}
                      {hasDiscount(product) && (
                        <span className="text-xs line-through text-gray-400">
                          ฿{Number(product.comparePrice!).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {(() => {
                      const totalStock = product.hasVariants ? product.totalStock : product.stockQuantity || 0
                      const isOutOfStock = totalStock === 0

                      return (
                        <a
                          href={`/products/${product.id}`}
                          className={`block text-center w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isOutOfStock ? 'หมด' : product.hasVariants ? 'เลือก' : 'ดู'}
                        </a>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile & Tablet Horizontal Scroll */}
            <div className="lg:hidden">
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group flex-none w-48 sm:w-56 snap-start">
                    {/* Same content as desktop version */}
                    <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        แนะนำ
                      </div>
                      {hasDiscount(product) && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          -{getDiscountPercentage(product)}%
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.hasVariants && product.variants && product.variants.length > 0 && (
                        <div className="text-xs text-blue-600 font-medium">
                          {product.variants.length} รูปแบบ
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-gray-900">
                          ฿{Number(product.hasVariants ? product.minPrice : product.price).toLocaleString()}
                        </span>
                      </div>
                      <a
                        href={`/products/${product.id}`}
                        className="block text-center w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        ดู
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
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
          
          {(searchTerm || selectedCategoryId || minPrice || maxPrice || sortBy !== 'created' || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-6 pt-4 border-t">
            {/* Categories Filter */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                หมวดหมู่
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange(null)}
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
                    onClick={() => handleCategoryChange(category.id)}
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

            {/* Sorting */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">เรียงลำดับ</h3>
              <select
                value={`${sortBy},${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split(',') as [typeof sortBy, typeof sortOrder]
                  handleSortChange(newSortBy, newSortOrder)
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created,desc">ใหม่ล่าสุด</option>
                <option value="created,asc">เก่าสุด</option>
                <option value="name,asc">ชื่อ A-Z</option>
                <option value="name,desc">ชื่อ Z-A</option>
                <option value="price,asc">ราคาต่ำ-สูง</option>
                <option value="price,desc">ราคาสูง-ต่ำ</option>
                <option value="popularity,desc">ความนิยม</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">ช่วงราคา</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">ราคาต่ำสุด</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={minPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value) || null
                      setMinPrice(value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">ราคาสูงสุด</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="ไม่จำกัด"
                    value={maxPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value) || null
                      setMaxPrice(value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {(minPrice || maxPrice) && (
                <div className="text-xs text-gray-600">
                  ช่วงราคา: ฿{minPrice || 0} - ฿{maxPrice || '∞'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(searchTerm || selectedCategory || minPrice || maxPrice || sortBy !== 'created' || sortOrder !== 'desc') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">กรองโดย:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                ค้นหา: "{searchTerm}"
                <button
                  onClick={() => handleSearchChange('')}
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
                  onClick={() => handleCategoryChange(null)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                ราคา: ฿{minPrice || 0} - ฿{maxPrice || '∞'}
                <button
                  onClick={() => {
                    setMinPrice(null)
                    setMaxPrice(null)
                  }}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {(sortBy !== 'created' || sortOrder !== 'desc') && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                เรียง: {(() => {
                  const sortOptions: Record<string, string> = {
                    'created,desc': 'ใหม่ล่าสุด',
                    'created,asc': 'เก่าสุด',
                    'name,asc': 'ชื่อ A-Z',
                    'name,desc': 'ชื่อ Z-A',
                    'price,asc': 'ราคาต่ำ-สูง',
                    'price,desc': 'ราคาสูง-ต่ำ',
                    'popularity,desc': 'ความนิยม'
                  }
                  return sortOptions[`${sortBy},${sortOrder}`] || 'กำหนดเอง'
                })()}
                <button
                  onClick={() => handleSortChange('created', 'desc')}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          สินค้า ({(minPrice || maxPrice) ? filteredProducts.length : pagination.totalElements} รายการ)
          {pagination.totalPages > 1 && (
            <span className="text-sm text-gray-500 font-normal">
              หน้า {pagination.currentPage + 1} จาก {pagination.totalPages}
            </span>
          )}
        </h2>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            กำลังโหลด...
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 && !loading ? (
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
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${loading ? 'opacity-50' : ''}`}>
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                  <ShoppingBag className="h-16 w-16 text-gray-400" />

                  {/* Top Left - Discount Badge */}
                  {hasDiscount(product) && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      -{getDiscountPercentage(product)}%
                    </div>
                  )}

                  {/* Top Right - Variant Badge */}
                  {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                         style={{marginTop: hasDiscount(product) ? '32px' : '0'}}>
                      {product.variants.length} รูปแบบ
                    </div>
                  )}
                  {(() => {
                    const totalStock = product.hasVariants ? product.totalStock : product.stockQuantity || 0
                    const isLowStock = totalStock <= 5 && totalStock > 0
                    const isOutOfStock = totalStock === 0

                    return (
                      <>
                        {isLowStock && (
                          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            เหลือน้อย
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-medium">สินค้าหมด</span>
                          </div>
                        )}
                      </>
                    )
                  })()}
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

                  {/* Variant Info */}
                  {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <div className="text-xs text-blue-600 font-medium">
                      {product.variants.length} รูปแบบ
                      {product.variants.length > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({product.variants.map(v => Object.values(v.variantOptions).join(', ')).slice(0, 2).join(', ')}
                          {product.variants.length > 2 && '...'})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stock Info */}
                  <div className="text-xs text-gray-500">
                    คงเหลือ: {product.hasVariants ? product.totalStock : product.stockQuantity || 0} ชิ้น
                    {product.hasVariants && (
                      <span className="text-blue-600 ml-1">(รวมทุกรูปแบบ)</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    {product.hasVariants && product.minPrice !== product.maxPrice ? (
                      <span className="text-lg font-bold text-gray-900">
                        ฿{Number(product.minPrice).toLocaleString()} - ฿{Number(product.maxPrice).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ฿{Number(product.hasVariants ? product.minPrice : product.price).toLocaleString()}
                      </span>
                    )}
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
                  {(() => {
                    const totalStock = product.hasVariants ? product.totalStock : product.stockQuantity || 0
                    const isOutOfStock = totalStock === 0

                    return (
                      <a
                        href={`/products/${product.id}`}
                        className={`block text-center w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isOutOfStock ? 'สินค้าหมด' : product.hasVariants ? 'เลือกรูปแบบ' : 'ดูรายละเอียด'}
                      </a>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevious}
                  className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  ← ก่อนหน้า
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const currentPage = pagination.currentPage
                    const totalPages = pagination.totalPages
                    const pages = []

                    // Always show first page
                    if (currentPage > 2) {
                      pages.push(
                        <button
                          key={0}
                          onClick={() => handlePageChange(0)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          1
                        </button>
                      )
                      if (currentPage > 3) {
                        pages.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>)
                      }
                    }

                    // Show pages around current page
                    for (let i = Math.max(0, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            i === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      )
                    }

                    // Always show last page
                    if (currentPage < totalPages - 3) {
                      if (currentPage < totalPages - 4) {
                        pages.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>)
                      }
                      pages.push(
                        <button
                          key={totalPages - 1}
                          onClick={() => handlePageChange(totalPages - 1)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          {totalPages}
                        </button>
                      )
                    }

                    return pages
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          )}
        </>
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
                  handleCategoryChange(category.id)
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