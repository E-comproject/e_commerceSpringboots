'use client';

import { useState, useEffect } from 'react';
import { Product, AddToCartRequest, CreateVariantRequest } from '@/types/product';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { fetchProducts, fetchProductWithVariants, createProductVariant } from '@/lib/api/products';

export default function VariantsTestPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingVariant, setCreatingVariant] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const fetchedProducts = await fetchProducts();
      console.log('Fetched products:', fetchedProducts);
      setProducts(fetchedProducts);
      if (fetchedProducts.length > 0) {
        console.log('Loading details for first product:', fetchedProducts[0].id);
        await loadProductDetails(fetchedProducts[0].id);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProductDetails = async (productId: number) => {
    try {
      console.log('Loading product details for ID:', productId);
      const productWithVariants = await fetchProductWithVariants(productId);
      console.log('Product with variants:', productWithVariants);
      setSelectedProduct(productWithVariants);
    } catch (error) {
      console.error('Failed to load product details:', error);
      alert('เกิดข้อผิดพลาดในการโหลดรายละเอียดสินค้า: ' + error.message);
    }
  };

  const handleAddToCart = async (request: AddToCartRequest) => {
    console.log('Add to cart request:', request);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`เพิ่มสินค้าลงตะกร้าแล้ว!\nProduct ID: ${request.productId}\nVariant ID: ${request.variantId || 'none'}\nQuantity: ${request.quantity}`);
  };

  const createSampleVariants = async () => {
    if (!selectedProduct) return;

    setCreatingVariant(true);
    try {
      // Create sample variants for the selected product
      const sampleVariants: CreateVariantRequest[] = [
        {
          sku: `${selectedProduct.sku || 'PROD'}-RED-S`,
          variantTitle: 'Red Small',
          variantOptions: { color: 'Red', size: 'S' },
          price: selectedProduct.price + 0,
          stockQuantity: 5,
          status: 'active'
        },
        {
          sku: `${selectedProduct.sku || 'PROD'}-RED-M`,
          variantTitle: 'Red Medium',
          variantOptions: { color: 'Red', size: 'M' },
          price: selectedProduct.price + 100,
          stockQuantity: 10,
          status: 'active'
        },
        {
          sku: `${selectedProduct.sku || 'PROD'}-BLUE-S`,
          variantTitle: 'Blue Small',
          variantOptions: { color: 'Blue', size: 'S' },
          price: selectedProduct.price + 50,
          stockQuantity: 3,
          status: 'active'
        },
        {
          sku: `${selectedProduct.sku || 'PROD'}-BLUE-M`,
          variantTitle: 'Blue Medium',
          variantOptions: { color: 'Blue', size: 'M' },
          price: selectedProduct.price + 150,
          stockQuantity: 8,
          status: 'active'
        },
        {
          sku: `${selectedProduct.sku || 'PROD'}-GREEN-M`,
          variantTitle: 'Green Medium',
          variantOptions: { color: 'Green', size: 'M' },
          price: selectedProduct.price + 200,
          stockQuantity: 0, // Out of stock
          status: 'active'
        }
      ];

      for (const variant of sampleVariants) {
        await createProductVariant(selectedProduct.id, variant);
      }

      // Reload product with new variants
      await loadProductDetails(selectedProduct.id);
      alert('สร้าง sample variants เรียบร้อยแล้ว!');

    } catch (error) {
      console.error('Failed to create variants:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง variants');
    } finally {
      setCreatingVariant(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">กำลังโหลด...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600">ไม่พบข้อมูลสินค้า กรุณาตรวจสอบ Backend Server</div>
          <div className="text-sm text-gray-500 mt-2">
            Backend URL: http://localhost:8080/api/products
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            รีโหลดหน้า
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Product Variants Test Page</h1>

        {/* Product Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">เลือกสินค้าเพื่อทดสอบ:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => loadProductDetails(product.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProduct?.id === product.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600">฿{product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {product.hasVariants ? `${product.variants?.length || 0} variants` : 'No variants'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Info */}
            <div>
              <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
              <div className="space-y-2 text-gray-600">
                <p>ID: {selectedProduct.id}</p>
                <p>SKU: {selectedProduct.sku || 'N/A'}</p>
                <p>Base Price: ฿{selectedProduct.price.toLocaleString()}</p>
                <p>Stock: {selectedProduct.stockQuantity}</p>
                <p>Has Variants: {selectedProduct.hasVariants ? 'Yes' : 'No'}</p>
                {selectedProduct.hasVariants && (
                  <>
                    <p>Variants Count: {selectedProduct.variants?.length || 0}</p>
                    <p>Price Range: ฿{selectedProduct.minPrice?.toLocaleString()} - ฿{selectedProduct.maxPrice?.toLocaleString()}</p>
                  </>
                )}
              </div>

              {/* Create Sample Variants Button */}
              {(!selectedProduct.hasVariants || !selectedProduct.variants || selectedProduct.variants.length === 0) && (
                <button
                  onClick={createSampleVariants}
                  disabled={creatingVariant}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
                >
                  {creatingVariant ? 'กำลังสร้าง...' : 'สร้าง Sample Variants'}
                </button>
              )}

              {/* Variants List */}
              {selectedProduct.hasVariants && selectedProduct.variants && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Variants:</h3>
                  <div className="space-y-2">
                    {selectedProduct.variants.map(variant => (
                      <div key={variant.id} className="p-3 bg-gray-50 rounded-md text-sm">
                        <div className="font-medium">{variant.variantTitle}</div>
                        <div className="text-gray-600">
                          SKU: {variant.sku} | Price: ฿{variant.price.toLocaleString()} | Stock: {variant.stockQuantity}
                        </div>
                        <div className="text-gray-500">
                          Options: {JSON.stringify(variant.variantOptions)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Variant Selector */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Product Variant Selector</h3>
              <ProductVariantSelector
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                onVariantChange={(variantId) => {
                  console.log('Variant changed to:', variantId);
                }}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">วิธีการทดสอบ:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>เลือกสินค้าจากรายการด้านบน</li>
            <li>หากสินค้าไม่มี variants ให้กดปุ่ม "สร้าง Sample Variants" เพื่อสร้าง variants ทดสอบ</li>
            <li>ลองเลือกตัวเลือกต่างๆ (สี, ขนาด) และสังเกตการเปลี่ยนแปลงของราคาและสต็อก</li>
            <li>ทดสอบเพิ่มสินค้าลงตะกร้า</li>
            <li>สังเกตการแสดงผลเมื่อสินค้าหมด (Green Medium จะหมด)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}