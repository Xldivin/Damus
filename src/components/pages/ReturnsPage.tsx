import React, { useEffect, useState } from 'react'
import { RotateCcw, Clock, Package, CheckCircle, AlertCircle, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function ReturnsPage() {
  const { user } = useAppContext()
  const isSuperAdmin = user?.roles?.some?.((r: any) => String(r.slug || r.name || r) === 'super-admin')

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({
    policy_overview_items: [],
    conditions_items: [],
    non_returnable_note: '',
    how_to_return_steps: [],
    refund_processing_timeline: [],
    exchange_policy: '',
    additional_notes: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiService.returnsInfo.get()
        const info = res.data || res
        setData(info)
        setForm({
          policy_overview_items: info.policy_overview_items || [],
          conditions_items: info.conditions_items || [],
          non_returnable_note: info.non_returnable_note || '',
          how_to_return_steps: info.how_to_return_steps || [],
          refund_processing_timeline: info.refund_processing_timeline || [],
          exchange_policy: info.exchange_policy || '',
          additional_notes: info.additional_notes || '',
        })
      } catch (e) {
        // use defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await apiService.returnsInfo.update(form)
      toast.success('Returns & Refunds updated')
      setEditOpen(false)
      const res = await apiService.returnsInfo.get()
      setData(res.data || res)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header + Edit */}
      <div className="text-center mb-8 sm:mb-12 relative">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Returns & Refunds
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto whitespace-pre-line">
          Our hassle-free return policy ensures you're completely satisfied with your purchase
        </p>
        {isSuperAdmin && (
          <Button
            onClick={() => {
              setForm({
                policy_overview_items: data?.policy_overview_items || [],
                conditions_items: data?.conditions_items || [],
                non_returnable_note: data?.non_returnable_note || '',
                how_to_return_steps: data?.how_to_return_steps || [],
                refund_processing_timeline: data?.refund_processing_timeline || [],
                exchange_policy: data?.exchange_policy || '',
                additional_notes: data?.additional_notes || '',
              })
              setEditOpen(true)
            }}
            className="absolute top-0 right-0 bg-black text-white hover:bg-gray-800"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
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
            {(data?.policy_overview_items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
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
                  {(data?.conditions_items || []).map((t: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {data?.non_returnable_note && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Non-Returnable Items</h4>
                      <p className="text-sm text-yellow-800">
                        {data.non_returnable_note}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
              {(data?.how_to_return_steps || []).map((s: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    {s.stepNumber || idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{s.title}</h3>
                    <p className="text-gray-600">{s.description}</p>
                  </div>
                </div>
              ))}
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
              <div className="space-y-2">
                {(data?.refund_processing_timeline || []).map((t: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="outline">{t.method}</Badge>
                    <span className="text-sm text-gray-600">{t.timeline}</span>
                  </div>
                ))}
              </div>
            </div>
            {data?.exchange_policy && (
              <div>
                <h3 className="font-semibold mb-2">Exchange Policy</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {data.exchange_policy}
                </p>
              </div>
            )}
            {data?.additional_notes && (
              <div>
                <h3 className="font-semibold mb-2">Additional Notes</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {data.additional_notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Returns & Refunds</DialogTitle>
            <DialogDescription>Update each section below; all content is stored in structured fields.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            {/* Policy Overview Items */}
            <div>
              <Label className="font-semibold">Policy Overview Items</Label>
              <div className="space-y-3 mt-2">
                {(form.policy_overview_items || []).map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={item.title || ''}
                        onChange={(e) => {
                          const arr = [...form.policy_overview_items]
                          arr[idx] = { ...arr[idx], title: e.target.value }
                          setForm({ ...form, policy_overview_items: arr })
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => {
                          const arr = [...form.policy_overview_items]
                          arr[idx] = { ...arr[idx], description: e.target.value }
                          setForm({ ...form, policy_overview_items: arr })
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setForm({ ...form, policy_overview_items: [...(form.policy_overview_items || []), { title: '', description: '' }] })}
                >
                  Add Item
                </Button>
              </div>
            </div>

            {/* Conditions Items */}
            <div>
              <Label className="font-semibold">Conditions Items</Label>
              <div className="space-y-2 mt-2">
                {(form.conditions_items || []).map((text: string, idx: number) => (
                  <Input
                    key={idx}
                    value={text}
                    onChange={(e) => {
                      const arr = [...form.conditions_items]
                      arr[idx] = e.target.value
                      setForm({ ...form, conditions_items: arr })
                    }}
                  />
                ))}
                <Button
                  variant="outline"
                  onClick={() => setForm({ ...form, conditions_items: [...(form.conditions_items || []), ''] })}
                >
                  Add Condition
                </Button>
              </div>
            </div>

            {/* Non-returnable Note */}
            <div>
              <Label className="font-semibold">Non-returnable Note</Label>
              <Textarea rows={3} value={form.non_returnable_note} onChange={(e) => setForm({ ...form, non_returnable_note: e.target.value })} />
            </div>

            {/* How To Return Steps */}
            <div>
              <Label className="font-semibold">How To Return Steps</Label>
              <div className="space-y-3 mt-2">
                {(form.how_to_return_steps || []).map((s: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Step #</Label>
                      <Input
                        value={s.stepNumber ?? idx + 1}
                        onChange={(e) => {
                          const arr = [...form.how_to_return_steps]
                          arr[idx] = { ...arr[idx], stepNumber: Number(e.target.value) }
                          setForm({ ...form, how_to_return_steps: arr })
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={s.title || ''}
                        onChange={(e) => {
                          const arr = [...form.how_to_return_steps]
                          arr[idx] = { ...arr[idx], title: e.target.value }
                          setForm({ ...form, how_to_return_steps: arr })
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Textarea
                        rows={2}
                        value={s.description || ''}
                        onChange={(e) => {
                          const arr = [...form.how_to_return_steps]
                          arr[idx] = { ...arr[idx], description: e.target.value }
                          setForm({ ...form, how_to_return_steps: arr })
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setForm({ ...form, how_to_return_steps: [...(form.how_to_return_steps || []), { stepNumber: (form.how_to_return_steps?.length || 0) + 1, title: '', description: '' }] })}
                >
                  Add Step
                </Button>
              </div>
            </div>

            {/* Refund Processing Timeline */}
            <div>
              <Label className="font-semibold">Refund Processing Timeline</Label>
              <div className="space-y-3 mt-2">
                {(form.refund_processing_timeline || []).map((t: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Method</Label>
                      <Input
                        value={t.method || ''}
                        onChange={(e) => {
                          const arr = [...form.refund_processing_timeline]
                          arr[idx] = { ...arr[idx], method: e.target.value }
                          setForm({ ...form, refund_processing_timeline: arr })
                        }}
                      />
                    </div>
                    <div>
                      <Label>Timeline</Label>
                      <Input
                        value={t.timeline || ''}
                        onChange={(e) => {
                          const arr = [...form.refund_processing_timeline]
                          arr[idx] = { ...arr[idx], timeline: e.target.value }
                          setForm({ ...form, refund_processing_timeline: arr })
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setForm({ ...form, refund_processing_timeline: [...(form.refund_processing_timeline || []), { method: '', timeline: '' }] })}
                >
                  Add Timeline
                </Button>
              </div>
            </div>

            {/* Exchange Policy */}
            <div>
              <Label className="font-semibold">Exchange Policy</Label>
              <Textarea rows={3} value={form.exchange_policy} onChange={(e) => setForm({ ...form, exchange_policy: e.target.value })} />
            </div>

            {/* Additional Notes */}
            <div>
              <Label className="font-semibold">Additional Notes (optional)</Label>
              <Textarea rows={3} value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


