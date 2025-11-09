import React from 'react'
import { RotateCcw, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

export function ReturnsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Returns & Refunds
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our hassle-free return policy ensures you're completely satisfied with your purchase
        </p>
      </div>

      <div className="space-y-8">
        {/* Return Policy Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Return Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">15-Day Return Window</h3>
                <p className="text-gray-600">
                  You have 15 days from the date of delivery to return any item for a full refund or exchange.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Free Return Shipping</h3>
                <p className="text-gray-600">
                  We offer free return shipping on all eligible returns. Simply initiate a return through your account or contact our support team.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Full Refund Guarantee</h3>
                <p className="text-gray-600">
                  Receive a full refund to your original payment method within 5-7 business days after we receive your return.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Return Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Items must be:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <span>In original, unworn condition with tags attached</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <span>In original packaging with all accessories included</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <span>Free from damage, stains, or signs of use</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <span>Accompanied by the original receipt or order confirmation</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Non-Returnable Items</h4>
                    <p className="text-sm text-yellow-800">
                      Personalized items, intimate apparel, and items marked as "Final Sale" cannot be returned. Please review product descriptions carefully before purchasing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Return */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              How to Return an Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Initiate Return</h3>
                  <p className="text-gray-600">
                    Log into your account and navigate to "My Orders". Select the item you wish to return and click "Return Item". Alternatively, contact our customer service team.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Print Return Label</h3>
                  <p className="text-gray-600">
                    Once your return is approved, you'll receive a prepaid return shipping label via email. Print the label and attach it to your package.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Package Your Item</h3>
                  <p className="text-gray-600">
                    Securely package the item in its original packaging (or suitable alternative) with all tags and accessories. Include the return form if provided.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ship Your Return</h3>
                  <p className="text-gray-600">
                    Drop off your package at any authorized shipping location. You'll receive email updates as your return is processed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receive Refund</h3>
                  <p className="text-gray-600">
                    Once we receive and inspect your return, we'll process your refund within 5-7 business days. You'll receive a confirmation email when the refund is complete.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Refund Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Refund Timeline</h3>
              <p className="text-gray-600 mb-3">
                Refunds are processed to your original payment method within 5-7 business days after we receive your return. The time it takes for the refund to appear in your account depends on your bank or credit card company.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Credit/Debit Cards</Badge>
                  <span className="text-sm text-gray-600">3-5 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">PayPal</Badge>
                  <span className="text-sm text-gray-600">1-2 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Bank Transfer</Badge>
                  <span className="text-sm text-gray-600">5-7 business days</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Exchange Policy</h3>
              <p className="text-gray-600">
                If you need a different size or color, you can request an exchange. Simply select "Exchange" when initiating your return and specify the desired item. Exchanges are subject to availability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


