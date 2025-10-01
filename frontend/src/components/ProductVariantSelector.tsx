'use client';

import { useState } from 'react';
import { Product, AddToCartRequest } from '@/types/product';
import { useVariantSelection } from '@/hooks/useVariantSelection';
import { VariantPicker, ColorPicker, SizePicker } from './VariantPicker';

interface ProductVariantSelectorProps {
  product: Product;
  onAddToCart?: (request: AddToCartRequest) => Promise<void>;
  onVariantChange?: (variantId?: number) => void;
}

export function ProductVariantSelector({
  product,
  onAddToCart,
  onVariantChange
}: ProductVariantSelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { state, updateOption, getAvailableOptionValues } = useVariantSelection(product);

  // Notify parent component when variant changes
  const handleOptionChange = (optionKey: string, value: string) => {
    updateOption(optionKey, value);
    onVariantChange?.(state.selectedVariant?.id);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!onAddToCart) return;

    setIsAddingToCart(true);
    try {
      const request: AddToCartRequest = {
        productId: product.id,
        variantId: state.selectedVariant?.id,
        quantity
      };
      await onAddToCart(request);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // You might want to show a toast or error message here
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Get appropriate picker component for each option
  const getPickerComponent = (option: any) => {
    const commonProps = {
      option,
      selectedValue: state.selectedOptions[option.key],
      availableValues: getAvailableOptionValues(option.key),
      onSelect: (value: string) => handleOptionChange(option.key, value)
    };

    // Use specialized pickers for common options
    if (option.key.toLowerCase().includes('color') || option.key.toLowerCase().includes('สี')) {
      return <ColorPicker key={option.key} {...commonProps} />;
    }

    if (option.key.toLowerCase().includes('size') || option.key.toLowerCase().includes('ขนาด')) {
      return <SizePicker key={option.key} {...commonProps} />;
    }

    // Use dropdown for options with many values
    if (option.values.length > 6) {
      return <VariantPicker key={option.key} {...commonProps} variant="dropdown" />;
    }

    // Default to button picker
    return <VariantPicker key={option.key} {...commonProps} variant="button" />;
  };

  if (!product.hasVariants) {
    // Simple product without variants
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ฿{product.price.toLocaleString()}
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="text-sm text-gray-500 line-through">
                ฿{product.comparePrice.toLocaleString()}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            คงเหลือ: {product.stockQuantity} ชิ้น
          </div>
        </div>

        {product.stockQuantity > 0 && onAddToCart && (
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
                className="w-16 text-center border-0 focus:ring-0"
                min="1"
                max={product.stockQuantity}
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingToCart ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
            </button>
          </div>
        )}

        {product.stockQuantity === 0 && (
          <div className="text-center py-4 text-red-600 font-medium">
            สินค้าหมด
          </div>
        )}
      </div>
    );
  }

  // Product with variants
  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div className="flex items-center justify-between">
        <div>
          {state.isValidSelection ? (
            <div className="text-2xl font-bold text-gray-900">
              ฿{state.price.toLocaleString()}
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-900">
              ฿{product.minPrice?.toLocaleString()} - ฿{product.maxPrice?.toLocaleString()}
            </div>
          )}
          {state.selectedVariant?.comparePrice && state.selectedVariant.comparePrice > state.price && (
            <div className="text-sm text-gray-500 line-through">
              ฿{state.selectedVariant.comparePrice.toLocaleString()}
            </div>
          )}
        </div>
        {state.isValidSelection && (
          <div className="text-sm text-gray-600">
            คงเหลือ: {state.stockQuantity} ชิ้น
          </div>
        )}
      </div>

      {/* Variant Options */}
      <div className="space-y-4">
        {state.availableOptions.map(option => getPickerComponent(option))}
      </div>

      {/* Selected Variant Info */}
      {state.selectedVariant && (
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="text-sm font-medium text-gray-700">เลือกแล้ว:</div>
          <div className="text-sm text-gray-600">{state.selectedVariant.displayName}</div>
          <div className="text-sm text-gray-600">SKU: {state.selectedVariant.sku}</div>
        </div>
      )}

      {/* Add to Cart Section */}
      {state.available && state.isValidSelection && onAddToCart && (
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(state.stockQuantity, parseInt(e.target.value) || 1)))}
              className="w-16 text-center border-0 focus:ring-0"
              min="1"
              max={state.stockQuantity}
            />
            <button
              type="button"
              onClick={() => setQuantity(Math.min(state.stockQuantity, quantity + 1))}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isAddingToCart ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
          </button>
        </div>
      )}

      {/* Validation Messages */}
      {!state.isValidSelection && state.availableOptions.length > 0 && (
        <div className="text-center py-4 text-orange-600 font-medium">
          กรุณาเลือกตัวเลือกให้ครบถ้วน
        </div>
      )}

      {state.isValidSelection && !state.available && (
        <div className="text-center py-4 text-red-600 font-medium">
          สินค้าหมด
        </div>
      )}
    </div>
  );
}