import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, AtSign, Share2, Rss } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="container-page py-12">
          <div className="max-w-xl mx-auto text-center">
            <p className="section-subtitle text-gold-300 mb-3">Newsletter</p>
            <h2 className="font-display text-2xl text-white mb-2">Stay in the Loop</h2>
            <p className="text-sm text-gray-400 mb-6">Get early access to new arrivals, exclusive deals & style inspiration.</p>
            <form className="flex gap-0 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-gray-800 border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500"
              />
              <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 text-sm font-medium tracking-widest uppercase transition-colors flex-shrink-0">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/">
              <span className="font-display text-2xl font-semibold text-white">BUY<span className="text-rose-500">LADIES</span></span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Your premium destination for ladies fashion. Curated collections, luxury quality, delivered to your door.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram"><AtSign size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Share"><Share2 size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="RSS"><Rss size={18} /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">Shop</h3>
            <ul className="space-y-3">
              {[
                ['New Arrivals', '/products?is_new_arrival=true'],
                ['Best Sellers', '/products?is_bestseller=true'],
                ['Sale', '/products?on_sale=true'],
                ['All Products', '/products'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">Account</h3>
            <ul className="space-y-3">
              {[
                ['My Profile', '/profile'],
                ['My Orders', '/orders'],
                ['Wishlist', '/wishlist'],
                ['Cart', '/cart'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-widest uppercase mb-5">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Mail size={15} className="flex-shrink-0 mt-0.5 text-gray-500" />
                support@buyladies.pk
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Phone size={15} className="flex-shrink-0 mt-0.5 text-gray-500" />
                +92 300 1234567
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={15} className="flex-shrink-0 mt-0.5 text-gray-500" />
                Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2025 BuyLadies. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300">Terms of Service</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
