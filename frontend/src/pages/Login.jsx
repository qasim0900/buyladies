import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff } from 'lucide-react'
import { loginUser, clearError } from '../store/slices/authSlice'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
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
    return Object.entries(error).flatMap(([, v]) => Array.isArray(v) ? v : [v])
  }

  const errors = getErrors()

  return (
    <div className="min-h-[calc(100vh-theme(spacing.8))] bg-[#0D0D0D] text-[#F5F0E8] flex flex-col selection:bg-[#C9A84C] selection:text-[#0D0D0D]">
      {/* Subtle grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),' +
            'repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)',
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="w-full max-w-sm">
          {/* Eyebrow */}
          <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-5 text-center">
            Members' Entrance
          </p>

          {/* Heading */}
          <h1 className="font-display text-4xl font-medium text-center mb-12 leading-snug">
            Welcome<br />
            <span className="italic text-[#C9A84C]">back.</span>
          </h1>

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="border border-red-900/60 bg-red-950/30 text-red-400 text-sm px-4 py-3 mb-8 text-center">
              {errors.map((err, i) => <p key={i}>{err}</p>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Email */}
            <div className="group border-b border-[#2A2A2A] focus-within:border-[#C9A84C] transition-colors duration-500 pb-3 mb-8">
              <label className="block text-[10px] tracking-[0.25em] uppercase text-[#5A5A5A] group-focus-within:text-[#C9A84C] transition-colors mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-transparent text-[#F5F0E8] text-base placeholder-[#3A3A3A] outline-none"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="group border-b border-[#2A2A2A] focus-within:border-[#C9A84C] transition-colors duration-500 pb-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] tracking-[0.25em] uppercase text-[#5A5A5A] group-focus-within:text-[#C9A84C] transition-colors">
                  Password
                </label>
                <a href="#" className="text-[10px] tracking-wider text-[#5A5A5A] hover:text-[#C9A84C] transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[#F5F0E8] text-base placeholder-[#3A3A3A] outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="text-[#3A3A3A] hover:text-[#C9A84C] transition-colors flex-shrink-0"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 border border-[#C9A84C] text-[#C9A84C] text-xs tracking-[0.3em] uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Enter the Collection'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mt-10 mb-8">
            <div className="flex-1 h-px bg-[#1E1E1E]" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#3A3A3A]">or</span>
            <div className="flex-1 h-px bg-[#1E1E1E]" />
          </div>

          <p className="text-center text-[#3A3A3A] text-xs tracking-wider">
            First time here?{' '}
            <Link to="/register" className="text-[#C9A84C] hover:underline transition-colors">
              Create your account
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom ornament */}
      <div className="relative z-10 text-center py-5 border-t border-[#1E1E1E]">
        <p className="text-[#2A2A2A] text-[10px] tracking-[0.3em] uppercase">
          Heritage · Craft · Elegance
        </p>
      </div>
    </div>
  )
}
