import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, Settings, LogOut, UserCircle, Shield } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'
import { useAppContext } from '../context/AppContext'
import { apiService } from '../services/api'
import { toast } from 'sonner'

export function Header() {
  const navigate = useNavigate()
  const { 
    cartCount, 
    wishlistCount, 
    isLoggedIn, 
    setIsLoggedIn, 
    searchQuery, 
    setSearchQuery,
    user,
    setUser,
    isAdmin,
    setIsAdmin
  } = useAppContext()
  const [remoteWishlistCount, setRemoteWishlistCount] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    const loadWishlistCount = async () => {
      try {
        const resp = isLoggedIn
          ? await apiService.wishlist.countAuth()
          : await apiService.wishlist.count()
        if (mounted) setRemoteWishlistCount(resp.count)
      } catch (e) {
        // swallow silently for header; optionally log
      }
    }
    loadWishlistCount()
    // optionally poll, or listen to route changes
    return () => {
      mounted = false
    }
  }, [])
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [userModalOpen, setUserModalOpen] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length > 0) {
      navigate('/search')
    }
  }

  // Predefined login credentials
  const adminCredentials = {
    email: 'admin@techstore.com',
    password: 'admin123',
    name: 'Admin User'
  }

  const customerCredentials = {
    email: 'customer@example.com', 
    password: 'customer123',
    name: 'John Doe'
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
    setUser({ name: customerCredentials.name, email: customerCredentials.email })
    navigate('/dashboard')
    toast.success('Successfully logged in!')
  }

  const handleLogout = async () => {
    try {
      await apiService.auth.logout()
    } catch {}
    setIsLoggedIn(false)
    setUser(null)
    setIsAdmin(false)
    navigate('/')
    setUserModalOpen(false)
    toast.success('Successfully logged out!')
  }

  const handleAdminLogin = () => {
    setIsLoggedIn(true)
    setIsAdmin(true)
    setUser({ name: adminCredentials.name, email: adminCredentials.email })
    navigate('/admin')
    toast.success('Logged in as Administrator!')
  }

  const navItems = [
    { label: 'Electronics', action: () => navigate('/products') },
    { label: 'Audio', action: () => navigate('/products') },
    { label: 'Computers', action: () => navigate('/products') },
    { label: 'Gaming', action: () => navigate('/products') },
    { label: 'Deals', action: () => navigate('/products') }
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top row: Logo + Nav + Actions */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 relative">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-xl sm:text-2xl font-bold text-black hover:text-gray-600 transition-colors"
              >
                TECHSTORE
              </button>
            </div>

            {/* Desktop nav (moved to first row) */}
            <nav className="flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-gray-700 hover:text-black transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Wishlist */}
              <button 
                onClick={() => navigate('/wishlist')}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-black transition-colors"
              >
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                {(remoteWishlistCount ?? wishlistCount) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-black text-white">
                    {remoteWishlistCount ?? wishlistCount}
                  </Badge>
                )}
              </button>

              {/* Cart */}
              <button 
                onClick={() => navigate('/cart')}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-black transition-colors"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-black text-white">
                    {cartCount}
                  </Badge>
                )}
              </button>

              {/* User menu */}
              <Popover open={userModalOpen} onOpenChange={setUserModalOpen}>
                <PopoverTrigger asChild>
                  <button className={`relative p-1.5 sm:p-2 rounded-md ${isLoggedIn ? 'text-black bg-gray-100' : 'text-gray-600 hover:text-black'} transition-colors`}>
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    {isLoggedIn && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end" sideOffset={5}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <UserCircle className="h-5 w-5" />
                      {isLoggedIn ? 'Account Menu' : 'Welcome'}
                    </div>
                  
                  {isLoggedIn ? (
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user?.name || 'User'}</h3>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                          {isAdmin && (
                            <div className="flex items-center gap-1 mt-1">
                              <Shield className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-blue-600 font-medium">Administrator</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Menu Options */}
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 h-auto p-3"
                          onClick={() => {
                            navigate('/dashboard')
                            setUserModalOpen(false)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">
                              {isAdmin ? 'Admin Dashboard' : 'My Account'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isAdmin ? 'Manage store settings' : 'Manage your profile and settings'}
                            </div>
                          </div>
                        </Button>

                        {!isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-2 h-auto p-3"
                              onClick={() => {
                                navigate('/dashboard')
                                setUserModalOpen(false)
                              }}
                            >
                              <UserCircle className="h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium">Order History</div>
                                <div className="text-xs text-gray-500">View your past orders</div>
                              </div>
                            </Button>

                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-2 h-auto p-3"
                              onClick={() => {
                                navigate('/wishlist')
                                setUserModalOpen(false)
                              }}
                            >
                              <Heart className="h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium">Wishlist</div>
                                <div className="text-xs text-gray-500">View saved items</div>
                              </div>
                            </Button>
                          </>
                        )}
                      </div>

                      <Separator />

                      {/* Logout */}
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => {
                          handleLogout()
                          setUserModalOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600 text-center">
                        Sign in to access your account, orders, and wishlist.
                      </p>
                      
                      <div className="space-y-3">
                        <Button
                          className="w-full bg-black text-white hover:bg-gray-800"
                          onClick={() => {
                            navigate('/login')
                            setUserModalOpen(false)
                          }}
                        >
                          Sign In
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigate('/signup')
                            setUserModalOpen(false)
                          }}
                        >
                          Create Account
                        </Button>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Need help? Contact our support team
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="md:hidden p-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h2 className="text-lg font-semibold">Menu</h2>
                    </div>
                    
                    {/* Navigation items */}
                    <nav className="flex-1 py-4">
                      <div className="space-y-2">
                        {navItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              item.action()
                              setMobileMenuOpen(false)
                            }}
                            className="w-full text-left py-2 px-0 text-gray-700 hover:text-black transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      {/* No second row; nav merged into the top row and search removed */}
    </header>
  )
}