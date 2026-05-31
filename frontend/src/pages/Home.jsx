import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFeaturedProducts, getNewArrivals, getCategories } from '../api/products'
import Spinner from '../components/ui/Spinner'

const JEWEL = ['#1E3932', '#6B0F1A', '#003366', '#4A1942', '#1A4731', '#7B2D00']

const OCCASIONS = [
  {
    key:   'wedding',
    name:  'Wedding Season',
    sub:   'Shaadi hai — dress like it',
    color: '#6B0F1A',
    badge: 'Bridal',
    link:  '/products?is_featured=true',
  },
  {
    key:   'eid',
    name:  'Eid Collection',
    sub:   'Mornings that deserve silk',
    color: '#1E3932',
    badge: 'New',
    link:  '/products?is_new_arrival=true',
  },
  {
    key:   'pret',
    name:  'Everyday Pret',
    sub:   'Every day deserves beauty',
    color: '#4A1942',
    badge: 'Pret',
    link:  '/products',
  },
]

/* ── Product card used inside horizontal rails ─────────────────── */
function RailCard({ product, color, index }) {
  const img  = product?.primary_image?.image_url
  const price = product
    ? parseFloat(product.effective_price || product.base_price).toLocaleString()
    : null

  return (
    <Link
      to={product ? `/products/${product.slug}` : '/products'}
      className="flex-shrink-0 w-52 group cursor-pointer"
    >
      <div className="aspect-[3/4] overflow-hidden relative mb-3 bg-stone-100">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundColor: JEWEL[index % JEWEL.length] }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%,#fff),' +
                  'repeating-linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%,#fff)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag size={36} color="rgba(255,255,255,0.2)" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to top, ${color}CC 0%, transparent 55%)` }}
        />
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center justify-center w-full py-2 text-white text-[10px] tracking-[0.2em] uppercase border border-white/60 hover:bg-white hover:text-[#1E3932] transition-colors">
            View Details
          </span>
        </div>

        {/* Badge */}
        {product?.is_new_arrival && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 text-white text-[9px] tracking-widest uppercase"
            style={{ backgroundColor: color }}
          >
            New
          </div>
        )}
        {product?.is_featured && !product?.is_new_arrival && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 text-white text-[9px] tracking-widest uppercase"
            style={{ backgroundColor: color }}
          >
            Featured
          </div>
        )}
      </div>

      <p className="text-xs text-[#1E3932] font-medium leading-snug mb-1 line-clamp-2 group-hover:text-[#800020] transition-colors">
        {product?.name ?? 'Coming Soon'}
      </p>
      {price && (
        <p className="text-xs font-medium" style={{ color }}>
          PKR {price}
        </p>
      )}
    </Link>
  )
}

/* ── "See all" ghost card ───────────────────────────────────────── */
function SeeAllCard({ occ }) {
  return (
    <Link
      to={occ.link}
      className="flex-shrink-0 w-52 aspect-[3/4] border-2 border-dashed border-[#1E3932]/15 flex items-center justify-center group hover:border-[#1E3932]/30 transition-colors"
    >
      <div className="text-center">
        <p className="font-display text-[#1E3932]/20 text-2xl font-medium mb-2 group-hover:text-[#1E3932]/40 transition-colors">
          View All
        </p>
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#1E3932]/20 group-hover:text-[#1E3932]/40 transition-colors">
          {occ.name} →
        </p>
      </div>
    </Link>
  )
}

