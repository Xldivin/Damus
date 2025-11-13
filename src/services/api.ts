// Centralized API service for the e-commerce application
// This service handles all API calls and can be easily updated to change endpoints, headers, or logic

import { API_CONFIG, getApiUrl, getApiHeaders, getGuestSessionId } from './apiConfig'

// Cache implementation for API responses
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = API_CONFIG.cache.ttl): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
}

const apiCache = new ApiCache()

// Request deduplication to prevent multiple identical requests
const pendingRequests = new Map<string, Promise<any>>()

// Performance monitoring
class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  
  record(endpoint: string, duration: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, [])
    }
    const times = this.metrics.get(endpoint)!
    times.push(duration)
    
    // Keep only last 10 measurements
    if (times.length > 10) {
      times.shift()
    }
  }
  
  getAverageTime(endpoint: string): number {
    const times = this.metrics.get(endpoint)
    if (!times || times.length === 0) return 0
    return times.reduce((a, b) => a + b, 0) / times.length
  }
  
  getStats(): Record<string, { avg: number; count: number }> {
    const stats: Record<string, { avg: number; count: number }> = {}
    for (const [endpoint, times] of this.metrics.entries()) {
      stats[endpoint] = {
        avg: times.reduce((a, b) => a + b, 0) / times.length,
        count: times.length
      }
    }
    return stats
  }
}

const performanceMonitor = new PerformanceMonitor()

// API Response interface
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

// Generate cache key for requests
function getCacheKey(endpoint: string, options: RequestInit = {}): string {
  const method = options.method || 'GET'
  const body = options.body ? JSON.stringify(options.body) : ''
  return `${method}:${endpoint}:${body}`
}

