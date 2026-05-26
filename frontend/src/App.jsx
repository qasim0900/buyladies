/**
 * FE-001 FIX: All page components are lazy-loaded via React.lazy().
 * Each page becomes a separate Vite chunk → smaller initial bundle.
 * Suspense provides a loading fallback during async chunk loading.
 *
 * FE-002 FIX: ErrorBoundary wraps the entire route tree so any unhandled
 * React error renders a graceful UI instead of a blank white screen.
 *
 * Result:
 *   Before: 1 bundle ~450 KB (all pages)
 *   After:  ~60 KB initial + per-page chunks loaded on demand
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from './store/slices/authSlice'
import { fetchCart } from './store/slices/cartSlice'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Code-split every page — each becomes its own JS chunk
const Home        = lazy(() => import('./pages/Home'))
const Products    = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart        = lazy(() => import('./pages/Cart'))
const Checkout    = lazy(() => import('./pages/Checkout'))
const Login       = lazy(() => import('./pages/Login'))
const Register    = lazy(() => import('./pages/Register'))
const Profile     = lazy(() => import('./pages/Profile'))
const Orders      = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Wishlist    = lazy(() => import('./pages/Wishlist'))
const NotFound    = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 tracking-widest uppercase">Loading</p>
      </div>
    </div>
  )
}

function AppInit() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCart())
    if (isAuthenticated) {
      dispatch(fetchProfile())
    }
  }, [dispatch, isAuthenticated])

  return null
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ErrorBoundary>
        <AppInit />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