/* ── Occasion row with horizontal scroll ────────────────────────── */
function OccasionRow({ occ, products, loading }) {
  const railRef = useRef(null)
  const scrollBy = (d) => railRef.current?.scrollBy({ left: d, behavior: 'smooth' })

  const items = products?.length > 0
    ? products.slice(0, 8)
    : Array(4).fill(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="border-b border-[#1E3932]/10 pb-16 mb-16"
    >
      {/* Row header */}
      <div className="flex items-end justify-between mb-8 px-6 md:px-14">
        <div className="flex items-end gap-5">
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: occ.color, minHeight: 48 }}
          />
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-medium" style={{ color: '#1E3932' }}>
              {occ.name}
            </h2>
            <p
              className="text-[10px] tracking-[0.25em] uppercase mt-1"
              style={{ color: occ.color }}
            >
              {occ.sub}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => scrollBy(-340)}
            className="w-9 h-9 border border-[#1E3932]/20 flex items-center justify-center hover:border-[#1E3932] transition-colors text-[#1E3932]/40 hover:text-[#1E3932]"
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scrollBy(340)}
            className="w-9 h-9 border border-[#1E3932]/20 flex items-center justify-center hover:border-[#1E3932] transition-colors text-[#1E3932]/40 hover:text-[#1E3932]"
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
          <Link
            to={occ.link}
            className="hidden md:inline-flex text-[10px] tracking-[0.25em] uppercase border-b border-[#1E3932]/20 pb-0.5 text-[#1E3932]/40 hover:text-[#1E3932] hover:border-[#1E3932] transition-colors ml-2"
          >
            Shop All {occ.name} →
          </Link>
        </div>
      </div>

      {/* Rail */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : (
        <div
          ref={railRef}
          className="flex gap-5 overflow-x-auto px-6 md:px-14 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((product, i) => (
            <RailCard
              key={product?.id ?? i}
              product={product}
              color={occ.color}
              index={i}
            />
          ))}
          <SeeAllCard occ={occ} />
        </div>
      )}
    </motion.div>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function Home() {
  const { data: featured,    isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedProducts,
    select: (res) => res.data?.results || res.data || [],
  })
  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: getNewArrivals,
    select: (res) => res.data?.results || res.data || [],
  })

  const eidProducts  = (newArrivals || []).slice(0, 8)
  const pretProducts = (newArrivals || []).slice(8, 16)

  return (
    <div style={{ backgroundColor: '#FDFBF7', color: '#1E3932' }} className="overflow-x-hidden">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="px-6 md:px-14 py-14 md:py-16 border-b border-[#1E3932]/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-10">
          {/* Left: editorial text */}
          <div className="max-w-xl flex-shrink-0">
            <p className="text-[#800020] text-[10px] tracking-[0.5em] uppercase mb-5">
              Heritage Collection · 2024
            </p>
            <h1
              className="font-display text-[#1E3932] leading-none mb-6"
              style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)' }}
            >
              Dressed for<br />
              every occasion<br />
              <span className="italic text-[#800020]">beautifully.</span>
            </h1>
            <p className="text-[#1E3932]/50 max-w-md leading-relaxed mb-8 text-sm md:text-base">
              Pakistani craftsmanship curated by occasion — from everyday pret
              to the most sacred bridal moment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E3932] text-white text-xs tracking-[0.25em] uppercase hover:bg-[#800020] transition-colors duration-300"
              >
                Explore All <ArrowRight size={14} />
              </Link>
              <Link
                to="/products?is_new_arrival=true"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[#1E3932]/30 text-[#1E3932] text-xs tracking-[0.25em] uppercase hover:border-[#1E3932] transition-colors duration-300"
              >
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Right: 3 stacked offset photos */}
          <div className="hidden lg:flex gap-3 flex-shrink-0 items-start">
            {[
              { src: '/images/cultural-hero.png', h: 250, mt: 0 },
              { src: null, h: 280, mt: 20, bg: '#1E3932' },
              { src: null, h: 230, mt: 10, bg: '#4A1942' },
            ].map(({ src, h, mt, bg }, i) => (
              <div
                key={i}
                className="overflow-hidden w-40 flex-shrink-0"
                style={{ height: h, marginTop: mt }}
              >
                {src ? (
                  <img
                    src={src}
                    alt="Heritage fashion"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full relative"
                    style={{ backgroundColor: bg }}
                  >
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%,#fff),' +
                          'repeating-linear-gradient(45deg,#fff 25%,transparent 25%,transparent 75%,#fff 75%,#fff)',
                        backgroundPosition: '0 0, 10px 10px',
                        backgroundSize: '20px 20px',
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag size={28} color="rgba(255,255,255,0.18)" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Craft signals — replaces generic trust icons */}
        <div className="max-w-7xl mx-auto flex flex-wrap gap-10 mt-12 pt-8 border-t border-[#1E3932]/10">
          {[
            ['Hand-embroidered in Pakistan', 'Each piece by master karigars'],
            ['12 artisan ateliers',          'Direct from the craftsperson'],
            ['Free delivery PKR 2,000+',     '30-day hassle-free returns'],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="text-xs font-semibold text-[#1E3932]">{title}</p>
              <p className="text-[10px] text-[#1E3932]/40 tracking-wide mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── OCCASION ROWS ────────────────────────────────────────────── */}
      <div className="pt-16">
        <OccasionRow
          occ={OCCASIONS[0]}
          products={featured || []}
          loading={loadingFeatured}
        />
        <OccasionRow
          occ={OCCASIONS[1]}
          products={eidProducts}
          loading={loadingNew}
        />
        <OccasionRow
          occ={OCCASIONS[2]}
          products={pretProducts.length > 0 ? pretProducts : eidProducts}
          loading={loadingNew}
        />
      </div>

      {/* ── PROMO BANNER ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: '#800020', color: '#FDFBF7' }}
      >
        {/* Islamic geometric pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heritage-geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M30 0 L60 30 L30 60 L0 30 Z M15 15 L45 45 M15 45 L45 15"
                  stroke="currentColor" strokeWidth="2" fill="none"
                />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#heritage-geo)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <div
            className="inline-block px-4 py-1 mb-8 text-sm tracking-[0.2em] uppercase"
            style={{ border: '1px solid #D4AF37', color: '#D4AF37' }}
          >
            Festive Season Offer
          </div>
          <h2 className="font-display text-4xl md:text-6xl mb-6 leading-tight">
            Radiate Confidence<br className="hidden md:block" /> This Season
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Complimentary tailoring on all unstitched collections. Use code{' '}
            <span className="font-semibold" style={{ color: '#D4AF37' }}>SAVE50</span>{' '}
            for 50% off your first order.
          </p>
          <Link
            to="/products?on_sale=true"
            className="inline-flex items-center gap-2 px-10 py-5 text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:brightness-90"
            style={{ backgroundColor: '#D4AF37', color: '#800020' }}
          >
            Shop Sale <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>

    </div>
  )
}
