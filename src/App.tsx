import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { AnnouncementBar } from './components/AnnouncementBar'
import { HomePage } from './components/pages/HomePage'
import { ProductListingPage } from './components/pages/ProductListingPage'
import { ProductDetailPage } from './components/pages/ProductDetailPage'
import { SearchPage } from './components/pages/SearchPage'
import { WishlistPage } from './components/pages/WishlistPage'
import { CartPage } from './components/pages/CartPage'
import { CheckoutPage } from './components/pages/CheckoutPage'
import { ThankYouPage } from './components/pages/ThankYouPage'
import { CustomerDashboard } from './components/pages/CustomerDashboard'
import { AdminDashboard } from './components/pages/AdminDashboard'
import { LoginPage } from './components/pages/LoginPage'
import { SignupPage } from './components/pages/SignupPage'
import { ContactUsPage } from './components/pages/ContactUsPage'
import { ShippingInfoPage } from './components/pages/ShippingInfoPage'
import { ReturnsPage } from './components/pages/ReturnsPage'
import { SupportPage } from './components/pages/SupportPage'
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage'
import { TermsOfServicePage } from './components/pages/TermsOfServicePage'
import { Toaster } from './components/ui/sonner'
import { AppContext, AppContextType, CartItem } from './context/AppContext'
import './utils/apiTest' // Auto-run API test
import { SideCart } from './components/SideCart'
import { LiveChat } from './components/LiveChat'
import { LiveChatProvider } from './context/LiveChatContext'
import { ScrollToTop } from './components/ScrollToTop'

