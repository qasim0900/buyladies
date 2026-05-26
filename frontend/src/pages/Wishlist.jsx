import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { fetchWishlist, toggleWishlistItem } from '../store/slices/wishlistSlice'
import ProductCard from '../components/products/ProductCard'
import Spinner from '../components/ui/Spinner'

export default function Wishlist() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((s) => s.wishlist)
  const { isAuthenticated } = useSelector((s) => s.auth)

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist())
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <Heart size={48} className="text-rose-200 mb-4" />
        <h2 className="font-display text-2xl font-medium text-gray-900 mb-2">Sign in to see your wishlist</h2>
        <p className="text-gray-500 text-sm mb-6">Save your favourite items to come back to them later.</p>
        <Link to="/login" className="btn-primary">Sign In <ArrowRight size={16} /></Link>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-page py-8">
          <h1 className="font-display text-3xl font-medium text-gray-900">My Wishlist <span className="text-gray-400 text-xl font-normal">({items.length})</span></h1>
        </div>
      </div>

      <div className="container-page py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={48} className="text-rose-100 mb-4" />
            <h2 className="font-display text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Browse our collection and save items you love.</p>
            <Link to="/products" className="btn-primary">Explore Products <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item, index) => item.product && (
              <ProductCard key={item.id} product={item.product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
