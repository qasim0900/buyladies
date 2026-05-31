import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, RefreshCw, Shield, Headphones, ArrowRight, ShoppingBag } from 'lucide-react'
import { getFeaturedProducts, getNewArrivals, getCategories } from '../api/products'
import ProductGrid from '../components/products/ProductGrid'
import Spinner from '../components/ui/Spinner'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

const JEWEL_TONES = ['#1E3932', '#6B0F1A', '#003366', '#4A1942', '#1A4731', '#7B2D00']
const CAT_TONES   = ['#1E3932', '#800020', '#003366', '#4A1942', '#1A4731', '#2E4942']

function OrnamentalCorners() {
  return (
    <>
      <span className="absolute -top-[6px] -left-[6px] w-4 h-4 border-t-2 border-l-2 border-[#D4AF37] z-10 pointer-events-none" />
      <span className="absolute -top-[6px] -right-[6px] w-4 h-4 border-t-2 border-r-2 border-[#D4AF37] z-10 pointer-events-none" />
      <span className="absolute -bottom-[6px] -left-[6px] w-4 h-4 border-b-2 border-l-2 border-[#D4AF37] z-10 pointer-events-none" />
      <span className="absolute -bottom-[6px] -right-[6px] w-4 h-4 border-b-2 border-r-2 border-[#D4AF37] z-10 pointer-events-none" />
    </>
  )
}

