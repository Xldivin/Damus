import React from 'react'
import { Truck, Package, Clock, Shield, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function ShippingInfoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Shipping Information
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about our shipping policies and delivery options
        </p>
      </div>

      <div className="space-y-8">
        {/* Shipping Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Standard Shipping</h3>
                <p className="text-gray-600 text-sm mb-2">3-7 business days</p>
                <p className="text-2xl font-bold">Free</p>
                <p className="text-xs text-gray-500 mt-1">On orders over AED 50</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Express Shipping</h3>
                <p className="text-gray-600 text-sm mb-2">1-3 business days</p>
                <p className="text-2xl font-bold">AED 9.99</p>
                <p className="text-xs text-gray-500 mt-1">Available for all orders</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Overnight Shipping</h3>
                <p className="text-gray-600 text-sm mb-2">Next business day</p>
                <p className="text-2xl font-bold">AED 19.99</p>
                <p className="text-xs text-gray-500 mt-1">Order before 2 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Delivery Areas</h3>
              <p className="text-gray-600">
                We currently deliver to all major cities in the United Arab Emirates, including Dubai, Abu Dhabi, Sharjah, and surrounding areas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tracking Your Order</h3>
              <p className="text-gray-600">
                Once your order ships, you'll receive a tracking number via email. You can use this number to track your package in real-time through our tracking system.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Delivery Time</h3>
              <p className="text-gray-600">
                Delivery times are calculated from the moment your order is confirmed and payment is processed. Business days exclude weekends and public holidays.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              All orders are processed within 1-2 business days. Processing time begins after payment confirmation and does not include weekends or holidays.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Orders placed before 2 PM GST are processed the same day</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Orders placed after 2 PM GST are processed the next business day</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Custom or personalized items may require additional processing time</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* International Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              International Shipping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We currently offer international shipping to select countries. Shipping costs and delivery times vary by destination.
            </p>
            <p className="text-gray-600">
              For international orders, customers are responsible for any customs duties, taxes, or fees that may apply. These charges are determined by your local customs office and are not included in the order total.
            </p>
          </CardContent>
        </Card>

        {/* Shipping Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Shipping Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              All orders are fully insured during transit. If your package is lost or damaged during shipping, please contact us immediately and we'll work to resolve the issue quickly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

