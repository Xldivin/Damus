import { useEffect, useState } from 'react'
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  MessageSquare,
  LayoutDashboard,
  Menu,
  Tag
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'sonner'
import { apiService } from '../../services/api'

export function AdminDashboard() {
  const { isAdmin } = useAppContext()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [chatThreads, setChatThreads] = useState<Array<{ sessionId: string; lastMessage?: any; unreadCount: number }>>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'support'; timestamp?: string }>>([])
  const [chatInput, setChatInput] = useState<string>('')
  const [isSendingChat, setIsSendingChat] = useState(false)
  
  // Overview data state
  const [overviewData, setOverviewData] = useState<any>(null)
  const [isLoadingOverview, setIsLoadingOverview] = useState(false)
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  
  // Load overview data when opening overview tab
  useEffect(() => {
    const loadOverview = async () => {
      if (activeTab === 'overview' && !overviewData) {
        try {
          setIsLoadingOverview(true)
          const response = await apiService.adminDashboard.getOverview()
          setOverviewData(response.data || response)
        } catch (error) {
          console.error('Failed to load overview data:', error)
          toast.error('Failed to load dashboard overview')
        } finally {
          setIsLoadingOverview(false)
        }
      }
    }
    loadOverview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])
  
  // Load analytics data when opening analytics tab
  useEffect(() => {
    const loadAnalytics = async () => {
      if (activeTab === 'analytics' && !analyticsData) {
        try {
          setIsLoadingAnalytics(true)
          const response = await apiService.adminDashboard.getAnalytics({ months: 12 })
          setAnalyticsData(response.data || response)
        } catch (error) {
          console.error('Failed to load analytics data:', error)
          toast.error('Failed to load dashboard analytics')
        } finally {
          setIsLoadingAnalytics(false)
        }
      }
    }
    loadAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])
  
  // Load chat threads initially and when opening chat tab
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const res = await apiService.chat.adminThreads()
        console.log('Chat threads response:', res)
        // Handle different response structures
        if (res.threads) {
          setChatThreads(res.threads)
        } else if (res.data?.threads) {
          setChatThreads(res.data.threads)
        } else if (Array.isArray(res)) {
          setChatThreads(res)
        } else {
          setChatThreads([])
        }
      } catch (error) {
        console.error('Failed to load chat threads:', error)
        toast.error('Failed to load chat threads')
      }
    }
    if (activeTab === 'chat') {
      loadThreads()
    }
  }, [activeTab])

  // Load selected thread messages
  useEffect(() => {
    const loadThread = async () => {
      if (!selectedSessionId) return
      try {
        const thread = await apiService.chat.fetchThread(selectedSessionId)
        console.log('Thread messages response:', thread)
        setChatMessages(thread.messages || [])
      } catch (error) {
        console.error('Failed to load thread messages:', error)
        toast.error('Failed to load messages')
      }
    }
    loadThread()
  }, [selectedSessionId])
  
  // Modal states
  const [viewProductModal, setViewProductModal] = useState(false)
  const [editProductModal, setEditProductModal] = useState(false)
  const [addProductModal, setAddProductModal] = useState(false)
  const [viewOrderModal, setViewOrderModal] = useState(false)
  const [editOrderModal, setEditOrderModal] = useState(false)
  const [viewCustomerModal, setViewCustomerModal] = useState(false)
  const [editCustomerModal, setEditCustomerModal] = useState(false)
  
  // Selected items
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  // Edit forms
  const [editProductForm, setEditProductForm] = useState<any>({})
  const [editOrderForm, setEditOrderForm] = useState<any>({})
  const [editCustomerForm, setEditCustomerForm] = useState<any>({})
  
  // Products state
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Orders state
  const [orders, setOrders] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('all')
  const [deleteOrderModal, setDeleteOrderModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<any>(null)
  const [isDeletingOrder, setIsDeletingOrder] = useState(false)
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false)
  
  // Customers state
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomerStatus, setSelectedCustomerStatus] = useState<string>('all')
  const [deleteCustomerModal, setDeleteCustomerModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<any>(null)
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false)
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false)
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    cost_price: '',
    category_id: '',
    subcategory_id: '',
    stock_quantity: '',
    min_stock_level: '5',
    weight: '',
    is_active: true,
    is_featured: false,
    is_digital: false,
  })
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [editSelectedSizes, setEditSelectedSizes] = useState<string[]>([])
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Autocomplete states for Category
  const [categoryInput, setCategoryInput] = useState('')
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  
  // Product images state
  const [productImages, setProductImages] = useState<Array<{
    url: string;
    alt_text?: string;
    is_primary: boolean;
    preview?: string;
  }>>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  // Load products when products tab is active
  useEffect(() => {
    const loadProducts = async () => {
      if (activeTab === 'products') {
        try {
          setIsLoadingProducts(true)
          const [productsResponse, filterOptions] = await Promise.all([
            apiService.adminProducts.getAll({ include_inactive: true, per_page: 100 }),
            apiService.adminProducts.getFilterOptions()
          ])
          setProducts(productsResponse.data || [])
          setCategories(filterOptions.categories || [])
        } catch (error) {
          console.error('Failed to load products:', error)
          toast.error('Failed to load products')
        } finally {
          setIsLoadingProducts(false)
        }
      }
    }
    loadProducts()
  }, [activeTab])
  
  // Load orders when orders tab is active
  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab === 'orders') {
        try {
          setIsLoadingOrders(true)
          const response = await apiService.adminOrders.getAll({
            status: selectedOrderStatus !== 'all' ? selectedOrderStatus : undefined,
            search: orderSearchQuery || undefined,
            per_page: 100
          })
          setOrders(response.data || [])
        } catch (error) {
          console.error('Failed to load orders:', error)
          toast.error('Failed to load orders')
        } finally {
          setIsLoadingOrders(false)
        }
      }
    }
    loadOrders()
  }, [activeTab, selectedOrderStatus, orderSearchQuery])
  
  // Load customers when customers tab is active
  useEffect(() => {
    const loadCustomers = async () => {
      if (activeTab === 'customers') {
        try {
          setIsLoadingCustomers(true)
          const response = await apiService.adminUsers.getAll({
            status: selectedCustomerStatus !== 'all' ? selectedCustomerStatus : undefined,
            search: customerSearchQuery || undefined,
            per_page: 100
          })
          setCustomers(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
          console.error('Failed to load customers:', error)
          toast.error('Failed to load customers')
        } finally {
          setIsLoadingCustomers(false)
        }
      }
    }
    loadCustomers()
  }, [activeTab, selectedCustomerStatus, customerSearchQuery])
  
  // Clean up image preview URLs on unmount
  useEffect(() => {
    return () => {
      productImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview)
        }
      })
    }
  }, [productImages])
  
  // Handle modal actions
  const handleViewProduct = async (product: any) => {
    try {
      // Fetch full product details
      const fullProduct = await apiService.products.getProductById(product.id)
      setSelectedProduct(fullProduct)
      setViewProductModal(true)
    } catch (error) {
      // Fallback to product from table if API fails
      setSelectedProduct(product)
      setViewProductModal(true)
    }
  }
  
  const handleEditProduct = async (product: any) => {
    try {
      // Fetch full product details
      const fullProduct = await apiService.products.getProductById(product.id)
      setSelectedProduct(fullProduct)
      setEditProductForm({
        name: fullProduct.name || '',
        description: fullProduct.description || '',
        short_description: fullProduct.short_description || '',
        price: fullProduct.price || '',
        original_price: fullProduct.original_price || '',
        cost_price: fullProduct.cost_price || '',
        category_id: fullProduct.category?.id || '',
        subcategory_id: fullProduct.subcategory?.id || '',
        brand_id: fullProduct.brand?.id || '',
        stock_quantity: fullProduct.stock_quantity || '',
        min_stock_level: fullProduct.min_stock_level || '5',
        weight: fullProduct.weight || '',
        is_active: fullProduct.is_active ?? true,
        is_featured: fullProduct.is_featured ?? false,
        is_digital: fullProduct.is_digital ?? false,
      })
      // Load existing sizes
      setEditSelectedSizes(Array.isArray(fullProduct.c_sizes) ? fullProduct.c_sizes : [])
      setEditProductModal(true)
    } catch (error) {
      // Fallback to product from table if API fails
      setSelectedProduct(product)
      setEditProductForm({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price || '',
        original_price: product.original_price || '',
        cost_price: product.cost_price || '',
        category_id: product.category?.id || '',
        subcategory_id: product.subcategory?.id || '',
        brand_id: product.brand?.id || '',
        stock_quantity: product.stock_quantity || '',
        min_stock_level: product.min_stock_level || '5',
        weight: product.weight || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_digital: product.is_digital ?? false,
      })
      // Load existing sizes
      setEditSelectedSizes(Array.isArray(product.c_sizes) ? product.c_sizes : [])
      setEditProductModal(true)
    }
  }
  
  const handleViewOrder = async (order: any) => {
    try {
      // Fetch full order details
      const fullOrder = await apiService.adminOrders.getById(order.id)
      setSelectedOrder(fullOrder)
      setViewOrderModal(true)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      // Fallback to order from table if API fails
      setSelectedOrder(order)
      setViewOrderModal(true)
      toast.error('Failed to load full order details')
    }
  }
  
  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    setEditOrderForm({
      status: order.status || 'pending'
    })
    setEditOrderModal(true)
  }
  
  const handleDeleteOrder = (order: any) => {
    setOrderToDelete(order)
    setDeleteOrderModal(true)
  }
  
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return
    
    try {
      setIsDeletingOrder(true)
      await apiService.adminOrders.delete(orderToDelete.id)
      toast.success('Order deleted successfully')
      setDeleteOrderModal(false)
      setOrderToDelete(null)
      
      // Reload orders
      const response = await apiService.adminOrders.getAll({
        status: selectedOrderStatus !== 'all' ? selectedOrderStatus : undefined,
        search: orderSearchQuery || undefined,
        per_page: 100
      })
      setOrders(response.data || [])
    } catch (error: any) {
      console.error('Failed to delete order:', error)
      toast.error(error?.message || 'Failed to delete order')
    } finally {
      setIsDeletingOrder(false)
    }
  }
  
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !editOrderForm.status) return
    
    try {
      setIsUpdatingOrderStatus(true)
      await apiService.adminOrders.updateStatus(selectedOrder.id, editOrderForm.status)
      toast.success('Order status updated successfully')
      setEditOrderModal(false)
      setSelectedOrder(null)
      
      // Reload orders
      const response = await apiService.adminOrders.getAll({
        status: selectedOrderStatus !== 'all' ? selectedOrderStatus : undefined,
        search: orderSearchQuery || undefined,
        per_page: 100
      })
      setOrders(response.data || [])
    } catch (error: any) {
      console.error('Failed to update order status:', error)
      toast.error(error?.message || 'Failed to update order status')
    } finally {
      setIsUpdatingOrderStatus(false)
    }
  }
  
  const handleViewCustomer = async (customer: any) => {
    try {
      // Fetch full customer details
      const fullCustomer = await apiService.adminUsers.getById(customer.id)
      setSelectedCustomer(fullCustomer)
      setViewCustomerModal(true)
    } catch (error) {
      console.error('Failed to fetch customer details:', error)
      // Fallback to customer from table if API fails
      setSelectedCustomer(customer)
      setViewCustomerModal(true)
      toast.error('Failed to load full customer details')
    }
  }
  
  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setEditCustomerForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status || 'active'
    })
    setEditCustomerModal(true)
  }
  
  const handleDeleteCustomer = (customer: any) => {
    setCustomerToDelete(customer)
    setDeleteCustomerModal(true)
  }
  
  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return
    
    try {
      setIsDeletingCustomer(true)
      await apiService.adminUsers.delete(customerToDelete.id)
      toast.success('Customer deleted successfully')
      setDeleteCustomerModal(false)
      setCustomerToDelete(null)
      
      // Reload customers
      const response = await apiService.adminUsers.getAll({
        status: selectedCustomerStatus !== 'all' ? selectedCustomerStatus : undefined,
        search: customerSearchQuery || undefined,
        per_page: 100
      })
      setCustomers(response.data || [])
    } catch (error: any) {
      console.error('Failed to delete customer:', error)
      toast.error(error?.message || 'Failed to delete customer')
    } finally {
      setIsDeletingCustomer(false)
    }
  }
  
  const handleUpdateCustomer = async () => {
    if (!selectedCustomer || !editCustomerForm.name || !editCustomerForm.email) return
    
    try {
      setIsUpdatingCustomer(true)
      await apiService.adminUsers.update(selectedCustomer.id, {
        name: editCustomerForm.name,
        email: editCustomerForm.email,
        phone: editCustomerForm.phone || undefined,
        status: editCustomerForm.status
      })
      toast.success('Customer updated successfully')
      setEditCustomerModal(false)
      setSelectedCustomer(null)
      
      // Reload customers
      const response = await apiService.adminUsers.getAll({
        status: selectedCustomerStatus !== 'all' ? selectedCustomerStatus : undefined,
        search: customerSearchQuery || undefined,
        per_page: 100
      })
      setCustomers(response.data || [])
    } catch (error: any) {
      console.error('Failed to update customer:', error)
      toast.error(error?.message || 'Failed to update customer')
    } finally {
      setIsUpdatingCustomer(false)
    }
  }
  
  const [deleteProductModal, setDeleteProductModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  
  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product)
    setDeleteProductModal(true)
  }
  
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    
    try {
      setIsDeletingProduct(true)
      await apiService.adminProducts.delete(productToDelete.id)
      toast.success('Product deleted successfully!')
      setDeleteProductModal(false)
      setProductToDelete(null)
      
      // Reload products
      const productsResponse = await apiService.adminProducts.getAll({ include_inactive: true, per_page: 100 })
      setProducts(productsResponse.data || [])
    } catch (error: any) {
      console.error('Failed to delete product:', error)
      toast.error(error?.message || 'Failed to delete product. Please try again.')
    } finally {
      setIsDeletingProduct(false)
    }
  }
  
  const handleSaveProduct = async () => {
    try {
      setIsSubmittingProduct(true)
      
      if (!editProductForm.name || !editProductForm.description || !editProductForm.price || !editProductForm.category_id || !editProductForm.stock_quantity) {
        toast.error('Please fill in all required fields')
        return
      }
      
      // Find or create category
      let categoryId: number
      const categoryInputValue = typeof editProductForm.category_id === 'string' ? editProductForm.category_id : categories.find(c => c.id === editProductForm.category_id)?.name || ''
      const existingCategory = categories.find(c => c.id === editProductForm.category_id || c.name.toLowerCase() === categoryInputValue.toLowerCase())
      if (existingCategory) {
        categoryId = existingCategory.id
      } else {
        toast.error('Invalid category selected')
        return
      }
      
      // Find or create brand (if provided)
      let brandId: number | undefined
      if (editProductForm.brand_id) {
        const existingBrand = brands.find(b => b.id === editProductForm.brand_id)
        if (existingBrand) {
          brandId = existingBrand.id
        }
      }
      
      const productData = {
        name: editProductForm.name,
        description: editProductForm.description,
        short_description: editProductForm.short_description || undefined,
        price: parseFloat(editProductForm.price),
        original_price: editProductForm.original_price ? parseFloat(editProductForm.original_price) : undefined,
        cost_price: editProductForm.cost_price ? parseFloat(editProductForm.cost_price) : undefined,
        category_id: categoryId,
        subcategory_id: editProductForm.subcategory_id ? parseInt(editProductForm.subcategory_id) : undefined,
        brand_id: brandId,
        stock_quantity: parseInt(editProductForm.stock_quantity),
        min_stock_level: editProductForm.min_stock_level ? parseInt(editProductForm.min_stock_level) : 5,
        weight: editProductForm.weight ? parseFloat(editProductForm.weight) : undefined,
        is_active: editProductForm.is_active,
        is_featured: editProductForm.is_featured,
        is_digital: editProductForm.is_digital,
        c_sizes: editSelectedSizes.length > 0 ? editSelectedSizes : undefined,
      }
      
      await apiService.adminProducts.update(selectedProduct.id, productData)
      toast.success('Product updated successfully!')
      setEditProductModal(false)
      setEditSelectedSizes([]) // Reset sizes after successful update
      
      // Reload products
      const productsResponse = await apiService.adminProducts.getAll({ include_inactive: true, per_page: 100 })
      setProducts(productsResponse.data || [])
    } catch (error: any) {
      console.error('Failed to update product:', error)
      toast.error(error?.message || 'Failed to update product. Please try again.')
    } finally {
      setIsSubmittingProduct(false)
    }
  }
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
      product.category?.id?.toString() === selectedCategory ||
      product.category?.slug === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const handleAddProduct = async () => {
    try {
      setIsSubmittingProduct(true)
      
      // Validate required fields
      if (!newProductForm.name || !newProductForm.description || !newProductForm.price || !categoryInput || !newProductForm.stock_quantity) {
        toast.error('Please fill in all required fields')
        return
      }
      
      // Find or create category
      let categoryId: number
      const existingCategory = categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase())
      if (existingCategory) {
        categoryId = existingCategory.id
      } else {
        // Create new category via API
        try {
          const categoryResponse = await apiService.adminCategories.create({ name: categoryInput })
          categoryId = categoryResponse.id || categoryResponse.data?.id
          // Reload categories
          const filterOptions = await apiService.adminProducts.getFilterOptions()
          setCategories(filterOptions.categories || [])
        } catch (error: any) {
          toast.error('Failed to create category. Please try again.')
          return
        }
      }
      
      const productData = {
        name: newProductForm.name,
        description: newProductForm.description,
        short_description: newProductForm.short_description || undefined,
        price: parseFloat(newProductForm.price),
        original_price: newProductForm.original_price ? parseFloat(newProductForm.original_price) : undefined,
        cost_price: newProductForm.cost_price ? parseFloat(newProductForm.cost_price) : undefined,
        category_id: categoryId,
        subcategory_id: newProductForm.subcategory_id ? parseInt(newProductForm.subcategory_id) : undefined,
        stock_quantity: parseInt(newProductForm.stock_quantity),
        min_stock_level: newProductForm.min_stock_level ? parseInt(newProductForm.min_stock_level) : 5,
        weight: newProductForm.weight ? parseFloat(newProductForm.weight) : undefined,
        is_active: newProductForm.is_active,
        is_featured: newProductForm.is_featured,
        is_digital: newProductForm.is_digital,
        c_sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
        images: productImages.length > 0 ? productImages.map(img => ({
          url: img.url,
          alt_text: img.alt_text || newProductForm.name,
          is_primary: img.is_primary,
        })) : undefined,
      }
      
      await apiService.adminProducts.create(productData)
    toast.success('Product added successfully!')
    setAddProductModal(false)
      
      // Reset form
      setNewProductForm({
        name: '',
        description: '',
        short_description: '',
        price: '',
        original_price: '',
        cost_price: '',
        category_id: '',
        subcategory_id: '',
        stock_quantity: '',
        min_stock_level: '5',
        weight: '',
        is_active: true,
        is_featured: false,
        is_digital: false,
      })
      setCategoryInput('')
      setSelectedCategoryId(null)
      setSelectedSizes([]) // Reset selected sizes
      
      // Clean up image previews
      productImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview)
        }
      })
      setProductImages([])
      
      // Reload products
      const productsResponse = await apiService.adminProducts.getAll({ include_inactive: true, per_page: 100 })
      setProducts(productsResponse.data || [])
    } catch (error: any) {
      console.error('Failed to add product:', error)
      toast.error(error?.message || 'Failed to add product. Please try again.')
    } finally {
      setIsSubmittingProduct(false)
    }
  }
  
  

  // Use real data from API or fallback to mock data
  const salesData = overviewData?.charts?.revenue_overview || [
    { month: 'Jan', revenue: 0, orders: 0 },
    { month: 'Feb', revenue: 0, orders: 0 },
    { month: 'Mar', revenue: 0, orders: 0 },
    { month: 'Apr', revenue: 0, orders: 0 },
    { month: 'May', revenue: 0, orders: 0 },
    { month: 'Jun', revenue: 0, orders: 0 }
  ]

  const categoryData = overviewData?.charts?.category_sales || [
    { name: 'Clothes', value: 0, color: '#000000' },
    { name: 'Shoes', value: 0, color: '#666666' },
    { name: 'Retail', value: 0, color: '#999999' },
  ]

  const recentOrders = overviewData?.recent_orders || []
  const lowStockProducts = overviewData?.low_stock_products || []


  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    switch (normalizedStatus) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !orderSearchQuery || 
      order.order_number?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(orderSearchQuery.toLowerCase())
    return matchesSearch
  })
  
  // Filter customers based on search and status
  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
    const matchesSearch = !customerSearchQuery || 
      customer.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(customerSearchQuery.toLowerCase())
    const matchesStatus = selectedCustomerStatus === 'all' || customer.status === selectedCustomerStatus
    return matchesSearch && matchesStatus
  }) : []

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4" >
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access the admin dashboard
          </p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ]

