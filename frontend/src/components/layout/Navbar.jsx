import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../../api/products'

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const { isAuthenticated, user }       = useSelector((s) => s.auth)
  const { total_items }                 = useSelector((s) => s.cart)
  const { count: wishlistCount }        = useSelector((s) => s.wishlist)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { pathname, search } = useLocation()

  // Dark mode: products listing, login, register, profile, and cart pages
  const isProductListing = pathname === '/products' || pathname === '/login' || pathname === '/register' || pathname === '/profile' || pathname === '/cart'

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
  }, [pathname, search])

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
    { label: 'Sale',         to: '/products?on_sale=true' },
  ]

  // --- Theming helpers ---
  const dark = isProductListing

  const announcementBg  = dark ? 'bg-[#0D0D0D] border-b border-[#1A1A1A]' : 'bg-gray-900'
  const headerBg        = dark
    ? `bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#2A2A2A] ${scrolled ? 'shadow-[0_4px_30px_rgba(0,0,0,0.6)]' : ''}`
    : `bg-white transition-shadow duration-300 ${scrolled ? 'shadow-luxury' : 'border-b border-gray-100'}`
  const logoText        = dark ? 'text-[#F5F0E8]' : 'text-gray-900'
  const logoAccent      = dark ? 'text-[#C9A84C]' : 'text-rose-600'
  const navLinkBase     = dark
    ? 'text-sm font-medium tracking-widest uppercase transition-colors text-[#A0A0A0] hover:text-[#C9A84C]'
    : 'text-sm font-medium text-gray-700 hover:text-gray-900 tracking-wide uppercase transition-colors'
  const iconBase        = dark
    ? 'p-2 text-[#A0A0A0] hover:text-[#C9A84C] transition-colors'
    : 'p-2 text-gray-700 hover:text-gray-900 transition-colors'
  const badgeBg         = dark ? 'bg-[#C9A84C] text-[#0D0D0D]' : 'bg-gray-900 text-white'
  const wishBadgeBg     = dark ? 'bg-[#C9A84C] text-[#0D0D0D]' : 'bg-rose-600 text-white'
  const dropdownBg      = dark
    ? 'bg-[#111111] border border-[#2A2A2A] shadow-[0_8px_40px_rgba(0,0,0,0.8)]'
    : 'bg-white shadow-luxury-lg border border-gray-100'
  const dropdownLink    = dark
    ? 'block px-4 py-2.5 text-sm text-[#A0A0A0] hover:text-[#C9A84C] hover:bg-[#1A1A1A] transition-colors'
    : 'block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors'
  const searchBarBg     = dark
    ? 'bg-[#111111] border-t border-[#2A2A2A]'
    : 'bg-white border-t border-gray-100'
  const searchInput     = dark
    ? 'flex-1 text-sm text-[#F5F0E8] placeholder-[#5A5A5A] bg-transparent outline-none py-1'
    : 'flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none py-1'
  const searchIcon      = dark ? 'text-[#5A5A5A]' : 'text-gray-400'
  const searchBtn       = dark
    ? 'text-sm font-medium text-[#C9A84C] hover:text-[#F5F0E8] uppercase tracking-wide'
    : 'text-sm font-medium text-gray-700 hover:text-gray-900 uppercase tracking-wide'
  const mobileMenuBg    = dark ? 'bg-[#111111]' : 'bg-white'
  const mobileMenuBorder = dark ? 'border-b border-[#2A2A2A]' : 'border-b border-gray-100'
  const mobileLink      = dark
    ? 'flex items-center px-5 py-3.5 text-sm font-medium text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#C9A84C] uppercase tracking-wide transition-colors'
    : 'flex items-center px-5 py-3.5 text-sm font-medium text-gray-800 hover:bg-gray-50 uppercase tracking-wide'
  const mobileLinkSub   = dark
    ? 'flex items-center px-5 py-3.5 text-sm text-[#7A7A7A] hover:bg-[#1A1A1A] hover:text-[#C9A84C] transition-colors'
    : 'flex items-center px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50'
  const menuToggle      = dark ? 'p-2 text-[#A0A0A0] hover:text-[#C9A84C] transition-colors' : 'p-2 text-gray-700'

  const allCategories = categoriesData?.results ?? categoriesData ?? []

  return (
    <>
      {/* Announcement Bar */}
      <div className={`${announcementBg} text-white text-center py-2 text-xs tracking-widest uppercase`}>
        Free shipping on orders over PKR 2,000 · Use code{' '}
        <span className="text-[#C9A84C] font-semibold">WELCOME10</span> for 10% off
      </div>

      <header className={`sticky top-0 z-50 ${headerBg}`}>
        <nav className="container-page">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden ${menuToggle}`} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className={`font-display text-2xl md:text-3xl font-semibold tracking-tight ${logoText}`}>
                BUY<span className={logoAccent}>LADIES</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <div
                className="relative group"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button className={`flex items-center gap-1 ${navLinkBase}`}>
                  Categories{' '}
                  <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-full left-0 mt-2 w-56 py-2 z-50 ${dropdownBg}`}
                    >
                      <Link to="/products" className={dropdownLink}>All Products</Link>
                      {allCategories.map((cat) => (
                        <Link key={cat.id} to={`/products?category=${cat.slug}`} className={dropdownLink}>
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((link) => (
                <Link key={link.label} to={link.to} className={navLinkBase}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 md:gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className={iconBase} aria-label="Search">
                <Search size={20} />
              </button>

              {isAuthenticated && (
                <Link to="/wishlist" className={`relative ${iconBase}`} aria-label="Wishlist">
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 ${wishBadgeBg} text-[10px] w-4 h-4 flex items-center justify-center font-medium`}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <Link to="/cart" className={`relative ${iconBase}`} aria-label="Cart">
                <ShoppingBag size={20} />
                {total_items > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 ${badgeBg} text-[10px] w-4 h-4 flex items-center justify-center font-medium`}>
                    {total_items}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative group hidden md:block">
                  <button className={`flex items-center gap-1.5 ${iconBase}`}>
                    <User size={20} />
                    <span className="text-sm font-medium">{user?.first_name || 'Account'}</span>
                  </button>
                  <div className={`absolute right-0 top-full mt-1 w-48 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${dropdownBg}`}>
                    <Link to="/profile"  className={dropdownLink}>My Profile</Link>
                    <Link to="/orders"   className={dropdownLink}>My Orders</Link>
                    <Link to="/wishlist" className={dropdownLink}>Wishlist</Link>
                    <hr className={`my-1 ${dark ? 'border-[#2A2A2A]' : 'border-gray-100'}`} />
                    <button onClick={handleLogout} className={`block w-full text-left ${dropdownLink}`}>Sign Out</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className={`hidden md:flex items-center gap-1.5 ${iconBase}`}>
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
              className={`overflow-hidden ${searchBarBg}`}
            >
              <form onSubmit={handleSearch} className="container-page py-4">
                <div className="flex items-center gap-3 max-w-2xl mx-auto">
                  <Search size={18} className={`flex-shrink-0 ${searchIcon}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands, categories..."
                    className={searchInput}
                    autoFocus
                  />
                  <button type="submit" className={searchBtn}>Search</button>
                  <button type="button" onClick={() => setSearchOpen(false)} className={searchIcon}>
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
            <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
            <div className={`relative w-72 h-full ${mobileMenuBg} shadow-2xl flex flex-col`}>
              <div className={`flex items-center justify-between p-5 ${mobileMenuBorder}`}>
                <span className={`font-display text-xl font-semibold ${logoText}`}>
                  BUY<span className={logoAccent}>LADIES</span>
                </span>
                <button onClick={() => setMenuOpen(false)} className={dark ? 'text-[#7A7A7A] hover:text-[#F5F0E8]' : 'text-gray-700'}>
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <Link to="/products" className={mobileLink}>All Products</Link>
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.to} className={mobileLink}>{link.label}</Link>
                ))}
                <div className={`my-4 border-t ${dark ? 'border-[#2A2A2A]' : 'border-gray-100'}`} />
                {isAuthenticated ? (
                  <>
                    <Link to="/profile"  className={mobileLinkSub}>My Profile</Link>
                    <Link to="/orders"   className={mobileLinkSub}>My Orders</Link>
                    <Link to="/wishlist" className={mobileLinkSub}>Wishlist</Link>
                    <button onClick={handleLogout} className={`w-full text-left ${mobileLinkSub}`}>Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login"    className={mobileLinkSub}>Sign In</Link>
                    <Link to="/register" className={mobileLinkSub}>Create Account</Link>
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
