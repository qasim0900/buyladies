import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronRight, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { createOrder, validateCoupon } from '../api/orders'
import Spinner from '../components/ui/Spinner'

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
  { value: 'easypaisa', label: 'EasyPaisa', desc: 'Pay via EasyPaisa mobile wallet' },
  { value: 'jazzcash', label: 'JazzCash', desc: 'Pay via JazzCash mobile wallet' },
  { value: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, etc.' },
]

export default function Checkout() {
  const { items, subtotal } = useSelector((s) => s.cart)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [form, setForm] = useState({
    shipping_full_name: '',
    shipping_phone: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'Pakistan',
    payment_method: 'cod',
    notes: '',
  })

  const shippingCost = parseFloat(subtotal) >= 2000 ? 0 : 150
  const discount = couponData ? parseFloat(couponData.discount_amount) : 0
  const total = parseFloat(subtotal) - discount + shippingCost

  const handleCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode) return
    setCouponLoading(true)
    try {
      const res = await validateCoupon(couponCode, subtotal)
      setCouponData(res.data)
      toast.success(`Coupon applied! You saved PKR ${parseFloat(res.data.discount_amount).toLocaleString()}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid coupon')
      setCouponData(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const orderData = { ...form, coupon_code: couponData?.code || '' }
      const res = await createOrder(orderData)
      toast.success('Order placed successfully!')
      navigate(`/orders/${res.data.id}`)
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        const msgs = Object.values(errors).flat().join(', ')
        toast.error(msgs || 'Failed to place order')
      }
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="font-display text-2xl font-medium mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link to="/cart" className="hover:text-gray-900">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6">
                <h2 className="font-display text-xl font-medium text-gray-900 mb-5">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Full Name *</label>
                    <input required value={form.shipping_full_name} onChange={(e) => setForm({ ...form, shipping_full_name: e.target.value })} className="input-field" placeholder="Sarah Ahmed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Phone Number *</label>
                    <input required value={form.shipping_phone} onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })} className="input-field" placeholder="+92 300 1234567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Address Line 1 *</label>
                    <input required value={form.shipping_address_line1} onChange={(e) => setForm({ ...form, shipping_address_line1: e.target.value })} className="input-field" placeholder="House # / Street / Area" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Address Line 2</label>
                    <input value={form.shipping_address_line2} onChange={(e) => setForm({ ...form, shipping_address_line2: e.target.value })} className="input-field" placeholder="Apartment, suite, etc. (optional)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">City *</label>
                    <input required value={form.shipping_city} onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} className="input-field" placeholder="Lahore" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Province *</label>
                    <input required value={form.shipping_state} onChange={(e) => setForm({ ...form, shipping_state: e.target.value })} className="input-field" placeholder="Punjab" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Postal Code</label>
                    <input value={form.shipping_postal_code} onChange={(e) => setForm({ ...form, shipping_postal_code: e.target.value })} className="input-field" placeholder="54000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Country</label>
                    <input value={form.shipping_country} onChange={(e) => setForm({ ...form, shipping_country: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Order Notes (Optional)</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="input-field resize-none" placeholder="Any special instructions..." />
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6">
                <h2 className="font-display text-xl font-medium text-gray-900 mb-5">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.value} className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${form.payment_method === method.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={form.payment_method === method.value}
                        onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                        className="accent-gray-900"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-5 justify-center text-base">
                {loading ? <Spinner size="sm" /> : `Place Order · PKR ${total.toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white p-6 sticky top-24">
              <h2 className="font-display text-lg font-medium text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-14 bg-gray-50 overflow-hidden">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full bg-gray-100" />}
                      </div>
                      <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                      {item.variant?.color && <p className="text-[10px] text-gray-400">{item.variant.color.name}{item.variant?.size ? ` / ${item.variant.size.name}` : ''}</p>}
                    </div>
                    <span className="text-xs font-semibold text-gray-900 flex-shrink-0">PKR {parseFloat(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <form onSubmit={handleCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="input-field pl-8 text-xs py-2.5" placeholder="Coupon code" />
                  </div>
                  <button type="submit" disabled={couponLoading} className="btn-outline px-4 py-2 text-xs">
                    {couponLoading ? <Spinner size="sm" /> : 'Apply'}
                  </button>
                </form>
                {couponData && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 text-xs">
                    <CheckCircle size={13} />
                    Saved PKR {parseFloat(couponData.discount_amount).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>PKR {parseFloat(subtotal).toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `PKR ${shippingCost}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
