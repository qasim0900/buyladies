import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Truck, RefreshCw, Shield, Star, ChevronRight, Minus, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getProduct, getProductReviews } from '../api/products'
import { addItemToCart } from '../store/slices/cartSlice'
import { toggleWishlistItem } from '../store/slices/wishlistSlice'
import Spinner from '../components/ui/Spinner'

export default function ProductDetail() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((s) => s.auth)
  const { items: wishlistItems } = useSelector((s) => s.wishlist)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    select: (res) => res.data,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => getProductReviews(slug),
    select: (res) => res.data?.results || res.data || [],
    enabled: !!product,
  })

  const isWishlisted = wishlistItems.some((i) => i.product?.id === product?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="font-display text-2xl text-gray-900 mb-2">Product Not Found</h2>
        <Link to="/products" className="text-rose-600 hover:underline text-sm mt-2">Back to Products</Link>
      </div>
    )
  }

  const images = product.images || []
  const currentImage = images[selectedImage]

  const colors = [...new Map(
    product.variants?.filter((v) => v.color).map((v) => [v.color.id, v.color])
  ).values()]

  const sizes = [...new Map(
    product.variants?.filter((v) => {
      if (!v.size) return false
      if (selectedColor) return v.color?.id === selectedColor.id
      return true
    }).map((v) => [v.size.id, v.size])
  ).values()]

  const selectedVariant = product.variants?.find((v) => {
    if (selectedColor && selectedSize) return v.color?.id === selectedColor.id && v.size?.id === selectedSize.id
    if (selectedColor) return v.color?.id === selectedColor.id
    if (selectedSize) return v.size?.id === selectedSize.id
    return true
  })

  const effectiveVariant = selectedVariant || product.variants?.[0]
  const price = effectiveVariant?.price || product.effective_price || product.base_price
  const inStock = effectiveVariant ? effectiveVariant.in_stock : true

  const avgRating = reviews?.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null

  const handleAddToCart = async () => {
    if (!effectiveVariant) {
      toast.error('Please select a variant')
      return
    }
    if (colors.length > 0 && !selectedColor) { toast.error('Please select a color'); return }
    if (sizes.length > 0 && !selectedSize) { toast.error('Please select a size'); return }
    setAdding(true)
    const result = await dispatch(addItemToCart({ variantId: effectiveVariant.id, quantity }))
    setAdding(false)
    if (addItemToCart.fulfilled.match(result)) {
      toast.success('Added to cart')
    } else {
      toast.error(result.payload?.detail || 'Failed to add to cart')
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to add to wishlist'); return }
    await dispatch(toggleWishlistItem(product.id))
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-gray-900">Products</Link>
            {product.category && (
              <>
                <ChevronRight size={12} />
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-gray-900">{product.category.name}</Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">
          {/* Images */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 w-16 flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main Image */}
            <div className="flex-1">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    {currentImage ? (
                      <img src={currentImage.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
                        <ShoppingBag size={60} className="text-rose-200" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {product.discount_percent > 0 && (
                  <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-medium px-2.5 py-1.5">
                    -{product.discount_percent}%
                  </div>
                )}
              </div>
              {/* Mobile Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 md:hidden">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setSelectedImage(i)} className={`w-14 h-14 overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? 'border-gray-900' : 'border-gray-200'}`}>
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {product.brand && (
              <p className="text-xs font-semibold tracking-widest uppercase text-rose-600 mb-2">{product.brand.name}</p>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-medium text-gray-900 leading-tight mb-3">{product.name}</h1>

            {/* Rating */}
            {avgRating && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{avgRating}</span>
                <span className="text-sm text-gray-400">({reviews?.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl font-semibold text-gray-900">PKR {parseFloat(price).toLocaleString()}</span>
              {product.sale_price && parseFloat(product.base_price) > parseFloat(product.sale_price) && (
                <span className="text-xl text-gray-400 line-through">PKR {parseFloat(product.base_price).toLocaleString()}</span>
              )}
            </div>

            <div className="w-16 h-px bg-gray-200 mb-6" />

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-700">Color</span>
                  {selectedColor && <span className="text-xs text-gray-500">— {selectedColor.name}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(selectedColor?.id === color.id ? null : color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor?.id === color.id ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                      style={{ backgroundColor: color.hex_code || '#ccc' }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-700">Size</span>
                  <button className="text-xs text-gray-400 hover:text-gray-700 underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(selectedSize?.id === size.id ? null : size)}
                      className={`min-w-[3rem] px-3 h-10 text-sm border transition-all ${selectedSize?.id === size.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-700">Qty</span>
              <div className="flex items-center border border-gray-200">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              {effectiveVariant && (
                <span className="text-xs text-gray-400">{effectiveVariant.stock_quantity} in stock</span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={adding || !inStock}
                className="flex-1 btn-primary py-4 text-sm justify-center"
              >
                {adding ? <Spinner size="sm" /> : !inStock ? 'Out of Stock' : <><ShoppingBag size={16} /> Add to Cart</>}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 border flex items-center justify-center transition-all ${isWishlisted ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                aria-label="Add to wishlist"
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 py-5 border-t border-b border-gray-100 mb-6">
              {[
                [Truck, 'Free Delivery', 'On orders over PKR 2K'],
                [RefreshCw, 'Easy Returns', '30-day returns'],
                [Shield, 'Secure Payment', '100% safe checkout'],
              ].map(([Icon, title, desc]) => (
                <div key={title} className="text-center">
                  <Icon size={18} className="text-gray-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">{title}</p>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </div>
              ))}
            </div>

            {/* Category & Tags */}
            {(product.category || product.tags) && (
              <div className="text-xs text-gray-500 space-y-1">
                {product.category && <p>Category: <Link to={`/products?category=${product.category.slug}`} className="text-gray-700 hover:text-rose-600">{product.category.name}</Link></p>}
                {product.tags && <p>Tags: {product.tags}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200 mb-8">
            {[['description', 'Description'], ['reviews', `Reviews (${reviews?.length || 0})`]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 text-sm font-medium tracking-wide uppercase transition-colors border-b-2 -mb-px ${activeTab === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-3xl text-gray-600 leading-relaxed">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description available.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              {reviews?.length === 0 && (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to review this product!</p>
              )}
              <div className="space-y-6">
                {reviews?.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {review.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.user_name}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} size={10} className={s <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </div>
                          {review.is_verified_purchase && (
                            <span className="text-[10px] text-green-600 font-medium">✓ Verified Purchase</span>
                          )}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.title && <p className="text-sm font-medium text-gray-900 mb-1">{review.title}</p>}
                    <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
