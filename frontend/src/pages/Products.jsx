import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown, Grid2X2, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProducts, getCategories, getBrands } from '../api/products'
import ProductGrid from '../components/products/ProductGrid'

const SORT_OPTIONS = [
  { label: 'Newest', value: '-created_at' },
  { label: 'Price: Low to High', value: 'base_price' },
  { label: 'Price: High to Low', value: '-base_price' },
  { label: 'Name A-Z', value: 'name' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const ordering = searchParams.get('ordering') || '-created_at'
  const isFeatured = searchParams.get('is_featured') || ''
  const isNewArrival = searchParams.get('is_new_arrival') || ''
  const isBestseller = searchParams.get('is_bestseller') || ''
  const onSale = searchParams.get('on_sale') || ''

  const params = {
    search, category, brand, ordering, page,
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
    ...(isFeatured && { is_featured: true }),
    ...(isNewArrival && { is_new_arrival: true }),
    ...(isBestseller && { is_bestseller: true }),
    ...(onSale && { on_sale: true }),
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
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    select: (res) => res.data?.results || res.data || [],
  })

  const products = data?.results || data || []
  const totalPages = data?.count ? Math.ceil(data.count / 20) : 1
  const totalCount = data?.count || products.length

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setPage(1)
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearchParams({})
    setPage(1)
  }

  const hasFilters = category || brand || minPrice || maxPrice || isFeatured || isNewArrival || isBestseller || onSale

  const pageTitle = search ? `Search: "${search}"` :
    isNewArrival ? 'New Arrivals' :
    isBestseller ? 'Best Sellers' :
    isFeatured ? 'Featured Products' :
    onSale ? 'Sale' :
    'All Products'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-page py-8">
          <h1 className="font-display text-3xl font-medium text-gray-900 mb-1">{pageTitle}</h1>
          <p className="text-sm text-gray-500">{totalCount} {totalCount === 1 ? 'product' : 'products'}</p>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            fixed md:static inset-0 z-40 md:z-auto md:w-64 md:flex-shrink-0 bg-white md:bg-transparent
            transform transition-transform duration-300 md:transform-none
            ${filtersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="h-full md:h-auto overflow-y-auto p-6 md:p-0 border-r border-gray-100 md:border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-gray-900 uppercase tracking-widest text-sm">Filters</h2>
                <div className="flex items-center gap-3">
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-rose-600 hover:text-rose-700 underline">Clear All</button>
                  )}
                  <button onClick={() => setFiltersOpen(false)} className="md:hidden"><X size={18} /></button>
                </div>
              </div>

              {/* Category */}
              <FilterSection title="Category">
                <label className="filter-option cursor-pointer">
                  <input type="radio" name="category" value="" checked={!category} onChange={() => updateParam('category', '')} className="sr-only" />
                  <span className={`text-sm py-1.5 block transition-colors ${!category ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>All Categories</span>
                </label>
                {categories?.map((cat) => (
                  <label key={cat.id} className="cursor-pointer">
                    <input type="radio" name="category" value={cat.slug} checked={category === cat.slug} onChange={() => updateParam('category', cat.slug)} className="sr-only" />
                    <span className={`text-sm py-1.5 block transition-colors ${category === cat.slug ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>{cat.name}</span>
                  </label>
                ))}
              </FilterSection>

              {/* Brand */}
              {brands && brands.length > 0 && (
                <FilterSection title="Brand">
                  {brands.slice(0, 10).map((b) => (
                    <label key={b.id} className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={brand === b.slug}
                        onChange={() => updateParam('brand', brand === b.slug ? '' : b.slug)}
                        className="w-3.5 h-3.5 accent-gray-800"
                      />
                      <span className="text-sm text-gray-600 hover:text-gray-900">{b.name}</span>
                    </label>
                  ))}
                </FilterSection>
              )}

              {/* Price Range */}
              <FilterSection title="Price Range">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParam('min_price', e.target.value)}
                    className="input-field text-xs px-3 py-2 w-full"
                  />
                  <span className="text-gray-400 flex-shrink-0">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParam('max_price', e.target.value)}
                    className="input-field text-xs px-3 py-2 w-full"
                  />
                </div>
              </FilterSection>

              {/* Availability */}
              <FilterSection title="Availability">
                {[
                  ['New Arrivals', 'is_new_arrival', isNewArrival],
                  ['Best Sellers', 'is_bestseller', isBestseller],
                  ['On Sale', 'on_sale', onSale],
                  ['Featured', 'is_featured', isFeatured],
                ].map(([label, key, val]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={!!val}
                      onChange={() => updateParam(key, val ? '' : 'true')}
                      className="w-3.5 h-3.5 accent-gray-800"
                    />
                    <span className="text-sm text-gray-600 hover:text-gray-900">{label}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {filtersOpen && (
            <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setFiltersOpen(false)} />
          )}

          {/* Products Area */}
          <div className="flex-1">
            {/* Sort & View controls */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 px-3 py-2"
              >
                <SlidersHorizontal size={15} /> Filters {hasFilters && <span className="w-4 h-4 bg-rose-600 text-white text-[10px] flex items-center justify-center rounded-full">{[category, brand, minPrice, maxPrice, onSale, isFeatured, isNewArrival, isBestseller].filter(Boolean).length}</span>}
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-500 hidden md:block">Sort by:</span>
                <select
                  value={ordering}
                  onChange={(e) => updateParam('ordering', e.target.value)}
                  className="text-sm border border-gray-200 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <ProductGrid products={products} loading={isLoading} emptyMessage="No products match your filters. Try adjusting your search." />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 text-sm text-gray-700 hover:border-gray-400 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 text-sm transition-colors ${page === p ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-700 hover:border-gray-400'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 text-sm text-gray-700 hover:border-gray-400 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mb-6 pb-6 border-b border-gray-100">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-semibold text-gray-900 uppercase tracking-widest">{title}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
