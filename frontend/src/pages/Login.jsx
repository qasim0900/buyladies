import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { loginUser, clearError } from '../store/slices/authSlice'
import Spinner from '../components/ui/Spinner'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth)

  useEffect(() => {
    if (isAuthenticated) navigate(state?.from || '/')
    return () => dispatch(clearError())
  }, [isAuthenticated])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser(form))
  }

  const getErrors = () => {
    if (!error) return []
    if (error.detail) return [error.detail]
    return Object.entries(error).flatMap(([k, v]) => Array.isArray(v) ? v : [v])
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-50 via-pink-50 to-stone-100 items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-rose-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <Link to="/">
            <span className="font-display text-4xl font-semibold text-gray-900">BUY<span className="text-rose-600">LADIES</span></span>
          </Link>
          <p className="font-display text-3xl font-medium text-gray-700 mt-8 leading-relaxed italic">
            "Style is a way to say who you are without having to speak."
          </p>
          <p className="text-gray-500 mt-3 text-sm">— Rachel Zoe</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <Link to="/"><span className="font-display text-3xl font-semibold">BUY<span className="text-rose-600">LADIES</span></span></Link>
          </div>
          <h1 className="font-display text-3xl font-medium text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

          {getErrors().length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
              {getErrors().map((err, i) => <p key={i}>{err}</p>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-600">Password</label>
                <a href="#" className="text-xs text-rose-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 mt-2">
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-rose-600 font-medium hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
