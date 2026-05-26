import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, ArrowRight } from 'lucide-react'
import { getOrders } from '../api/orders'
import Spinner from '../components/ui/Spinner'

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-gray-50 text-gray-700 border-gray-200',
}

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    select: (res) => res.data?.results || res.data || [],
  })

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-page py-8">
          <p className="text-xs text-gray-500 mb-3">Account</p>
          <h1 className="font-display text-3xl font-medium text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="container-page py-8">
        {orders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
              <Package size={36} className="text-gray-300" />
            </div>
            <h2 className="font-display text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">When you place an order, it will appear here.</p>
            <Link to="/products" className="btn-primary">Start Shopping <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white border border-gray-100 hover:border-gray-300 hover:shadow-card transition-all p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-900">#{order.order_number}</span>
                      <span className={`badge border text-xs ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className={`badge border text-xs ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {order.payment_status === 'paid' ? 'Paid' : 'Payment ' + order.payment_status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                      {order.items?.slice(0, 2).map((item) => ` · ${item.product_name}`)}
                      {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Total</p>
                      <p className="font-semibold text-gray-900">PKR {parseFloat(order.total_amount).toLocaleString()}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
