# Product Variants Implementation Guide

## 🎯 Overview

This guide explains how to use the newly implemented Product Variants system that allows customers to select different variations of products like size, color, or storage capacity.

## 📊 Database Schema

### New Tables Created:
```sql
-- Product variants table
product_variants (
    id, product_id, sku, variant_title,
    variant_options (JSONB), price, compare_price,
    stock_quantity, weight_gram, status, position,
    created_at, updated_at
)

-- Variant images table
product_variant_images (
    id, variant_id, image_url, alt_text, position, created_at
)
```

### Updated Tables:
```sql
-- Cart items now support variants
cart_items: + variant_id

-- Order items now support variants
order_items: + variant_id, variant_sku, variant_title
```

## 🚀 API Endpoints

### Product Variants Management

#### Get Product Variants
```http
GET /api/products/{productId}/variants?activeOnly=true
```

#### Create Product Variant
```http
POST /api/products/{productId}/variants
Content-Type: application/json

{
  "sku": "TSHIRT-RED-M",
  "variantTitle": "Red Medium T-Shirt",
  "variantOptions": {
    "color": "Red",
    "size": "M"
  },
  "price": 299.00,
  "stockQuantity": 50,
  "status": "active"
}
```

#### Get Variant Options for Product
```http
GET /api/products/{productId}/variant-options

Response:
{
  "color": ["Red", "Blue", "Green"],
  "size": ["S", "M", "L", "XL"],
  "storage": ["128GB", "256GB", "512GB"]
}
```

#### Find Variants by Options
```http
POST /api/products/{productId}/variants/search
Content-Type: application/json

{
  "color": "Red",
  "size": "M"
}
```

### Cart Management

#### Add Product Variant to Cart
```http
POST /api/cart/items?cartId={cartId}
Content-Type: application/json

{
  "productId": 1,
  "variantId": 5,
  "quantity": 2
}
```

#### Add Regular Product to Cart (backward compatibility)
```http
POST /api/cart/items/simple?cartId={cartId}&productId={productId}&quantity={quantity}
```

## 💻 Usage Examples

### Example 1: T-Shirt with Color and Size
```json
{
  "productId": 1,
  "name": "Cotton T-Shirt",
  "hasVariants": true,
  "minPrice": 299.00,
  "maxPrice": 329.00,
  "variants": [
    {
      "id": 1,
      "sku": "TSHIRT-RED-S",
      "variantOptions": {"color": "Red", "size": "S"},
      "price": 299.00,
      "stockQuantity": 10,
      "available": true,
      "displayName": "Red / S"
    },
    {
      "id": 2,
      "sku": "TSHIRT-BLUE-L",
      "variantOptions": {"color": "Blue", "size": "L"},
      "price": 329.00,
      "stockQuantity": 5,
      "available": true,
      "displayName": "Blue / L"
    }
  ]
}
```

### Example 2: iPhone with Storage and Color
```json
{
  "productId": 2,
  "name": "iPhone 15 Pro",
  "hasVariants": true,
  "minPrice": 45900.00,
  "maxPrice": 62900.00,
  "variants": [
    {
      "id": 3,
      "sku": "IP15P-256GB-BLACK",
      "variantOptions": {
        "storage": "256GB",
        "color": "Space Black"
      },
      "price": 45900.00,
      "stockQuantity": 8,
      "available": true,
      "displayName": "256GB / Space Black"
    },
    {
      "id": 4,
      "sku": "IP15P-512GB-BLUE",
      "variantOptions": {
        "storage": "512GB",
        "color": "Blue Titanium"
      },
      "price": 52900.00,
      "stockQuantity": 3,
      "available": true,
      "displayName": "512GB / Blue Titanium"
    }
  ]
}
```

## 🛒 Frontend Integration

### Basic Variant Selector (React/TypeScript)
```typescript
interface ProductWithVariants {
  id: number;
  name: string;
  hasVariants: boolean;
  variants: ProductVariant[];
  minPrice: number;
  maxPrice: number;
}

interface ProductVariant {
  id: number;
  sku: string;
  variantOptions: Record<string, string>;
  price: number;
  stockQuantity: number;
  available: boolean;
  displayName: string;
}

function ProductVariantSelector({ product }: { product: ProductWithVariants }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Get available option keys (color, size, etc.)
  const optionKeys = Array.from(
    new Set(product.variants.flatMap(v => Object.keys(v.variantOptions)))
  );

  // Get available values for each option
  const getOptionValues = (optionKey: string) => {
    return Array.from(
      new Set(product.variants.map(v => v.variantOptions[optionKey]).filter(Boolean))
    );
  };

  // Find matching variant based on selected options
  const findMatchingVariant = () => {
    return product.variants.find(variant =>
      Object.entries(selectedOptions).every(
        ([key, value]) => variant.variantOptions[key] === value
      )
    );
  };

  // Add to cart
  const addToCart = async () => {
    if (!selectedVariant) return;

    const response = await fetch(`/api/cart/items?cartId=${cartId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: 1
      })
    });
  };

  return (
    <div className="variant-selector">
      {optionKeys.map(optionKey => (
        <div key={optionKey} className="option-group">
          <label>{optionKey.charAt(0).toUpperCase() + optionKey.slice(1)}</label>
          <select
            value={selectedOptions[optionKey] || ''}
            onChange={(e) => setSelectedOptions({
              ...selectedOptions,
              [optionKey]: e.target.value
            })}
          >
            <option value="">Select {optionKey}</option>
            {getOptionValues(optionKey).map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      ))}

      {selectedVariant && (
        <div className="selected-variant">
          <p>Selected: {selectedVariant.displayName}</p>
          <p>Price: ฿{selectedVariant.price}</p>
          <p>Stock: {selectedVariant.stockQuantity} available</p>
          <button
            onClick={addToCart}
            disabled={!selectedVariant.available}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
```

## 🔧 Business Logic

### Stock Management
- Each variant has its own stock quantity
- Product total stock = sum of all active variant stocks
- Cart items are linked to specific variants
- Order processing reserves stock from specific variants

### Pricing
- Variants can have their own price or inherit from parent product
- Product shows price range (min-max) when variants have different prices
- Cart and orders use variant's effective price

### SKU Management
- Each variant must have a unique SKU
- Auto-generation: `P{productId}-{optionKey}{optionValue}-{timestamp}`
- Example: `P1-COLRED-SIZM-1234` for Red Medium variant

## ⚠️ Important Notes

1. **Backward Compatibility**: Products without variants continue to work as before
2. **Stock Validation**: Always check variant availability before adding to cart
3. **Price Snapshots**: Cart items store price at time of addition
4. **JSON Storage**: Variant options are stored as JSONB for flexibility
5. **Performance**: Use appropriate indexes on variant queries

## 🧪 Testing Scenarios

### Test Case 1: Create Product with Variants
1. Create base product
2. Add variants with different options
3. Verify variant options API returns correct structure

### Test Case 2: Add Variant to Cart
1. Select specific variant
2. Add to cart with quantity
3. Verify cart item has correct variant info and price

### Test Case 3: Stock Management
1. Try to add more quantity than available stock
2. Verify error message
3. Test stock deduction on order placement

### Test Case 4: Price Range Display
1. Create variants with different prices
2. Verify product shows correct min/max price range
3. Test effective price calculation

## 🚀 Next Steps

1. Implement frontend variant selector UI
2. Add variant image switching functionality
3. Create admin interface for variant management
4. Add bulk variant creation tools
5. Implement variant-based inventory reports