import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Filter, Grid, List, Star, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Slider } from '../ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
// removed popover in favor of simple toggle panels
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { QuickAdd } from '../QuickAdd'
import { toast } from 'sonner'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'

export function ProductListingPage() {
  const navigate = useNavigate()
  const { setSelectedProduct, addToCart, toggleWishlist, wishlistItems, isLoggedIn } = useAppContext()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(10000) // Default max price, will be calculated from products
  const [priceRange, setPriceRange] = useState([0, 10000])
  // const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [showPricePanel, setShowPricePanel] = useState(false)
  // const [showBrandsPanel, setShowBrandsPanel] = useState(false)
  const [showCategoriesPanel, setShowCategoriesPanel] = useState(false)
  const [showRatingPanel, setShowRatingPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // API state
  const [products, setProducts] = useState<any[]>([])
  // const [brands, setBrands] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [productsData, categoriesData] = await Promise.all([
          apiService.products.getAllProducts(),
          apiService.categories.getAllCategories()
        ])
        // Check wishlist status per product (auth vs session)
        try {
          const checks = await Promise.all(productsData.map((p: any) => (
            (isLoggedIn ? apiService.wishlist.check(p.id) : apiService.wishlist.check(p.id))
              .catch(() => ({ in_wishlist: false }))
          )))
          productsData.forEach((p: any, idx: number) => {
            p.__in_wishlist = !!checks[idx]?.in_wishlist
          })
        } catch {
          // ignore wishlist check errors gracefully
        }
        
        setProducts(productsData)
        setCategories(categoriesData.map(cat => cat.name))
        
        // Calculate max price from products and update price range
        if (productsData.length > 0) {
          const calculatedMaxPrice = Math.max(...productsData.map((p: any) => p.effective_price || p.price || 0))
          const roundedMaxPrice = Math.ceil(calculatedMaxPrice / 100) * 100 // Round up to nearest 100
          setMaxPrice(Math.max(roundedMaxPrice, 1000)) // At least 1000
          setPriceRange([0, Math.max(roundedMaxPrice, 1000)]) // Reset to show all products
        }
        
        // Extract unique brands from products
        // const uniqueBrands = [...new Set(productsData.map(p => p.brand?.name).filter(Boolean))]
        // setBrands(uniqueBrands)
      } catch (err) {
        console.error('Failed to load products data:', err)
        setError('Failed to load products. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply category filter from query string on navigation
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const category = params.get('category')
      if (category) {
        setSelectedCategories([category])
      }
    } catch {}
  }, [location.search])

  const filteredProducts = products.filter(product => {
    const matchesPrice = product.effective_price >= priceRange[0] && product.effective_price <= priceRange[1]
    // const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand?.name)
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category?.name)
    const matchesRating = product.average_rating >= minRating
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // product.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesPrice && /* matchesBrand && */ matchesCategory && matchesRating && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.effective_price - b.effective_price
      case 'price-high':
        return b.effective_price - a.effective_price
      case 'rating':
        return b.average_rating - a.average_rating
      case 'newest':
        return 0 // Mock sorting
      default:
        return 0
    }
  })

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    navigate(`/product/${product.id}`)
  }

  const handleAddToCartApi = async (e: any, product: any) => {
    e.stopPropagation()
    try {
      if (isLoggedIn) {
        await apiService.cart.addAuth({ product_id: product.id, quantity: 1 })
      } else {
        await apiService.cart.add({ product_id: product.id, quantity: 1 })
      }
      addToCart(product)
      toast.success('Added to cart')
    } catch (err) {
      toast.error('Failed to add to cart')
    }
  }

  // const toggleBrand = (brand: string) => {
  //   setSelectedBrands(prev =>
  //     prev.includes(brand)
  //       ? prev.filter(b => b !== brand)
  //       : [...prev, brand]
  //   )
  // }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setPriceRange([0, maxPrice]) // Reset to calculated max price to show all products
    // setSelectedBrands([])
    setSelectedCategories([])
    setMinRating(0)
    setSearchQuery('') // Clear search query to show all products
  }

  const handleWishlistClick = async (e: any, productId: number | string) => {
    e.stopPropagation()
    
    // Find the product to check its current wishlist status
    const product = products.find(p => p.id === productId)
    const isInWishlist = product?.__in_wishlist || wishlistItems.includes(String(productId))
    
    try {
      if (isInWishlist) {
        // Remove from wishlist
        if (isLoggedIn) {
          await apiService.wishlist.removeAuth(productId)
        } else {
          await apiService.wishlist.removeProduct(productId)
        }
        // Update local state
        toggleWishlist(String(productId))
        // Update local product flag
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, __in_wishlist: false } : p))
        toast.success('Removed from wishlist')
      } else {
        // Add to wishlist
        const resp = isLoggedIn
          ? await apiService.wishlist.addAuth(productId)
          : await apiService.wishlist.add(productId)
        console.log('Wishlist add success:', { productId, resp })
        toggleWishlist(String(productId))
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, __in_wishlist: true } : p))
        toast.success('Added to wishlist')
      }
    } catch (err: any) {
      console.error('Wishlist toggle failed', { productId, err })
      // Handle specific error messages
      if (err?.message?.includes('already in your wishlist') || err?.body?.includes('already in your wishlist')) {
        // If it's already in wishlist, try to remove it
        try {
          if (isLoggedIn) {
            await apiService.wishlist.removeAuth(productId)
          } else {
            await apiService.wishlist.removeProduct(productId)
          }
          toggleWishlist(String(productId))
          setProducts(prev => prev.map(p => p.id === productId ? { ...p, __in_wishlist: false } : p))
          toast.success('Removed from wishlist')
        } catch (removeErr) {
          toast.error('Failed to update wishlist')
        }
      } else {
        toast.error(err?.message || 'Failed to update wishlist')
      }
    }
  }

  const FilterSidebar = () => (
    <div className="w-72 space-y-6">
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" >Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <h4 className="font-medium">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={maxPrice}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>AED {priceRange[0]}</span>
            <span>AED {priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-medium">Categories</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label htmlFor={category} className="text-sm">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      {/* <div className="space-y-3">
        <h4 className="font-medium">Brands</h4>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <label htmlFor={brand} className="text-sm">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div> */}

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
              />
              <label htmlFor={`rating-${rating}`} className="flex items-center text-sm">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span className="ml-1">& up</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">All Products</h1>
            <p className="text-gray-600 mt-1">Discover our complete collection of premium technology and electronics</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-black focus:border-black"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{sortedProducts.length} products found</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex items-center border rounded-lg">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        {/* Active filters chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {priceRange[0] !== 0 || priceRange[1] !== maxPrice ? (
            <span className="px-3 py-1 border border-black rounded-full text-sm">{priceRange[0]} - {priceRange[1]}</span>
          ) : null}
          {selectedCategories.map(c => (
            <span key={`cat-${c}`} className="px-3 py-1 border border-black rounded-full text-sm">{c}</span>
          ))}
          {/* {selectedBrands.map(b => (
            <span key={`brand-${b}`} className="px-3 py-1 border border-black rounded-full text-sm">{b}</span>
          ))} */}
          {minRating > 0 ? (
            <span className="px-3 py-1 border border-black rounded-full text-sm">{minRating}★ & up</span>
          ) : null}
          {(priceRange[0] !== 0 || priceRange[1] !== maxPrice || selectedCategories.length || /* selectedBrands.length || */ minRating > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear All</Button>
          )}
        </div>
        {/* Top filters bar (desktop) */}
        <div className="mt-4 hidden lg:block">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowPricePanel(!showPricePanel)} className="px-3 py-2 border border-black rounded-md text-sm inline-flex items-center">
              Price <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {/* <button onClick={() => setShowBrandsPanel(!showBrandsPanel)} className="px-3 py-2 border border-black rounded-md text-sm inline-flex items-center">
              Brands <ChevronDown className="h-4 w-4 ml-2" />
            </button> */}
            <button onClick={() => setShowCategoriesPanel(!showCategoriesPanel)} className="px-3 py-2 border border-black rounded-md text-sm inline-flex items-center">
              Categories <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            <button onClick={() => setShowRatingPanel(!showRatingPanel)} className="px-3 py-2 border border-black rounded-md text-sm inline-flex items-center">
              Rating <ChevronDown className="h-4 w-4 ml-2" />
            </button>
          </div>
          {showPricePanel && (
            <div className="mt-3 border border-black rounded-md p-4 max-w-xl">
              <h4 className="font-medium mb-3">Price Range</h4>
              <Slider value={priceRange} onValueChange={setPriceRange} max={maxPrice} step={50} className="w-full" />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>AED {priceRange[0]}</span>
                <span>AED {priceRange[1]}</span>
              </div>
            </div>
          )}
          {/* {showBrandsPanel && (
            <div className="mt-3 border border-black rounded-md p-4 max-w-md">
              <div className="space-y-2">
                {brands.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox id={`brand-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
                    <label htmlFor={`brand-${brand}`} className="text-sm">{brand}</label>
                  </div>
                ))}
              </div>
            </div>
          )} */}
          {showCategoriesPanel && (
            <div className="mt-3 border border-black rounded-md p-4 max-w-md">
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox id={`cat-${category}`} checked={selectedCategories.includes(category)} onCheckedChange={() => toggleCategory(category)} />
                    <label htmlFor={`cat-${category}`} className="text-sm">{category}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showRatingPanel && (
            <div className="mt-3 border border-black rounded-md p-4 max-w-sm">
              <div className="space-y-2">
                {[4,3,2,1].map(rating => (
                  <button
                    key={`min-${rating}`}
                    className={`w-full text-left px-3 py-2 border rounded-md ${minRating === rating ? 'border-black' : 'border-gray-200'} hover:bg-gray-50`}
                    onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  >
                    <span className="inline-flex items-center">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-2 text-sm">& up</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters - Mobile */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Filters
              </h2>
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                ✕
              </Button>
            </div>
            <FilterSidebar />
            <div className="mt-6 space-y-3">
              <Button 
                className="w-full bg-black text-white"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

      {/* Products */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 animate-pulse rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product, index) => (
                <Card 
                  key={`product-${product.id || index}`} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200 relative"
                >
                  <CardContent className="p-0">
                    <div className="h-80 overflow-hidden rounded-t-lg relative">
                      <ImageWithFallback
                        src={product.primary_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={320}
                        quality={85}
                        lazy={true}
                      />
                      {product.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-black text-white">
                          AED {product.original_price - product.effective_price} OFF
                        </Badge>
                      )}
                      {!product.in_stock && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          Out of Stock
                        </Badge>
                      )}
                      <button
                        onClick={(e) => handleWishlistClick(e, product.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          className={`h-4 w-4 ${product.__in_wishlist || wishlistItems.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <div onClick={() => handleProductClick(product)} className="cursor-pointer flex-grow flex flex-col">
                        {/* <p className="text-sm text-gray-600 mb-1">{product.brand?.name}</p> */}
                        <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-between mb-3 mt-auto">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">AED {product.effective_price}</span>
                            {product.original_price && (
                              <span className="text-gray-500 line-through text-sm">AED {product.original_price}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Add Component - Show on hover */}
                      <div className="mt-4 border-t pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                        <QuickAdd 
                          product={product}
                          onAddToCart={(product, size) => {
                            console.log(`Added ${product.name} in size ${size} to cart`)
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product, index) => (
                <Card 
                  key={`product-list-${product.id || index}`} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200"
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent className="p-6">
                    <div className="flex space-x-6">
                      <div className="w-48 h-48 flex-shrink-0 overflow-hidden rounded-lg relative">
                        <ImageWithFallback
                          src={product.primary_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-black text-white">
                          AED {product.original_price - product.effective_price} OFF
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* <p className="text-sm text-gray-600 mb-1">{product.brand?.name}</p> */}
                            <h3 className="text-xl font-semibold mb-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(product.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">
                                ({product.total_reviews} reviews)
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4">{product.description}</p>
                            <div className="flex items-center space-x-2 mb-4">
                              <span className="font-bold text-2xl">AED {product.effective_price}</span>
                              {product.original_price && (
                                <span className="text-gray-500 line-through text-lg">AED {product.original_price}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-6">
                            <button
                              onClick={(e) => handleWishlistClick(e, product.id)}
                              className="p-2 border rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <svg
                                className={`h-5 w-5 ${product.__in_wishlist || wishlistItems.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <Button 
                              className="bg-black text-white hover:bg-gray-800"
                              disabled={!product.in_stock}
                              onClick={(e:any) => handleAddToCartApi(e, product)}
                            >
                              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
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

          {!loading && sortedProducts.length === 0 && !error && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2" >
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button onClick={clearFilters} className="bg-black text-white">
                Clear Filters
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2" >
                Failed to load products
              </h3>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-black text-white"
              >
                Try Again
              </Button>
            </div>
          )}
      </div>
    </div>
  )
}