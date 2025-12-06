import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, wishlistItems, setSelectedProduct, isLoggedIn, openCart } = useAppContext()
  
  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [inWishlist, setInWishlist] = useState<boolean>(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState<{ average_rating: number; total_reviews: number }>({ average_rating: 0, total_reviews: 0 })
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState<{ rating: number; title: string; content: string }>({ rating: 5, title: '', content: '' })
  const [reviewErrors, setReviewErrors] = useState<{ rating?: string; title?: string; content?: string }>({})
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Get product with variants - use direct API call to get full response structure
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/products/${id}`)
        const jsonResponse = await response.json()
        
        // Handle API response structure: { success, message, data: { product, variants, related_products } }
        const productData = jsonResponse.data?.product || jsonResponse.product || jsonResponse
        const variantsData = jsonResponse.data?.variants || jsonResponse.variants || []
        const relatedData = jsonResponse.data?.related_products || []
        
        setProduct(productData)
        setVariants(variantsData)
        setRelatedProducts(relatedData)
        setSelectedProduct(productData)
        
        // Set default variant (first one) if variants exist
        if (variantsData.length > 0) {
          setSelectedVariant(variantsData[0])
          setSelectedImageIndex(0)
        }
        
        // Check wishlist status for this product (auth vs session)
        try {
          const status = await apiService.wishlist.check(productData.id)
          setInWishlist(!!status?.in_wishlist)
        } catch {
          setInWishlist(false)
        }

        // Load reviews
        try {
          const resp = await apiService.reviews.list(productData.id)
          setReviews(resp.items || [])
          setReviewStats({ average_rating: resp.average_rating || 0, total_reviews: resp.total_reviews || 0 })
        } catch {}
      } catch (err) {
        console.error('Failed to load product:', err)
        setError('Failed to load product. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id, setSelectedProduct])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" >
            {error || 'Product not found'}
          </h2>
          <Button onClick={() => navigate('/products')} className="bg-black text-white">
            Browse Products
          </Button>
        </div>
      </div>
    )
  }


  const handleAddToCart = async () => {
    try {
      if (isLoggedIn) {
        await apiService.cart.addAuth({ product_id: product.id, quantity, size: selectedSize })
      } else {
        await apiService.cart.add({ product_id: product.id, quantity, size: selectedSize })
      }
      addToCart({ ...product, selectedSize }, quantity)
      toast.success(`Added ${quantity} ${product.name}${selectedSize ? ` (${selectedSize})` : ''} to cart`)
      if (openCart) openCart()
    } catch (e) {
      toast.error('Failed to add to cart')
    }
  }

  const handleWishlistToggle = async () => {
    try {
      // Use local state to decide action
      if (inWishlist) {
        if (isLoggedIn) {
          await apiService.wishlist.removeAuth(product.id)
        } else {
          await apiService.wishlist.removeProduct(product.id)
        }
        toggleWishlist(product.id)
        setInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        const resp = isLoggedIn
          ? await apiService.wishlist.addAuth(product.id)
          : await apiService.wishlist.add(product.id)
        console.log('Wishlist add success (PDP):', { productId: product.id, resp })
        toggleWishlist(product.id)
        setInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (err: any) {
      console.error('Wishlist toggle failed (PDP)', { productId: product.id, err })
      toast.error('Failed to update wishlist')
    }
  }

  const validateReviewForm = (): boolean => {
    const errors: { rating?: string; title?: string; content?: string } = {}
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5.'
    }
    if (reviewForm.title && reviewForm.title.length > 255) {
      errors.title = 'Title cannot exceed 255 characters.'
    }
    if (!reviewForm.content || !reviewForm.content.trim()) {
      errors.content = 'Review content is required.'
    }
    setReviewErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitReview = async () => {
    if (!product) return
    if (!validateReviewForm()) return
    try {
      setIsSubmittingReview(true)
      const resp = await apiService.reviews.create(product.id, {
        rating: reviewForm.rating,
        title: reviewForm.title,
        content: reviewForm.content,
      })
      setIsReviewOpen(false)
      setReviewForm({ rating: 5, title: '', content: '' })
      setReviewErrors({})
      // Refresh reviews
      const list = await apiService.reviews.list(product.id)
      setReviews(list.items || [])
      setReviewStats({ average_rating: list.average_rating || 0, total_reviews: list.total_reviews || 0 })
      toast.success('Review submitted')
    } catch (e) {
      toast.error('Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // Get current images (variant images or product images)
  const getCurrentImages = () => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images
    }
    return product?.images || []
  }

  const currentImages = getCurrentImages()

  const nextImage = () => {
    if (currentImages.length > 0) {
      setSelectedImageIndex(prev => (prev + 1) % currentImages.length)
    }
  }

  const prevImage = () => {
    if (currentImages.length > 0) {
      setSelectedImageIndex(prev => (prev - 1 + currentImages.length) % currentImages.length)
    }
  }

  // Handle variant selection
  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant)
    setSelectedImageIndex(0) // Reset to first image when variant changes
    // Reset size selection when variant changes
    setSelectedSize('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-black"
            >
              Home
            </button>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <button 
              onClick={() => navigate('/products')}
              className="text-gray-600 hover:text-black"
            >
              Products
            </button>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-black font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border relative">
            <ImageWithFallback
              src={currentImages[selectedImageIndex]?.image_url || selectedVariant?.primary_image || product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover"
              width={600}
              height={600}
              quality={90}
              lazy={false}
            />
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail images */}
          {currentImages.length > 1 && (
            <div className="flex space-x-2">
              {currentImages.map((image:any, index:any) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 overflow-hidden rounded-lg border-2 ${
                    selectedImageIndex === index ? 'border-black' : 'border-gray-200'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <ImageWithFallback
                    src={image.image_url}
                    alt={image.alt_text || `${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Product title and rating */}
          <div>
            <p className="text-gray-600 mb-2">{product.brand?.name}</p>
            <h1 className="text-3xl font-bold mb-4" >
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.average_rating} ({product.total_reviews} reviews)
              </span>
            </div>
          </div>

          {/* Color Variants - Color Swatches */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Select Color
              </div>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant: any) => {
                  const isSelected = selectedVariant?.id === variant.id
                  const isAvailable = variant.in_stock
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => isAvailable && handleVariantSelect(variant)}
                      disabled={!isAvailable}
                      className={`
                        relative w-12 h-12 rounded-full border-2 transition-all
                        ${isSelected 
                          ? 'border-black ring-2 ring-black ring-offset-2 scale-110' 
                          : isAvailable
                            ? 'border-gray-300 hover:border-gray-500 hover:scale-105'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }
                        focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                      `}
                      style={{
                        backgroundColor: variant.hex || '#cccccc',
                      }}
                      aria-label={`Select ${variant.color} color variant`}
                      title={`${variant.color}${!isAvailable ? ' - Out of Stock' : ''}`}
                    >
                      {!isAvailable && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-px bg-gray-400 rotate-45 transform"></span>
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full border-2 border-white flex items-center justify-center">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {selectedVariant && (
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedVariant.color}</span>
                </p>
              )}
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold">
                AED {selectedVariant?.effective_price || product.effective_price}
              </span>
              {product.original_price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    AED {product.original_price}
                  </span>
                  <Badge className="bg-red-100 text-red-800">
                    Save AED {product.original_price - (selectedVariant?.effective_price || product.effective_price)}
                  </Badge>
                </>
              )}
            </div>
            {product.original_price && (
              <p className="text-sm text-gray-600">
                {Math.round(((product.original_price - (selectedVariant?.effective_price || product.effective_price)) / product.original_price) * 100)}% off
              </p>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              (selectedVariant?.in_stock ?? product.in_stock) ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={(selectedVariant?.in_stock ?? product.in_stock) ? 'text-green-600' : 'text-red-600'}>
              {(selectedVariant?.in_stock ?? product.in_stock) ? 'In Stock' : 'Out of Stock'}
            </span>
            {selectedVariant && selectedVariant.stock_quantity !== undefined && (
              <span className="text-sm text-gray-500">
                ({selectedVariant.stock_quantity} available)
              </span>
            )}
          </div>

          {/* Size Selection - Only show if product has sizes */}
          {(product.sizes || product.c_sizes || product.available_sizes) && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Select Size
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || product.c_sizes || product.available_sizes).map((size: any, index: number) => {
                  const sizeValue = typeof size === 'string' ? size : size.name || size.value || size
                  const isSelected = selectedSize === sizeValue
                  // Check if size is available (for object format) or default to true for string format
                  const isAvailable = typeof size === 'string' ? true : (size.available !== false)
                  
                  return (
                    <button
                      key={`size-${index}-${sizeValue}`}
                      onClick={() => isAvailable && setSelectedSize(sizeValue)}
                      disabled={!isAvailable}
                      className={`
                        px-3 py-2 text-xs font-medium rounded border transition-all relative
                        ${isSelected 
                          ? 'bg-black text-white border-black' 
                          : isAvailable 
                            ? 'bg-white text-gray-700 border-gray-300 hover:border-black hover:bg-gray-50' 
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

          {/* Description */}
          <p className="text-gray-700 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={decrementQuantity}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                size="lg"
                className="flex-1 bg-black text-white hover:bg-gray-800"
                disabled={
                  !(selectedVariant?.in_stock ?? product.in_stock) || 
                  (product.sizes || product.c_sizes || product.available_sizes ? !selectedSize : false)
                }
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {(product.sizes || product.c_sizes || product.available_sizes) && !selectedSize ? 'Select Size' : 'Add to Cart'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlistToggle}
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Heart 
                  className={`h-5 w-5 ${inWishlist || wishlistItems.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over AED 50</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Warranty</p>
                <p className="text-xs text-gray-600">1 year coverage</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Returns</p>
                <p className="text-xs text-gray-600">30-day returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
          <Tabs defaultValue="reviews" className="mb-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" >
                Product Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold" >
                  Customer Reviews
                </h3>
                {isLoggedIn && (
                  <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white" onClick={() => setIsReviewOpen(true)}>
                    Write a Review
                  </Button>
                )}
              </div>
              
              <div className="space-y-6">
                {reviews.map((rev: any) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{rev.user?.name || 'Anonymous'}</span>
                          {rev.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < (rev.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{new Date(rev.created_at).toISOString().split('T')[0]}</span>
                        </div>
                      </div>
                    </div>
                    {rev.title && <div className="font-medium mb-1">{rev.title}</div>}
                    <p className="text-gray-700">{rev.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" >
                Shipping & Returns
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Shipping Information</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Free standard shipping on orders over $50</li>
                    <li>• Express shipping available for $9.99</li>
                    <li>• Delivery within 3-7 business days</li>
                    <li>• Tracking information provided</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Return Policy</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 15-day return window</li>
                    <li>• Items must be in original condition</li>
                    <li>• Free return shipping</li>
                    <li>• Refund processed within 5-7 business days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8" >
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <Card 
                key={relatedProduct.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200"
                onClick={() => {
                  navigate(`/product/${relatedProduct.id}`)
                  window.scrollTo(0, 0)
                }}
              >
                <CardContent className="p-0">
                  <div className="overflow-hidden rounded-t-lg relative">
                    <ImageWithFallback
                      src={relatedProduct.primary_image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2" >
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">AED {relatedProduct.effective_price}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {relatedProduct.average_rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      {/* Write Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewForm(prev => ({ ...prev, rating: n }))}>
                      <Star className={`h-5 w-5 ${n <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                {reviewErrors.rating && (
                  <div className="text-xs text-red-600 mt-1">{reviewErrors.rating}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (optional)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                />
                {reviewErrors.title && (
                  <div className="text-xs text-red-600 mt-1">{reviewErrors.title}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Review</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-28"
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                />
                {reviewErrors.content && (
                  <div className="text-xs text-red-600 mt-1">{reviewErrors.content}</div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
              <Button className="bg-black text-white hover:bg-gray-800" onClick={submitReview} disabled={isSubmittingReview}>
                {isSubmittingReview ? 'Creating…' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}