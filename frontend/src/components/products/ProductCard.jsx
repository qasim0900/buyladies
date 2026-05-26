import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart } from '../../store/slices/cartSlice'
import { toggleWishlistItem } from '../../store/slices/wishlistSlice'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((s) => s.auth)
  const { items: wishlistItems } = useSelector((s) => s.wishlist)
  const [imgError, setImgError] = useState(false)
  const [adding, setAdding] = useState(false)

  const isWishlisted = wishlistItems.some((i) => i.product?.id === product.id)
  const hasDiscount = product.sale_price && parseFloat(product.base_price) > parseFloat(product.sale_price)
  const price = product.effective_price || product.base_price
  const imgSrc = !imgError && product.primary_image?.image_url ? product.primary_image.image_url : null

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist')
      return
    }
    await dispatch(toggleWishlistItem(product.id))
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    const variants = product.variants
    if (variants && variants.length === 1) {
      setAdding(true)
      const result = await dispatch(addItemToCart({ variantId: variants[0].id, quantity: 1 }))
      setAdding(false)
      if (addItemToCart.fulfilled.match(result)) {
        toast.success('Added to cart')
      } else {
        toast.error(result.payload?.detail || 'Failed to add to cart')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.primary_image?.alt_text || product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center p-4">
                <ShoppingBag size={40} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 line-clamp-2">{product.name}</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new_arrival && (
              <span className="badge bg-gray-900 text-white text-[10px] tracking-widest uppercase px-2 py-1">New</span>
            )}
            {hasDiscount && (
              <span className="badge bg-rose-600 text-white text-[10px] font-medium px-2 py-1">
                -{product.discount_percent}%
              </span>
            )}
            {product.is_bestseller && (
              <span className="badge bg-gold-500 text-white text-[10px] tracking-widest uppercase px-2 py-1">Best Seller</span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 flex items-center justify-center bg-white shadow-card transition-colors ${isWishlisted ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'}`}
              aria-label="Add to wishlist"
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); window.location.href = `/products/${product.slug}` }}
              className="w-9 h-9 flex items-center justify-center bg-white shadow-card text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Quick view"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full bg-gray-900 text-white py-3 text-xs font-medium tracking-widest uppercase hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1">
          {product.brand_name && (
            <p className="text-[10px] font-medium text-gray-400 tracking-widest uppercase mb-1">{product.brand_name}</p>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-rose-700 transition-colors">
            {product.name}
          </h3>
          {product.avg_rating && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} className={s <= Math.round(product.avg_rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">({product.review_count})</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-semibold text-gray-900">PKR {parseFloat(price).toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">PKR {parseFloat(product.base_price).toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
