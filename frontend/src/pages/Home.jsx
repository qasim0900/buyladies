import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, RefreshCw, Shield, Headphones } from 'lucide-react'
import { getFeaturedProducts, getNewArrivals, getCategories, getBestSellers } from '../api/products'
import ProductGrid from '../components/products/ProductGrid'
import Spinner from '../components/ui/Spinner'

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } }

export default function Home() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedProducts,
    select: (res) => res.data?.results || res.data || [],
  })
  const { data: newArrivalsData, isLoading: loadingNew } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: getNewArrivals,
    select: (res) => res.data?.results || res.data || [],
  })
  const { data: bestSellersData } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: getBestSellers,
    select: (res) => res.data?.results || res.data || [],
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (res) => res.data?.results || res.data || [],
  })

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders above PKR 2,000' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
    { icon: Shield, title: 'Secure Payments', desc: '100% safe & encrypted' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer care' },
  ]

  const heroGradients = [
    'from-rose-50 to-pink-100',
    'from-stone-100 to-amber-50',
    'from-slate-100 to-zinc-200',
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-stone-100 min-h-[85vh] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-amber-200 rounded-full blur-2xl" />
        </div>
        <div className="container-page relative z-10 py-20">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="section-subtitle mb-4"
            >
              Spring / Summer 2025
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-medium text-gray-900 leading-[1.05] tracking-tight mb-6"
            >
              Dress Like
              <br />
              <span className="italic text-rose-600">Royalty</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-600 text-lg mb-10 leading-relaxed max-w-md"
            >
              Discover premium ladies fashion — from elegant formals to casual chic. Curated collections for every occasion.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <Link to="/products" className="btn-primary px-8 py-4 text-sm">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products?is_new_arrival=true" className="btn-outline px-8 py-4 text-sm">
                New Arrivals
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-6 mt-12 pt-8 border-t border-rose-200/50"
            >
              {[['10K+', 'Happy Customers'], ['500+', 'Premium Products'], ['50+', 'Top Brands']].map(([num, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-semibold text-gray-900">{num}</p>
                  <p className="text-xs text-gray-500 tracking-wide">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Decorative right side */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 hidden lg:flex items-center justify-center p-16">
          <div className="relative w-full h-full max-h-[600px]">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-200 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="font-display text-8xl text-rose-300 mb-4 opacity-30">👗</div>
                <p className="font-display text-2xl text-rose-400 opacity-60 italic">Fashion Forward</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gold-200 rounded-xl opacity-40 blur-sm" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-200 rounded-full opacity-40 blur-sm" />
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-gray-900 text-white">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-800">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 py-6 px-4 md:px-6">
                <Icon size={22} className="text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <motion.section {...fadeUp} className="py-16 md:py-24">
          <div className="container-page">
            <div className="text-center mb-12">
              <p className="section-subtitle mb-3">Browse By</p>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="group relative block overflow-hidden bg-gray-50 aspect-square"
                  >
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${heroGradients[i % heroGradients.length]}`}>
                        <span className="text-4xl">👗</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-lg font-medium text-white">{cat.name}</h3>
                      <p className="text-xs text-white/70 mt-1 group-hover:text-white transition-colors">Shop Now →</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* New Arrivals */}
      <motion.section {...fadeUp} className="py-16 bg-cream-50">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-subtitle mb-2">Just Arrived</p>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/products?is_new_arrival=true" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors uppercase tracking-wide">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {loadingNew ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <ProductGrid products={newArrivalsData?.slice(0, 8)} />
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/products?is_new_arrival=true" className="btn-outline">View All New Arrivals</Link>
          </div>
        </div>
      </motion.section>

      {/* Promo Banner */}
      <motion.section {...fadeUp} className="py-16">
        <div className="container-page">
          <div className="relative overflow-hidden bg-gray-900 text-white p-12 md:p-20 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            </div>
            <div className="relative z-10">
              <p className="text-rose-400 text-sm font-medium tracking-widest uppercase mb-3">Limited Time Offer</p>
              <h2 className="font-display text-4xl md:text-6xl font-medium mb-4">Up to 50% Off</h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">Explore our sale collection and save big on premium ladies fashion. Use code <span className="text-gold-300 font-semibold">SAVE50</span> at checkout.</p>
              <Link to="/products?on_sale=true" className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 text-sm font-medium tracking-widest uppercase transition-colors">
                Shop Sale <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Products */}
      {(featuredData && featuredData.length > 0) && (
        <motion.section {...fadeUp} className="py-16 bg-gray-50">
          <div className="container-page">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-subtitle mb-2">Hand-picked</p>
                <h2 className="section-title">Featured Products</h2>
              </div>
              <Link to="/products?is_featured=true" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors uppercase tracking-wide">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <ProductGrid products={featuredData?.slice(0, 8)} loading={loadingFeatured} />
          </div>
        </motion.section>
      )}

      {/* Best Sellers */}
      {(bestSellersData && bestSellersData.length > 0) && (
        <motion.section {...fadeUp} className="py-16">
          <div className="container-page">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-subtitle mb-2">Most Loved</p>
                <h2 className="section-title">Best Sellers</h2>
              </div>
              <Link to="/products?is_bestseller=true" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors uppercase tracking-wide">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <ProductGrid products={bestSellersData?.slice(0, 8)} />
          </div>
        </motion.section>
      )}
    </div>
  )
}
