import React, { useEffect, useState } from 'react'
import { FileText, Scale, AlertCircle, CheckCircle, Edit, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function TermsOfServicePage() {
  const { user } = useAppContext()
  const isSuperAdmin = user?.roles?.some?.((r: any) => String(r.slug || r.name || r) === 'super-admin')
  
  const [termsData, setTermsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<any>({
    agreement_paragraph_1: '',
    agreement_paragraph_2: '',
    use_service_eligibility: '',
    use_service_account_registration: '',
    use_service_account_security: '',
    products_pricing_product_info: '',
    products_pricing_pricing: '',
    products_pricing_availability: '',
    orders_payment_order_acceptance: '',
    orders_payment_payment_terms: '',
    orders_payment_order_cancellation: '',
    shipping_delivery_paragraph_1: '',
    shipping_delivery_paragraph_2: '',
    returns_refunds_paragraph_1: '',
    returns_refunds_paragraph_2: '',
    prohibited_uses_intro: '',
    prohibited_uses_items: [],
    intellectual_property_paragraph_1: '',
    intellectual_property_paragraph_2: '',
    limitation_liability_paragraph_1: '',
    limitation_liability_paragraph_2: '',
    indemnification: '',
    governing_law: '',
    changes_terms_paragraph_1: '',
    changes_terms_paragraph_2: '',
    contact_intro: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
  })

  useEffect(() => {
    loadTermsInfo()
  }, [])

  // Initialize form with current data from database
  const initializeEditForm = (data: any) => {
    setEditForm({
      agreement_paragraph_1: data.agreement_paragraph_1 || '',
      agreement_paragraph_2: data.agreement_paragraph_2 || '',
      use_service_eligibility: data.use_service_eligibility || '',
      use_service_account_registration: data.use_service_account_registration || '',
      use_service_account_security: data.use_service_account_security || '',
      products_pricing_product_info: data.products_pricing_product_info || '',
      products_pricing_pricing: data.products_pricing_pricing || '',
      products_pricing_availability: data.products_pricing_availability || '',
      orders_payment_order_acceptance: data.orders_payment_order_acceptance || '',
      orders_payment_payment_terms: data.orders_payment_payment_terms || '',
      orders_payment_order_cancellation: data.orders_payment_order_cancellation || '',
      shipping_delivery_paragraph_1: data.shipping_delivery_paragraph_1 || '',
      shipping_delivery_paragraph_2: data.shipping_delivery_paragraph_2 || '',
      returns_refunds_paragraph_1: data.returns_refunds_paragraph_1 || '',
      returns_refunds_paragraph_2: data.returns_refunds_paragraph_2 || '',
      prohibited_uses_intro: data.prohibited_uses_intro || '',
      prohibited_uses_items: data.prohibited_uses_items || [],
      intellectual_property_paragraph_1: data.intellectual_property_paragraph_1 || '',
      intellectual_property_paragraph_2: data.intellectual_property_paragraph_2 || '',
      limitation_liability_paragraph_1: data.limitation_liability_paragraph_1 || '',
      limitation_liability_paragraph_2: data.limitation_liability_paragraph_2 || '',
      indemnification: data.indemnification || '',
      governing_law: data.governing_law || '',
      changes_terms_paragraph_1: data.changes_terms_paragraph_1 || '',
      changes_terms_paragraph_2: data.changes_terms_paragraph_2 || '',
      contact_intro: data.contact_intro || '',
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      contact_address: data.contact_address || '',
    })
  }

  const loadTermsInfo = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.termsInfo.get()
      const data = response.data || response
      setTermsData(data)
      initializeEditForm(data)
    } catch (error) {
      console.error('Failed to load terms info:', error)
      toast.error('Failed to load terms information')
    } finally {
      setIsLoading(false)
    }
  }

  // When edit modal opens, reload current data into form
  useEffect(() => {
    if (isEditModalOpen && termsData) {
      initializeEditForm(termsData)
    }
  }, [isEditModalOpen])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await apiService.termsInfo.update(editForm)
      toast.success('Terms information updated successfully!')
      setIsEditModalOpen(false)
      loadTermsInfo()
    } catch (error: any) {
      console.error('Failed to update terms info:', error)
      toast.error(error?.message || 'Failed to update terms information')
    } finally {
      setIsSaving(false)
    }
  }

  // Helper functions for managing arrays in form
  const updateArrayItem = (field: string, index: number, value: string) => {
    const updated = [...(editForm[field] || [])]
    updated[index] = value
    setEditForm({ ...editForm, [field]: updated })
  }

  const addArrayItem = (field: string) => {
    setEditForm({
      ...editForm,
      [field]: [...(editForm[field] || []), '']
    })
  }

  const removeArrayItem = (field: string, index: number) => {
    const updated = (editForm[field] || []).filter((_: any, i: number) => i !== index)
    setEditForm({ ...editForm, [field]: updated })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
          <Scale className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {isSuperAdmin && (
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-0 right-0 bg-black text-white hover:bg-gray-800"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {/* Agreement to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.agreement_paragraph_1 && (
              <p className="text-gray-700">{termsData.agreement_paragraph_1}</p>
            )}
            {termsData?.agreement_paragraph_2 && (
              <p className="text-gray-700">{termsData.agreement_paragraph_2}</p>
            )}
          </CardContent>
        </Card>

        {/* Use of Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Use of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.use_service_eligibility && (
              <div>
                <h3 className="font-semibold mb-2">Eligibility</h3>
                <p className="text-gray-700">{termsData.use_service_eligibility}</p>
              </div>
            )}
            {termsData?.use_service_account_registration && (
              <div>
                <h3 className="font-semibold mb-2">Account Registration</h3>
                <p className="text-gray-700">{termsData.use_service_account_registration}</p>
              </div>
            )}
            {termsData?.use_service_account_security && (
              <div>
                <h3 className="font-semibold mb-2">Account Security</h3>
                <p className="text-gray-700">{termsData.use_service_account_security}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products and Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Products and Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.products_pricing_product_info && (
              <div>
                <h3 className="font-semibold mb-2">Product Information</h3>
                <p className="text-gray-700">{termsData.products_pricing_product_info}</p>
              </div>
            )}
            {termsData?.products_pricing_pricing && (
              <div>
                <h3 className="font-semibold mb-2">Pricing</h3>
                <p className="text-gray-700">{termsData.products_pricing_pricing}</p>
              </div>
            )}
            {termsData?.products_pricing_availability && (
              <div>
                <h3 className="font-semibold mb-2">Availability</h3>
                <p className="text-gray-700">{termsData.products_pricing_availability}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders and Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Orders and Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.orders_payment_order_acceptance && (
              <div>
                <h3 className="font-semibold mb-2">Order Acceptance</h3>
                <p className="text-gray-700">{termsData.orders_payment_order_acceptance}</p>
              </div>
            )}
            {termsData?.orders_payment_payment_terms && (
              <div>
                <h3 className="font-semibold mb-2">Payment Terms</h3>
                <p className="text-gray-700">{termsData.orders_payment_payment_terms}</p>
              </div>
            )}
            {termsData?.orders_payment_order_cancellation && (
              <div>
                <h3 className="font-semibold mb-2">Order Cancellation</h3>
                <p className="text-gray-700">{termsData.orders_payment_order_cancellation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping and Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping and Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.shipping_delivery_paragraph_1 && (
              <p className="text-gray-700">{termsData.shipping_delivery_paragraph_1}</p>
            )}
            {termsData?.shipping_delivery_paragraph_2 && (
              <p className="text-gray-700">{termsData.shipping_delivery_paragraph_2}</p>
            )}
          </CardContent>
        </Card>

        {/* Returns and Refunds */}
        <Card>
          <CardHeader>
            <CardTitle>Returns and Refunds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.returns_refunds_paragraph_1 && (
              <p className="text-gray-700">{termsData.returns_refunds_paragraph_1}</p>
            )}
            {termsData?.returns_refunds_paragraph_2 && (
              <p className="text-gray-700">{termsData.returns_refunds_paragraph_2}</p>
            )}
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.prohibited_uses_intro && (
              <p className="text-gray-700">{termsData.prohibited_uses_intro}</p>
            )}
            {termsData?.prohibited_uses_items && Array.isArray(termsData.prohibited_uses_items) && termsData.prohibited_uses_items.length > 0 && (
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                {termsData.prohibited_uses_items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.intellectual_property_paragraph_1 && (
              <p className="text-gray-700">{termsData.intellectual_property_paragraph_1}</p>
            )}
            {termsData?.intellectual_property_paragraph_2 && (
              <p className="text-gray-700">{termsData.intellectual_property_paragraph_2}</p>
            )}
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {termsData?.limitation_liability_paragraph_1 && (
              <p className="text-gray-700">{termsData.limitation_liability_paragraph_1}</p>
            )}
            {termsData?.limitation_liability_paragraph_2 && (
              <p className="text-gray-700">{termsData.limitation_liability_paragraph_2}</p>
            )}
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card>
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            {termsData?.indemnification && (
              <p className="text-gray-700">{termsData.indemnification}</p>
            )}
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            {termsData?.governing_law && (
              <p className="text-gray-700">{termsData.governing_law}</p>
            )}
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            {termsData?.changes_terms_paragraph_1 && (
              <p className="text-gray-700">{termsData.changes_terms_paragraph_1}</p>
            )}
            {termsData?.changes_terms_paragraph_2 && (
              <p className="text-gray-700 mt-4">{termsData.changes_terms_paragraph_2}</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {termsData?.contact_intro && (
              <p className="text-gray-700 mb-4">{termsData.contact_intro}</p>
            )}
            <div className="space-y-2 text-gray-700">
              {termsData?.contact_email && (
                <p><strong>Email:</strong> <a href={`mailto:${termsData.contact_email}`} className="text-black underline">{termsData.contact_email}</a></p>
              )}
              {termsData?.contact_phone && (
                <p><strong>Phone:</strong> <a href={`tel:${termsData.contact_phone.replace(/\s/g, '')}`} className="text-black underline">{termsData.contact_phone}</a></p>
              )}
              {termsData?.contact_address && (
                <p><strong>Address:</strong> {termsData.contact_address}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Terms of Service</DialogTitle>
            <DialogDescription>Update all content sections of the Terms of Service page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Agreement to Terms */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Agreement to Terms</h3>
              <div>
                <Label>Paragraph 1</Label>
                <Textarea
                  rows={3}
                  value={editForm.agreement_paragraph_1}
                  onChange={(e) => setEditForm({ ...editForm, agreement_paragraph_1: e.target.value })}
                />
              </div>
              <div>
                <Label>Paragraph 2</Label>
                <Textarea
                  rows={3}
                  value={editForm.agreement_paragraph_2}
                  onChange={(e) => setEditForm({ ...editForm, agreement_paragraph_2: e.target.value })}
                />
              </div>
            </div>

            {/* Use of Service */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Use of Service</h3>
              <div>
                <Label>Eligibility</Label>
                <Textarea
                  rows={3}
                  value={editForm.use_service_eligibility}
                  onChange={(e) => setEditForm({ ...editForm, use_service_eligibility: e.target.value })}
                />
              </div>
              <div>
                <Label>Account Registration</Label>
                <Textarea
                  rows={3}
                  value={editForm.use_service_account_registration}
                  onChange={(e) => setEditForm({ ...editForm, use_service_account_registration: e.target.value })}
                />
              </div>
              <div>
                <Label>Account Security</Label>
                <Textarea
                  rows={3}
                  value={editForm.use_service_account_security}
                  onChange={(e) => setEditForm({ ...editForm, use_service_account_security: e.target.value })}
                />
              </div>
            </div>

            {/* Products and Pricing */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Products and Pricing</h3>
              <div>
                <Label>Product Information</Label>
                <Textarea
                  rows={3}
                  value={editForm.products_pricing_product_info}
                  onChange={(e) => setEditForm({ ...editForm, products_pricing_product_info: e.target.value })}
                />
              </div>
              <div>
                <Label>Pricing</Label>
                <Textarea
                  rows={3}
                  value={editForm.products_pricing_pricing}
                  onChange={(e) => setEditForm({ ...editForm, products_pricing_pricing: e.target.value })}
                />
              </div>
              <div>
                <Label>Availability</Label>
                <Textarea
                  rows={3}
                  value={editForm.products_pricing_availability}
                  onChange={(e) => setEditForm({ ...editForm, products_pricing_availability: e.target.value })}
                />
              </div>
            </div>

            {/* Orders and Payment */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Orders and Payment</h3>
              <div>
                <Label>Order Acceptance</Label>
                <Textarea
                  rows={3}
                  value={editForm.orders_payment_order_acceptance}
                  onChange={(e) => setEditForm({ ...editForm, orders_payment_order_acceptance: e.target.value })}
                />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Textarea
                  rows={3}
                  value={editForm.orders_payment_payment_terms}
                  onChange={(e) => setEditForm({ ...editForm, orders_payment_payment_terms: e.target.value })}
                />
              </div>
              <div>
                <Label>Order Cancellation</Label>
                <Textarea
                  rows={3}
                  value={editForm.orders_payment_order_cancellation}
                  onChange={(e) => setEditForm({ ...editForm, orders_payment_order_cancellation: e.target.value })}
                />
              </div>
            </div>

            {/* Shipping and Delivery */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Shipping and Delivery</h3>
              <div>
                <Label>Paragraph 1</Label>
                <Textarea
                  rows={3}
                  value={editForm.shipping_delivery_paragraph_1}
                  onChange={(e) => setEditForm({ ...editForm, shipping_delivery_paragraph_1: e.target.value })}
                />
              </div>
              <div>
                <Label>Paragraph 2</Label>
                <Textarea
                  rows={3}
                  value={editForm.shipping_delivery_paragraph_2}
                  onChange={(e) => setEditForm({ ...editForm, shipping_delivery_paragraph_2: e.target.value })}
                />
              </div>
            </div>

            {/* Returns and Refunds */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Returns and Refunds</h3>
              <div>
                <Label>Paragraph 1</Label>
                <Textarea
                  rows={3}
                  value={editForm.returns_refunds_paragraph_1}
                  onChange={(e) => setEditForm({ ...editForm, returns_refunds_paragraph_1: e.target.value })}
                />
              </div>
              <div>
                <Label>Paragraph 2</Label>
                <Textarea
                  rows={3}
                  value={editForm.returns_refunds_paragraph_2}
                  onChange={(e) => setEditForm({ ...editForm, returns_refunds_paragraph_2: e.target.value })}
                />
              </div>
            </div>

            {/* Prohibited Uses */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Prohibited Uses</h3>
              <div>
                <Label>Introduction</Label>
                <Textarea
                  rows={2}
                  value={editForm.prohibited_uses_intro}
                  onChange={(e) => setEditForm({ ...editForm, prohibited_uses_intro: e.target.value })}
                />
              </div>
              <div>
                <Label>Prohibited Items</Label>
                {(editForm.prohibited_uses_items || []).map((item: string, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      rows={2}
                      value={item}
                      onChange={(e) => updateArrayItem('prohibited_uses_items', index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('prohibited_uses_items', index)}
                      className="mt-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('prohibited_uses_items')}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Intellectual Property</h3>
              <div>
                <Label>Paragraph 1</Label>
                <Textarea
                  rows={3}
                  value={editForm.intellectual_property_paragraph_1}
                  onChange={(e) => setEditForm({ ...editForm, intellectual_property_paragraph_1: e.target.value })}
                />
              </div>
              <div>
                <Label>Paragraph 2</Label>
                <Textarea
                  rows={3}
                  value={editForm.intellectual_property_paragraph_2}
                  onChange={(e) => setEditForm({ ...editForm, intellectual_property_paragraph_2: e.target.value })}
                />
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Limitation of Liability</h3>
              <div>
                <Label>Paragraph 1</Label>
                <Textarea
                  rows={3}
                  value={editForm.limitation_liability_paragraph_1}
                  onChange={(e) => setEditForm({ ...editForm, limitation_liability_paragraph_1: e.target.value })}
                />
              </div>
              <div>
                <Label>Paragraph 2</Label>
                <Textarea
                  rows={3}
                  value={editForm.limitation_liability_paragraph_2}
                  onChange={(e) => setEditForm({ ...editForm, limitation_liability_paragraph_2: e.target.value })}
                />
              </div>
            </div>

            {/* Indemnification */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Indemnification</h3>
              <div>
                <Label>Content</Label>
                <Textarea
                  rows={4}
                  value={editForm.indemnification}
                  onChange={(e) => setEditForm({ ...editForm, indemnification: e.target.value })}
                />
              </div>
            </div>

            {/* Governing Law */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Governing Law</h3>
              <div>
                <Label>Content</Label>
                <Textarea
                  rows={4}
                  value={editForm.governing_law}
                  onChange={(e) => setEditForm({ ...editForm, governing_law: e.target.value })}
                />
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-lg">Changes to Terms</h3>
              <div>
                <Label>Paragraph 1</Label>
                <Textarea
                  rows={3}
                  value={editForm.changes_terms_paragraph_1}
                  onChange={(e) => setEditForm({ ...editForm, changes_terms_paragraph_1: e.target.value })}
                />
              </div>
              <div>
                <Label>Paragraph 2</Label>
                <Textarea
                  rows={3}
                  value={editForm.changes_terms_paragraph_2}
                  onChange={(e) => setEditForm({ ...editForm, changes_terms_paragraph_2: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div>
                <Label>Introduction</Label>
                <Textarea
                  rows={2}
                  value={editForm.contact_intro}
                  onChange={(e) => setEditForm({ ...editForm, contact_intro: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editForm.contact_email}
                  onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editForm.contact_phone}
                  onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={editForm.contact_address}
                  onChange={(e) => setEditForm({ ...editForm, contact_address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
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
