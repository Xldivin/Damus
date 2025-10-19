import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Share2, Trash2, Grid, List, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function WishlistPage() {
  const navigate = useNavigate()
  const { 
    wishlistItems, 
    toggleWishlist, 
    addToCart, 
    setSelectedProduct,
    isLoggedIn 
  } = useAppContext()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true)
        setError(null)
        const resp = isLoggedIn
          ? await apiService.wishlist.getAllAuth()
          : await apiService.wishlist.getAll()
        console.log('Wishlist GET response:', resp)
        const products = (resp.items || []).map((entry: any) => ({
          id: entry.product?.id,
          name: entry.product?.name,
          description: entry.product?.short_description || entry.product?.description,
          primary_image: entry.product?.images?.[0]?.image_url,
          effective_price: parseFloat(entry.product?.price ?? '0'),
          original_price: entry.product?.original_price ? parseFloat(entry.product.original_price) : null,
          in_stock: !!entry.product?.in_stock,
          average_rating: parseFloat(entry.product?.average_rating ?? '0'),
          total_reviews: entry.product?.total_reviews ?? 0,
          brand: entry.product?.brand,
          category: entry.product?.category,
        }))
        setWishlistProducts(products)
        setWishlistCount(resp.item_count ?? products.length)
      } catch (err: any) {
        console.error('Failed to load wishlist:', err)
        setError('Failed to load wishlist')
      } finally {
        setLoading(false)
      }
    }
    loadWishlist()
  }, [])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    navigate(`/product/${product.id}`)
  }

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast.success(`Added ${product.name} to cart`)
  }

  const handleRemoveFromWishlist = async (productId: string | number) => {
    try {
      if (isLoggedIn) {
        await apiService.wishlist.removeAuth(productId)
      } else {
        await apiService.wishlist.removeProduct(productId)
      }
      toggleWishlist(String(productId))
      setWishlistProducts(prev => prev.filter(p => p.id !== productId))
      setWishlistCount(prev => Math.max(0, prev - 1))
      toast.success('Removed from wishlist')
    } catch (err: any) {
      console.error('Failed to remove from wishlist', err)
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleMoveAllToCart = () => {
    wishlistProducts.forEach(product => {
      if (product.inStock) {
        addToCart(product)
      }
    })
    toast.success(`Added ${wishlistProducts.filter(p => p.inStock).length} items to cart`)
  }

  const handleClearWishlist = async () => {
    try {
      if (isLoggedIn) {
        await apiService.wishlist.clearAuth()
      } else {
        await apiService.wishlist.clear()
      }
      wishlistProducts.forEach(product => toggleWishlist(product.id))
      setWishlistProducts([])
      setWishlistCount(0)
      toast.success('Wishlist cleared')
    } catch (err: any) {
      console.error('Failed to clear wishlist', err)
      toast.error('Failed to clear wishlist')
    }
  }

  const handleShareWishlist = () => {
    // Mock sharing functionality
    navigator.clipboard.writeText(window.location.href)
    toast.success('Wishlist link copied to clipboard')
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" >
          My Wishlist
        </h1>
        <p className="text-gray-600">
          {wishlistCount} item{wishlistCount !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      {loading && (
        <div className="text-center py-16">Loading wishlist...</div>
      )}
      {error && !loading && (
        <div className="text-center py-16 text-red-600">{error}</div>
      )}

      {!loading && !error && wishlistProducts.length > 0 ? (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200"
                >
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg relative">
                      <ImageWithFallback
                        src={product.primary_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.original_price && (
                        <Badge className="absolute top-2 left-2 bg-black text-white">
                          {'$'}{(product.original_price as number) - (product.effective_price as number)} OFF
                        </Badge>
                      )}
                      {!product.in_stock && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          Out of Stock
                        </Badge>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFromWishlist(product.id)
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </button>
                      
                      {/* Price change notification */}
                      {product.originalPrice && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Price dropped by ${product.originalPrice - product.price}!
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4" onClick={() => handleProductClick(product)}>
                      <p className="text-sm text-gray-600 mb-1">{product.brand?.name}</p>
                      <h3 className="font-semibold mb-2" >
                        {product.name}
                      </h3>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({product.total_reviews})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg">{'$'}{product.effective_price}</span>
                          {product.original_price && (
                            <span className="text-gray-500 line-through text-sm">
                              {'$'}{product.original_price}
                            </span>
                          )}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-black text-white hover:bg-gray-800"
                          disabled={!product.in_stock}
                          onClick={(e: { stopPropagation: () => void }) => {
                            e.stopPropagation()
                            if (product.in_stock) {
                              handleAddToCart(product)
                            }
                          }}
                        >
                          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={(e: { stopPropagation: () => void }) => {
                            e.stopPropagation()
                            handleRemoveFromWishlist(product.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200"
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent className="p-6">
                    <div className="flex space-x-6">
                      <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg relative">
                        <ImageWithFallback
                          src={product.primary_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.original_price && (
                          <Badge className="absolute top-1 left-1 bg-black text-white text-xs">
                            SALE
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm text-gray-600">{product.brand?.name}</p>
                              <div className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className={`text-xs ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2" >
                              {product.name}
                            </h3>
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">({product.total_reviews} reviews)</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xl">{'$'}{product.effective_price}</span>
                              {product.original_price && (
                                <>
                                  <span className="text-gray-500 line-through">
                                    {'$'}{product.original_price}
                                  </span>
                                  {product.original_price && (
                                    <span className="text-green-600 text-sm font-medium">
                                      Save {'$'}{(product.original_price as number) - (product.effective_price as number)}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-6">
                            <Button
                              size="sm"
                              disabled={!product.in_stock}
                              onClick={(e: { stopPropagation: () => void }) => {
                                e.stopPropagation()
                                if (product.in_stock) {
                                  handleAddToCart(product)
                                }
                              }}
                              className="bg-black text-white hover:bg-gray-800"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e: { stopPropagation: () => void }) => {
                                e.stopPropagation()
                                handleRemoveFromWishlist(product.id)
                              }}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Wishlist Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2" >
                  Save for Later
                </h3>
                <p className="text-gray-600 text-sm">
                  Keep track of items you're interested in and get notified of price changes
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2" >
                  Quick Purchase
                </h3>
                <p className="text-gray-600 text-sm">
                  Add multiple items to cart at once when you're ready to buy
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start browsing and save your favorite items to your wishlist for easy access later
          </p>
          <Button 
            onClick={() => navigate('/products')}
            className="bg-black text-white hover:bg-gray-800"
          >
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  )
}