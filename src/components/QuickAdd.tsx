import React, { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Lock, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext'
import { apiService } from '../services/api'

interface QuickAddProps {
  product: any
  onAddToCart?: (product: any, size: string) => void
}

export function QuickAdd({ product, onAddToCart }: QuickAddProps) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart, isLoggedIn } = useAppContext()

  // Extract sizes from product data
  const sizes = product.sizes || product.c_sizes || product.available_sizes || []
  
  // Only show size selection if product has sizes
  const hasSizes = sizes.length > 0

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
  }

  const handleQuickAdd = async () => {
    if (hasSizes && !selectedSize) {
      toast.error('Please select a size')
      return
    }

    setIsAdding(true)
    try {
      // Add to cart via API
      if (isLoggedIn) {
        await apiService.cart.addAuth({ 
          product_id: product.id, 
          quantity: 1,
          size: hasSizes ? selectedSize : undefined
        })
      } else {
        await apiService.cart.add({ 
          product_id: product.id, 
          quantity: 1,
          size: hasSizes ? selectedSize : undefined
        })
      }

      // Add to local cart state
      addToCart({ ...product, selectedSize: hasSizes ? selectedSize : undefined })
      
      // Call parent callback if provided
      if (onAddToCart) {
        onAddToCart(product, hasSizes ? selectedSize : '')
      }

      toast.success(`Added ${product.name}${hasSizes ? ` (${selectedSize})` : ''} to cart`)
      setSelectedSize('')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast.error('Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Quick Add Header */}
      {/* <div className="flex items-center space-x-2">
        <Lock className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">QUICK ADD</span>
      </div> */}

      {/* Select Size Section - Only show if product has sizes */}
      {hasSizes && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Select Size
          </div>
          <div className="grid grid-cols-3 gap-1">
            {sizes.map((size: any, index: number) => {
              const sizeValue = typeof size === 'string' ? size : size.name || size.value || size
              const isSelected = selectedSize === sizeValue
              // Check if size is available (for object format) or default to true for string format
              const isAvailable = typeof size === 'string' ? true : (size.available !== false)
              
              return (
                <button
                  key={`size-${index}-${sizeValue}`}
                  onClick={() => isAvailable && handleSizeSelect(sizeValue)}
                  disabled={!isAvailable}
                  className={`
                    px-2 py-1.5 text-xs font-medium rounded border transition-all relative
                    ${isSelected 
                      ? 'bg-black text-white border-black' 
                      : isAvailable 
                        ? 'bg-white text-gray-700 border-gray-300 hover:border-gray-400' 
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                    }
                  `}
                >
                  {sizeValue}
                  {!isAvailable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-px bg-gray-400 rotate-45 transform"></span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleQuickAdd}
        disabled={(hasSizes && !selectedSize) || isAdding || !product.in_stock}
        className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 text-sm py-2"
      >
        {isAdding ? (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Adding...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-3 w-3" />
            <span>
              {!product.in_stock 
                ? 'Out of Stock' 
                : hasSizes && !selectedSize
                  ? 'Select Size'
                  : hasSizes && selectedSize
                    ? `Add ${selectedSize}`
                    : 'Add to Cart'
              }
            </span>
          </div>
        )}
      </Button>
    </div>
  )
}
