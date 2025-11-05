import React, { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Package, Heart, CreditCard, MapPin, Bell, Download, Star, Eye, MoreHorizontal, Plus, Shield, Gift, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { mockProducts } from '../../App'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function CustomerDashboard() {
  const navigate = useNavigate()
  const {
    user,
    setUser,
    orderHistory,
    wishlistItems,
    setSelectedProduct,
    isLoggedIn,
    setIsLoggedIn
  } = useAppContext()

  const [activeTab, setActiveTab] = useState('overview')
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [allUserOrders, setAllUserOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [recentLoading, setRecentLoading] = useState(false)
  const [recentError, setRecentError] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  })

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      isDefault: true
    },
    {
      id: 2,
      type: 'Work',
      name: 'John Doe',
      address: '456 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      isDefault: false
    }
  ])

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    productRecommendations: false,
    newsletter: true
  })

  const [faqItems, setFaqItems] = useState([
    {
      id: 1,
      question: "How do I track my order?",
      answer: "You can track your order by clicking the 'Track' button in your order details, or by using the tracking number provided in your order confirmation email. You can also visit our tracking page and enter your order number."
    },
    {
      id: 2,
      question: "What is your return policy?",
      answer: "We offer a 15-day return policy for most items. Items must be in original condition with tags attached. Electronics have a 14-day return window. Custom or personalized items are not eligible for return."
    },
    {
      id: 3,
      question: "How do I use my loyalty points?",
      answer: "Loyalty points are automatically applied at checkout. You can view your current points balance in your account dashboard. Points can be redeemed for discounts on future purchases."
    },
    {
      id: 4,
      question: "How can I change my shipping address?",
      answer: "You can update your shipping address in your account settings under 'Addresses'. For existing orders, contact customer support within 24 hours of placing the order to request an address change."
    }
  ])

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2026',
      isDefault: true
    },
    {
      id: 2,
      type: 'credit',
      brand: 'Mastercard',
      last4: '8888',
      expiryMonth: '08',
      expiryYear: '2025',
      isDefault: false
    }
  ])

  const loyaltyProgram = {
    tier: 'Gold',
    points: 0,
    nextTier: 'Platinum',
    pointsToNext: 753,
    benefits: [
      'Free shipping on all orders',
      '15% discount on all purchases',
      'Early access to sales',
      'Priority customer support'
    ]
  }

  // Mock order data
  const mockOrders = [
    {
      id: 'ORD001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 1299.99,
      items: [
        { product: mockProducts[0], quantity: 1 }
      ],
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD002',
      date: '2024-01-10',
      status: 'Shipped',
      total: 299.99,
      items: [
        { product: mockProducts[1], quantity: 1 }
      ],
      trackingNumber: 'TRK987654321'
    },
    {
      id: 'ORD003',
      date: '2024-01-05',
      status: 'Processing',
      total: 999.99,
      items: [
        { product: mockProducts[2], quantity: 1 }
      ],
      trackingNumber: null
    }
  ]
  const [rewardPoints, setRewardPoints] = useState<number>(0)

  useEffect(() => {
    (async () => {
      try {
        const hasToken = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
        if (!hasToken) return
        const bal = await apiService.rewards.balance()
        setRewardPoints(bal?.points ?? 0)
      } catch {}
    })()
  }, [])

  const allOrders = allUserOrders
  const wishlistProducts = mockProducts.filter(product => wishlistItems.includes(product.id))

  const handleProfileSave = async () => {
    try {
      const updated = await apiService.profile.updateProfile({
        name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone || null,
      })
      // Backend returns { success, data: user }; api layer unwraps to user
      const newUser = updated?.user ?? updated
      setUser(newUser || { name: profileData.fullName, email: profileData.email, phone: profileData.phone })
      setEditingProfile(false)
      toast.success('Profile updated successfully')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile')
    }
  }

  const handleAddressDelete = (addressId: number) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId))
    toast.success('Address deleted')
  }

  const handleSetDefaultAddress = (addressId: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })))
    toast.success('Default address updated')
  }

  const handleDownloadInvoice = (orderId: string) => {
    toast.success(`Invoice for order ${orderId} downloaded`)
  }

  const handleTrackOrder = (trackingNumber: string) => {
    toast.success(`Tracking order: ${trackingNumber}`)
  }

  const handleDeletePaymentMethod = (paymentId: number) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== paymentId))
    toast.success('Payment method removed')
  }

  const handleSetDefaultPayment = (paymentId: number) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === paymentId
    })))
    toast.success('Default payment method updated')
  }

  const handleExportAccountData = async () => {
    try {
      const blob = await apiService.account.exportData()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Account data downloaded successfully')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to download account data')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    if (!confirm('This will permanently delete your account and all associated data. Are you absolutely sure?')) {
      return
    }
    try {
      await apiService.account.deleteAccount()
      // Clear local storage and redirect
      localStorage.clear()
      sessionStorage.clear()
      setIsLoggedIn(false)
      setUser(null)
      toast.success('Account deleted successfully')
      navigate('/')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete account')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Load recent and all orders for logged-in user
  useEffect(() => {
    if (!isLoggedIn) return
    let mounted = true
    const load = async () => {
      try {
        setRecentLoading(true)
        setOrdersLoading(true)
        setRecentError(null)
        setOrdersError(null)
        const [recents, all] = await Promise.all([
          apiService.orders.getAuthRecent(),
          apiService.orders.getAuthAll(),
        ])
        if (!mounted) return
        const normalizeOrder = (o: any) => ({
          id: o?.id ?? o?.order_number ?? 'N/A',
          date: o?.created_at ?? o?.date ?? '',
          status: o?.status ?? 'Unknown',
          total: o?.total_amount ?? o?.total ?? 0,
          payment_method: o?.payment_method ?? null,
          payment_reference: o?.payment_reference ?? null,
          is_paid: typeof o?.is_paid === 'boolean' ? o.is_paid : !!o?.paid_at,
          paid_at: o?.paid_at ?? null,
          items: Array.isArray(o?.items)
            ? o.items.map((it: any) => ({
                ...it,
                product: {
                  ...it?.product,
                  image: it?.product?.image ?? it?.product?.primary_image ?? '',
                  price: it?.product?.price ?? it?.unit_price ?? 0,
                },
              }))
            : [],
          trackingNumber: o?.tracking_number ?? o?.trackingNumber ?? null,
        })
        const safeRecents = Array.isArray(recents) ? recents.map(normalizeOrder) : []
        setRecentOrders(safeRecents)
        // getAuthAll now returns { data, meta }
        const allData = Array.isArray((all as any)?.data) ? (all as any).data : (Array.isArray(all as any) ? (all as any) : [])
        const safeAll = Array.isArray(allData) ? allData.map(normalizeOrder) : []
        setAllUserOrders(safeAll)
      } catch (e) {
        if (!mounted) return
        setRecentError('Failed to load. Check your internet connection')
        setOrdersError('Failed to load. Check your internet connection')
      } finally {
        if (!mounted) return
        setRecentLoading(false)
        setOrdersLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [isLoggedIn])

  // Load current profile details when logged in
  useEffect(() => {
    if (!isLoggedIn) return
    let mounted = true
    const loadProfile = async () => {
      try {
        const me = await apiService.profile.getCurrentUser()
        const u = me?.user ?? me
        if (!mounted || !u) return
        setProfileData(prev => ({
          ...prev,
          fullName: u.name || prev.fullName,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
        }))
        setUser(u)
      } catch {}
    }
    loadProfile()
    return () => { mounted = false }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4" >
            Please sign in
          </h2>
          <p className="text-gray-600 mb-8">
            Access your account to view orders, wishlist, and manage your profile
          </p>
          <Button
            onClick={() => setIsLoggedIn(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" >
          My Account
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name || 'John Doe'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-[3rem]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{allOrders.length}</p>
                    <p className="text-gray-600 text-sm">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Heart className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{wishlistItems.length}</p>
                    <p className="text-gray-600 text-sm">Wishlist Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{rewardPoints}</p>
                    <p className="text-gray-600 text-sm">Reward Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${allOrders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
                    </p>
                    <p className="text-gray-600 text-sm">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle >Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="text-center py-8 text-gray-600">Loading recent orders...</div>
              ) : recentError ? (
                <div className="text-center py-8 text-red-600">{recentError}</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No recent orders</div>
              ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {order.items && order.items.length > 0 && order.items[0]?.product?.image ? (
                          <ImageWithFallback
                            src={order.items[0].product.image}
                            alt={order.items[0].product?.name ?? 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-gray-500">No image</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-gray-600 text-sm">{order.date}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('orders')}
                        className="mt-2"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              )}
              {!recentError && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setActiveTab('orders')}
                >
                  View All Orders
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle >Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8 text-gray-600">Loading orders...</div>
              ) : ordersError ? (
                <div className="text-center py-8 text-red-600">{ordersError}</div>
              ) : allOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No orders found</div>
              ) : (
              <div className="space-y-6">
                {allOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-gray-600 text-sm">Placed on {order.date}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.total}</p>
                        <div className="flex space-x-2 mt-2">
                          {order.trackingNumber && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTrackOrder(order.trackingNumber!)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Track
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(order.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(order.items && order.items.length > 0 ? order.items : [null]).map(
                        (
                          item: any,
                          index: React.Key
                        ) => (
                          <div key={index} className="flex items-center space-x-4">
                            {item ? (
                              <>
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                  <ImageWithFallback
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.product.name}</h4>
                                  <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                  <p className="font-semibold">
                                    ${item.product.price * item.quantity}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduct(item.product);
                                    navigate(`/product/${item.product.id}`);
                                  }}
                                >
                                  View Product
                                </Button>
                              </>
                            ) : (
                              <div className="text-gray-500 text-sm">No item details available</div>
                            )}
                          </div>
                        )
                      )}
                    </div>


                    {order.trackingNumber && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
              </div>

              {editingProfile && (
                <div className="flex space-x-4 mt-6">
                  <Button onClick={handleProfileSave} className="bg-black text-white hover:bg-gray-800">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle >Payment Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8 text-gray-600">Loading payments...</div>
              ) : ordersError ? (
                <div className="text-center py-8 text-red-600">{ordersError}</div>
              ) : allOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No payments found</div>
              ) : (
              <div className="space-y-4">
                {allOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-gray-600 text-sm">{order.date}</p>
                      </div>
                      <Badge className={order.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {order.is_paid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Payment Method:</span>
                        <div className="font-medium">{order.payment_method || '—'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <div className="font-medium">{order.payment_reference || '—'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid At:</span>
                        <div className="font-medium">{order.paid_at ? new Date(order.paid_at).toLocaleString() : '—'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">${order.total}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle >Customer Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Live Chat</h4>
                    <p className="text-gray-600 text-sm">Chat with our support team</p>
                    <p className="text-green-600 text-xs mt-1">Available 24/7</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Email Support</h4>
                    <p className="text-gray-600 text-sm">support@store.com</p>
                    <p className="text-gray-500 text-xs mt-1">Response within 24h</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Phone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Phone Support</h4>
                    <p className="text-gray-600 text-sm">1-800-STORE-01</p>
                    <p className="text-gray-500 text-xs mt-1">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Frequently Asked Questions</h4>
                  <div className="space-y-2">
                    {faqItems.map((faq) => (
                      <div key={faq.id} className="border rounded-lg overflow-hidden">
                        <button 
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        >
                          <div className="flex items-center">
                            <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                            <span className="font-medium">{faq.question}</span>
                          </div>
                          <span className="text-gray-500 text-lg">
                            {expandedFaq === faq.id ? '−' : '+'}
                          </span>
                        </button>
                        {expandedFaq === faq.id && (
                          <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50 border-t">
                            <p className="pt-2">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle >Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportAccountData}
                >
                  Download Account Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-800"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}