// Mock data for products
export const mockProducts = [
  {
    id: '1',
    name: 'MacBook Pro M3',
    price: 1999,
    originalPrice: 2199,
    image: 'https://images.unsplash.com/photo-1754928864131-21917af96dfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzU4NzcyNzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Laptops',
    brand: 'Apple',
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    description: 'The most powerful MacBook Pro ever with M3 chip.',
    specifications: ['M3 Pro chip', '16GB RAM', '512GB SSD', '14-inch Liquid Retina XDR display'],
    images: ['https://images.unsplash.com/photo-1754928864131-21917af96dfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzU4NzcyNzA5fDA&ixlib=rb-4.1.0&q=80&w=1080']
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzU4NzcyNzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Audio',
    brand: 'Sony',
    rating: 4.6,
    reviews: 892,
    inStock: true,
    description: 'Industry-leading noise canceling headphones.',
    specifications: ['30-hour battery', 'Quick charge', 'Multi-point connection', 'Touch controls'],
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzU4NzcyNzA5fDA&ixlib=rb-4.1.0&q=80&w=1080']
  },
  {
    id: '3',
    name: 'iPhone 15 Pro',
    price: 999,
    originalPrice: 1099,
    image: 'https://images.unsplash.com/photo-1675953935267-e039f13ddd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzU4NzI1ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Phones',
    brand: 'Apple',
    rating: 4.7,
    reviews: 2156,
    inStock: true,
    description: 'The ultimate iPhone with titanium design.',
    specifications: ['A17 Pro chip', '128GB storage', 'Pro camera system', 'Action button'],
    images: ['https://images.unsplash.com/photo-1675953935267-e039f13ddd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzU4NzI1ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080']
  },
  {
    id: '4',
    name: 'Apple Watch Series 9',
    price: 399,
    originalPrice: 449,
    image: 'https://images.unsplash.com/photo-1716234479503-c460b87bdf98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHdhdGNoJTIwd2VhcmFibGV8ZW58MXx8fHwxNzU4NzM3ODEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Wearables',
    brand: 'Apple',
    rating: 4.5,
    reviews: 743,
    inStock: true,
    description: 'The most advanced smartwatch with health features.',
    specifications: ['S9 chip', 'Double tap gesture', 'Blood oxygen monitoring', 'ECG app'],
    images: ['https://images.unsplash.com/photo-1716234479503-c460b87bdf98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHdhdGNoJTIwd2VhcmFibGV8ZW58MXx8fHwxNzU4NzM3ODEwfDA&ixlib=rb-4.1.0&q=80&w=1080']
  },
  {
    id: '5',
    name: 'Canon EOS R5',
    price: 2499,
    originalPrice: 2799,
    image: 'https://images.unsplash.com/photo-1729857037662-221cc636782a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBwaG90b2dyYXBoeSUyMGdlYXJ8ZW58MXx8fHwxNzU4Nzc1MjUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cameras',
    brand: 'Canon',
    rating: 4.9,
    reviews: 456,
    inStock: false,
    description: 'Professional mirrorless camera with 8K video.',
    specifications: ['45MP sensor', '8K video recording', 'In-body image stabilization', 'Dual card slots'],
    images: ['https://images.unsplash.com/photo-1729857037662-221cc636782a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBwaG90b2dyYXBoeSUyMGdlYXJ8ZW58MXx8fHwxNzU4Nzc1MjUyfDA&ixlib=rb-4.1.0&q=80&w=1080']
  },
  {
    id: '6',
    name: 'PlayStation 5',
    price: 499,
    originalPrice: 549,
    image: 'https://images.unsplash.com/photo-1655976796204-308e6f3deaa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb25zb2xlJTIwY29udHJvbGxlcnxlbnwxfHx8fDE3NTg2NzU1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Gaming',
    brand: 'Sony',
    rating: 4.4,
    reviews: 1823,
    inStock: true,
    description: 'Next-generation gaming console with stunning graphics.',
    specifications: ['Custom SSD', '4K gaming', 'Ray tracing', 'DualSense controller'],
    images: ['https://images.unsplash.com/photo-1655976796204-308e6f3deaa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb25zb2xlJTIwY29udHJvbGxlcnxlbnwxfHx8fDE3NTg2NzU1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080']
  }
]

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [orderHistory, setOrderHistory] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = (product: any, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { productId: product.id, product, quantity }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const replaceCartFromServer = (items: CartItem[]) => {
    setCartItems(items)
  }

  const toggleWishlist = (productId: string) => {
    setWishlistItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const openCart = () => setIsCartOpen(true)

  const replaceWishlistFromServer = (ids: string[]) => {
    setWishlistItems(ids)
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length

  useEffect(() => {
    try {
      // Ensure a stable guest session id exists early
      if (typeof window !== 'undefined') {
        let id = localStorage.getItem('guestSessionId')
        if (!id) {
          // Prefer secure random UUID when available
          // @ts-ignore
          id = (window.crypto?.randomUUID && window.crypto.randomUUID()) || `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`
          localStorage.setItem('guestSessionId', id)
        }
      }

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (token) {
        setIsLoggedIn(true)
        const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
        if (raw) {
          const parsed = JSON.parse(raw)
          setUser(parsed)
          const hasAdmin = !!parsed?.roles?.some?.((r: any) => {
            const val = String((r.slug || r.name || '')).toLowerCase()
            return val === 'admin' || val === 'super-admin'
          })
          setIsAdmin(hasAdmin)
        }
      }
    } catch {}
  }, [])

  const contextValue: AppContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    replaceCartFromServer,
    wishlistItems,
    toggleWishlist,
    replaceWishlistFromServer,
    isCartOpen,
    setIsCartOpen,
    openCart,
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    cartCount,
    wishlistCount,
    isAdmin,
    setIsAdmin,
    orderHistory,
    setOrderHistory
  }

  return (
    <AppContext.Provider value={contextValue}>
      <LiveChatProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-white flex flex-col">
            <AnnouncementBar />
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/dashboard" element={isAdmin ? <AdminDashboard /> : <CustomerDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/shipping" element={<ShippingInfoPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
          <SideCart />
          <LiveChat />
        </Router>
      </LiveChatProvider>
    </AppContext.Provider>
  )
}