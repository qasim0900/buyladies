import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ChevronRight } from 'lucide-react'
import { updateItem, removeItem } from '../store/slices/cartSlice'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, subtotal, total_items } = useSelector((s) => s.cart)
  const { isAuthenticated } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const shippingCost = parseFloat(subtotal) >= 2000 ? 0 : 150
  const total = parseFloat(subtotal) + shippingCost

  const handleQuantity = async (itemId, newQty) => {
    const result = await dispatch(updateItem({ itemId, quantity: newQty }))
    if (!updateItem.fulfilled.match(result)) {
      toast.error(result.payload?.detail || 'Failed to update')
    }
  }

  const handleRemove = async (itemId) => {
    await dispatch(removeItem(itemId))
    toast.success('Item removed')
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout')
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="font-display text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Start Shopping <ArrowRight size={16} /></Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-page py-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Cart</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-gray-900">Shopping Cart <span className="text-gray-400 text-xl font-normal">({total_items})</span></h1>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items */}
          <div className="flex-1">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,40px] gap-4 pb-3 border-b border-gray-200 text-xs font-semibold uppercase tracking-widest text-gray-500">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span></span>
            </div>

            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="grid grid-cols-[auto,1fr] md:grid-cols-[2fr,1fr,1fr,40px] gap-4 py-5 border-b border-gray-100 items-center"
                >
                  {/* Product */}
                  <div className="flex items-start gap-4 col-span-2 md:col-span-1">
                    <Link to={`/products/${item.product_slug}`} className="flex-shrink-0">
                      <div className="w-20 h-24 bg-gray-50 overflow-hidden">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={24} className="text-gray-200" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link to={`/products/${item.product_slug}`} className="text-sm font-medium text-gray-900 hover:text-rose-600 transition-colors line-clamp-2">
                        {item.product_name}
                      </Link>
                      {item.variant?.color && <p className="text-xs text-gray-400 mt-1">Color: {item.variant.color.name}</p>}
                      {item.variant?.size && <p className="text-xs text-gray-400">Size: {item.variant.size.name}</p>}
                      {/* Mobile price */}
                      <p className="text-sm font-semibold text-gray-900 mt-2 md:hidden">
                        PKR {(parseFloat(item.subtotal)).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden md:block">
                    <span className="text-sm font-medium text-gray-900">PKR {parseFloat(item.variant?.price || 0).toLocaleString()}</span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 w-fit">
                    <button onClick={() => handleQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-rose-500 transition-colors ml-auto">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="mt-6">
              <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="font-display text-lg font-medium text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({total_items} items)</span>
                  <span>PKR {parseFloat(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `PKR ${shippingCost}`}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-gray-400">Add PKR {(2000 - parseFloat(subtotal)).toLocaleString()} more for free shipping</p>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full mt-6 justify-center py-4">
                Proceed to Checkout <ArrowRight size={16} />
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">Secure checkout · Free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
