import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Heart, Sparkles } from 'lucide-react'
import { updateItem, removeItem } from '../store/slices/cartSlice'
import { useQuery } from '@tanstack/react-query'
import { getFeaturedProducts, getNewArrivals } from '../api/products'
import toast from 'react-hot-toast'

const GRID_TEXTURE = {
  backgroundImage:
    'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),' +
    'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
}

const JEWEL_COLORS = ['#1E3932', '#4A1942', '#6B0F1A', '#003366', '#7B2D00']

function ProductGlimpse({ product, index }) {
  const color = JEWEL_COLORS[index % JEWEL_COLORS.length]
  const imgSrc = product?.images?.[0]?.image || product?.main_image || null
  const name   = product?.name || 'Collection Piece'
  const price  = product?.min_price
    ? `PKR ${parseFloat(product.min_price).toLocaleString()}`
    : null
  const slug   = product?.slug

  return (
    <Link
      to={slug ? `/products/${slug}` : '/products'}
      className="group cursor-pointer relative overflow-hidden block"
    >
      <div className="w-full h-full">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color }}>
            <div
              className="w-full h-full opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 8px)',
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs font-medium line-clamp-1">{name}</p>
          {price && <p className="text-[#C9A84C] text-[10px]">{price}</p>}
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedProducts,
    select: (r) => r.data?.results ?? r.data ?? [],
  })
  const { data: newArrivals } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: getNewArrivals,
    select: (r) => r.data?.results ?? r.data ?? [],
  })

  const glimpses = [
    ...(featured ?? []).slice(0, 2),
    ...(newArrivals ?? []).slice(0, 3),
  ].slice(0, 5)

  return (
    <div
      className="flex-1 relative z-10 flex min-h-0"
      style={{ minHeight: 'calc(100vh - 57px - 48px)' }}
    >
      {/* Left — messaging */}
      <div className="w-[55%] flex flex-col justify-center px-16 border-r border-[#1E1E1E]">
        <div className="mb-10">
          <div className="w-14 h-14 border border-[#C9A84C]/30 flex items-center justify-center mb-8">
            <ShoppingBag size={22} className="text-[#C9A84C]/50" />
          </div>
          <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-4">
            Your Collection
          </p>
          <h1
            className="font-display font-medium leading-none mb-6"
            style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#F5F0E8' }}
          >
            Your cart<br />
            <span className="italic" style={{ color: '#C9A84C' }}>awaits.</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-sm mb-12" style={{ color: '#5A5A5A' }}>
            Nothing selected yet. Every great wardrobe begins with a single choice — yours is waiting in the collection.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/products"
              className="flex items-center gap-2 px-8 py-3.5 text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#0D0D0D]"
              style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}
            >
              Explore Collection <ArrowRight size={12} />
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase transition-colors hover:text-[#F5F0E8]"
              style={{ color: '#5A5A5A' }}
            >
              <Heart size={12} /> View Wishlist
            </Link>
          </div>
        </div>

        <div className="border-t pt-8 space-y-3" style={{ borderColor: '#1E1E1E' }}>
          {[
            ['Hand-embroidered in Pakistan', 'Direct from master karigars'],
            ['Free delivery on PKR 2,000+', '30-day returns, no questions'],
          ].map(([title, sub]) => (
            <div key={title} className="flex items-center gap-3">
              <Sparkles size={11} className="flex-shrink-0" style={{ color: 'rgba(201,168,76,0.4)' }} />
              <div>
                <p className="text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>{title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#5A5A5A' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — collection glimpse */}
      <div className="w-[45%] flex flex-col justify-center px-10 py-10">
        <p className="text-[10px] tracking-[0.35em] uppercase mb-6" style={{ color: '#5A5A5A' }}>
          From the collection
        </p>

        <div className="flex gap-3 items-start">
          {/* Left column — 2 tall */}
          <div className="flex-1 space-y-3">
            {glimpses.slice(0, 2).map((g, i) => (
              <div key={i} style={{ height: 180 }}>
                <ProductGlimpse product={g} index={i} />
              </div>
            ))}
          </div>
          {/* Right column — 3 shorter, offset down */}
          <div className="flex-1 space-y-3" style={{ marginTop: 40 }}>
            {glimpses.slice(2).map((g, i) => (
              <div key={i} style={{ height: 140 }}>
                <ProductGlimpse product={g} index={i + 2} />
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/products"
          className="mt-6 text-[10px] tracking-[0.25em] uppercase pb-0.5 w-fit transition-colors hover:text-[#C9A84C] hover:border-[#C9A84C]"
          style={{ color: '#5A5A5A', borderBottom: '1px solid #2A2A2A' }}
        >
          See all pieces →
        </Link>
      </div>
    </div>
  )
}

export default function Cart() {
  const { items, subtotal, total_items } = useSelector((s) => s.cart)
  const { isAuthenticated }              = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const shippingCost = parseFloat(subtotal) >= 2000 ? 0 : 150
  const total        = parseFloat(subtotal) + shippingCost

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

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#C9A84C] selection:text-[#0D0D0D]"
      style={{ backgroundColor: '#0D0D0D', color: '#F5F0E8' }}
    >
      {/* Grid texture */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ ...GRID_TEXTURE, opacity: 0.03 }} />

      {/* Empty state */}
      {items.length === 0 && <EmptyState />}

      {/* Filled cart */}
      {items.length > 0 && (
        <div className="flex-1 relative z-10">
          {/* Page header */}
          <div className="border-b px-12 py-8" style={{ borderColor: '#1E1E1E' }}>
            <p className="text-[11px] tracking-[0.35em] uppercase mb-3" style={{ color: '#C9A84C' }}>
              Your Collection
            </p>
            <h1 className="font-display font-medium" style={{ fontSize: '2rem', color: '#F5F0E8' }}>
              Shopping Cart{' '}
              <span className="text-base font-normal" style={{ color: '#5A5A5A' }}>
                ({total_items} {total_items === 1 ? 'piece' : 'pieces'})
              </span>
            </h1>
          </div>

          <div className="px-12 py-8 flex flex-col lg:flex-row gap-10">
            {/* Cart items */}
            <div className="flex-1">
              {/* Table header */}
              <div
                className="hidden md:grid grid-cols-[2fr,1fr,1fr,40px] gap-4 pb-3 border-b text-[10px] uppercase tracking-[0.25em]"
                style={{ borderColor: '#1E1E1E', color: '#5A5A5A' }}
              >
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span />
              </div>

              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="grid grid-cols-[auto,1fr] md:grid-cols-[2fr,1fr,1fr,40px] gap-4 py-6 border-b items-center"
                    style={{ borderColor: '#1E1E1E' }}
                  >
                    {/* Product */}
                    <div className="flex items-start gap-4 col-span-2 md:col-span-1">
                      <Link to={`/products/${item.product_slug}`} className="flex-shrink-0">
                        <div className="w-20 h-24 overflow-hidden" style={{ border: '1px solid #1E1E1E' }}>
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
                              <ShoppingBag size={20} style={{ color: '#3A3A3A' }} />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div>
                        <Link
                          to={`/products/${item.product_slug}`}
                          className="text-sm font-medium line-clamp-2 transition-colors hover:text-[#C9A84C]"
                          style={{ color: '#F5F0E8' }}
                        >
                          {item.product_name}
                        </Link>
                        {item.variant?.color && (
                          <p className="text-xs mt-1" style={{ color: '#5A5A5A' }}>
                            Color: {item.variant.color.name}
                          </p>
                        )}
                        {item.variant?.size && (
                          <p className="text-xs" style={{ color: '#5A5A5A' }}>
                            Size: {item.variant.size.name}
                          </p>
                        )}
                        <p className="text-sm font-semibold mt-2 md:hidden" style={{ color: '#C9A84C' }}>
                          PKR {parseFloat(item.subtotal).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="hidden md:block">
                      <span className="text-sm font-medium" style={{ color: '#F5F0E8' }}>
                        PKR {parseFloat(item.variant?.price || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center w-fit" style={{ border: '1px solid #2A2A2A' }}>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors hover:text-[#C9A84C]"
                        style={{ color: '#5A5A5A' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium" style={{ color: '#F5F0E8' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors hover:text-[#C9A84C]"
                        style={{ color: '#5A5A5A' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="ml-auto transition-colors hover:text-[#800020]"
                      style={{ color: '#3A3A3A' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors hover:text-[#F5F0E8]"
                  style={{ color: '#5A5A5A' }}
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 p-7" style={{ border: '1px solid #1E1E1E', backgroundColor: '#111111' }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: '#C9A84C' }}>
                  Order Summary
                </p>
                <h2 className="font-display text-lg font-medium mb-6" style={{ color: '#F5F0E8' }}>
                  Your Selection
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between" style={{ color: '#A0A0A0' }}>
                    <span>Subtotal ({total_items} {total_items === 1 ? 'item' : 'items'})</span>
                    <span>PKR {parseFloat(subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: '#A0A0A0' }}>
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0
                        ? <span style={{ color: '#C9A84C' }}>Free</span>
                        : `PKR ${shippingCost}`}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs" style={{ color: '#5A5A5A' }}>
                      Add PKR {(2000 - parseFloat(subtotal)).toLocaleString()} more for free shipping
                    </p>
                  )}
                  <div
                    className="pt-4 border-t flex justify-between font-semibold"
                    style={{ borderColor: '#2A2A2A', color: '#F5F0E8' }}
                  >
                    <span>Total</span>
                    <span style={{ color: '#C9A84C' }}>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-8 py-4 flex items-center justify-center gap-2 text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#0D0D0D]"
                  style={{ border: '1px solid #C9A84C', color: '#C9A84C', backgroundColor: 'transparent' }}
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>

                <div className="mt-5 flex items-center gap-2 justify-center">
                  <Sparkles size={10} style={{ color: 'rgba(201,168,76,0.4)' }} />
                  <p className="text-[10px] tracking-wide" style={{ color: '#3A3A3A' }}>
                    Secure checkout · Free returns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer strip */}
      <div className="relative z-10 border-t text-center py-4" style={{ borderColor: '#1E1E1E' }}>
        <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#2A2A2A' }}>
          Heritage · Craft · Elegance
        </p>
      </div>
    </div>
  )
}