// Generic API request function with caching and deduplication
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache: boolean = true
): Promise<T> {
  const cacheKey = getCacheKey(endpoint, options)
  
  // Check cache first for GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    const cached = apiCache.get(cacheKey)
    if (cached) {
      console.log(`Cache hit for ${endpoint}`)
      return cached
    }
  }
  
  // Check for pending identical requests
  if (pendingRequests.has(cacheKey)) {
    console.log(`Deduplicating request for ${endpoint}`)
    return pendingRequests.get(cacheKey)!
  }
  
  const url = getApiUrl(endpoint)
  
  const config: RequestInit = {
    ...options,
    headers: getApiHeaders(options.headers as Record<string, string>),
    credentials: API_CONFIG.credentials,
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      const startTime = performance.now()
      const response = await fetch(url, config)
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Record performance metrics
      performanceMonitor.record(endpoint, duration)
      
      console.log(`API call to ${endpoint} took ${duration.toFixed(2)}ms`)
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow API call detected: ${endpoint} took ${duration.toFixed(2)}ms`)
      }
      
      if (!response.ok) {
        let errorBody: string | undefined
        try {
          errorBody = await response.text()
        } catch {}
        console.error('API non-OK response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        })
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      const apiResponse: ApiResponse<T> = await response.json()
      
      if (!apiResponse.success) {
        console.error('API success=false payload:', { url, payload: apiResponse })
        throw new Error(`API error: ${apiResponse.message}`)
      }
      
      // Cache successful GET requests with appropriate TTL
      if (useCache && (!options.method || options.method === 'GET')) {
        let ttl = API_CONFIG.cache.ttl
        
        // Set different TTL based on endpoint type
        if (endpoint.includes('/api/products')) {
          ttl = API_CONFIG.cache.productTtl
        } else if (endpoint.includes('/api/categories')) {
          ttl = API_CONFIG.cache.categoryTtl
        } else if (endpoint.includes('/api/customer/orders')) {
          ttl = 60000 // 1 minute for orders (more dynamic)
        }
        
        apiCache.set(cacheKey, apiResponse.data, ttl)
      }
      
      return apiResponse.data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey)
    }
  })()
  
  // Store the promise to prevent duplicate requests
  pendingRequests.set(cacheKey, requestPromise)
  
  return requestPromise
}

// Product API functions with optimized caching
export const productApi = {
  // Get all products with long cache TTL
  async getAllProducts(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.endpoints.products, {}, true)
  },
  pages: {
    async get(slug: string): Promise<{ success: boolean; data: any }> {
      return apiRequest<{ success: boolean; data: any }>(API_CONFIG.endpoints.pageShow(slug), {}, false)
    },
    async upsert(slug: string, payload: { title: string; content?: string; sections?: any[] }): Promise<{ success: boolean; message: string; data: any }> {
      return apiRequest<{ success: boolean; message: string; data: any }>(API_CONFIG.endpoints.pageUpsert(slug), {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      }, false)
    },
  },

  // Get product by ID with medium cache TTL
  async getProductById(id: string): Promise<any> {
    const response = await apiRequest<any>(`${API_CONFIG.endpoints.products}/${id}`, {}, true)
    return response.product || response
  },

  // Get product by slug with medium cache TTL
  async getProductBySlug(slug: string): Promise<any> {
    return apiRequest<any>(`${API_CONFIG.endpoints.products}/${slug}`, {}, true)
  },

  // Get products by category with medium cache TTL
  async getProductsByCategory(category: string): Promise<any[]> {
    return apiRequest<any[]>(`${API_CONFIG.endpoints.products}?category=${encodeURIComponent(category)}`, {}, true)
  },

  // Search products with short cache TTL for dynamic results
  async searchProducts(query: string): Promise<any[]> {
    if (!query.trim()) return []
    return apiRequest<any[]>(`${API_CONFIG.endpoints.products}?search=${encodeURIComponent(query)}`, {}, true)
  },

  // Get best sellers with optimized approach
  async getBestSellers(limit: number = 4): Promise<any[]> {
    try {
      // Try to get from dedicated endpoint first
      return await apiRequest<any[]>(`${API_CONFIG.endpoints.products}?featured=true&limit=${limit}`, {}, true)
    } catch {
      // Fallback to filtering all products
      const products = await this.getAllProducts()
      return products
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, limit)
    }
  },

  // Get related products for a specific product
  async getRelatedProducts(productId: string): Promise<any[]> {
    try {
      const response = await apiRequest<any>(`${API_CONFIG.endpoints.products}/${productId}/related`, {}, true)
      return response.related_products || []
    } catch {
      // Fallback to filtering by category
      const product = await this.getProductById(productId)
      if (product?.category) {
        const categoryProducts = await this.getProductsByCategory(product.category)
        return categoryProducts.filter(p => p.id !== productId).slice(0, 4)
      }
      return []
    }
  },

  // Clear product cache when needed
  clearCache(): void {
    apiCache.delete('GET:/api/products')
    // Clear all product-related cache entries
    for (const key of apiCache['cache'].keys()) {
      if (key.includes('/api/products')) {
        apiCache.delete(key)
      }
    }
  },
}

// Export performance monitoring utilities
export const apiUtils = {
  getPerformanceStats: () => performanceMonitor.getStats(),
  clearCache: () => apiCache.clear(),
  clearProductCache: () => productApi.clearCache(),
  
  // Debug function to log current cache state
  getCacheInfo: () => {
    const cache = apiCache['cache']
    const info: Record<string, any> = {}
    for (const [key, value] of cache.entries()) {
      info[key] = {
        age: Date.now() - value.timestamp,
        ttl: value.ttl,
        expired: Date.now() - value.timestamp > value.ttl
      }
    }
    return info
  }
}

// Category API functions
export const categoryApi = {
  // Get all categories
  async getAllCategories(): Promise<any[]> {
    return apiRequest<any[]>(API_CONFIG.endpoints.categories)
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<any> {
    return apiRequest<any>(`${API_CONFIG.endpoints.categories}/${id}`)
  },

  // Get featured categories (assuming this endpoint exists or we filter from all categories)
  async getFeaturedCategories(limit: number = 4): Promise<any[]> {
    const categories = await this.getAllCategories()
    // Return first few categories or filter by featured flag if it exists
    return categories.slice(0, limit)
  },
}

// Combined API service
export const apiService = {
  products: productApi,
  categories: categoryApi,
  chat: {
    async send(payload: { sessionId: string; text: string; metadata?: Record<string, any> }): Promise<{ success: boolean; id?: string | number }> {
      return apiRequest<{ success: boolean; id?: string | number }>(API_CONFIG.endpoints.chatSend, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      }, false)
    },
    async fetchThread(sessionId: string): Promise<{ messages: Array<{ id: string; text: string; sender: 'user' | 'support'; timestamp?: string }> }> {
      const url = getApiUrl(API_CONFIG.endpoints.chatThread(sessionId))
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to fetch thread: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      // Backend returns { messages: [...] } directly, not wrapped in { success, data }
      if (json.messages) {
        return { messages: json.messages }
      }
      // Fallback if wrapped in success/data structure
      if (json.success && json.data?.messages) {
        return { messages: json.data.messages }
      }
      return { messages: [] }
    },
    async adminThreads(): Promise<{ threads: Array<{ sessionId: string; lastMessage?: any; unreadCount: number }> }> {
      const url = getApiUrl(API_CONFIG.endpoints.adminChatThreads)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to fetch chat threads: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      // Backend returns { threads: [...] } directly, not wrapped in { success, data }
      if (json.threads) {
        return { threads: json.threads }
      }
      // Fallback if wrapped in success/data structure
      if (json.success && json.data?.threads) {
        return { threads: json.data.threads }
      }
      return { threads: [] }
    },
    async adminReply(payload: { sessionId: string; text: string }): Promise<{ success: boolean; id?: string | number }> {
      const url = getApiUrl(API_CONFIG.endpoints.adminChatReply)
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to send reply: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      // Backend returns { success: true, id: ... } directly
      if (json.success) {
        return { success: true, id: json.id }
      }
      // Fallback if wrapped in data structure
      if (json.data?.success) {
        return { success: true, id: json.data.id }
      }
      throw new Error('Unexpected response format from reply endpoint')
    },
  },
  profile: {
    async getCurrentUser(): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.me, {
        method: 'GET',
        headers: getApiHeaders(),
      })
    },
    async updateProfile(params: { name: string; email: string; phone?: string | null }): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.profile, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({
          name: params.name,
          email: params.email,
          phone: params.phone ?? null,
        }),
      })
    },
  },
  account: {
    async exportData(): Promise<Blob> {
      const url = getApiUrl(API_CONFIG.endpoints.accountExport)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Account export failed: ${response.status} ${response.statusText} ${text ?? ''}`)
      }
      return response.blob()
    },
    async deleteAccount(): Promise<{ message: string }> {
      return apiRequest<{ message: string }>(API_CONFIG.endpoints.accountDelete, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
    },
  },
  auth: {
    async register(params: { name: string; email: string; password: string; password_confirmation: string }): Promise<{ user: any; token: string; token_type: string }> {
      const resp = await apiRequest<{ user: any; token: string; token_type: string }>(API_CONFIG.endpoints.register, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      })
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', resp.token)
        }
      } catch {}
      return resp
    },
    async login(params: { email: string; password: string }): Promise<{ user: any; token: string; token_type: string }> {
      const resp = await apiRequest<{ user: any; token: string; token_type: string }>(API_CONFIG.endpoints.login, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(params),
      })
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('authToken', resp.token)
        }
      } catch {}
      return resp
    },
    async logout(): Promise<{ message: string }> {
      const resp = await apiRequest<{ message: string }>(API_CONFIG.endpoints.logout, {
        method: 'POST',
        headers: getApiHeaders(),
      })
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          sessionStorage.removeItem('authToken')
          sessionStorage.removeItem('authUser')
        }
      } catch {}
      return resp
    },
  },
  cart: {
    async add(params: { product_id: number | string; quantity: number; size?: string; product_options?: Record<string, any> }): Promise<{ message: string }> {
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      
      // Include size in product_options if provided
      const requestParams = {
        ...params,
        product_options: {
          ...params.product_options,
          ...(params.size && { size: params.size })
        }
      }
      
      return apiRequest<{ message: string }>(API_CONFIG.endpoints.cartAdd, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestParams),
      })
    },
    async addAuth(params: { product_id: number | string; quantity: number; size?: string; product_options?: Record<string, any> }): Promise<{ message: string }> {
      // Include size in product_options if provided
      const requestParams = {
        ...params,
        product_options: {
          ...params.product_options,
          ...(params.size && { size: params.size })
        }
      }
      
      return apiRequest<{ message: string }>(API_CONFIG.endpoints.authCartAdd, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(requestParams),
      })
    },
    async getAll(): Promise<{ items: any[]; item_count: number; total: number }> {
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      return apiRequest<{ items: any[]; item_count: number; total: number }>(API_CONFIG.endpoints.cart, { headers }, false)
    },
    async getAllAuth(userId?: string | number): Promise<{ items: any[]; item_count: number; total: number }> {
      const endpoint = userId ? `${API_CONFIG.endpoints.authCart}?user_id=${userId}` : API_CONFIG.endpoints.authCart
      return apiRequest<{ items: any[]; item_count: number; total: number }>(endpoint, {}, false)
    },
    async clear(): Promise<{ message?: string }> {
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      return apiRequest<{ message?: string }>(API_CONFIG.endpoints.cartClear, {
        method: 'DELETE',
        headers,
      })
    },
    async clearAuth(userId?: string | number): Promise<{ message?: string }> {
      const endpoint = userId ? `${API_CONFIG.endpoints.authCartClear}?user_id=${userId}` : API_CONFIG.endpoints.authCartClear
      return apiRequest<{ message?: string }>(endpoint, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
    },
    async remove(itemId: string | number): Promise<{ message?: string }> {
      const endpoint = API_CONFIG.endpoints.cartRemove(itemId)
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      return apiRequest<{ message?: string }>(endpoint, {
        method: 'DELETE',
        headers,
      })
    },
    async removeAuth(itemId: string | number, userId?: string | number): Promise<{ message?: string }> {
      const endpoint = userId ? `${API_CONFIG.endpoints.authCartRemove(itemId)}?user_id=${userId}` : API_CONFIG.endpoints.authCartRemove(itemId)
      return apiRequest<{ message?: string }>(endpoint, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
    },
  },
  orders: {
    async getAuthAll(): Promise<{ data: any[]; meta?: { total: number; per_page: number; current_page: number; last_page: number } }> {
      const url = getApiUrl(API_CONFIG.endpoints.authOrders)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Orders fetch failed: ${response.status} ${response.statusText} ${text ?? ''}`)
      }
      const json = await response.json()
      // Expected shape (from backend): { success, message, data: { data: [...], meta: {...} } }
      if (json?.data?.data) {
        return { data: json.data.data, meta: json.data.meta }
      }
      // Fallback: if API already returns array at top-level data
      if (Array.isArray(json?.data)) {
        return { data: json.data }
      }
      // Fallback: if the entire payload is the array (non-standard)
      if (Array.isArray(json)) {
        return { data: json }
      }
      return { data: [] }
    },
    async getAuthRecent(): Promise<any[]> {
      const url = getApiUrl(API_CONFIG.endpoints.authOrdersRecent)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Recent orders fetch failed: ${response.status} ${response.statusText} ${text ?? ''}`)
      }
      const json = await response.json()
      // Recent endpoint returns a raw array per provided example
      if (Array.isArray(json)) return json
      // Fallbacks in case backend wraps it later
      if (Array.isArray(json?.data)) return json.data
      if (Array.isArray(json?.data?.data)) return json.data.data
      return []
    },
    async createAuthOrder(payload: {
      customer_name: string
      customer_email: string
      shipping_address: string
      subtotal: number
      tax_amount: number
      shipping_amount: number
      total_amount: number
      currency: string
      payment_method: string
      items: Array<{ product_id: number | string; product_name: string; unit_price: number; quantity: number; total_price: number }>
      points_redeemed?: number
    }): Promise<{ id?: string | number; message?: string }> {
      return apiRequest<{ id?: string | number; message?: string }>(API_CONFIG.endpoints.authOrders, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      })
    },
    async createGuestCheckout(payload: {
      customer_name: string
      customer_email: string
      shipping_address: string
      subtotal: number
      tax_amount: number
      shipping_amount: number
      total_amount: number
      currency: string
      payment_method: string
      items: Array<{ product_id: number | string; product_name: string; unit_price: number; quantity: number; total_price: number }>
    }): Promise<{ id?: string | number; message?: string }> {
      // Important: do NOT include Authorization header for guest checkout
      const url = API_CONFIG.endpoints.guestCheckout
      const response = await fetch(getApiUrl(url), {
        method: 'POST',
        headers: { ...API_CONFIG.headers },
        credentials: API_CONFIG.credentials,
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Guest checkout failed: ${response.status} ${response.statusText} ${text ?? ''}`)
      }
      const json = await response.json()
      return json?.data ?? json
    },
    async downloadInvoice(orderId: string | number): Promise<Blob> {
      const url = getApiUrl(`/api/customer/orders/${orderId}/invoice`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Invoice download failed: ${response.status} ${response.statusText} ${text ?? ''}`)
      }
      return await response.blob()
    },
  },
  wishlist: {
    async add(productId: number | string): Promise<{ message: string }> {
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      
      return apiRequest<{ message: string }>(API_CONFIG.endpoints.wishlistAdd, {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId }),
      })
    },
    async addAuth(productId: number | string): Promise<{ message: string }> {
      return apiRequest<{ message: string }>(API_CONFIG.endpoints.authWishlistAdd, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ product_id: productId }),
      })
    },
    async getAll(): Promise<{ items: any[]; item_count: number }> {
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      
      return apiRequest<{ items: any[]; item_count: number }>(API_CONFIG.endpoints.wishlist, { headers }, false)
    },
    async getAllAuth(): Promise<{ items: any[]; item_count: number }> {
      return apiRequest<{ items: any[]; item_count: number }>(API_CONFIG.endpoints.authWishlist, {}, false)
    },
    async clear(): Promise<{ message: string }> {
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      
      return apiRequest<{ message: string }>(API_CONFIG.endpoints.wishlistClear, {
        method: 'DELETE',
        headers,
      })
    },
    async clearAuth(): Promise<{ message: string }> {
      return apiRequest<{ message: string }>(API_CONFIG.endpoints.authWishlistClear, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
    },
    async removeProduct(productId: number | string): Promise<{ message: string }> {
      const endpoint = API_CONFIG.endpoints.wishlistRemoveProduct(productId)
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      
      return apiRequest<{ message: string }>(endpoint, {
        method: 'DELETE',
        headers,
      })
    },
    async removeAuth(id: number | string): Promise<{ message: string }> {
      const endpoint = API_CONFIG.endpoints.authWishlistRemove(id)
      return apiRequest<{ message: string }>(endpoint, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
    },
    async count(): Promise<{ count: number }> {
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      
      return apiRequest<{ count: number }>(API_CONFIG.endpoints.wishlistCount, { headers }, false)
    },
    async countAuth(): Promise<{ count: number }> {
      return apiRequest<{ count: number }>(API_CONFIG.endpoints.authWishlistCount, {}, false)
    },
    async check(productId: number | string): Promise<{ in_wishlist: boolean }> {
      const endpoint = API_CONFIG.endpoints.wishlistCheck(productId)
      const baseHeaders = getApiHeaders()
      const hasToken = !!(typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')))
      const headers = hasToken ? baseHeaders : { ...baseHeaders, 'X-Session-Id': getGuestSessionId() }
      
      const resp = await apiRequest<{ is_in_wishlist: boolean; product_id: string | number }>(endpoint, { headers })
      return { in_wishlist: !!resp.is_in_wishlist }
    },
  },

  reviews: {
    async list(productId: string | number): Promise<{ items: any[]; average_rating: number; total_reviews: number }> {
      return apiRequest<{ items: any[]; average_rating: number; total_reviews: number }>(`${API_CONFIG.endpoints.products}/${productId}/reviews`, {}, false)
    },
    async create(productId: string | number, payload: { rating: number; title?: string; content: string }): Promise<any> {
      return apiRequest<any>(`${API_CONFIG.endpoints.products}/${productId}/reviews`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      }, false)
    },
  },

  rewards: {
    async balance(): Promise<{ points: number; value_aed: number }> {
      const url = '/api/rewards/balance'
      const res = await apiRequest<any>(url, { headers: getApiHeaders() }, false)
      // backend returns { success, data: { points, value_aed } }
      return (res?.data ?? res) as any
    },
    async transactions(): Promise<any[]> {
      const url = '/api/rewards/transactions'
      const res = await apiRequest<any>(url, { headers: getApiHeaders() }, false)
      return (res?.data ?? res) as any
    },
  },

  newsletter: {
    async subscribe(email: string): Promise<{ success: boolean; message: string }> {
      return apiRequest<{ success: boolean; message: string }>(API_CONFIG.endpoints.newsletterSubscribe, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false)
    },
  },

  contact: {
    async send(data: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> {
      return apiRequest<{ success: boolean; message: string }>(API_CONFIG.endpoints.contactSend, {
        method: 'POST',
        body: JSON.stringify(data),
      }, false)
    },
  },
  shippingInfo: {
    async get(): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.shippingInfo, {}, false)
    },
    async update(data: any): Promise<{ success: boolean; message: string; data: any }> {
      return apiRequest<{ success: boolean; message: string; data: any }>(API_CONFIG.endpoints.shippingInfo, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      }, false)
    },
  },
  returnsInfo: {
    async get(): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.returnsInfo, {}, false)
    },
    async update(data: any): Promise<{ success: boolean; message: string; data: any }> {
      return apiRequest<{ success: boolean; message: string; data: any }>(API_CONFIG.endpoints.returnsInfo, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      }, false)
    },
  },
  privacyInfo: {
    async get(): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.privacyInfo, {}, false)
    },
    async update(data: any): Promise<{ success: boolean; message: string; data: any }> {
      return apiRequest<{ success: boolean; message: string; data: any }>(API_CONFIG.endpoints.privacyInfo, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      }, false)
    },
  },
  termsInfo: {
    async get(): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.termsInfo, {}, false)
    },
    async update(data: any): Promise<{ success: boolean; message: string; data: any }> {
      return apiRequest<{ success: boolean; message: string; data: any }>(API_CONFIG.endpoints.termsInfo, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      }, false)
    },
  },
  adminDashboard: {
    async getOverview(): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.adminDashboardOverview, {
        headers: getApiHeaders(),
      }, false)
    },
    async getAnalytics(params?: { months?: number }): Promise<any> {
      const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : ''
      return apiRequest<any>(API_CONFIG.endpoints.adminDashboardAnalytics + queryParams, {
        headers: getApiHeaders(),
      }, false)
    },
  },
  adminProducts: {
    async getAll(params?: { include_inactive?: boolean; category_id?: number; search?: string; per_page?: number }): Promise<{ data: any[]; pagination?: any }> {
      const queryParams = new URLSearchParams()
      if (params?.include_inactive) queryParams.append('include_inactive', 'true')
      if (params?.category_id) queryParams.append('category_id', params.category_id.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      
      const url = `${API_CONFIG.endpoints.products}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const url_full = getApiUrl(url)
      
      const response = await fetch(url_full, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const json = await response.json()
      
      // Handle API response structure: { success: true, data: [...], pagination: {...} }
      if (json.success && json.data) {
        return { 
          data: Array.isArray(json.data) ? json.data : [], 
          pagination: json.pagination 
        }
      }
      
      // Fallback for different response structures
      if (Array.isArray(json)) {
        return { data: json }
      }
      
      return { data: json.data || [] }
    },
    async create(productData: {
      name: string
      description: string
      short_description?: string
      price: number
      original_price?: number
      cost_price?: number
      category_id: number
      subcategory_id?: number
      brand_id?: number
      sku?: string
      stock_quantity: number
      min_stock_level?: number
      weight?: number
      dimensions?: string
      specifications?: any
      features?: any[]
      tags?: any[]
      meta_title?: string
      meta_description?: string
      is_active?: boolean
      is_featured?: boolean
      is_digital?: boolean
      images?: Array<{ url: string; alt_text?: string; is_primary?: boolean }>
    }): Promise<any> {
      return apiRequest<any>(API_CONFIG.endpoints.products, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(productData),
      }, false)
    },
    async update(id: number | string, productData: {
      name: string
      description: string
      short_description?: string
      price: number
      original_price?: number
      cost_price?: number
      category_id: number
      subcategory_id?: number
      brand_id?: number
      sku?: string
      stock_quantity: number
      min_stock_level?: number
      weight?: number
      dimensions?: string
      meta_title?: string
      meta_description?: string
      is_active?: boolean
      is_featured?: boolean
      is_digital?: boolean
    }): Promise<any> {
      return apiRequest<any>(`${API_CONFIG.endpoints.products}/${id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(productData),
      }, false)
    },
    async getFilterOptions(): Promise<{ brands: any[]; categories: any[] }> {
      const url = getApiUrl(`${API_CONFIG.endpoints.products}/filter-options`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filter options: ${response.status}`)
      }
      
      const json = await response.json()
      
      // Handle API response structure: { success: true, data: { brands: [...], categories: [...] } }
      if (json.success && json.data) {
        return json.data
      }
      
      // Fallback
      return json.data || json
    },
    async delete(id: number | string): Promise<any> {
      return apiRequest<any>(`${API_CONFIG.endpoints.products}/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      }, false)
    },
  },
  adminCategories: {
    async create(categoryData: { name: string; description?: string; is_active?: boolean }): Promise<any> {
      const url = getApiUrl(API_CONFIG.endpoints.categories)
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
        body: JSON.stringify(categoryData),
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to create category: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      // Handle API response structure: { success: true, data: {...} }
      if (json.success && json.data) {
        return json.data
      }
      return json
    },
  },
  adminBrands: {
    async create(brandData: { name: string; description?: string; is_active?: boolean }): Promise<any> {
      const url = getApiUrl('/api/brands')
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
        body: JSON.stringify(brandData),
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to create brand: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      // Handle API response structure: { success: true, data: {...} }
      if (json.success && json.data) {
        return json.data
      }
      return json
    },
  },
  adminMedia: {
    async upload(file: File, folder?: string, usageType: string = 'product_image'): Promise<any> {
      const formData = new FormData()
      formData.append('file', file)
      if (folder) formData.append('folder', folder)
      formData.append('usage_type', usageType)
      
      const url = getApiUrl('/api/media/upload')
      const headers = getApiHeaders()
      // Remove Content-Type header to let browser set it with boundary for FormData
      delete headers['Content-Type']
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: API_CONFIG.credentials,
        body: formData,
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to upload image: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      if (json.success && json.data) {
        return json.data
      }
      return json
    },
  },
  adminOrders: {
    async getAll(params?: { status?: string; search?: string; per_page?: number }): Promise<{ data: any[]; pagination?: any }> {
      const queryParams = new URLSearchParams()
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      
      const url = getApiUrl(`/api/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to fetch orders: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      if (json.success && json.data) {
        return { data: json.data, pagination: json.pagination }
      }
      return { data: [] }
    },
    async getById(id: number | string): Promise<any> {
      const url = getApiUrl(`/api/admin/orders/${id}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to fetch order: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      if (json.success && json.data) {
        return json.data
      }
      return json
    },
    async updateStatus(id: number | string, status: string): Promise<any> {
      return apiRequest<any>(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify({ status }),
      }, false)
    },
    async delete(id: number | string): Promise<any> {
      return apiRequest<any>(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      }, false)
    },
  },
  adminUsers: {
    async getAll(params?: { status?: string; search?: string; per_page?: number }): Promise<{ data: any[]; pagination?: any }> {
      const queryParams = new URLSearchParams()
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
      
      const url = getApiUrl(`/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to fetch users: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      if (json.success && json.data) {
        return { data: json.data, pagination: json.pagination }
      }
      return { data: [] }
    },
    async getById(id: number | string): Promise<any> {
      const url = getApiUrl(`/api/admin/users/${id}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: API_CONFIG.credentials,
      })
      
      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(`Failed to fetch user: ${response.status} ${text ?? ''}`)
      }
      
      const json = await response.json()
      if (json.success && json.data) {
        return json.data
      }
      return json
    },
    async update(id: number | string, userData: { name?: string; email?: string; phone?: string; status?: string }): Promise<any> {
      return apiRequest<any>(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(userData),
      }, false)
    },
    async delete(id: number | string): Promise<any> {
      return apiRequest<any>(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      }, false)
    },
  },
  
  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await apiRequest(API_CONFIG.endpoints.health)
      return true
    } catch {
      return false
    }
  },
}

// Export default for easy importing
export default apiService


