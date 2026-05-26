import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, MapPin, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react'
import { getOrder, cancelOrder } from '../api/orders'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import { useState } from 'react'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-gray-50 text-gray-700 border-gray-200',
}

export default function OrderDetail() {
  const { id } = useParams()
  const [cancelling, setCancelling] = useState(false)
  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    select: (res) => res.data,
  })

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await cancelOrder(id)
      toast.success('Order cancelled')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot cancel this order')
    } finally {
      setCancelling(false)
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!order) return <div className="container-page py-20 text-center"><p className="text-gray-500">Order not found</p></div>

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const isActive = !['cancelled', 'refunded'].includes(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-page py-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-medium text-gray-900">Order #{order.order_number}</h1>
            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge border px-3 py-1 text-sm ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {['pending', 'confirmed'].includes(order.status) && (
              <button onClick={handleCancel} disabled={cancelling} className="text-sm text-red-600 border border-red-200 px-3 py-1 hover:bg-red-50 transition-colors">
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {isActive && (
          <div className="bg-white p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-700 mb-5">Order Progress</h2>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${i <= currentStep ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {i < currentStep ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1.5 capitalize hidden sm:block">{step}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-gray-900' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 bg-white p-6">
            <h2 className="font-display text-lg font-medium text-gray-900 mb-5 flex items-center gap-2">
              <Package size={18} /> Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0">
                  <div className="w-16 h-20 bg-gray-50 flex-shrink-0 overflow-hidden">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-gray-100" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_info && <p className="text-xs text-gray-400 mt-0.5">{item.variant_info}</p>}
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">PKR {parseFloat(item.total_price).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">PKR {parseFloat(item.unit_price).toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Shipping */}
            <div className="bg-white p-6">
              <h2 className="font-display text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={16} /> Shipping To
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shipping_full_name}</p>
                <p>{order.shipping_phone}</p>
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
                {order.tracking_number && (
                  <p className="mt-2 pt-2 border-t border-gray-100 text-xs">Tracking: <span className="font-medium text-gray-900">{order.tracking_number}</span></p>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white p-6">
              <h2 className="font-display text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={16} /> Payment
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Method</span>
                  <span className="font-medium text-gray-900 capitalize">{order.payment_method.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>PKR {parseFloat(order.subtotal).toLocaleString()}</span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-PKR {parseFloat(order.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{parseFloat(order.shipping_cost) === 0 ? 'Free' : `PKR ${parseFloat(order.shipping_cost).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>PKR {parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
