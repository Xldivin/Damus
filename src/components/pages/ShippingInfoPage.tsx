import React, { useState, useEffect } from 'react'
import { Truck, Package, Clock, Shield, MapPin, Edit, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function ShippingInfoPage() {
  const { user } = useAppContext()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [shippingData, setShippingData] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>({
    shipping_options: [],
    delivery_info: {},
    processing_time: '',
    processing_time_items: [],
    international_shipping: '',
    shipping_protection: ''
  })

  const isSuperAdmin = user?.roles?.some?.((r: any) => 
    String(r.slug || r.name || r) === 'super-admin'
  )

  useEffect(() => {
    loadShippingInfo()
  }, [])

  // Initialize form with current data from database
  const initializeEditForm = (data: any) => {
    setEditForm({
      shipping_options: data.shipping_options || [
        { name: 'Standard Shipping', duration: '3-7 business days', price: 'Free', note: 'On orders over AED 50' },
        { name: 'Express Shipping', duration: '1-3 business days', price: 'AED 9.99', note: 'Available for all orders' },
        { name: 'Overnight Shipping', duration: 'Next business day', price: 'AED 19.99', note: 'Order before 2 PM' }
      ],
      delivery_info: data.delivery_info || {
        areas: 'We currently deliver to all major cities in the United Arab Emirates, including Dubai, Abu Dhabi, Sharjah, and surrounding areas.',
        tracking: 'Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package in real-time through our tracking system.',
        delivery_time: 'Delivery times are calculated from the moment your order is confirmed and payment is processed. Business days exclude weekends and public holidays.'
      },
      processing_time: data.processing_time || 'All orders are processed within 1-2 business days. Processing time begins after payment confirmation and does not include weekends or holidays.',
      processing_time_items: data.processing_time_items || [
        'Orders placed before 2 PM GST are processed the same day',
        'Orders placed after 2 PM GST are processed the next business day',
        'Custom or personalized items may require additional processing time'
      ],
      international_shipping: data.international_shipping || 'We currently offer international shipping to select countries. Shipping costs and delivery times vary by destination.\n\nFor international orders, customers are responsible for any customs duties, taxes, or fees that may apply. These charges are determined by your local customs office and are not included in the order total.',
      shipping_protection: data.shipping_protection || 'All orders are fully insured during transit. If your package is lost or damaged during shipping, please contact us immediately and we\'ll work to resolve the issue quickly.'
    })
  }

  const loadShippingInfo = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.shippingInfo.get()
      const data = response.data || response
      setShippingData(data)
      // Initialize form with current data
      initializeEditForm(data)
    } catch (error) {
      console.error('Failed to load shipping info:', error)
      toast.error('Failed to load shipping information')
    } finally {
      setIsLoading(false)
    }
  }

  // When edit modal opens, reload current data into form
  useEffect(() => {
    if (isEditModalOpen && shippingData) {
      initializeEditForm(shippingData)
    }
  }, [isEditModalOpen])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await apiService.shippingInfo.update(editForm)
      toast.success('Shipping information updated successfully!')
      setIsEditModalOpen(false)
      loadShippingInfo()
    } catch (error: any) {
      console.error('Failed to update shipping info:', error)
      toast.error(error?.message || 'Failed to update shipping information')
    } finally {
      setIsSaving(false)
    }
  }

  const updateShippingOption = (index: number, field: string, value: string) => {
    const updated = [...editForm.shipping_options]
    updated[index] = { ...updated[index], [field]: value }
    setEditForm({ ...editForm, shipping_options: updated })
  }

  const addShippingOption = () => {
    setEditForm({
      ...editForm,
      shipping_options: [...editForm.shipping_options, { name: '', duration: '', price: '', note: '' }]
    })
  }

  const removeShippingOption = (index: number) => {
    const updated = editForm.shipping_options.filter((_: any, i: number) => i !== index)
    setEditForm({ ...editForm, shipping_options: updated })
  }

  const updateProcessingTimeItem = (index: number, value: string) => {
    const updated = [...editForm.processing_time_items]
    updated[index] = value
    setEditForm({ ...editForm, processing_time_items: updated })
  }

  const addProcessingTimeItem = () => {
    setEditForm({
      ...editForm,
      processing_time_items: [...editForm.processing_time_items, '']
    })
  }

  const removeProcessingTimeItem = (index: number) => {
    const updated = editForm.processing_time_items.filter((_: any, i: number) => i !== index)
    setEditForm({ ...editForm, processing_time_items: updated })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading shipping information...</p>
        </div>
      </div>
    )
  }

  const data = shippingData || editForm

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 relative">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Shipping Information
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about our shipping policies and delivery options
        </p>
        {isSuperAdmin && (
          <Button
            onClick={() => {
              // Ensure form is populated with latest data before opening modal
              if (shippingData) {
                initializeEditForm(shippingData)
              }
              setIsEditModalOpen(true)
            }}
            className="absolute top-0 right-0 bg-black text-white hover:bg-gray-800"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
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
              {(data.shipping_options || []).map((option: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{option.name || 'Shipping Option'}</h3>
                  <p className="text-gray-600 text-sm mb-2">{option.duration || ''}</p>
                  <p className="text-2xl font-bold">{option.price || ''}</p>
                  {option.note && (
                    <p className="text-xs text-gray-500 mt-1">{option.note}</p>
                  )}
                </div>
              ))}
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
                {data.delivery_info?.areas || 'We currently deliver to all major cities in the United Arab Emirates, including Dubai, Abu Dhabi, Sharjah, and surrounding areas.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tracking Your Order</h3>
              <p className="text-gray-600">
                {data.delivery_info?.tracking || 'Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package in real-time through our tracking system.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Delivery Time</h3>
              <p className="text-gray-600">
                {data.delivery_info?.delivery_time || 'Delivery times are calculated from the moment your order is confirmed and payment is processed. Business days exclude weekends and public holidays.'}
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
              {data.processing_time || 'All orders are processed within 1-2 business days. Processing time begins after payment confirmation and does not include weekends or holidays.'}
            </p>
            <ul className="space-y-2 text-gray-600">
              {(data.processing_time_items || []).map((item: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
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
            <p className="text-gray-600 whitespace-pre-line">
              {data.international_shipping || 'We currently offer international shipping to select countries. Shipping costs and delivery times vary by destination.\n\nFor international orders, customers are responsible for any customs duties, taxes, or fees that may apply. These charges are determined by your local customs office and are not included in the order total.'}
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
              {data.shipping_protection || 'All orders are fully insured during transit. If your package is lost or damaged during shipping, please contact us immediately and we\'ll work to resolve the issue quickly.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shipping Information</DialogTitle>
            <DialogDescription>
              Update the shipping information content that will be displayed to customers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Shipping Options */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Shipping Options</Label>
                <Button variant="outline" size="sm" onClick={addShippingOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-4">
                {editForm.shipping_options.map((option: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Option {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShippingOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={option.name || ''}
                          onChange={(e) => updateShippingOption(index, 'name', e.target.value)}
                          placeholder="e.g., Standard Shipping"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={option.duration || ''}
                          onChange={(e) => updateShippingOption(index, 'duration', e.target.value)}
                          placeholder="e.g., 3-7 business days"
                        />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          value={option.price || ''}
                          onChange={(e) => updateShippingOption(index, 'price', e.target.value)}
                          placeholder="e.g., Free or AED 9.99"
                        />
                      </div>
                      <div>
                        <Label>Note</Label>
                        <Input
                          value={option.note || ''}
                          onChange={(e) => updateShippingOption(index, 'note', e.target.value)}
                          placeholder="e.g., On orders over AED 50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Delivery Information</Label>
              <div className="space-y-3">
                <div>
                  <Label>Delivery Areas</Label>
                  <Textarea
                    value={editForm.delivery_info?.areas || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      delivery_info: { ...editForm.delivery_info, areas: e.target.value }
                    })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tracking Information</Label>
                  <Textarea
                    value={editForm.delivery_info?.tracking || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      delivery_info: { ...editForm.delivery_info, tracking: e.target.value }
                    })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Delivery Time</Label>
                  <Textarea
                    value={editForm.delivery_info?.delivery_time || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      delivery_info: { ...editForm.delivery_info, delivery_time: e.target.value }
                    })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Processing Time */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Processing Time</Label>
              <div className="space-y-3">
                <div>
                  <Label>Main Description</Label>
                  <Textarea
                    value={editForm.processing_time || ''}
                    onChange={(e) => setEditForm({ ...editForm, processing_time: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Processing Time Items</Label>
                    <Button variant="outline" size="sm" onClick={addProcessingTimeItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editForm.processing_time_items.map((item: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateProcessingTimeItem(index, e.target.value)}
                          placeholder="e.g., Orders placed before 2 PM GST are processed the same day"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProcessingTimeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* International Shipping */}
            <div>
              <Label className="text-lg font-semibold mb-2 block">International Shipping</Label>
              <Textarea
                value={editForm.international_shipping || ''}
                onChange={(e) => setEditForm({ ...editForm, international_shipping: e.target.value })}
                rows={5}
                placeholder="Enter international shipping information..."
              />
            </div>

            {/* Shipping Protection */}
            <div>
              <Label className="text-lg font-semibold mb-2 block">Shipping Protection</Label>
              <Textarea
                value={editForm.shipping_protection || ''}
                onChange={(e) => setEditForm({ ...editForm, shipping_protection: e.target.value })}
                rows={3}
                placeholder="Enter shipping protection information..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-black text-white hover:bg-gray-800">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


