import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Minus, Plus, Trash2, Heart, ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function CartPage() {
  const navigate = useNavigate()
  const { 
    cartItems, 
    updateCartQuantity, 
    removeFromCart, 
    toggleWishlist, 
    setSelectedProduct,
    isLoggedIn,
    user,
    replaceCartFromServer,
  } = useAppContext()
  
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [estimatedDelivery, setEstimatedDelivery] = useState('3-5 business days')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()

  const refreshCartFromServer = async () => {
    try {
      const resp = isLoggedIn
        ? await apiService.cart.getAllAuth(user?.id)
        : await apiService.cart.getAll()
      const mapped: any[] = (resp.items || []).map((it: any) => ({
        productId: String(it.product?.id ?? it.product_id),
        cartItemId: it.id,
        product: {
          ...(it.product ?? it),
          selectedSize: it.product_options?.size,
          selectedColor: it.product_options?.color,
        },
        quantity: Number(it.quantity ?? 1),
      }))
      if (replaceCartFromServer) replaceCartFromServer(mapped as any)
    } catch (e) {
      // ignore refresh errors here
    }
  }

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true)
        setError(null)
        const resp = isLoggedIn
          ? await apiService.cart.getAllAuth(user?.id)
          : await apiService.cart.getAll()
        // Map server items -> local CartItem shape { productId, product, quantity, cartItemId }
        const mapped: any[] = (resp.items || []).map((it: any) => ({
          productId: String(it.product?.id ?? it.product_id),
          cartItemId: it.id, // Store the actual cart item ID for removal
          product: {
            ...(it.product ?? it),
            // Add size from product_options if available
            selectedSize: it.product_options?.size,
            // Add other product options
            selectedColor: it.product_options?.color,
          },
          quantity: Number(it.quantity ?? 1),
        }))
        if (replaceCartFromServer) replaceCartFromServer(mapped as any)
      } catch (e) {
        setError('Failed to load cart')
      } finally {
        setLoading(false)
      }
    }
    loadCart()
  }, [isLoggedIn, user?.id, location.key])

  // Calculate totals (support API product shape)
  const subtotal = cartItems.reduce((sum, item) => {
    const unit = Number(item.product?.effective_price ?? item.product?.price ?? 0)
    return sum + unit * item.quantity
  }, 0)
  const promoDiscount = appliedPromo === 'SAVE10' ? subtotal * 0.1 : 0
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - promoDiscount) * 0.08 // 8% tax
  const total = subtotal - promoDiscount + shipping + tax

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      toast.success('Item removed from cart')
    } else {
      updateCartQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = async (cartItemId: string, productId: string, productName: string) => {
    try {
      // Use the cart item ID for API removal, with authenticated endpoint if logged in
      if (isLoggedIn) {
        await apiService.cart.removeAuth(cartItemId, user?.id)
      } else {
        await apiService.cart.remove(cartItemId)
      }
    } catch (e) {
      console.error('Failed to remove item from cart:', e)
      toast.error('Failed to remove item from cart')
      return
    }
    // Update local state using product ID
    removeFromCart(productId)
    // Ensure header/cart counts reflect server truth
    refreshCartFromServer()
    toast.success(`${productName} removed from cart`)
  }

  const handleMoveToWishlist = (productId: string, productName: string) => {
    toggleWishlist(productId)
    removeFromCart(productId)
    // Also refresh from server to avoid any drift
    refreshCartFromServer()
    toast.success(`${productName} moved to wishlist`)
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    navigate(`/product/${product.id}`)
  }

  if (!loading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4" >
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some items to your cart to get started
          </p>
          <Button 
            onClick={() => navigate('/products')}
            className="bg-black text-white hover:bg-gray-800"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && (
        <div className="text-center py-16">Loading cart...</div>
      )}
      {error && !loading && (
        <div className="text-center py-4 text-red-600">{error}</div>
      )}
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        <div>
          <h1 className="text-3xl font-bold" >
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.productId} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div 
                    className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
                    onClick={() => handleProductClick(item.product)}
                  >
                    <ImageWithFallback
                      src={item.product?.primary_image || item.product?.image || item.product?.images?.[0]?.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      width={200}
                      height={200}
                      quality={80}
                      lazy={true}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 
                          className="font-semibold cursor-pointer hover:text-gray-600"
                         
                          onClick={() => handleProductClick(item.product)}
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{item.product?.brand?.name || item.product?.brand || ''}</p>
                        
                        {/* Product Attributes */}
                        <div className="space-y-1 mb-3">
                          {/* Size */}
                          {(item.product?.selectedSize || item.product?.size) && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Size:</span> {item.product?.selectedSize || item.product?.size}
                            </div>
                          )}
                          
                          {/* Color */}
                          {(item.product?.color || item.product?.selectedColor) && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Color:</span> {item.product?.color || item.product?.selectedColor}
                            </div>
                          )}
                          
                          {/* Fit */}
                          {item.product?.fit && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Fit:</span> {item.product.fit}
                            </div>
                          )}
                          
                          {/* Material */}
                          {item.product?.material && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Material:</span> {item.product.material}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2 border-x min-w-[60px] text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveItem((item as any).cartItemId || item.productId, item.productId, item.product.name)}
                              className="flex items-center text-gray-600 hover:text-red-600 text-sm transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${(item.product?.in_stock ?? item.product?.inStock) ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-sm font-medium ${(item.product?.in_stock ?? item.product?.inStock) ? 'text-green-600' : 'text-red-600'}`}>
                            {(item.product?.in_stock ?? item.product?.inStock) ? 'In stock' : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg mb-1">
                          AED {(
                            Number(item.product?.effective_price ?? item.product?.price ?? 0) * item.quantity
                          ).toFixed(2)}
                        </div>
                        <div className="text-gray-600 text-sm">
                          AED {Number(item.product?.effective_price ?? item.product?.price ?? 0).toFixed(2)} each
                        </div>
                        {item.product?.original_price && (
                          <div className="text-gray-500 line-through text-sm">
                            AED {(Number(item.product.original_price) * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          

        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" >
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>
                
                {appliedPromo === 'SAVE10' && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (SAVE10)</span>
                    <span>-AED {promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 || appliedPromo === 'FREESHIP' ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `AED ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>AED {tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>AED {total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6 bg-black text-white hover:bg-gray-800"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" >
                Delivery Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-gray-600 text-sm">{estimatedDelivery}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Secure Checkout</p>
                    <p className="text-gray-600 text-sm">Your information is protected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" >
                We Accept
              </h3>
              <div className="flex space-x-2">
                {['Visa', 'MC', 'Amex', 'PayPal', 'Apple Pay'].map((method) => (
                  <div 
                    key={method}
                    className="w-12 h-8 bg-gray-100 border rounded flex items-center justify-center text-xs font-medium"
                  >
                    {method === 'MC' ? 'MC' : method.charAt(0)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Truck className="h-6 w-6 text-gray-600" />
          <div>
            <p className="font-medium">Free Shipping</p>
            <p className="text-gray-600 text-sm">On orders over AED 50</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Shield className="h-6 w-6 text-gray-600" />
          <div>
            <p className="font-medium">Secure Checkout</p>
            <p className="text-gray-600 text-sm">SSL encrypted payment</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Heart className="h-6 w-6 text-gray-600" />
          <div>
            <p className="font-medium">30-Day Returns</p>
            <p className="text-gray-600 text-sm">Easy return policy</p>
          </div>
        </div>
      </div>
    </div>
  )
}