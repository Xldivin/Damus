import { useState, useEffect } from 'react'
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
  const { addToCart, toggleWishlist, wishlistItems, setSelectedProduct, isLoggedIn } = useAppContext()
  
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [inWishlist, setInWishlist] = useState<boolean>(false)

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        const productData = await apiService.products.getProductById(id)
        setProduct(productData)
        setSelectedProduct(productData)
        // Check wishlist status for this product (auth vs session)
        try {
          const status = await apiService.wishlist.check(productData.id)
          setInWishlist(!!status?.in_wishlist)
        } catch {
          setInWishlist(false)
        }
        
        // Load related products
        const related = await apiService.products.getRelatedProducts(id)
        setRelatedProducts(related)
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
        await apiService.cart.addAuth({ product_id: product.id, quantity })
      } else {
        await apiService.cart.add({ product_id: product.id, quantity })
      }
      addToCart(product, quantity)
      toast.success(`Added ${quantity} ${product.name} to cart`)
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

  const reviews = [
    {
      id: 1,
      name: 'John Smith',
      rating: 5,
      date: '2024-01-15',
      content: 'Excellent product! Works exactly as described and arrived quickly.',
      verified: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      rating: 4,
      date: '2024-01-10',
      content: 'Good quality but could be improved in some areas. Overall satisfied.',
      verified: true
    },
    {
      id: 3,
      name: 'Mike Chen',
      rating: 5,
      date: '2024-01-05',
      content: 'Amazing build quality and performance. Highly recommend!',
      verified: false
    }
  ]

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const nextImage = () => {
    setSelectedImageIndex(prev => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex(prev => (prev - 1 + product.images.length) % product.images.length)
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
          <div className="aspect-square overflow-hidden rounded-lg border relative">
            <ImageWithFallback
              src={product.images?.[selectedImageIndex]?.image_url || product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover"
              width={600}
              height={600}
              quality={90}
              lazy={false}
            />
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail images */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image:any, index:any) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 overflow-hidden rounded-lg border-2 ${
                    selectedImageIndex === index ? 'border-black' : 'border-gray-200'
                  }`}
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

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold">${product.effective_price}</span>
              {product.original_price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.original_price}
                  </span>
                  <Badge className="bg-red-100 text-red-800">
                    Save ${product.original_price - product.effective_price}
                  </Badge>
                </>
              )}
            </div>
            {product.original_price && (
              <p className="text-sm text-gray-600">
                {Math.round(((product.original_price - product.effective_price) / product.original_price) * 100)}% off
              </p>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={product.in_stock ? 'text-green-600' : 'text-red-600'}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

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
                disabled={!product.in_stock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
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
                <p className="text-xs text-gray-600">On orders over $50</p>
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
      <Tabs defaultValue="specifications" className="mb-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
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
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  Write a Review
                </Button>
              </div>
              
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{review.name}</span>
                          {review.verified && (
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
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.content}</p>
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
                    <li>• 30-day return window</li>
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
                  <div className="aspect-square overflow-hidden rounded-t-lg relative">
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
                      <span className="font-bold">${relatedProduct.effective_price}</span>
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
    </div>
  )
}