return (
  <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
    {/* Sidebar */}
    <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Sidebar Header */}
      <div className={`p-4 border-b border-gray-200 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        {sidebarOpen && (
          <h2 className="text-lg font-bold">Admin Panel</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={sidebarOpen ? "ml-auto" : ""}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-lg transition-colors ${
                  sidebarOpen 
                    ? 'gap-3 px-3 py-2.5' 
                    : 'justify-center px-0 py-2.5'
                } ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </aside>

    {/* Main Content */}
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {menuItems.find(item => item.id === activeTab)?.label || 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            Manage your store and monitor performance
          </p>
        </div>

        <div>
          {/* Overview Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          {isLoadingOverview ? '...' : `AED ${overviewData?.kpis?.revenue?.total || '0.00'}`}
                        </p>
                        <p className={`text-sm ${overviewData?.kpis?.revenue?.growth_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {isLoadingOverview ? '...' : `${overviewData?.kpis?.revenue?.growth_direction === 'up' ? '↗' : '↘'} ${Math.abs(overviewData?.kpis?.revenue?.growth || 0)}% from last month`}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold">
                          {isLoadingOverview ? '...' : overviewData?.kpis?.orders?.total || 0}
                        </p>
                        <p className={`text-sm ${overviewData?.kpis?.orders?.growth_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {isLoadingOverview ? '...' : `${overviewData?.kpis?.orders?.growth_direction === 'up' ? '↗' : '↘'} ${Math.abs(overviewData?.kpis?.orders?.growth || 0)}% from last month`}
                        </p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Products</p>
                        <p className="text-2xl font-bold">
                          {isLoadingOverview ? '...' : overviewData?.kpis?.products?.active || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isLoadingOverview ? '...' : `${overviewData?.kpis?.products?.out_of_stock || 0} out of stock`}
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold">
                          {isLoadingOverview ? '...' : overviewData?.kpis?.customers?.total || 0}
                        </p>
                        <p className="text-sm text-green-600">
                          {isLoadingOverview ? '...' : `↗ ${overviewData?.kpis?.customers?.new_this_month || 0} new this month`}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#000000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name} ${value}%`}
                        >
                          {categoryData.map((entry:any, index:any) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders & Low Stock */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Orders</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('orders')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoadingOverview ? (
                        <p className="text-center text-gray-600 py-4">Loading orders...</p>
                      ) : recentOrders.length > 0 ? (
                        recentOrders.map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{order.id}</p>
                              <p className="text-gray-600 text-sm">{order.customer}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">AED {order.total}</p>
                              <p className="text-gray-600 text-sm">{order.date}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-600 py-4">No recent orders</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Low Stock Alert */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Low Stock Alert</CardTitle>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoadingOverview ? (
                        <p className="text-center text-gray-600 py-4">Loading products...</p>
                      ) : lowStockProducts.length > 0 ? (
                        lowStockProducts.map((product: any) => (
                          <div key={product.id} className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <ImageWithFallback
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-gray-600 text-sm">{product.brand}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-red-100 text-red-800">
                                {product.stock} left
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-600 py-4">No low stock products</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analytics Content */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {isLoadingAnalytics ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading analytics data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-gray-200">
                      <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analyticsData?.sales_data || salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardHeader>
                        <CardTitle>Order Volume</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analyticsData?.sales_data || salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#666666" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Analytics Summary Cards */}
                  {analyticsData?.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card className="border-gray-200">
                        <CardContent className="p-6">
                          <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                          <p className="text-2xl font-bold">AED {analyticsData.summary.total_revenue}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-gray-200">
                        <CardContent className="p-6">
                          <p className="text-sm text-gray-600 mb-2">Total Orders</p>
                          <p className="text-2xl font-bold">{analyticsData.summary.total_orders}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-gray-200">
                        <CardContent className="p-6">
                          <p className="text-sm text-gray-600 mb-2">Avg Order Value</p>
                          <p className="text-2xl font-bold">AED {analyticsData.summary.average_order_value}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-gray-200">
                        <CardContent className="p-6">
                          <p className="text-sm text-gray-600 mb-2">Best Month</p>
                          <p className="text-xl font-bold">{analyticsData.summary.best_month?.month || 'N/A'}</p>
                          <p className="text-sm text-gray-600">AED {analyticsData.summary.best_month?.revenue?.toLocaleString() || '0'}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Products Content */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-9" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.length > 0 && categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name || 'Unnamed Category'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-black text-white hover:bg-gray-800" onClick={() => setAddProductModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <Card className="border-gray-200">
                <CardContent className="p-0">
                  {isLoadingProducts ? (
                    <div className="p-8 text-center text-gray-600">Loading products...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">No products found</div>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                  <ImageWithFallback 
                                    src={product.primary_image || product.images?.[0]?.image_url} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                  />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                  <p className="text-gray-600 text-sm">{product.brand?.name || 'No brand'}</p>
                              </div>
                            </div>
                          </TableCell>
                            <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                          <TableCell>AED {product.price}</TableCell>
                          <TableCell>
                              <Badge className={product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                              <Badge className={product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Content */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search orders..." 
                      className="pl-9" 
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedOrderStatus} onValueChange={setSelectedOrderStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="border-gray-200">
                <CardContent className="p-0">
                  {isLoadingOrders ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading orders...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No orders found
                    </div>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number || `#${order.id}`}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name || order.user?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{order.customer_email || order.user?.email || ''}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{order.items?.length || 0} item(s)</TableCell>
                          <TableCell>
                            {order.currency || 'AED'}{(Number(order.total_amount) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={order.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {order.is_paid ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customers Content */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search customers..." 
                      className="pl-9" 
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCustomerStatus} onValueChange={setSelectedCustomerStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="border-gray-200">
                <CardContent className="p-0">
                  {isLoadingCustomers ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading customers...</p>
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No customers found
                    </div>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map(customer => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone || 'N/A'}</TableCell>
                          <TableCell>{customer.total_orders || 0}</TableCell>
                          <TableCell>
                            AED {(Number(customer.total_spent) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              customer.status === 'active' ? 'bg-green-100 text-green-800' :
                              customer.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {customer.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat Content */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Threads list */}
                <Card className="border-gray-200 lg:col-span-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Conversations</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await apiService.chat.adminThreads()
                            console.log('Chat threads refresh response:', res)
                            // Handle different response structures
                            if (res.threads) {
                              setChatThreads(res.threads)
                            } else if (res.data?.threads) {
                              setChatThreads(res.data.threads)
                            } else if (Array.isArray(res)) {
                              setChatThreads(res)
                            } else {
                              setChatThreads([])
                            }
                          } catch (error) {
                            console.error('Failed to refresh threads:', error)
                            toast.error('Failed to refresh threads')
                          }
                        }}
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {chatThreads.length === 0 && (
                        <p className="text-sm text-gray-600">No conversations yet.</p>
                      )}
                      {chatThreads.map(t => (
                        <button
                          key={t.sessionId}
                          onClick={() => setSelectedSessionId(t.sessionId)}
                          className={`w-full text-left p-3 rounded border ${selectedSessionId === t.sessionId ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Session: {t.sessionId.slice(0, 10)}…</div>
                            {t.unreadCount > 0 && <Badge className="bg-black text-white">{t.unreadCount}</Badge>}
                          </div>
                          {t.lastMessage && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {t.lastMessage.text}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Messages */}
                <Card className="border-gray-200 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSessionId ? (
                      <div className="flex flex-col h-[460px]">
                        <div className="flex-1 overflow-y-auto space-y-3 p-2 border rounded">
                          {chatMessages.length === 0 && (
                            <p className="text-sm text-gray-600 p-2">No messages yet.</p>
                          )}
                          {chatMessages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded px-3 py-2 text-sm ${m.sender === 'support' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                                <div>{m.text}</div>
                                {!!m.timestamp && <div className="text-[10px] opacity-70 mt-1">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                        <form
                          className="mt-3 flex gap-2"
                          onSubmit={async (e) => {
                            e.preventDefault()
                            if (!chatInput.trim() || isSendingChat || !selectedSessionId) return
                            setIsSendingChat(true)
                            try {
                              await apiService.chat.adminReply({ sessionId: selectedSessionId, text: chatInput })
                              setChatInput('')
                              // Reload messages after sending reply
                              const thread = await apiService.chat.fetchThread(selectedSessionId)
                              setChatMessages(thread.messages || [])
                              toast.success('Reply sent successfully')
                            } catch (error: any) {
                              console.error('Failed to send reply:', error)
                              toast.error(error?.message || 'Failed to send reply')
                            } finally {
                              setIsSendingChat(false)
                            }
                          }}
                        >
                          <Input
                            placeholder="Type your reply..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                          />
                          <Button type="submit" disabled={!chatInput.trim() || isSendingChat} className="bg-black text-white hover:bg-gray-800">
                            Send
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Select a conversation to view messages.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Add Product Modal */}
    <Dialog open={addProductModal} onOpenChange={(open:any) => {
      setAddProductModal(open)
      if (!open) {
        // Clean up image previews when modal closes
        productImages.forEach(img => {
          if (img.preview) {
            URL.revokeObjectURL(img.preview)
          }
        })
        setProductImages([])
        setCategoryInput('')
        setSelectedCategoryId(null)
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the product details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={newProductForm.name}
              onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={newProductForm.description}
              onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
              placeholder="Enter product description"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              value={newProductForm.short_description}
              onChange={(e) => setNewProductForm({...newProductForm, short_description: e.target.value})}
              placeholder="Enter short description"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newProductForm.price}
                onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                value={newProductForm.original_price}
                onChange={(e) => setNewProductForm({...newProductForm, original_price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={newProductForm.cost_price}
                onChange={(e) => setNewProductForm({...newProductForm, cost_price: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Category Autocomplete */}
            <div className="space-y-2">
              <Label htmlFor="categorySuggest">Category *</Label>
              <div className="relative">
                <Input
                  id="categorySuggest"
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value)
                    setShowCategorySuggestions(true)
                    setSelectedCategoryId(null)
                  }}
                  onFocus={() => setShowCategorySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                  placeholder="Enter or select category"
                  className="h-10 sm:h-11 text-sm sm:text-base"
                  autoComplete="off"
                />
                {/* Enhanced suggestions dropdown */}
                {categoryInput && showCategorySuggestions && (
                  <div className="absolute z-[9999] mt-1 sm:mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 sm:max-h-48 overflow-auto">
                    {categories
                      .filter(c => (c.name || '').toLowerCase().includes(categoryInput.toLowerCase()))
                      .slice(0, 6)
                      .map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCategoryInput(c.name)
                            setSelectedCategoryId(c.id)
                            setShowCategorySuggestions(false)
                          }}
                          className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 sm:gap-3 transition-colors"
                        >
                          <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <span className="text-xs sm:text-sm">{c.name}</span>
                        </button>
                      ))}
                    {categories.filter(c => (c.name || '').toLowerCase().includes(categoryInput.toLowerCase())).length === 0 && (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm flex items-center gap-2 sm:gap-3 text-slate-600">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">No matches found for "{categoryInput}". Will create new category.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={newProductForm.weight}
                onChange={(e) => setNewProductForm({...newProductForm, weight: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={newProductForm.stock_quantity}
                onChange={(e) => setNewProductForm({...newProductForm, stock_quantity: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Min Stock Level</Label>
              <Input
                id="min_stock_level"
                type="number"
                value={newProductForm.min_stock_level}
                onChange={(e) => setNewProductForm({...newProductForm, min_stock_level: e.target.value})}
                placeholder="5"
              />
            </div>
          </div>
          
          {/* Size Selection - Show based on category */}
          {(() => {
            const categoryLower = categoryInput.toLowerCase()
            const isShoes = categoryLower.includes('shoe')
            const isClothes = categoryLower.includes('cloth') || categoryLower.includes('apparel') || categoryLower.includes('fashion')
            return isShoes || isClothes
          })() && (
            <div className="space-y-2">
              <Label>Select Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {categoryInput.toLowerCase().includes('shoe') ? (
                  // Shoe sizes (numeric)
                  Array.from({ length: 20 }, (_, i) => {
                    const size = (35 + i).toString() // Sizes from 35 to 54
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSizes(prev => 
                            prev.includes(size) 
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          )
                        }}
                        className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                          selectedSizes.includes(size)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })
                ) : (
                  // Clothes sizes (XS, S, M, L, XL, XXL)
                  ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSizes(prev => 
                          prev.includes(size) 
                            ? prev.filter(s => s !== size)
                            : [...prev, size]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))
                )}
              </div>
              {selectedSizes.length > 0 && (
                <p className="text-sm text-gray-600">Selected: {selectedSizes.join(', ')}</p>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={newProductForm.is_active}
                onChange={(e) => setNewProductForm({...newProductForm, is_active: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={newProductForm.is_featured}
                onChange={(e) => setNewProductForm({...newProductForm, is_featured: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_digital"
                checked={newProductForm.is_digital}
                onChange={(e) => setNewProductForm({...newProductForm, is_digital: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="is_digital">Digital Product</Label>
            </div>
          </div>
          
          {/* Product Images */}
          {true && (
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="product-images"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length === 0) return
                    
                    setUploadingImages(true)
                    try {
                      const uploadPromises = files.map(async (file, fileIndex) => {
                        // Create preview
                        const preview = URL.createObjectURL(file)
                        
                        // Upload to server
                        const uploadedFile = await apiService.adminMedia.upload(file, 'products', 'product_image')
                        
                        return {
                          url: uploadedFile.secure_url || uploadedFile.url,
                          alt_text: newProductForm.name || file.name,
                          is_primary: productImages.length === 0 && fileIndex === 0, // First image of first batch is primary
                          preview,
                        }
                      })
                      
                      const uploadedImages = await Promise.all(uploadPromises)
                      setProductImages([...productImages, ...uploadedImages])
                      toast.success(`${uploadedImages.length} image(s) uploaded successfully`)
                    } catch (error: any) {
                      console.error('Failed to upload images:', error)
                      toast.error(error?.message || 'Failed to upload images')
                    } finally {
                      setUploadingImages(false)
                      // Reset input
                      e.target.value = ''
                    }
                  }}
                  disabled={uploadingImages || isSubmittingProduct}
                />
                <label
                  htmlFor="product-images"
                  className={`flex flex-col items-center justify-center cursor-pointer ${uploadingImages || isSubmittingProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {uploadingImages ? 'Uploading...' : 'Click to upload images or drag and drop'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                </label>
                
                {/* Image Preview Grid */}
                {productImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {productImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview || image.url}
                          alt={image.alt_text || `Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = productImages.filter((_, i) => i !== index)
                            // Update primary flag if needed
                            if (image.is_primary && newImages.length > 0) {
                              newImages[0].is_primary = true
                            }
                            setProductImages(newImages)
                            if (image.preview) {
                              URL.revokeObjectURL(image.preview)
                            }
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isSubmittingProduct || uploadingImages}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {image.is_primary && (
                          <div className="absolute bottom-1 left-1 bg-black text-white text-xs px-1 rounded">
                            Primary
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = productImages.map((img, i) => ({
                              ...img,
                              is_primary: i === index,
                            }))
                            setProductImages(newImages)
                          }}
                          className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isSubmittingProduct || uploadingImages}
                        >
                          Set Primary
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setAddProductModal(false)}
              disabled={isSubmittingProduct || uploadingImages}
            >
              Cancel
            </Button>
            <Button 
              className="bg-black text-white hover:bg-gray-800" 
              onClick={handleAddProduct}
              disabled={isSubmittingProduct || uploadingImages}
            >
              {uploadingImages ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Uploading Images...
                </>
              ) : isSubmittingProduct ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* View Product Modal */}
    <Dialog open={viewProductModal} onOpenChange={setViewProductModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            View product information and details
          </DialogDescription>
        </DialogHeader>
        {selectedProduct && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">Product Name</Label>
                <p className="text-lg font-semibold mt-1">{selectedProduct.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">SKU</Label>
                <p className="text-lg mt-1">{selectedProduct.sku || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Category</Label>
                <p className="text-lg mt-1">{selectedProduct.category?.name || 'Uncategorized'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Brand</Label>
                <p className="text-lg mt-1">{selectedProduct.brand?.name || 'No brand'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Price</Label>
                <p className="text-lg font-semibold mt-1">${selectedProduct.price}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Stock Quantity</Label>
                <p className="text-lg mt-1">{selectedProduct.stock_quantity || 0}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">
                  <Badge className={selectedProduct.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Stock Status</Label>
                <div className="mt-1">
                  <Badge className={selectedProduct.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {selectedProduct.description && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProduct.description}</p>
              </div>
            )}
            
            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">Product Images</Label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.images.map((image: any, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={image.image_url || image.url}
                        alt={image.alt_text || selectedProduct.name}
                        className="w-full h-32 object-cover rounded border"
                      />
                      {image.is_primary && (
                        <Badge className="absolute top-1 left-1 bg-black text-white text-xs">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setViewProductModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Edit Product Modal */}
    <Dialog open={editProductModal} onOpenChange={setEditProductModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        {selectedProduct && (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={editProductForm.name || ''}
                onChange={(e) => setEditProductForm({...editProductForm, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editProductForm.description || ''}
                onChange={(e) => setEditProductForm({...editProductForm, description: e.target.value})}
                placeholder="Enter product description"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-short-description">Short Description</Label>
              <Textarea
                id="edit-short-description"
                value={editProductForm.short_description || ''}
                onChange={(e) => setEditProductForm({...editProductForm, short_description: e.target.value})}
                placeholder="Enter short description"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editProductForm.price || ''}
                  onChange={(e) => setEditProductForm({...editProductForm, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-original-price">Original Price</Label>
                <Input
                  id="edit-original-price"
                  type="number"
                  step="0.01"
                  value={editProductForm.original_price || ''}
                  onChange={(e) => setEditProductForm({...editProductForm, original_price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost-price">Cost Price</Label>
                <Input
                  id="edit-cost-price"
                  type="number"
                  step="0.01"
                  value={editProductForm.cost_price || ''}
                  onChange={(e) => setEditProductForm({...editProductForm, cost_price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editProductForm.stock_quantity || ''}
                  onChange={(e) => setEditProductForm({...editProductForm, stock_quantity: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-min-stock">Min Stock Level</Label>
                <Input
                  id="edit-min-stock"
                  type="number"
                  value={editProductForm.min_stock_level || ''}
                  onChange={(e) => setEditProductForm({...editProductForm, min_stock_level: e.target.value})}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-weight">Weight (kg)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.01"
                  value={editProductForm.weight || ''}
                  onChange={(e) => setEditProductForm({...editProductForm, weight: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={editProductForm.category_id?.toString() || ''} 
                  onValueChange={(value: string) => setEditProductForm({...editProductForm, category_id: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand</Label>
                <Select 
                  value={editProductForm.brand_id?.toString() || undefined} 
                  onValueChange={(value: string) => setEditProductForm({...editProductForm, brand_id: value === 'none' ? null : parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Size Selection - Show based on category */}
            {(() => {
              const selectedCategory = categories.find(c => c.id === editProductForm.category_id)
              const categoryName = selectedCategory?.name?.toLowerCase() || ''
              const isShoes = categoryName.includes('shoe')
              const isClothes = categoryName.includes('cloth') || categoryName.includes('apparel') || categoryName.includes('fashion')
              return isShoes || isClothes
            })() && (
              <div className="space-y-2">
                <Label>Select Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const selectedCategory = categories.find(c => c.id === editProductForm.category_id)
                    const categoryName = selectedCategory?.name?.toLowerCase() || ''
                    return categoryName.includes('shoe')
                  })() ? (
                    // Shoe sizes (numeric)
                    Array.from({ length: 20 }, (_, i) => {
                      const size = (35 + i).toString() // Sizes from 35 to 54
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setEditSelectedSizes(prev => 
                              prev.includes(size) 
                                ? prev.filter(s => s !== size)
                                : [...prev, size]
                            )
                          }}
                          className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                            editSelectedSizes.includes(size)
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })
                  ) : (
                    // Clothes sizes (XS, S, M, L, XL, XXL)
                    ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setEditSelectedSizes(prev => 
                            prev.includes(size) 
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          )
                        }}
                        className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                          editSelectedSizes.includes(size)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  )}
                </div>
                {editSelectedSizes.length > 0 && (
                  <p className="text-sm text-gray-600">Selected: {editSelectedSizes.join(', ')}</p>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={editProductForm.is_active ?? true}
                  onChange={(e) => setEditProductForm({...editProductForm, is_active: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-is-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-featured"
                  checked={editProductForm.is_featured ?? false}
                  onChange={(e) => setEditProductForm({...editProductForm, is_featured: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-is-featured">Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-digital"
                  checked={editProductForm.is_digital ?? false}
                  onChange={(e) => setEditProductForm({...editProductForm, is_digital: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-is-digital">Digital Product</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setEditProductModal(false)
                setEditSelectedSizes([]) // Reset sizes when closing
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-black text-white hover:bg-gray-800" 
                onClick={handleSaveProduct}
                disabled={isSubmittingProduct}
              >
                {isSubmittingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Delete Product Confirmation Modal */}
    <Dialog open={deleteProductModal} onOpenChange={setDeleteProductModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {productToDelete && (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-900">{productToDelete.name}</p>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete the product and all associated data.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteProductModal(false)
                  setProductToDelete(null)
                }}
                disabled={isDeletingProduct}
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                className="border-red-600 text-black hover:bg-red-50 hover:border-red-700" 
                onClick={confirmDeleteProduct}
                disabled={isDeletingProduct}
              >
                {isDeletingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2 inline-block"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* View Order Modal */}
    <Dialog open={viewOrderModal} onOpenChange={setViewOrderModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View complete order information
          </DialogDescription>
        </DialogHeader>
        {selectedOrder && (
          <div className="space-y-6 mt-4">
            {/* Order Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Order Number</Label>
                <p className="font-semibold text-lg">{selectedOrder.order_number || `#${selectedOrder.id}`}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Order Date</Label>
                <p className="font-semibold">
                  {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Name</Label>
                  <p>{selectedOrder.customer_name || selectedOrder.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p>{selectedOrder.customer_email || selectedOrder.user?.email || 'N/A'}</p>
                </div>
                {selectedOrder.customer_phone && (
                  <div>
                    <Label className="text-sm text-gray-500">Phone</Label>
                    <p>{selectedOrder.customer_phone}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Shipping Address */}
            {selectedOrder.shipping_address && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <p className="text-sm whitespace-pre-line">{selectedOrder.shipping_address}</p>
              </div>
            )}
            
            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      {item.product?.images?.[0]?.image_url && (
                        <img 
                          src={item.product.images[0].image_url} 
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {selectedOrder.currency || '$'}{(Number(item.total_price) || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedOrder.currency || '$'}{(Number(item.unit_price) || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{selectedOrder.currency || '$'}{(Number(selectedOrder.subtotal) || 0).toFixed(2)}</span>
                </div>
                {(Number(selectedOrder.discount_amount) || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span>-{selectedOrder.currency || '$'}{(Number(selectedOrder.discount_amount) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>{selectedOrder.currency || '$'}{(Number(selectedOrder.shipping_amount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>{selectedOrder.currency || '$'}{(Number(selectedOrder.tax_amount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{selectedOrder.currency || '$'}{(Number(selectedOrder.total_amount) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Order Status */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status || 'pending'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Payment Status</Label>
                  <Badge className={selectedOrder.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedOrder.is_paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
              </div>
              {selectedOrder.payment_method && (
                <div className="mt-2">
                  <Label className="text-sm text-gray-500">Payment Method</Label>
                  <p>{selectedOrder.payment_method}</p>
                </div>
              )}
            </div>
            
            {selectedOrder.notes && (
              <div className="border-t pt-4">
                <Label className="text-sm text-gray-500">Notes</Label>
                <p className="text-sm whitespace-pre-line">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Edit Order Status Modal */}
    <Dialog open={editOrderModal} onOpenChange={setEditOrderModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the status of this order
          </DialogDescription>
        </DialogHeader>
        {selectedOrder && (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">Order: {selectedOrder.order_number || `#${selectedOrder.id}`}</p>
              <p className="text-sm text-gray-600 mt-1">
                Customer: {selectedOrder.customer_name || selectedOrder.user?.name || 'N/A'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order-status">Order Status *</Label>
              <Select 
                value={editOrderForm.status || 'pending'} 
                onValueChange={(value: any) => setEditOrderForm({...editOrderForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditOrderModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-black text-white hover:bg-gray-800" 
                onClick={handleUpdateOrderStatus}
                disabled={isUpdatingOrderStatus}
              >
                {isUpdatingOrderStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Delete Order Confirmation Modal */}
    <Dialog open={deleteOrderModal} onOpenChange={setDeleteOrderModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {orderToDelete && (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-900">
                Order: {orderToDelete.order_number || `#${orderToDelete.id}`}
              </p>
              <p className="text-sm text-red-700 mt-1">
                Customer: {orderToDelete.customer_name || orderToDelete.user?.name || 'N/A'}
              </p>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete the order and all associated data.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteOrderModal(false)
                  setOrderToDelete(null)
                }}
                disabled={isDeletingOrder}
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                className="border-red-600 text-black hover:bg-red-50 hover:border-red-700" 
                onClick={confirmDeleteOrder}
                disabled={isDeletingOrder}
              >
                {isDeletingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2 inline-block"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Order'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* View Customer Modal */}
    <Dialog open={viewCustomerModal} onOpenChange={setViewCustomerModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            View complete customer information
          </DialogDescription>
        </DialogHeader>
        {selectedCustomer && (
          <div className="space-y-6 mt-4">
            {/* Customer Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Name</Label>
                <p className="font-semibold text-lg">{selectedCustomer.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="font-semibold">{selectedCustomer.email}</p>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Phone</Label>
                  <p>{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <Badge className={
                    selectedCustomer.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedCustomer.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedCustomer.status || 'active'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Joined Date</Label>
                  <p>{selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                {selectedCustomer.last_login_at && (
                  <div>
                    <Label className="text-sm text-gray-500">Last Login</Label>
                    <p>{new Date(selectedCustomer.last_login_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Statistics */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Total Orders</Label>
                  <p className="text-2xl font-bold">{selectedCustomer.total_orders || 0}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Total Spent</Label>
                  <p className="text-2xl font-bold">${(Number(selectedCustomer.total_spent) || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Recent Orders</h3>
                <div className="space-y-2">
                  {selectedCustomer.orders.map((order: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{order.order_number || `#${order.id}`}</p>
                        <p className="text-sm text-gray-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(Number(order.total_amount) || 0).toFixed(2)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Edit Customer Modal */}
    <Dialog open={editCustomerModal} onOpenChange={setEditCustomerModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information
          </DialogDescription>
        </DialogHeader>
        {selectedCustomer && (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customer-name">Name *</Label>
              <Input
                id="edit-customer-name"
                value={editCustomerForm.name || ''}
                onChange={(e) => setEditCustomerForm({...editCustomerForm, name: e.target.value})}
                placeholder="Customer name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-customer-email">Email *</Label>
              <Input
                id="edit-customer-email"
                type="email"
                value={editCustomerForm.email || ''}
                onChange={(e) => setEditCustomerForm({...editCustomerForm, email: e.target.value})}
                placeholder="customer@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-customer-phone">Phone</Label>
              <Input
                id="edit-customer-phone"
                value={editCustomerForm.phone || ''}
                onChange={(e) => setEditCustomerForm({...editCustomerForm, phone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-customer-status">Status *</Label>
              <Select 
                value={editCustomerForm.status || 'active'} 
                onValueChange={(value: any) => setEditCustomerForm({...editCustomerForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditCustomerModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-black text-white hover:bg-gray-800" 
                onClick={handleUpdateCustomer}
                disabled={isUpdatingCustomer}
              >
                {isUpdatingCustomer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Updating...
                  </>
                ) : (
                  'Update Customer'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {/* Delete Customer Confirmation Modal */}
    <Dialog open={deleteCustomerModal} onOpenChange={setDeleteCustomerModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this customer? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {customerToDelete && (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-900">{customerToDelete.name}</p>
              <p className="text-sm text-red-700 mt-1">
                Email: {customerToDelete.email}
              </p>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete the customer account. Customers with existing orders cannot be deleted.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteCustomerModal(false)
                  setCustomerToDelete(null)
                }}
                disabled={isDeletingCustomer}
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                className="border-red-600 text-black hover:bg-red-50 hover:border-red-700" 
                onClick={confirmDeleteCustomer}
                disabled={isDeletingCustomer}
              >
                {isDeletingCustomer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2 inline-block"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Customer'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>
)
}