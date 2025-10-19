import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'

export function ThankYouPage() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const orderData = location?.state?.orderData

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Thank you for your purchase!</h1>
        <p className="text-gray-600 mt-2">Your order has been received and is being processed.</p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-2 text-sm">
            {orderData?.id && (
              <div className="flex justify-between">
                <span>Order Number</span>
                <span className="font-medium">{orderData.id}</span>
              </div>
            )}
            {orderData?.total && (
              <div className="flex justify-between">
                <span>Order Total</span>
                <span className="font-medium">${Number(orderData.total).toFixed(2)}</span>
              </div>
            )}
            {orderData?.payment_method && (
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-medium">{String(orderData.payment_method).toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white" onClick={() => navigate('/products')}>
              <ShoppingBag className="h-4 w-4 mr-2" /> Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





