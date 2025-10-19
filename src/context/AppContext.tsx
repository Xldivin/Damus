import { createContext, useContext } from 'react'

// Context for global state management
export interface AppContextType {
  cartItems: CartItem[]
  addToCart: (product: any, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  replaceCartFromServer?: (items: CartItem[]) => void
  wishlistItems: string[]
  toggleWishlist: (productId: string) => void
  isLoggedIn: boolean
  setIsLoggedIn: (status: boolean) => void
  user: any
  setUser: (user: any) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedProduct: any
  setSelectedProduct: (product: any) => void
  cartCount: number
  wishlistCount: number
  isAdmin: boolean
  setIsAdmin: (status: boolean) => void
  orderHistory: any[]
  setOrderHistory: (orders: any[]) => void
}

export interface CartItem {
  productId: string
  product: any
  quantity: number
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}





