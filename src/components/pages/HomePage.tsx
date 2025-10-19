import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'sonner'
import { apiService } from '../../services/api'
import { preloadCriticalImages } from '../../utils/imagePreloader'

export function HomePage() {
  const navigate = useNavigate()
  const { setSelectedProduct, addToCart, toggleWishlist, wishlistItems, isLoggedIn } = useAppContext()
  
  // State for API data
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([])
  const [bestSellers, setBestSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load categories and products in parallel
        const [categoriesData, productsData] = await Promise.all([
          apiService.categories.getFeaturedCategories(4),
          apiService.products.getBestSellers(4)
        ])
        setFeaturedCategories(categoriesData)
        setBestSellers(productsData)
        
        // Preload critical images for better performance
        preloadCriticalImages(productsData)
      } catch (err) {
        console.error('Failed to load homepage data:', err)
        setError('Failed to load data. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // State for dynamic stats
  const [stats, setStats] = useState({
    numProducts: 0,
    numBrands: 0,
    numCustomers: 0
  })

  // Load stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiService.products.getAllProducts(),
          apiService.categories.getAllCategories()
        ])
        
        const uniqueBrands = new Set(productsData.map(p => p.brand?.name).filter(Boolean))
        
        setStats({
          numProducts: productsData.length,
          numBrands: uniqueBrands.size,
          numCustomers: 25000 // This could also come from an API endpoint
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
        // Set default stats if API fails
        setStats({
          numProducts: 0,
          numBrands: 0,
          numCustomers: 0
        })
      }
    }

    loadStats()
  }, [])


  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    navigate(`/product/${product.id}`)
  }

  const handleAddToCartApi = async (product: any) => {
    try {
      if (isLoggedIn) {
        await apiService.cart.addAuth({ product_id: product.id, quantity: 1 })
      } else {
        await apiService.cart.add({ product_id: product.id, quantity: 1 })
      }
      addToCart(product)
      toast.success('Added to cart')
    } catch (e) {
      toast.error('Failed to add to cart')
    }
  }


  return (
    <div className="space-y-16">
      {/* Hero - Minimal black & white */}
      <section className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
              Elevate Your Everyday Tech
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8">
              Curated electronics with simple, timeless style. Only black and white.
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 sm:space-y-0 space-y-4">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => navigate('/products')}
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white"
                onClick={() => navigate('/products')}
              >
                Browse All
              </Button>
            </div>
            {/* Hero stats */}
            <div className="mt-8 sm:mt-10 lg:mt-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold">{stats.numBrands}</div>
                  <div className="text-sm text-gray-700 mt-1">Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold">{stats.numProducts}</div>
                  <div className="text-sm text-gray-700 mt-1">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold">{`${(stats.numCustomers/1000).toFixed(0)}k+`}</div>
                  <div className="text-sm text-gray-700 mt-1">Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Simple, reliable, and customer-first. Here’s what sets us apart.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="border border-black rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3"><Truck className="h-8 w-8" /></div>
            <h3 className="font-semibold mb-1">Free & Fast Shipping</h3>
            <p className="text-sm text-gray-700">On qualified orders with reliable carriers.</p>
          </div>
          <div className="border border-black rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3"><ShieldCheck className="h-8 w-8" /></div>
            <h3 className="font-semibold mb-1">Secure Payments</h3>
            <p className="text-sm text-gray-700">Encrypted checkout. Your data stays safe.</p>
          </div>
          <div className="border border-black rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3"><Headphones className="h-8 w-8" /></div>
            <h3 className="font-semibold mb-1">24/7 Support</h3>
            <p className="text-sm text-gray-700">Real people ready to help anytime.</p>
          </div>
          <div className="border border-black rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3"><RotateCcw className="h-8 w-8" /></div>
            <h3 className="font-semibold mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-700">Hassle-free returns within the window.</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Find exactly what you're looking for in our carefully curated categories
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {featuredCategories.map((category, index) => (
            <button
                key={category.id || index}
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-black rounded-full text-sm sm:text-base hover:bg-black hover:text-white transition-colors"
            >
              {category.name}
            </button>
          ))}
        </div>
        )}
        {error && (
          <div className="text-center text-sm text-gray-500 mt-2">
            {error}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4" >
              Best Sellers
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Our most popular products loved by customers
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/products')}
            className="border-black text-black hover:bg-black hover:text-white"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="border-black">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 animate-pulse rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 animate-pulse rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 animate-pulse rounded flex-1"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <Card 
              key={product.id} 
              className="group hover:shadow-lg transition-all duration-300 border-black cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <CardContent className="p-0">
                 <div className="aspect-square overflow-hidden rounded-t-lg">
                   <ImageWithFallback
                       src={product.primary_image}
                     alt={product.name}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     width={300}
                     height={300}
                     quality={85}
                     lazy={true}
                   />
                 </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">${product.effective_price}</span>
                      {product.original_price && (
                        <span className="text-gray-500 line-through text-sm">${product.original_price}</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button 
                      variant="outline"
                      className="border-black text-black hover:bg-black hover:text-white"
                      onClick={(e: { stopPropagation: () => void }) => {
                        e.stopPropagation()
                        handleProductClick(product)
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={(e: { stopPropagation: () => void }) => {
                        e.stopPropagation()
                        handleAddToCartApi(product)
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
        {error && (
          <div className="text-center text-sm text-gray-500 mt-4">
            {error}
          </div>
        )}
      </section>



    </div>
  )
}