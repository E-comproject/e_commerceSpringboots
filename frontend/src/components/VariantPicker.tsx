'use client';

import { VariantOption } from '@/types/product';

interface VariantPickerProps {
  option: VariantOption;
  selectedValue?: string;
  availableValues: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  variant?: 'radio' | 'dropdown' | 'button';
}

export function VariantPicker({
  option,
  selectedValue,
  availableValues,
  onSelect,
  disabled = false,
  variant = 'button'
}: VariantPickerProps) {

  if (variant === 'dropdown') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {option.label}
        </label>
        <select
          value={selectedValue || ''}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">เลือก {option.label}</option>
          {option.values.map(value => (
            <option
              key={value}
              value={value}
              disabled={!availableValues.includes(value)}
            >
              {value}
              {!availableValues.includes(value) && ' (หมด)'}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (variant === 'radio') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {option.label}
        </label>
        <div className="space-y-2">
          {option.values.map(value => {
            const isAvailable = availableValues.includes(value);
            const isSelected = selectedValue === value;

            return (
              <label
                key={value}
                className={`flex items-center space-x-2 cursor-pointer ${
                  !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  checked={isSelected}
                  onChange={() => onSelect(value)}
                  disabled={disabled || !isAvailable}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700">
                  {value}
                  {!isAvailable && <span className="text-red-500 ml-1">(หมด)</span>}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: Button variant
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {option.label}
      </label>
      <div className="flex flex-wrap gap-2">
        {option.values.map(value => {
          const isAvailable = availableValues.includes(value);
          const isSelected = selectedValue === value;

          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              disabled={disabled || !isAvailable}
              className={`
                px-4 py-2 text-sm font-medium border rounded-md transition-colors duration-200
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isAvailable
                  ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }
                disabled:cursor-not-allowed
              `}
            >
              {value}
              {!isAvailable && (
                <span className="ml-1 text-xs">(หมด)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Special variant pickers for common use cases

export function ColorPicker(props: Omit<VariantPickerProps, 'variant'>) {
  const colorMap: Record<string, string> = {
    'Red': '#ef4444',
    'Blue': '#3b82f6',
    'Green': '#10b981',
    'Black': '#000000',
    'White': '#ffffff',
    'Yellow': '#eab308',
    'Purple': '#8b5cf6',
    'Pink': '#ec4899',
    'Gray': '#6b7280',
    'Orange': '#f97316'
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {props.option.label}
      </label>
      <div className="flex flex-wrap gap-2">
        {props.option.values.map(value => {
          const isAvailable = props.availableValues.includes(value);
          const isSelected = props.selectedValue === value;
          const colorCode = colorMap[value];

          return (
            <button
              key={value}
              onClick={() => props.onSelect(value)}
              disabled={props.disabled || !isAvailable}
              className={`
                relative w-12 h-12 border-2 rounded-full transition-all duration-200
                ${isSelected
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : isAvailable
                  ? 'border-gray-300 hover:border-gray-400'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
                }
                ${colorCode === '#ffffff' ? 'bg-white' : ''}
              `}
              style={{
                backgroundColor: colorCode || '#e5e7eb'
              }}
              title={`${value}${!isAvailable ? ' (หมด)' : ''}`}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className={`w-6 h-6 ${colorCode === '#ffffff' || colorCode === '#eab308' ? 'text-gray-800' : 'text-white'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SizePicker(props: Omit<VariantPickerProps, 'variant'>) {
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

  const sortedValues = [...props.option.values].sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a);
    const bIndex = sizeOrder.indexOf(b);

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  const sortedOption = {
    ...props.option,
    values: sortedValues
  };

  return <VariantPicker {...props} option={sortedOption} variant="button" />;
}