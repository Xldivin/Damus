import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Truck, Check, Lock, MapPin, Smartphone, Building2, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'
import {
  useFlutterwave,
  closePaymentModal,
} from "flutterwave-react-v3"

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, setOrderHistory, orderHistory } = useAppContext()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United Arab Emirates'
  })
  
  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United Arab Emirates'
  })
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'flutterwave',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false
  })
  
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [guestCheckout, setGuestCheckout] = useState(true)
  const [rewardBalance, setRewardBalance] = useState<{ points: number; value_aed: number } | null>(null)
  const [applyPoints, setApplyPoints] = useState(false)

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.product?.effective_price || item.product?.price || 0)
    const quantity = Number(item.quantity || 0)
    return sum + (price * quantity)
  }, 0)
  const shippingCost = shippingMethod === 'express' ? 9.99 : shippingMethod === 'overnight' ? 19.99 : 0
  const tax = subtotal * 0.08
  const hasToken = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
  const maxRedeemablePoints = rewardBalance ? Math.min(
    rewardBalance.points,
    Math.floor(subtotal / 0.02)
  ) : 0
  const redeemValueAed = applyPoints && rewardBalance ? Number((maxRedeemablePoints * 0.02).toFixed(2)) : 0
  const total = subtotal + shippingCost + tax - redeemValueAed

  // Debug logging
  console.log('Checkout calculation debug:', {
    cartItems: cartItems.length,
    subtotal,
    shippingCost,
    tax,
    total,
    reward: { points: rewardBalance?.points ?? 0, value_aed: rewardBalance?.value_aed ?? 0, applyPoints, maxRedeemablePoints, redeemValueAed },
    cartItemsDetails: cartItems.map(item => ({
      id: item.productId,
      name: item.product?.name,
      price: item.product?.price,
      effective_price: item.product?.effective_price,
      quantity: item.quantity
    }))
  })

  // Flutterwave configuration
  const flutterwavePublicKey = import.meta.env?.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-24669363f4dc019d7ea80e8598bae4a0-X"

  const config = {
    public_key: flutterwavePublicKey,
    tx_ref: `tx-${Date.now()}`,
    amount: total,
    currency: "AED",
    payment_options: "card,ussd,banktransfer,mobilemoneyrw,mobilemoneygh,mobilemoneyuganda,mobilemoneyzambia",
    customer: {
      email: shippingInfo.email,
      phone_number: shippingInfo.phone,
      name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
    },
    meta: {
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
    },
    customizations: {
      title: "Order Payment",
      description: `Payment for your order (${paymentInfo.method === 'mobile' ? 'Mobile Money' : paymentInfo.method === 'bank' ? 'Bank Transfer' : 'Online Payment'})`,
      logo: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/flutter.svg",
    },
  }

  const handleFlutterPayment = useFlutterwave(config)

  // Load reward balance for authenticated users
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!hasToken) return
        const bal = await apiService.rewards.balance()
        if (!mounted) return
        setRewardBalance({ points: bal.points ?? 0, value_aed: bal.value_aed ?? 0 })
      } catch {}
    })()
    return () => { mounted = false }
  }, [hasToken])

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', time: '5-7 business days', cost: 0 },
    { id: 'express', name: 'Express Shipping', time: '2-3 business days', cost: 9.99 },
    { id: 'overnight', name: 'Overnight Shipping', time: '1 business day', cost: 19.99 }
  ]

  const handleShippingInfoChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleBillingInfoChange = (field: string, value: string | boolean) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentInfoChange = (field: string, value: string | boolean) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return shippingInfo.firstName && shippingInfo.lastName && shippingInfo.email && 
               shippingInfo.address && shippingInfo.city && shippingInfo.state && shippingInfo.zipCode
      case 2:
        return shippingMethod
      case 3:
        if (paymentInfo.method === 'credit') {
          return paymentInfo.cardNumber && paymentInfo.expiryMonth && paymentInfo.expiryYear && 
                 paymentInfo.cvv && paymentInfo.nameOnCard
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const createOrderFromPayment = async (paymentData: any) => {
    try {
      const getStringValue = (value: any): string => {
        if (Array.isArray(value)) {
          return value[0] || '';
        }
        return String(value || '');
      };
      
      const transactionId = getStringValue(paymentData.transaction_id);
      const flwRef = getStringValue(paymentData.flw_ref);
      
      const paymentReference = (transactionId && transactionId.trim()) || 
                              (flwRef && flwRef.trim()) || 
                              `FLW_${Date.now()}`;
      
      if (!paymentReference || typeof paymentReference !== 'string' || paymentReference.trim() === '') {
        throw new Error('Invalid payment reference generated');
      }
      
      // Build API payload
      const payload = {
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
        customer_email: shippingInfo.email,
        shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`.trim(),
        subtotal: Number(subtotal),
        tax_amount: Number(tax),
        shipping_amount: Number(shippingCost),
        total_amount: Number(total),
        currency: 'AED',
        payment_method: paymentInfo.method,
        points_redeemed: hasToken && applyPoints ? maxRedeemablePoints : 0,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          unit_price: Number(item.product?.effective_price || item.product?.price || 0),
          quantity: Number(item.quantity || 0),
          total_price: Number((item.product?.effective_price || item.product?.price || 0) * (item.quantity || 0)),
          size: item.product?.selectedSize || item.product?.size || item.product_options?.size || null
        }))
      }

      console.groupCollapsed('[Checkout] Order payload');
      console.log({ payload });
      console.groupEnd();

      // Call appropriate endpoint based on auth state from context
      const resp = hasToken
        ? await apiService.orders.createAuthOrder(payload)
        : await apiService.orders.createGuestCheckout(payload)

      // Clear cart session on server after order creation
      try {
        if (hasToken) {
          await apiService.cart.clearAuth()
        } else {
          await apiService.cart.clear()
        }
      } catch {}

      // Create local order summary for confirmation page
      const newOrderNumber = String(resp?.id || 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase())
      setOrderNumber(newOrderNumber)

      const newOrder = {
        id: newOrderNumber,
        date: new Date().toISOString(),
        items: cartItems,
        total: total,
        status: 'Processing',
        shippingInfo,
        paymentMethod: paymentInfo.method,
        paymentReference,
        transactionId: paymentData.transaction_id,
        flwRef: paymentData.flw_ref
      }

      setOrderHistory([newOrder, ...orderHistory])
      setOrderPlaced(true)

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please contact support.');
      throw error;
    }
  }

  const onPay = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Please complete all required information')
      return
    }
    
    try {
      console.groupCollapsed('[Checkout] Start payment');
      console.log('Totals', { subtotal, tax, shippingCost, applyPoints, redeemValueAed, total });
      console.log('Rewards', { hasToken, rewardBalance, maxRedeemablePoints });
      console.groupEnd();
      handleFlutterPayment({
        callback: async (response: any) => {
          console.log("Flutterwave response:", response);
          
          if (response.status === 'successful') {
            setIsProcessingPayment(true);
            
            try {
              const orderData = await createOrderFromPayment(response);
              toast.success(`Payment successful! Order created. Transaction ID: ${response.transaction_id}`);
              
              navigate('/thank-you', { 
                state: { 
                  orderData: {
                    ...orderData,
                    transaction_id: response.transaction_id,
                    payment_method: 'flutterwave'
                  }
                } 
              });
            } catch (error) {
              console.error('Error processing order:', error);
              toast.error('Payment successful but order creation failed. Please contact support.');
            } finally {
              setIsProcessingPayment(false);
            }
          } else {
            toast.error(`Payment failed: ${response.status}`);
          }
          
          closePaymentModal();
        },
        onClose: () => {
          console.log("Flutterwave modal closed");
          setIsProcessingPayment(false);
        },
      });
    } catch (error) {
      console.error('Flutterwave payment error:', error);
      toast.error('Payment failed to initialize. Please check your configuration.');
      setIsProcessingPayment(false);
    }
  }

  const placeOrder = () => {
    if (!validateStep(3)) {
      toast.error('Please complete all payment information')
      return
    }

    const newOrderNumber = 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase()
    setOrderNumber(newOrderNumber)
    
    const newOrder = {
      id: newOrderNumber,
      date: new Date().toISOString(),
      items: cartItems,
      total: total,
      status: 'Processing',
      shippingInfo,
      paymentMethod: paymentInfo.method
    }
    
    setOrderHistory([newOrder, ...orderHistory])
    setOrderPlaced(true)
    
    toast.success('Order placed successfully!')
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4" >
            No items to checkout
          </h2>
          <p className="text-gray-600 mb-8">
            Add some items to your cart first
          </p>
          <Button 
            onClick={() => navigate('/products')}
            className="bg-black text-white hover:bg-gray-800"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4" >
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-gray-600 mb-8">
            Your order number is <span className="font-semibold">{orderNumber}</span>
          </p>
          
          <Card className="max-w-md mx-auto mb-8 border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" >
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `AED ${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>AED {tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>AED {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              We'll send you shipping confirmation and tracking information to {shippingInfo.email}
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-black text-white hover:bg-gray-800"
              >
                View Order Status
              </Button>
              <Button 
                onClick={() => navigate('/products')}
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cart')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <div>
          <h1 className="text-3xl font-bold" >
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your purchase securely
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {[
            { step: 1, name: 'Shipping', icon: MapPin },
            { step: 2, name: 'Delivery', icon: Truck },
            { step: 3, name: 'Payment', icon: CreditCard }
          ].map(({ step, name, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`ml-3 font-medium ${
                currentStep >= step ? 'text-black' : 'text-gray-600'
              }`}>
                {name}
              </span>
              {step < 3 && <div className="w-16 h-px bg-gray-300 ml-8" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6" >
                  Shipping Information
                </h2>
                
                {/* Guest Checkout Option */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleShippingInfoChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleShippingInfoChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingInfoChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingInfoChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingInfoChange('address', e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="apartment">Apartment, suite, etc.</Label>
                    <Input
                      id="apartment"
                      value={shippingInfo.apartment}
                      onChange={(e) => handleShippingInfoChange('apartment', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleShippingInfoChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Emirate *</Label>
                    <Select value={shippingInfo.state} onValueChange={(value: string) => handleShippingInfoChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emirate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                        <SelectItem value="Dubai">Dubai</SelectItem>
                        <SelectItem value="Sharjah">Sharjah</SelectItem>
                        <SelectItem value="Ajman">Ajman</SelectItem>
                        <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                        <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                        <SelectItem value="Fujairah">Fujairah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleShippingInfoChange('zipCode', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={shippingInfo.country} onValueChange={(value: string) => handleShippingInfoChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping Method */}
          {currentStep === 2 && (
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6" >
                  Shipping Method
                </h2>
                
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  {shippingOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="font-medium">
                          {option.name}
                        </Label>
                        <p className="text-gray-600 text-sm">{option.time}</p>
                      </div>
                      <div className="font-semibold">
                        {option.cost === 0 ? 'FREE' : `AED ${option.cost}`}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">
                    Payment Method
                  </h2>
                  
                  <RadioGroup value={paymentInfo.method} onValueChange={(value: string | boolean) => handlePaymentInfoChange('method', value)}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="flutterwave" id="flutterwave" />
                      <Label htmlFor="flutterwave" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment (Flutterwave)
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentInfo.method === 'flutterwave' && (
                    <div className="mt-6 space-y-4 border rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Pay securely with your card through Flutterwave
                        </p>
                        <Button
                          onClick={onPay}
                          disabled={!validateStep(1) || !validateStep(2) || isProcessingPayment}
                          size="lg"
                          className="w-full"
                        >
                          {isProcessingPayment ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          {isProcessingPayment ? 'Processing...' : `Pay - AED ${total.toFixed(2)}`}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        <p>Supports: Visa, Mastercard, American Express</p>
                        </div>
                        </div>
                  )}

                  {paymentInfo.method === 'mobile' && (
                    <div className="mt-6 space-y-4 border rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Pay securely with Mobile Money through Flutterwave
                        </p>
                        <Button
                          onClick={onPay}
                          disabled={!validateStep(1) || !validateStep(2) || isProcessingPayment}
                          size="lg"
                          className="w-full"
                        >
                          {isProcessingPayment ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Smartphone className="h-4 w-4 mr-2" />
                          )}
                          {isProcessingPayment ? 'Processing...' : `Pay with Mobile Money - AED ${total.toFixed(2)}`}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        <p>Supports: MTN Mobile Money, Vodafone Cash, AirtelTigo Money</p>
                      </div>
                    </div>
                  )}

                  {paymentInfo.method === 'bank' && (
                    <div className="mt-6 space-y-4 border rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Pay securely with Bank Transfer through Flutterwave
                        </p>
                        <Button
                          onClick={onPay}
                          disabled={!validateStep(1) || !validateStep(2) || isProcessingPayment}
                          size="lg"
                          className="w-full"
                        >
                          {isProcessingPayment ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Building2 className="h-4 w-4 mr-2" />
                          )}
                          {isProcessingPayment ? 'Processing...' : `Pay with Bank Transfer - AED ${total.toFixed(2)}`}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        <p>Supports: USSD, Direct Bank Transfer, Online Banking</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4" >
                    Billing Address
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="sameAsShipping"
                      checked={billingInfo.sameAsShipping}
                      onCheckedChange={(checked: string | boolean) => handleBillingInfoChange('sameAsShipping', checked)}
                    />
                    <Label htmlFor="sameAsShipping">
                      Same as shipping address
                    </Label>
                  </div>

                  {!billingInfo.sameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Billing address fields would go here */}
                      <div className="md:col-span-2 text-gray-600 text-sm">
                        Billing address form would be here...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-black text-black hover:bg-black hover:text-white"
            >
              Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                className="bg-black text-white hover:bg-gray-800"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={onPay}
                disabled={!validateStep(1) || !validateStep(2) || isProcessingPayment}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {isProcessingPayment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                <Lock className="h-4 w-4 mr-2" />
                )}
                {isProcessingPayment ? 'Processing Payment...' : `Pay - AED ${total.toFixed(2)}`}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="border-gray-200 sticky top-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" >
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex space-x-3">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <p className="font-semibold text-sm">AED {((item.product?.effective_price || item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="mb-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>
                {hasToken && rewardBalance && rewardBalance.points > 0 && (
                  <div className="flex items-start justify-between py-2">
                    <div className="mr-3">
                      <label className="font-medium">Reward Points</label>
                      <div className="text-xs text-gray-600">You have {rewardBalance.points} pts (AED {rewardBalance.value_aed.toFixed(2)})</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="applyPoints" checked={applyPoints} onCheckedChange={(v: string | boolean) => setApplyPoints(!!v)} />
                      <Label htmlFor="applyPoints">Apply points</Label>
                    </div>
                  </div>
                )}
                {applyPoints && redeemValueAed > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Points discount ({maxRedeemablePoints} pts)</span>
                    <span>- AED {redeemValueAed.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `AED ${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>AED {tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>AED {total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center text-sm text-gray-600">
                <Lock className="h-4 w-4 mr-2" />
                Secure checkout powered by SSL encryption
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}