import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, X, Star, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { mockProducts } from '../../App'

export function SearchPage() {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery, setSelectedProduct, addToCart, toggleWishlist, wishlistItems, isLoggedIn } = useAppContext()
  
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery)
  const [searchHistory, setSearchHistory] = useState<string[]>(['iPhone', 'MacBook', 'Headphones'])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [selectedFilters, setSelectedFilters] = useState({
    category: [] as string[],
    brand: [] as string[],
    priceRange: '' as string,
    rating: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['Laptops', 'Audio', 'Phones', 'Wearables', 'Cameras', 'Gaming']
  const brands = ['Apple', 'Sony', 'Canon', 'Samsung', 'Dell', 'HP']
  const priceRanges = [
    { label: 'Under $500', value: '0-500' },
    { label: '$500 - $1000', value: '500-1000' },
    { label: '$1000 - $2000', value: '1000-2000' },
    { label: 'Over $2000', value: '2000+' }
  ]

  // Filter products based on search query and filters
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedFilters.category.length === 0 || 
      selectedFilters.category.includes(product.category)

    const matchesBrand = selectedFilters.brand.length === 0 || 
      selectedFilters.brand.includes(product.brand)

    const matchesRating = product.rating >= selectedFilters.rating

    let matchesPrice = true
    if (selectedFilters.priceRange) {
      const [min, max] = selectedFilters.priceRange.split('-').map(Number)
      if (selectedFilters.priceRange.includes('+')) {
        matchesPrice = product.price >= min
      } else {
        matchesPrice = product.price >= min && product.price <= max
      }
    }

    return matchesSearch && matchesCategory && matchesBrand && matchesRating && matchesPrice
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)])
    }
  }

  const handleInputChange = (value: string) => {
    setCurrentSearchQuery(value)
    
    // Generate search suggestions
    if (value.length > 0) {
      const suggestions = mockProducts
        .filter(product => 
          product.name.toLowerCase().includes(value.toLowerCase()) ||
          product.brand.toLowerCase().includes(value.toLowerCase())
        )
        .map(product => product.name)
        .slice(0, 5)
      setSearchSuggestions(suggestions)
    } else {
      setSearchSuggestions([])
    }
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    navigate(`/product/${product.id}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCurrentSearchQuery('')
    setSearchSuggestions([])
  }

  const removeFromHistory = (term: string) => {
    setSearchHistory(prev => prev.filter(item => item !== term))
  }

  const toggleFilter = (type: 'category' | 'brand', value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      category: [],
      brand: [],
      priceRange: '',
      rating: 0
    })
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text
    
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : 
        part
    )
  }

  useEffect(() => {
    setCurrentSearchQuery(searchQuery)
  }, [searchQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">
          Search Products
        </h1>
        
        {/* Advanced Search Form */}
        <div className="relative max-w-2xl">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products, brands, or categories..."
              value={currentSearchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(currentSearchQuery)
                  setSearchSuggestions([])
                }
              }}
              className="pl-4 pr-20 py-3 text-lg border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {currentSearchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
              <button 
                onClick={() => {
                  handleSearch(currentSearchQuery)
                  setSearchSuggestions([])
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSearchQuery(suggestion)
                    handleSearch(suggestion)
                    setSearchSuggestions([])
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-400 mr-3" />
                    {suggestion}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search History */}
        {isLoggedIn && searchHistory.length > 0 && !searchQuery && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <Clock className="h-3 w-3 text-gray-400 mr-2" />
                  <button
                    onClick={() => {
                      setCurrentSearchQuery(term)
                      handleSearch(term)
                    }}
                    className="text-sm text-gray-700 hover:text-black"
                  >
                    {term}
                  </button>
                  <button
                    onClick={() => removeFromHistory(term)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {searchQuery && (
        <>
          {/* Search Results Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl font-semibold mb-2" >
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-black text-black hover:bg-black hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-72 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" >Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-medium">Categories</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedFilters.category.includes(category)}
                        onCheckedChange={() => toggleFilter('category', category)}
                      />
                      <label htmlFor={category} className="text-sm">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3">
                <h4 className="font-medium">Brands</h4>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={selectedFilters.brand.includes(brand)}
                        onCheckedChange={() => toggleFilter('brand', brand)}
                      />
                      <label htmlFor={brand} className="text-sm">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <div key={range.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={range.value}
                        checked={selectedFilters.priceRange === range.value}
                        onCheckedChange={() => 
                          setSelectedFilters(prev => ({
                            ...prev,
                            priceRange: prev.priceRange === range.value ? '' : range.value
                          }))
                        }
                      />
                      <label htmlFor={range.value} className="text-sm">
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <h4 className="font-medium">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={selectedFilters.rating === rating}
                        onCheckedChange={() => 
                          setSelectedFilters(prev => ({
                            ...prev,
                            rating: prev.rating === rating ? 0 : rating
                          }))
                        }
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

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold" >
                    Filters
                  </h2>
                  <Button variant="ghost" onClick={() => setShowFilters(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                {/* Same filter content as desktop */}
                <div className="space-y-6">
                  {/* Categories, Brands, Price Range, Rating - same as desktop */}
                </div>
                <div className="mt-6">
                  <Button 
                    className="w-full bg-black text-white"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200"
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden rounded-t-lg relative">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.originalPrice && (
                            <Badge className="absolute top-2 left-2 bg-black text-white">
                              ${product.originalPrice - product.price} OFF
                            </Badge>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleWishlist(product.id)
                            }}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                          >
                            <svg
                              className={`h-4 w-4 ${wishlistItems.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-4" onClick={() => handleProductClick(product)}>
                          <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                          <h3 className="font-semibold mb-2" >
                            {highlightSearchTerm(product.name, searchQuery)}
                          </h3>
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">
                              ({product.reviews})
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-lg">${product.price}</span>
                              {product.originalPrice && (
                                <span className="text-gray-500 line-through text-sm">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-black text-white hover:bg-gray-800"
                            disabled={!product.inStock}
                            onClick={(e: { stopPropagation: () => void }) => {
                              e.stopPropagation()
                              if (product.inStock) {
                                addToCart(product)
                              }
                            }}
                          >
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2" >
                      No results found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try different keywords or adjust your filters
                    </p>
                  </div>
                  
                  {/* Search suggestions */}
                  <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-600 mb-3">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['iPhone', 'MacBook', 'Headphones', 'Camera', 'Gaming'].map(term => (
                        <button
                          key={term}
                          onClick={() => {
                            setCurrentSearchQuery(term)
                            handleSearch(term)
                          }}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!searchQuery && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4" >
            Search for Products
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Find exactly what you're looking for from our extensive collection of technology and electronics.
          </p>
          
          {/* Popular searches */}
          <div className="max-w-md mx-auto">
            <p className="text-sm font-medium mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['iPhone', 'MacBook', 'Headphones', 'Camera', 'Gaming', 'Smartwatch'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    setCurrentSearchQuery(term)
                    handleSearch(term)
                  }}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}