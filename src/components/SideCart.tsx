import React, { useEffect, useMemo, useState } from 'react'
import { Sheet, SheetContent } from './ui/sheet'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { apiService } from '../services/api'
import { toast } from 'sonner'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import {
  useFlutterwave,
  closePaymentModal,
} from 'flutterwave-react-v3'

export function SideCart() {
  const navigate = useNavigate()
  const { cartItems, isCartOpen, setIsCartOpen, isLoggedIn, user } = useAppContext()
  const [isPaying, setIsPaying] = useState(false)
  const [rewardBalance, setRewardBalance] = useState<{ points: number; value_aed: number } | null>(null)
  const [applyPoints, setApplyPoints] = useState(false)

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const unit = Number(item.product?.effective_price ?? item.product?.price ?? 0)
      return sum + unit * item.quantity
    }, 0)
  }, [cartItems])

  // Rewards math: 100 pts = 2 AED => 1 pt = 0.02 AED
  const maxRedeemablePoints = useMemo(() => {
    if (!rewardBalance) return 0
    const capBySubtotal = Math.floor(subtotal / 0.02)
    return Math.min(rewardBalance.points, capBySubtotal)
  }, [rewardBalance, subtotal])

  const redeemValueAed = useMemo(() => {
    if (!applyPoints || !rewardBalance) return 0
    return Number((maxRedeemablePoints * 0.02).toFixed(2))
  }, [applyPoints, rewardBalance, maxRedeemablePoints])

  const adjustedTotal = useMemo(() => {
    return Math.max(0, Number((subtotal - redeemValueAed).toFixed(2)))
  }, [subtotal, redeemValueAed])

  // Load reward balance when logged in
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!isLoggedIn) return
        const bal = await apiService.rewards.balance()
        if (!mounted) return
        setRewardBalance({ points: bal?.points ?? 0, value_aed: bal?.value_aed ?? 0 })
      } catch {}
    })()
    return () => { mounted = false }
  }, [isLoggedIn])

  // Quick checkout config (no shipping form here)
  const flutterwavePublicKey = (import.meta as any)?.env?.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-24669363f4dc019d7ea80e8598bae4a0-X'
  const fwConfig = {
    public_key: flutterwavePublicKey,
    tx_ref: `tx-${Date.now()}`,
    amount: Number(adjustedTotal.toFixed(2)),
    currency: 'AED',
    payment_options: 'card,ussd,banktransfer,mobilemoneyrw,mobilemoneygh,mobilemoneyuganda,mobilemoneyzambia',
    customer: {
      email: (user?.email as string) || 'guest@example.com',
      phone_number: (user?.phone as string) || '',
      name: (user?.name as string) || 'Guest User',
    },
    meta: {
      quick_checkout: true,
    },
    customizations: {
      title: 'Quick Checkout',
      description: 'Payment for your order',
      logo: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/flutter.svg',
    },
  }
  const handleFlutterPayment = useFlutterwave(fwConfig)

  const createOrderFromPayment = async (paymentData: any) => {
    const items = cartItems.map(ci => ({
      product_id: ci.product?.id ?? ci.productId,
      product_name: ci.product?.name ?? '',
      unit_price: Number(ci.product?.effective_price ?? ci.product?.price ?? 0),
      quantity: Number(ci.quantity || 0),
      total_price: Number((ci.product?.effective_price ?? ci.product?.price ?? 0) * (ci.quantity || 0)),
    }))

    const payload = {
      customer_name: user?.name || 'Guest User',
      customer_email: user?.email || 'guest@example.com',
      shipping_address: 'N/A',
      subtotal: Number(subtotal),
      tax_amount: 0,
      shipping_amount: 0,
      total_amount: Number(adjustedTotal),
      currency: 'AED',
      payment_method: 'flutterwave',
      points_redeemed: isLoggedIn && applyPoints ? maxRedeemablePoints : 0,
      items,
    }

    console.groupCollapsed('[SideCart] Order payload');
    console.log({ payload });
    console.groupEnd();

    // Create order via API
    const hasToken = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
    const resp = hasToken
      ? await apiService.orders.createAuthOrder(payload as any)
      : await apiService.orders.createGuestCheckout(payload as any)

    // Clear cart on server
    try {
      if (hasToken) {
        await apiService.cart.clearAuth()
      } else {
        await apiService.cart.clear()
      }
    } catch {}

    return resp
  }

  const onQuickPay = () => {
    if (cartItems.length === 0) return
    setIsPaying(true)
    console.groupCollapsed('[SideCart] Start quick payment');
    console.log('Subtotal', subtotal);
    console.log('User', { isLoggedIn, userId: user?.id });
    console.groupEnd();
    handleFlutterPayment({
      callback: async (response: any) => {
        try {
          const order = await createOrderFromPayment(response)
          toast.success('Payment successful! Order created.')
          setIsCartOpen && setIsCartOpen(false)
          navigate('/thank-you', { state: { orderData: { ...order, total: subtotal, payment_method: 'flutterwave' } } })
        } catch (e) {
          toast.error('Payment successful but order creation failed')
        } finally {
          setIsPaying(false)
          closePaymentModal()
        }
      },
      onClose: () => {
        setIsPaying(false)
      },
    })
  }

  return (
    <Sheet open={!!isCartOpen} onOpenChange={(o: boolean) => setIsCartOpen && setIsCartOpen(o)}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] p-4 h-full max-h-screen">
        <div className="flex flex-col h-full">
          <div className="px-5 py-4 border-b">
            <h2 className="text-lg font-semibold">Your Bag</h2>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {cartItems.length === 0 ? (
              <div className="p-6 text-center text-gray-600">Your bag is empty</div>
            ) : (
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-4">
                    <div className="w-20 h-20 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.product?.primary_image || item.product?.image || item.product?.images?.[0]?.image_url}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.product?.name}</div>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">AED {(
                        Number(item.product?.effective_price ?? item.product?.price ?? 0) * item.quantity
                      ).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t space-y-3">
            <div className="flex justify-between text-sm">
              <span>Sub Total</span>
              <span>AED {subtotal.toFixed(2)}</span>
            </div>
            {isLoggedIn && rewardBalance && rewardBalance.points > 0 && (
              <div className="flex items-start justify-between text-sm py-1">
                <div className="mr-3">
                  <div className="font-medium">Reward Points</div>
                  <div className="text-xs text-gray-600">You have {rewardBalance.points} pts (AED {rewardBalance.value_aed.toFixed(2)})</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="applyPointsSide" checked={applyPoints} onCheckedChange={(v: string | boolean) => setApplyPoints(!!v)} />
                  <Label htmlFor="applyPointsSide">Apply points</Label>
                </div>
              </div>
            )}
            {applyPoints && redeemValueAed > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Points discount ({maxRedeemablePoints} pts)</span>
                <span>- AED {redeemValueAed.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-green-600">
              <span>Estimated Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>AED {adjustedTotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              size="lg"
              disabled={cartItems.length === 0 || isPaying}
              onClick={onQuickPay}
            >
              {isPaying ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


