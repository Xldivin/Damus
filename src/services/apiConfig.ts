// API Configuration - Centralized configuration for easy updates
// Update these values to change API endpoints, headers, or other settings

export const API_CONFIG = {
  // Base URL for all API calls
  baseURL: 'http://localhost:8000',
  
  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add authentication headers here if needed
    // 'Authorization': 'Bearer your-token-here',
  },
  
  // Request timeout in milliseconds
  timeout: 5000,
  
  // Whether to send cookies with cross-site requests (needed for session-based wishlists)
  credentials: 'include' as RequestCredentials,
  
  // API endpoints
  endpoints: {
    products: '/api/products',
    categories: '/api/categories',
    register: '/api/register',
    login: '/api/login',
    logout: '/api/logout',
    cartAdd: '/api/cart/add',
    authCartAdd: '/api/auth/cart/add',
    cart: '/api/cart',
    authCart: '/api/auth/cart',
    cartClear: '/api/cart/clear',
    authCartClear: '/api/auth/cart/clear',
    cartRemove: (id: string | number) => `/api/cart/remove/${id}`,
    wishlist: '/api/wishlist',
    wishlistAdd: '/api/wishlist/add',
    wishlistClear: '/api/wishlist/clear',
    wishlistRemoveProduct: (productId: string | number) => `/api/wishlist/remove-product/${productId}`,
    wishlistCount: '/api/wishlist/count',
    wishlistCheck: (productId: string | number) => `/api/wishlist/check/${productId}`,
    // Auth (bearer) wishlist endpoints
    authWishlist: '/api/auth/wishlist',
    authWishlistAdd: '/api/auth/wishlist/add',
    authWishlistClear: '/api/auth/wishlist/clear',
    authWishlistRemove: (productId: string | number) => `/api/auth/wishlist/remove-product/${productId}`,
    authWishlistCount: '/api/auth/wishlist/count',
    // Orders
    authOrders: '/api/customer/orders',
    authOrdersRecent: '/api/customer/orders/recent',
    guestCheckout: '/api/checkout',
    health: '/api/health',
    // Profile
    me: '/api/me',
    profile: '/api/profile',
    // Account actions
    accountExport: '/api/account/export',
    accountDelete: '/api/account',
  },
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000, // milliseconds
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes in milliseconds
    productTtl: 600000, // 10 minutes for products
    categoryTtl: 1800000, // 30 minutes for categories
  },
}

// Helper function to get full URL for an endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`
}

// Helper function to get headers with optional overrides
export const getApiHeaders = (overrides: Record<string, string> = {}): Record<string, string> => {
  let auth: Record<string, string> = {}
  try {
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    }
    if (token) auth = { Authorization: `Bearer ${token}` }
  } catch {}
  return {
    ...API_CONFIG.headers,
    ...auth,
    ...overrides,
  }
}

// Provide a stable guest session id for unauthenticated users
export const getGuestSessionId = (): string => {
  try {
    if (typeof window === 'undefined') return 'guest'
    let id = localStorage.getItem('guestSessionId')
    if (!id) {
      // Generate a reasonably unique id for the browser session
      if ((window as any).crypto?.randomUUID) {
        id = (window as any).crypto.randomUUID()
      } else {
        id = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`
      }
      localStorage.setItem('guestSessionId', id)
    }
    return id
  } catch {
    return 'guest'
  }
}