function SectionDivider({ subtitle, title }) {
  return (
    <div className="flex flex-col items-center mb-14">
      <div className="h-16 w-px mb-6" style={{ backgroundColor: '#1E3932' }} />
      {subtitle && (
        <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: '#800020' }}>
          {subtitle}
        </p>
      )}
      <h2 className="font-display text-4xl md:text-5xl text-center" style={{ color: '#1E3932' }}>
        {title}
      </h2>
    </div>
  )
}

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedProducts,
    select: (res) => res.data?.results || res.data || [],
  })
  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: getNewArrivals,
    select: (res) => res.data?.results || res.data || [],
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (res) => res.data?.results || res.data || [],
  })

  const featuredSlice = (featured || []).slice(0, 4)

  return (
    <div style={{ backgroundColor: '#FDFBF7', color: '#1E3932' }} className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center overflow-hidden border-b-4"
        style={{ height: '85vh', borderColor: '#1E3932' }}
      >
        {/* Full-bleed background photo */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 z-10"
            style={{ backgroundColor: '#1E3932', opacity: 0.62, mixBlendMode: 'multiply' }}
          />
          <img
            src="/images/cultural-hero.png"
            alt="The Heritage Collection"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Decorative gold corner SVGs */}
        {[
          { pos: 'top-8 left-8', rotate: '' },
          { pos: 'top-8 right-8', rotate: 'rotate-90' },
          { pos: 'bottom-8 left-8', rotate: '-rotate-90' },
          { pos: 'bottom-8 right-8', rotate: 'rotate-180' },
        ].map(({ pos, rotate }, i) => (
          <svg
            key={i}
            className={`absolute w-16 h-16 z-10 transform ${pos} ${rotate}`}
            viewBox="0 0 100 100"
            fill="#D4AF37"
          >
            <path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z" />
            <circle cx="40" cy="40" r="10" />
          </svg>
        ))}

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative z-10 text-center max-w-4xl px-6"
        >
          <h1 className="font-display leading-tight text-white mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
            The Heritage
            <br />
            <span className="italic" style={{ color: '#D4AF37' }}>Collection</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-white/90 text-lg md:text-xl max-w-xl mx-auto mb-10 tracking-wide leading-relaxed"
          >
            Embrace the timeless elegance of Pakistani craftsmanship. Rich textiles,
            intricate embroidery, unapologetic beauty.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-10 py-5 text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:brightness-90"
              style={{ backgroundColor: '#D4AF37', color: '#1E3932' }}
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
            <Link
              to="/products?is_new_arrival=true"
              className="inline-flex items-center gap-2 px-10 py-5 text-sm font-semibold tracking-widest uppercase border-2 text-white border-white/60 transition-all duration-300 hover:bg-white/10"
            >
              New Arrivals
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES STRIP ────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1E3932' }}>
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: Truck,       title: 'Free Delivery',   desc: 'On orders above PKR 2,000' },
              { icon: RefreshCw,   title: 'Easy Returns',    desc: '30-day hassle-free returns' },
              { icon: Shield,      title: 'Secure Payments', desc: '100% safe & encrypted' },
              { icon: Headphones,  title: '24/7 Support',    desc: 'Dedicated customer care' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex items-center gap-4 py-6 px-4 md:px-6 border-r last:border-r-0"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <Icon size={22} style={{ color: '#D4AF37' }} className="flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED MASTERPIECES ─────────────────────────────────────── */}
      <motion.section {...fadeUp} className="py-24 px-6 md:px-12" style={{ backgroundColor: '#FDFBF7' }}>
        <SectionDivider subtitle="Hand-picked" title="Featured Masterpieces" />

        {loadingFeatured ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
            {(featuredSlice.length > 0 ? featuredSlice : Array(4).fill(null)).map((product, i) => {
              const price  = product ? (product.effective_price || product.base_price) : null
              const imgSrc = product?.primary_image?.image_url
              const hasDiscount = product?.sale_price && parseFloat(product.base_price) > parseFloat(product.sale_price)
              return (
                <motion.div
                  key={product?.id ?? i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <Link to={product ? `/products/${product.slug}` : '/products'} className="block">
                    {/* Card with ornamental corner marks */}
                    <div className="relative mb-5">
                      <OrnamentalCorners />
                      <div
                        className="overflow-hidden aspect-[3/4] relative"
                        style={{ border: '2px solid #1E3932' }}
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="w-full h-full relative transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundColor: JEWEL_TONES[i % JEWEL_TONES.length] }}
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
                              <ShoppingBag size={48} color="rgba(255,255,255,0.25)" />
                            </div>
                          </div>
                        )}
                        {/* Badges */}
                        {product?.is_new_arrival && (
                          <div className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-widest uppercase text-white" style={{ backgroundColor: '#1E3932' }}>
                            New
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold text-white" style={{ backgroundColor: '#800020' }}>
                            -{product.discount_percent}%
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div
                          className="absolute bottom-4 left-4 right-4 py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ backgroundColor: 'rgba(253,251,247,0.92)', border: '1px solid #1E3932' }}
                        >
                          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#1E3932' }}>
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-display text-xl mb-1 leading-snug group-hover:opacity-70 transition-opacity" style={{ color: '#1E3932' }}>
                      {product?.name ?? 'Coming Soon'}
                    </h3>
                    {product?.brand_name && (
                      <p className="text-[10px] font-medium tracking-widest uppercase mb-1" style={{ color: 'rgba(30,57,50,0.45)' }}>
                        {product.brand_name}
                      </p>
                    )}
                    {price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-medium" style={{ color: '#800020' }}>
                          PKR {parseFloat(price).toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs line-through" style={{ color: 'rgba(30,57,50,0.4)' }}>
                            PKR {parseFloat(product.base_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/products?is_featured=true"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:text-[#FDFBF7] hover:bg-[#1E3932]"
            style={{ border: '2px solid #1E3932', color: '#1E3932' }}
          >
            View All Products <ArrowRight size={15} />
          </Link>
        </div>
      </motion.section>

      {/* ── CATEGORIES ────────────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <motion.section {...fadeUp} className="py-16" style={{ backgroundColor: '#FDFBF7' }}>
          <div className="container-page">
            <SectionDivider subtitle="Browse By" title="Shop by Collection" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="group relative block overflow-hidden aspect-square"
                    style={{ border: '2px solid #1E3932' }}
                  >
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundColor: CAT_TONES[i % CAT_TONES.length] }}
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-lg font-medium text-white leading-tight">{cat.name}</h3>
                      <p className="text-xs text-white/70 mt-1 group-hover:text-white transition-colors tracking-wide">Shop Now →</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── PROMO BANNER ──────────────────────────────────────────────── */}
      <motion.section
        {...fadeUp}
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: '#800020', color: '#FDFBF7' }}
      >
        {/* Islamic geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heritage-geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M30 0 L60 30 L30 60 L0 30 Z M15 15 L45 45 M15 45 L45 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
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

      {/* ── NEW ARRIVALS ──────────────────────────────────────────────── */}
      <motion.section {...fadeUp} className="py-24" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="container-page">
          <div className="flex items-end justify-between mb-14">
            <div className="flex items-center gap-6">
              <div className="h-14 w-px hidden sm:block" style={{ backgroundColor: '#1E3932' }} />
              <div>
                <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: '#800020' }}>Just Arrived</p>
                <h2 className="font-display text-3xl md:text-4xl" style={{ color: '#1E3932' }}>New Arrivals</h2>
              </div>
            </div>
            <Link
              to="/products?is_new_arrival=true"
              className="hidden md:flex items-center gap-2 text-sm font-medium tracking-wide uppercase transition-opacity hover:opacity-60"
              style={{ color: '#1E3932' }}
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loadingNew ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <ProductGrid products={(newArrivals || []).slice(0, 8)} />
          )}

          <div className="text-center mt-10 md:hidden">
            <Link
              to="/products?is_new_arrival=true"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-widest uppercase border-2 transition-colors"
              style={{ borderColor: '#1E3932', color: '#1E3932' }}
            >
              View All New Arrivals
            </Link>
          </div>
        </div>
      </motion.section>

    </div>
  )
}
