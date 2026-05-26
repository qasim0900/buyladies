import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../../api/products'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const { total_items } = useSelector((s) => s.cart)
  const { count: wishlistCount } = useSelector((s) => s.wishlist)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (res) => res.data,
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const navLinks = [
    { label: 'New Arrivals', to: '/products?is_new_arrival=true' },
    { label: 'Best Sellers', to: '/products?is_bestseller=true' },
    { label: 'Sale', to: '/products?on_sale=true' },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gray-900 text-white text-center py-2 text-xs tracking-widest uppercase">
        Free shipping on orders over PKR 2,000 · Use code <span className="text-gold-300 font-semibold">WELCOME10</span> for 10% off
      </div>

      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-luxury' : 'border-b border-gray-100'}`}>
        <nav className="container-page">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-700" aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                BUY<span className="text-rose-600">LADIES</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <div className="relative group" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}>
                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 tracking-wide uppercase transition-colors">
                  Categories <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white shadow-luxury-lg border border-gray-100 py-2 z-50"
                    >
                      <Link to="/products" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        All Products
                      </Link>
                      {categoriesData?.results?.map((cat) => (
                        <Link key={cat.id} to={`/products?category=${cat.slug}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                          {cat.name}
                        </Link>
                      ))}
                      {categoriesData?.map?.((cat) => (
                        <Link key={cat.id} to={`/products?category=${cat.slug}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {navLinks.map((link) => (
                <Link key={link.label} to={link.to} className="text-sm font-medium text-gray-700 hover:text-gray-900 tracking-wide uppercase transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 md:gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Search">
                <Search size={20} />
              </button>

              {isAuthenticated && (
                <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Wishlist">
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] w-4 h-4 flex items-center justify-center font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Cart">
                <ShoppingBag size={20} />
                {total_items > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-[10px] w-4 h-4 flex items-center justify-center font-medium">
                    {total_items}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative group hidden md:block">
                  <button className="flex items-center gap-1.5 p-2 text-gray-700 hover:text-gray-900 transition-colors">
                    <User size={20} />
                    <span className="text-sm font-medium">{user?.first_name || 'Account'}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-luxury-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                    <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Sign Out</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center gap-1.5 p-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <User size={20} />
                  <span className="text-sm font-medium">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="container-page py-4">
                <div className="flex items-center gap-3 max-w-2xl mx-auto">
                  <Search size={18} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands, categories..."
                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none py-1"
                    autoFocus
                  />
                  <button type="submit" className="text-sm font-medium text-gray-700 hover:text-gray-900 uppercase tracking-wide">Search</button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-700">
                    <X size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <div className="relative w-72 h-full bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <span className="font-display text-xl font-semibold">BUY<span className="text-rose-600">LADIES</span></span>
                <button onClick={() => setMenuOpen(false)}><X size={22} /></button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <Link to="/products" className="flex items-center px-5 py-3.5 text-sm font-medium text-gray-800 hover:bg-gray-50 uppercase tracking-wide">All Products</Link>
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.to} className="flex items-center px-5 py-3.5 text-sm font-medium text-gray-800 hover:bg-gray-50 uppercase tracking-wide">{link.label}</Link>
                ))}
                <div className="my-4 border-t border-gray-100" />
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                    <Link to="/orders" className="flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    <Link to="/wishlist" className="flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                    <button onClick={handleLogout} className="flex items-center w-full px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">Sign In</Link>
                    <Link to="/register" className="flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
