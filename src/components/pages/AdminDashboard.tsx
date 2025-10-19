import { useState } from 'react'
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  X,
  Star
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { mockProducts } from '../../App'
import { toast } from 'sonner'

export function AdminDashboard() {
  const { isAdmin } = useAppContext()
  
  const [activeTab, setActiveTab] = useState('overview')
  
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
  
  // Handle modal actions
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product)
    setViewProductModal(true)
  }
  
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product)
    setEditProductForm({...product})
    setEditProductModal(true)
  }
  
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setViewOrderModal(true)
  }
  
  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    setEditOrderForm({...order})
    setEditOrderModal(true)
  }
  
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setViewCustomerModal(true)
  }
  
  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setEditCustomerForm({...customer})
    setEditCustomerModal(true)
  }
  
  const handleSaveProduct = () => {
    toast.success('Product updated successfully!')
    setEditProductModal(false)
  }
  
  const handleAddProduct = () => {
    toast.success('Product added successfully!')
    setAddProductModal(false)
  }
  
  const handleSaveOrder = () => {
    toast.success('Order updated successfully!')
    setEditOrderModal(false)
  }
  
  const handleSaveCustomer = () => {
    toast.success('Customer updated successfully!')
    setEditCustomerModal(false)
  }

  // Mock data for admin dashboard
  const salesData = [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 135 },
    { month: 'Mar', revenue: 48000, orders: 125 },
    { month: 'Apr', revenue: 61000, orders: 160 },
    { month: 'May', revenue: 55000, orders: 145 },
    { month: 'Jun', revenue: 67000, orders: 175 }
  ]

  const categoryData = [
    { name: 'Laptops', value: 35, color: '#000000' },
    { name: 'Audio', value: 25, color: '#666666' },
    { name: 'Phones', value: 20, color: '#999999' },
    { name: 'Gaming', value: 15, color: '#CCCCCC' },
    { name: 'Other', value: 5, color: '#E5E5E5' }
  ]

  const recentOrders = [
    { id: 'ORD001', customer: 'John Doe', date: '2024-01-15', total: 1299.99, status: 'Shipped', items: 2 },
    { id: 'ORD002', customer: 'Jane Smith', date: '2024-01-15', total: 299.99, status: 'Processing', items: 1 },
    { id: 'ORD003', customer: 'Mike Johnson', date: '2024-01-14', total: 999.99, status: 'Delivered', items: 1 },
    { id: 'ORD004', customer: 'Sarah Wilson', date: '2024-01-14', total: 599.99, status: 'Pending', items: 3 },
    { id: 'ORD005', customer: 'Tom Brown', date: '2024-01-13', total: 199.99, status: 'Cancelled', items: 1 }
  ]

  const lowStockProducts = [
    { ...mockProducts[0], stock: 3 },
    { ...mockProducts[2], stock: 1 },
    { ...mockProducts[4], stock: 5 }
  ]

  const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', orders: 12, spent: 2499.99, joined: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 8, spent: 1899.99, joined: '2023-03-22' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', orders: 15, spent: 3299.99, joined: '2022-11-08' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', orders: 6, spent: 1299.99, joined: '2023-06-12' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', orders: 3, spent: 599.99, joined: '2023-09-05' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Pending':
        return 'bg-orange-100 text-orange-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" >
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your store and monitor performance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">$328,000</p>
                    <p className="text-sm text-green-600">↗ 12% from last month</p>
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
                    <p className="text-2xl font-bold">1,486</p>
                    <p className="text-sm text-green-600">↗ 8% from last month</p>
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
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-sm text-gray-600">5 out of stock</p>
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
                    <p className="text-2xl font-bold">12,437</p>
                    <p className="text-sm text-green-600">↗ 142 new this month</p>
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
                <CardTitle >Sales by Category</CardTitle>
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
                      {categoryData.map((entry, index) => (
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
                  <CardTitle >Recent Orders</CardTitle>
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
                  {recentOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-gray-600 text-sm">{order.customer}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${order.total}</p>
                        <p className="text-gray-600 text-sm">{order.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle >Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockProducts.map(product => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle >Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
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
                <CardTitle >Order Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
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
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="phones">Phones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setAddProductModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-0">
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
                  {mockProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-gray-600 text-sm">{product.brand}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
                        <Badge className={product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="spending">Top Spending</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>${customer.spent}</TableCell>
                      <TableCell>{customer.joined}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle >Banners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">Homepage Hero Banner</p>
                    <p className="text-gray-600 text-sm">Active until Jan 31</p>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Disable</Button>
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Banner
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle >Promotions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">Winter Sale - 20% Off</p>
                    <p className="text-gray-600 text-sm">542 uses • Expires Feb 1</p>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Disable</Button>
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Promotion
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle >Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">FAQ Section</p>
                    <p className="text-gray-600 text-sm">12 questions</p>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product View Modal */}
      <Dialog open={viewProductModal} onOpenChange={setViewProductModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle >Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                    <p className="text-gray-600">{selectedProduct.brand}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(selectedProduct.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold">${selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${selectedProduct.originalPrice}
                      </span>
                    )}
                  </div>
                  <Badge className={selectedProduct.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Specifications</h4>
                <ul className="space-y-1">
                  {selectedProduct.specifications?.map((spec: string, index: number) => (
                    <li key={index} className="text-gray-600">• {spec}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product ID</p>
                  <p className="font-medium">{selectedProduct.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Edit Modal */}
      <Dialog open={editProductModal} onOpenChange={setEditProductModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle >Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={editProductForm.name || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={editProductForm.brand || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, brand: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editProductForm.price || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={editProductForm.originalPrice || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, originalPrice: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={editProductForm.category || ''} onValueChange={(value: any) => setEditProductForm({...editProductForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laptops">Laptops</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                    <SelectItem value="Phones">Phones</SelectItem>
                    <SelectItem value="Wearables">Wearables</SelectItem>
                    <SelectItem value="Cameras">Cameras</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editProductForm.description || ''}
                  onChange={(e) => setEditProductForm({...editProductForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editProductForm.inStock || false}
                    onChange={(e) => setEditProductForm({...editProductForm, inStock: e.target.checked})}
                    className="rounded"
                  />
                  <span>In Stock</span>
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="outline" onClick={() => setEditProductModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct} className="bg-black text-white hover:bg-gray-800">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order View Modal */}
      <Dialog open={viewOrderModal} onOpenChange={setViewOrderModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle >Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Order Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <span className="ml-2 font-medium">{selectedOrder.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2">{selectedOrder.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Items:</span>
                      <span className="ml-2">{selectedOrder.items}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="ml-2 font-bold text-lg">${selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customer}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">customer@example.com</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>123 Main Street</p>
                  <p>Apartment 4B</p>
                  <p>New York, NY 10001</p>
                  <p>United States</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">Sample items for Order {selectedOrder.id}</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Product 1 × 1</span>
                      <span>$299.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product 2 × 1</span>
                      <span>$199.99</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>${selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Edit Modal */}
      <Dialog open={editOrderModal} onOpenChange={setEditOrderModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label>Order ID</Label>
                <Input value={selectedOrder.id} disabled />
              </div>
              <div>
                <Label>Customer</Label>
                <Input value={selectedOrder.customer} disabled />
              </div>
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select value={editOrderForm.status || ''} onValueChange={(value: any) => setEditOrderForm({...editOrderForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="total">Total Amount</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={editOrderForm.total || ''}
                  onChange={(e) => setEditOrderForm({...editOrderForm, total: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="items">Number of Items</Label>
                <Input
                  id="items"
                  type="number"
                  value={editOrderForm.items || ''}
                  onChange={(e) => setEditOrderForm({...editOrderForm, items: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="outline" onClick={() => setEditOrderModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveOrder} className="bg-black text-white hover:bg-gray-800">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer View Modal */}
      <Dialog open={viewCustomerModal} onOpenChange={setViewCustomerModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer ID:</span>
                      <span className="ml-2">{selectedCustomer.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Member Since:</span>
                      <span className="ml-2">{selectedCustomer.joined}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Purchase History</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="ml-2 font-bold text-lg">{selectedCustomer.orders}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="ml-2 font-bold text-lg text-green-600">${selectedCustomer.spent}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Average Order:</span>
                      <span className="ml-2">${(selectedCustomer.spent / selectedCustomer.orders).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Main Street, City, State 12345</p>
                  <p><strong>Preferred Contact:</strong> Email</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Recent Orders</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Order #ORD001</p>
                      <p className="text-sm text-gray-600">2024-01-15</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$299.99</p>
                      <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Order #ORD002</p>
                      <p className="text-sm text-gray-600">2024-01-10</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$599.99</p>
                      <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Edit Modal */}
      <Dialog open={editCustomerModal} onOpenChange={setEditCustomerModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle >Edit Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={editCustomerForm.name || ''}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={editCustomerForm.email || ''}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="totalSpent">Total Spent</Label>
                <Input
                  id="totalSpent"
                  type="number"
                  step="0.01"
                  value={editCustomerForm.spent || ''}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, spent: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="totalOrders">Total Orders</Label>
                <Input
                  id="totalOrders"
                  type="number"
                  value={editCustomerForm.orders || ''}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, orders: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="joinedDate">Joined Date</Label>
                <Input
                  id="joinedDate"
                  type="date"
                  value={editCustomerForm.joined || ''}
                  onChange={(e) => setEditCustomerForm({...editCustomerForm, joined: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="outline" onClick={() => setEditCustomerModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCustomer} className="bg-black text-white hover:bg-gray-800">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={addProductModal} onOpenChange={setAddProductModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new product to your store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="Enter brand name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptops">Laptops</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="phones">Phones</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="cameras">Cameras</SelectItem>
                    <SelectItem value="wearables">Wearables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originalPrice">Original Price ($)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl">Product Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="specifications">Specifications (one per line)</Label>
              <Textarea
                id="specifications"
                placeholder="Enter specifications separated by new lines"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded"
                />
                <span>In Stock</span>
              </label>
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" onClick={() => setAddProductModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="bg-black text-white hover:bg-gray-800">
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}