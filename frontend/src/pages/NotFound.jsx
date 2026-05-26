import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-display text-9xl font-semibold text-gray-100 select-none">404</p>
        <h1 className="font-display text-3xl font-medium text-gray-900 -mt-6 mb-3">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          Looks like this page went out of style. Let's get you back to the good stuff.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link to="/" className="btn-primary">Go Home <ArrowRight size={16} /></Link>
          <Link to="/products" className="btn-outline">Shop Now</Link>
        </div>
      </motion.div>
    </div>
  )
}
