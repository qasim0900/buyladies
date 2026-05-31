import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, ChevronDown, Heart, ShoppingBag, X, SlidersHorizontal } from 'lucide-react'
import { getProducts, getCategories } from '../api/products'
import { addItemToCart } from '../store/slices/cartSlice'
import { toggleWishlistItem } from '../store/slices/wishlistSlice'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { label: 'Featured',           value: '-created_at' },
  { label: 'Price: Low to High', value: 'base_price' },
  { label: 'Price: High to Low', value: '-base_price' },
  { label: 'Name A–Z',          value: 'name' },
]

const PRICE_RANGES = [
  { label: 'Under PKR 5,000',   min: '',      max: '5000' },
  { label: 'PKR 5,000–15,000',  min: '5000',  max: '15000' },
  { label: 'PKR 15,000–30,000', min: '15000', max: '30000' },
  { label: 'Above PKR 30,000',  min: '30000', max: '' },
]

function DarkProductCard({ product, index }) {
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
    if (!isAuthenticated) { toast.error('Please sign in to add to wishlist'); return }
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
      if (addItemToCart.fulfilled.match(result)) toast.success('Added to cart')
      else toast.error(result.payload?.detail || 'Failed to add to cart')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group cursor-pointer"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A] mb-5">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.primary_image?.alt_text || product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
              <ShoppingBag size={40} className="text-[#3A3A3A]" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new_arrival && (
              <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 bg-[#C9A84C] text-[#0D0D0D] font-medium">New</span>
            )}
            {hasDiscount && (
              <span className="text-[10px] font-medium px-2.5 py-1 bg-[#0D0D0D] border border-[#C9A84C] text-[#C9A84C]">
                -{product.discount_percent}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-[#0D0D0D]/80 border border-[#2A2A2A] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:border-[#C9A84C] ${isWishlisted ? 'text-[#C9A84C]' : 'text-[#F5F0E8]'}`}
          >
            <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Add to Cart — slide up */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full bg-[#0D0D0D] text-[#F5F0E8] border-t border-[#C9A84C] py-3 uppercase tracking-widest text-xs hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-colors disabled:opacity-60"
            >
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        </div>

        <div className="text-center px-2">
          <h3 className="font-display text-base mb-2 text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors duration-300 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-2.5">
            <span className="text-[#C9A84C] tracking-wider text-sm">
              PKR {parseFloat(price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[#5A5A5A] text-xs line-through">
                PKR {parseFloat(product.base_price).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function DarkFilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-5 group"
      >
        <h3 className="text-xs tracking-[0.2em] uppercase text-[#7A7A7A] group-hover:text-[#F5F0E8] transition-colors">{title}</h3>
        <ChevronDown size={14} className={`text-[#7A7A7A] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-[#1A1A1A] mb-5" />
          <div className="h-4 bg-[#1A1A1A] rounded w-3/4 mx-auto mb-2" />
          <div className="h-3 bg-[#1A1A1A] rounded w-1/3 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const search    = searchParams.get('search')        || ''
  const category  = searchParams.get('category')      || ''
  const minPrice  = searchParams.get('min_price')     || ''
  const maxPrice  = searchParams.get('max_price')     || ''
  const ordering  = searchParams.get('ordering')      || '-created_at'
  const isFeatured    = searchParams.get('is_featured')   || ''
  const isNewArrival  = searchParams.get('is_new_arrival') || ''
  const isBestseller  = searchParams.get('is_bestseller') || ''
  const onSale        = searchParams.get('on_sale')       || ''

  const params = {
    search, category, ordering, page,
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
    ...(isFeatured   && { is_featured: true }),
    ...(isNewArrival && { is_new_arrival: true }),
    ...(isBestseller && { is_bestseller: true }),
    ...(onSale       && { on_sale: true }),
  }
  Object.keys(params).forEach((k) => !params[k] && delete params[k])

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    keepPreviousData: true,
    select: (res) => res.data,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (res) => res.data?.results || res.data || [],
  })

  const products   = data?.results || data || []
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1
  const totalCount = data?.count ?? products.length
  const hasFilters = category || minPrice || maxPrice || isFeatured || isNewArrival || isBestseller || onSale

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setPage(1)
    setSearchParams(next)
  }

  const clearFilters = () => { setSearchParams({}); setPage(1) }

  const pageTitle = search        ? `Search: "${search}"` :
                    isNewArrival  ? 'New Arrivals' :
                    isBestseller  ? 'Best Sellers' :
                    isFeatured    ? 'Featured' :
                    onSale        ? 'The Sale' :
                    category      ? '' :
                    'The Collection'

  const activePriceRange = PRICE_RANGES.find(
    (r) => r.min === minPrice && r.max === maxPrice
  )

  const setPriceRange = (range) => {
    const next = new URLSearchParams(searchParams)
    if (activePriceRange?.label === range.label) {
      next.delete('min_price'); next.delete('max_price')
    } else {
      if (range.min) next.set('min_price', range.min); else next.delete('min_price')
      if (range.max) next.set('max_price', range.max); else next.delete('max_price')
    }
    next.delete('page'); setPage(1); setSearchParams(next)
  }

  const activeCategory = categories?.find((c) => c.slug === category)

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8]">

      {/* Editorial Header */}
      <header className="py-20 px-8 text-center border-b border-[#2A2A2A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] opacity-60 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase mb-5">
            The Heritage Collection
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-medium mb-5 leading-tight">
            {activeCategory?.name || (search ? `"${search}"` : 'Elegance')}{' '}
            <br />
            <span className="italic text-[#C9A84C]">
              {activeCategory ? 'Collection' : search ? 'Results' : 'Redefined'}
            </span>
          </h1>
          <p className="text-[#7A7A7A] text-base max-w-xl mx-auto font-light leading-relaxed">
            Discover our curated selection of masterful craftsmanship. Each piece tells
            a story of tradition, woven with contemporary grace.
          </p>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-14 flex gap-14">

        {/* Sidebar — desktop */}
        <aside className="w-60 shrink-0 hidden lg:block">
          <div className="sticky top-28">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#2A2A2A]">
              <span className="font-display text-lg text-[#F5F0E8]">Refine</span>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] tracking-widest uppercase text-[#C9A84C] hover:text-[#F5F0E8] transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <Filter size={14} className="text-[#C9A84C]" />
              </div>
            </div>

            {/* Category */}
            <DarkFilterSection title="Category">
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`text-sm transition-colors duration-200 ${!category ? 'text-[#C9A84C] italic font-display text-base' : 'text-[#F5F0E8] hover:text-[#C9A84C]'}`}
                  >
                    All
                  </button>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateParam('category', cat.slug)}
                      className={`text-sm transition-colors duration-200 ${category === cat.slug ? 'text-[#C9A84C] italic font-display text-base' : 'text-[#F5F0E8] hover:text-[#C9A84C]'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </DarkFilterSection>

            {/* Price Range */}
            <DarkFilterSection title="Price Range" defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((range) => {
                  const active = activePriceRange?.label === range.label
                  return (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange(range)}
                      className={`px-3 py-1.5 text-xs border rounded-full transition-all duration-200 ${
                        active
                          ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                          : 'border-[#2A2A2A] text-[#7A7A7A] hover:border-[#C9A84C] hover:text-[#C9A84C] bg-[#111111]'
                      }`}
                    >
                      {range.label}
                    </button>
                  )
                })}
              </div>
            </DarkFilterSection>

            {/* Availability */}
            <DarkFilterSection title="Collection" defaultOpen={false}>
              {[
                ['New Arrivals',  'is_new_arrival', isNewArrival],
                ['Best Sellers',  'is_bestseller',  isBestseller],
                ['On Sale',       'on_sale',        onSale],
                ['Featured',      'is_featured',    isFeatured],
              ].map(([label, key, val]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer py-1.5 group">
                  <span
                    onClick={() => updateParam(key, val ? '' : 'true')}
                    className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all ${
                      val ? 'border-[#C9A84C] bg-[#C9A84C]/20' : 'border-[#3A3A3A] group-hover:border-[#C9A84C]'
                    }`}
                  >
                    {val && <span className="w-2 h-2 bg-[#C9A84C]" />}
                  </span>
                  <span
                    onClick={() => updateParam(key, val ? '' : 'true')}
                    className={`text-sm transition-colors ${val ? 'text-[#C9A84C]' : 'text-[#7A7A7A] group-hover:text-[#F5F0E8]'}`}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </DarkFilterSection>
          </div>
        </aside>

        {/* Mobile filter drawer backdrop */}
        <AnimatePresence>
          {filtersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/70 lg:hidden"
                onClick={() => setFiltersOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#111111] overflow-y-auto p-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-lg text-[#F5F0E8]">Refine</span>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X size={18} className="text-[#7A7A7A] hover:text-[#F5F0E8]" />
                  </button>
                </div>

                <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#7A7A7A] mb-5">Category</h3>
                  <ul className="space-y-3">
                    <li>
                      <button onClick={() => { updateParam('category', ''); setFiltersOpen(false) }}
                        className={`text-sm ${!category ? 'text-[#C9A84C] italic font-display text-base' : 'text-[#F5F0E8]'}`}>
                        All
                      </button>
                    </li>
                    {categories?.map((cat) => (
                      <li key={cat.id}>
                        <button onClick={() => { updateParam('category', cat.slug); setFiltersOpen(false) }}
                          className={`text-sm ${category === cat.slug ? 'text-[#C9A84C] italic font-display text-base' : 'text-[#F5F0E8]'}`}>
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#7A7A7A] mb-5">Price Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => {
                      const active = activePriceRange?.label === range.label
                      return (
                        <button key={range.label} onClick={() => { setPriceRange(range); setFiltersOpen(false) }}
                          className={`px-3 py-1.5 text-xs border rounded-full ${active ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-[#2A2A2A] text-[#7A7A7A]'}`}>
                          {range.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#7A7A7A] mb-5">Collection</h3>
                  {[
                    ['New Arrivals', 'is_new_arrival', isNewArrival],
                    ['Best Sellers', 'is_bestseller',  isBestseller],
                    ['On Sale',      'on_sale',        onSale],
                    ['Featured',     'is_featured',    isFeatured],
                  ].map(([label, key, val]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer py-2">
                      <span onClick={() => updateParam(key, val ? '' : 'true')}
                        className={`w-4 h-4 border flex items-center justify-center ${val ? 'border-[#C9A84C] bg-[#C9A84C]/20' : 'border-[#3A3A3A]'}`}>
                        {val && <span className="w-2 h-2 bg-[#C9A84C]" />}
                      </span>
                      <span onClick={() => updateParam(key, val ? '' : 'true')}
                        className={`text-sm ${val ? 'text-[#C9A84C]' : 'text-[#7A7A7A]'}`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>

                {hasFilters && (
                  <button onClick={() => { clearFilters(); setFiltersOpen(false) }}
                    className="mt-8 w-full border border-[#C9A84C] text-[#C9A84C] py-2.5 text-xs tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-colors">
                    Clear All Filters
                  </button>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-xs tracking-widest uppercase text-[#7A7A7A] hover:text-[#F5F0E8] border border-[#2A2A2A] px-4 py-2.5 transition-colors hover:border-[#C9A84C]"
              >
                <SlidersHorizontal size={13} /> Filters
                {hasFilters && (
                  <span className="w-4 h-4 bg-[#C9A84C] text-[#0D0D0D] text-[9px] flex items-center justify-center font-bold">
                    {[category, minPrice, onSale, isFeatured, isNewArrival, isBestseller].filter(Boolean).length}
                  </span>
                )}
              </button>
              <span className="text-[#5A5A5A] text-sm tracking-wider">
                {isLoading ? 'Loading…' : `Showing ${totalCount} exclusive ${totalCount === 1 ? 'piece' : 'pieces'}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.15em] uppercase text-[#5A5A5A] hidden sm:block">Sort by:</span>
              <div className="relative">
                <select
                  value={ordering}
                  onChange={(e) => updateParam('ordering', e.target.value)}
                  className="appearance-none bg-[#111111] border border-[#2A2A2A] text-[#F5F0E8] text-xs tracking-wider uppercase px-4 py-2.5 pr-8 focus:outline-none focus:border-[#C9A84C] cursor-pointer transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#111111]">{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C9A84C] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product grid */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 border border-[#2A2A2A] flex items-center justify-center mb-6">
                <ShoppingBag size={24} className="text-[#3A3A3A]" />
              </div>
              <p className="font-display text-xl text-[#F5F0E8] mb-2">No pieces found</p>
              <p className="text-[#5A5A5A] text-sm">Try adjusting your filters or browse the full collection.</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-6 border border-[#C9A84C] text-[#C9A84C] px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product, index) => (
                <DarkProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-20">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 border border-[#2A2A2A] text-xs tracking-widest uppercase text-[#7A7A7A] hover:border-[#C9A84C] hover:text-[#C9A84C] disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-xs tracking-widest transition-colors ${
                    page === p
                      ? 'bg-[#C9A84C] text-[#0D0D0D] font-medium'
                      : 'border border-[#2A2A2A] text-[#7A7A7A] hover:border-[#C9A84C] hover:text-[#C9A84C]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2.5 border border-[#2A2A2A] text-xs tracking-widest uppercase text-[#7A7A7A] hover:border-[#C9A84C] hover:text-[#C9A84C] disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer strip */}
      <footer className="border-t border-[#2A2A2A] py-12 text-center mt-8">
        <div className="font-display text-xl tracking-widest text-[#F5F0E8] mb-3">BUYLADIES</div>
        <p className="text-[#5A5A5A] text-xs tracking-widest uppercase">The Pinnacle of Heritage Craft</p>
      </footer>
    </div>
  )
}
