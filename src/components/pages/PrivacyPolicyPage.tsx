import React, { useEffect, useState } from 'react'
import { Shield, Lock, Eye, FileText, Edit, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function PrivacyPolicyPage() {
  const { user } = useAppContext()
  const isSuperAdmin = user?.roles?.some?.((r: any) => String(r.slug || r.name || r) === 'super-admin')
  
  const [privacyData, setPrivacyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<any>({
    introduction_paragraph_1: '',
    introduction_paragraph_2: '',
    information_collect_personal_intro: '',
    information_collect_personal_items: [],
    information_collect_personal_details: '',
    information_collect_automatic: '',
    how_we_use_intro: '',
    how_we_use_items: [],
    information_sharing_intro: '',
    information_sharing_items: [],
    data_security_paragraph_1: '',
    data_security_paragraph_2: '',
    your_rights_intro: '',
    your_rights_items: [],
    your_rights_contact: '',
    cookies_paragraph_1: '',
    cookies_paragraph_2: '',
    children_privacy: '',
    changes_policy: '',
    contact_intro: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
  })

  useEffect(() => {
    loadPrivacyInfo()
  }, [])

  // Initialize form with current data from database
  const initializeEditForm = (data: any) => {
    setEditForm({
      introduction_paragraph_1: data.introduction_paragraph_1 || '',
      introduction_paragraph_2: data.introduction_paragraph_2 || '',
      information_collect_personal_intro: data.information_collect_personal_intro || '',
      information_collect_personal_items: data.information_collect_personal_items || [],
      information_collect_personal_details: data.information_collect_personal_details || '',
      information_collect_automatic: data.information_collect_automatic || '',
      how_we_use_intro: data.how_we_use_intro || '',
      how_we_use_items: data.how_we_use_items || [],
      information_sharing_intro: data.information_sharing_intro || '',
      information_sharing_items: data.information_sharing_items || [],
      data_security_paragraph_1: data.data_security_paragraph_1 || '',
      data_security_paragraph_2: data.data_security_paragraph_2 || '',
      your_rights_intro: data.your_rights_intro || '',
      your_rights_items: data.your_rights_items || [],
      your_rights_contact: data.your_rights_contact || '',
      cookies_paragraph_1: data.cookies_paragraph_1 || '',
      cookies_paragraph_2: data.cookies_paragraph_2 || '',
      children_privacy: data.children_privacy || '',
      changes_policy: data.changes_policy || '',
      contact_intro: data.contact_intro || '',
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      contact_address: data.contact_address || '',
    })
  }

  const loadPrivacyInfo = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.privacyInfo.get()
      const data = response.data || response
      setPrivacyData(data)
      initializeEditForm(data)
    } catch (error) {
      console.error('Failed to load privacy info:', error)
      toast.error('Failed to load privacy information')
    } finally {
      setIsLoading(false)
    }
  }

  // When edit modal opens, reload current data into form
  useEffect(() => {
    if (isEditModalOpen && privacyData) {
      initializeEditForm(privacyData)
    }
  }, [isEditModalOpen])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await apiService.privacyInfo.update(editForm)
      toast.success('Privacy information updated successfully!')
      setIsEditModalOpen(false)
      loadPrivacyInfo()
    } catch (error: any) {
      console.error('Failed to update privacy info:', error)
      toast.error(error?.message || 'Failed to update privacy information')
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

  const updateSharingItem = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...(editForm.information_sharing_items || [])]
    updated[index] = { ...updated[index], [field]: value }
    setEditForm({ ...editForm, information_sharing_items: updated })
  }

  const addSharingItem = () => {
    setEditForm({
      ...editForm,
      information_sharing_items: [...(editForm.information_sharing_items || []), { title: '', description: '' }]
    })
  }

  const removeSharingItem = (index: number) => {
    const updated = (editForm.information_sharing_items || []).filter((_: any, i: number) => i !== index)
    setEditForm({ ...editForm, information_sharing_items: updated })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading privacy information...</p>
        </div>
      </div>
    )
  }

  const data = privacyData || editForm

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {isSuperAdmin && (
          <Button
            onClick={() => {
              if (privacyData) {
                initializeEditForm(privacyData)
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
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {data.introduction_paragraph_1 || 'At Rovin, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.'}
            </p>
            <p className="text-gray-700">
              {data.introduction_paragraph_2 || 'By using our website, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our services.'}
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p className="text-gray-700 mb-2">
                {data.information_collect_personal_intro || 'We may collect personal information that you voluntarily provide to us when you:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                {(data.information_collect_personal_items || []).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700 mt-3">
                {data.information_collect_personal_details || 'This information may include your name, email address, phone number, shipping address, billing information, and payment details.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
              <p className="text-gray-700">
                {data.information_collect_automatic || 'When you visit our website, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {data.how_we_use_intro || 'We use the information we collect for various purposes, including:'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              {(data.how_we_use_items || []).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Information Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {data.information_sharing_intro || 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:'}
            </p>
            <div className="space-y-3">
              {(data.information_sharing_items || []).map((item: any, index: number) => (
                <div key={index}>
                  <h3 className="font-semibold mb-1">{item.title || ''}</h3>
                  <p className="text-gray-700">{item.description || ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {data.data_security_paragraph_1 || 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.'}
            </p>
            <p className="text-gray-700">
              {data.data_security_paragraph_2 || 'We use SSL encryption to protect sensitive information transmitted online and maintain secure servers for storing your data.'}
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {data.your_rights_intro || 'Depending on your location, you may have certain rights regarding your personal information, including:'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              {(data.your_rights_items || []).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-gray-700 mt-4">
              {data.your_rights_contact || 'To exercise these rights, please contact us at '}
              {data.your_rights_contact && data.contact_email && (
                <a href={`mailto:${data.contact_email}`} className="text-black underline">{data.contact_email}</a>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {data.cookies_paragraph_1 || 'We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'}
            </p>
            <p className="text-gray-700">
              {data.cookies_paragraph_2 || 'However, if you do not accept cookies, you may not be able to use some portions of our website.'}
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              {data.children_privacy || 'Our services are not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.'}
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              {data.changes_policy || 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.'}
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              {data.contact_intro || 'If you have any questions about this Privacy Policy, please contact us:'}
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> {data.contact_email && <a href={`mailto:${data.contact_email}`} className="text-black underline">{data.contact_email}</a>}</p>
              <p><strong>Phone:</strong> {data.contact_phone && <a href={`tel:${data.contact_phone}`} className="text-black underline">{data.contact_phone}</a>}</p>
              <p><strong>Address:</strong> {data.contact_address || ''}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Privacy Policy</DialogTitle>
            <DialogDescription>
              Update the privacy policy content that will be displayed to users.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Introduction */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Introduction</Label>
              <div className="space-y-3">
                <div>
                  <Label>Paragraph 1</Label>
                  <Textarea
                    value={editForm.introduction_paragraph_1 || ''}
                    onChange={(e) => setEditForm({ ...editForm, introduction_paragraph_1: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <Textarea
                    value={editForm.introduction_paragraph_2 || ''}
                    onChange={(e) => setEditForm({ ...editForm, introduction_paragraph_2: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Information We Collect */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Information We Collect</Label>
              <div className="space-y-3">
                <div>
                  <Label>Personal Information Intro</Label>
                  <Textarea
                    value={editForm.information_collect_personal_intro || ''}
                    onChange={(e) => setEditForm({ ...editForm, information_collect_personal_intro: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Personal Information Items</Label>
                    <Button variant="outline" size="sm" onClick={() => addArrayItem('information_collect_personal_items')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editForm.information_collect_personal_items || []).map((item: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('information_collect_personal_items', index, e.target.value)}
                          placeholder="e.g., Register for an account"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('information_collect_personal_items', index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Personal Information Details</Label>
                  <Textarea
                    value={editForm.information_collect_personal_details || ''}
                    onChange={(e) => setEditForm({ ...editForm, information_collect_personal_details: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Automatically Collected Information</Label>
                  <Textarea
                    value={editForm.information_collect_automatic || ''}
                    onChange={(e) => setEditForm({ ...editForm, information_collect_automatic: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">How We Use Your Information</Label>
              <div className="space-y-3">
                <div>
                  <Label>Intro</Label>
                  <Textarea
                    value={editForm.how_we_use_intro || ''}
                    onChange={(e) => setEditForm({ ...editForm, how_we_use_intro: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Items</Label>
                    <Button variant="outline" size="sm" onClick={() => addArrayItem('how_we_use_items')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editForm.how_we_use_items || []).map((item: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('how_we_use_items', index, e.target.value)}
                          placeholder="e.g., To process and fulfill your orders"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('how_we_use_items', index)}
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

            {/* Information Sharing */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Information Sharing and Disclosure</Label>
              <div className="space-y-3">
                <div>
                  <Label>Intro</Label>
                  <Textarea
                    value={editForm.information_sharing_intro || ''}
                    onChange={(e) => setEditForm({ ...editForm, information_sharing_intro: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Sharing Items</Label>
                    <Button variant="outline" size="sm" onClick={addSharingItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(editForm.information_sharing_items || []).map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Item {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSharingItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={item.title || ''}
                          onChange={(e) => updateSharingItem(index, 'title', e.target.value)}
                          placeholder="Title"
                        />
                        <Textarea
                          value={item.description || ''}
                          onChange={(e) => updateSharingItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Data Security</Label>
              <div className="space-y-3">
                <div>
                  <Label>Paragraph 1</Label>
                  <Textarea
                    value={editForm.data_security_paragraph_1 || ''}
                    onChange={(e) => setEditForm({ ...editForm, data_security_paragraph_1: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <Textarea
                    value={editForm.data_security_paragraph_2 || ''}
                    onChange={(e) => setEditForm({ ...editForm, data_security_paragraph_2: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Your Rights</Label>
              <div className="space-y-3">
                <div>
                  <Label>Intro</Label>
                  <Textarea
                    value={editForm.your_rights_intro || ''}
                    onChange={(e) => setEditForm({ ...editForm, your_rights_intro: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Rights Items</Label>
                    <Button variant="outline" size="sm" onClick={() => addArrayItem('your_rights_items')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editForm.your_rights_items || []).map((item: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('your_rights_items', index, e.target.value)}
                          placeholder="e.g., The right to access your personal information"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('your_rights_items', index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Contact Text</Label>
                  <Textarea
                    value={editForm.your_rights_contact || ''}
                    onChange={(e) => setEditForm({ ...editForm, your_rights_contact: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Cookies and Tracking Technologies</Label>
              <div className="space-y-3">
                <div>
                  <Label>Paragraph 1</Label>
                  <Textarea
                    value={editForm.cookies_paragraph_1 || ''}
                    onChange={(e) => setEditForm({ ...editForm, cookies_paragraph_1: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <Textarea
                    value={editForm.cookies_paragraph_2 || ''}
                    onChange={(e) => setEditForm({ ...editForm, cookies_paragraph_2: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Children's Privacy */}
            <div>
              <Label className="text-lg font-semibold mb-2 block">Children's Privacy</Label>
              <Textarea
                value={editForm.children_privacy || ''}
                onChange={(e) => setEditForm({ ...editForm, children_privacy: e.target.value })}
                rows={3}
              />
            </div>

            {/* Changes to Policy */}
            <div>
              <Label className="text-lg font-semibold mb-2 block">Changes to This Privacy Policy</Label>
              <Textarea
                value={editForm.changes_policy || ''}
                onChange={(e) => setEditForm({ ...editForm, changes_policy: e.target.value })}
                rows={3}
              />
            </div>

            {/* Contact Us */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Contact Us</Label>
              <div className="space-y-3">
                <div>
                  <Label>Intro</Label>
                  <Textarea
                    value={editForm.contact_intro || ''}
                    onChange={(e) => setEditForm({ ...editForm, contact_intro: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={editForm.contact_email || ''}
                      onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                      placeholder="mukunzidamus@gmail.com"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editForm.contact_phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                      placeholder="+971 58 841 5993"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={editForm.contact_address || ''}
                      onChange={(e) => setEditForm({ ...editForm, contact_address: e.target.value })}
                      placeholder="Dubai, United Arab Emirates"
                    />
                  </div>
                </div>
              </div>
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
