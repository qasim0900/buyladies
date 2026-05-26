import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { registerUser, clearError } from '../store/slices/authSlice'
import Spinner from '../components/ui/Spinner'

export default function Register() {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', password2: '' })
  const [showPwd, setShowPwd] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth)

  useEffect(() => {
    if (isAuthenticated) navigate('/')
    return () => dispatch(clearError())
  }, [isAuthenticated])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(registerUser(form))
  }

  const getErrors = () => {
    if (!error) return []
    return Object.entries(error).flatMap(([k, v]) => {
      const label = k === 'email' ? 'Email' : k === 'password' ? 'Password' : k
      const msgs = Array.isArray(v) ? v : [v]
      return msgs.map((m) => `${label !== 'non_field_errors' ? label + ': ' : ''}${m}`)
    })
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-50 via-pink-50 to-stone-100 items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-rose-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <Link to="/"><span className="font-display text-4xl font-semibold text-gray-900">BUY<span className="text-rose-600">LADIES</span></span></Link>
          <p className="font-display text-3xl font-medium text-gray-700 mt-8 leading-relaxed italic">
            "Fashion is the armor to survive the reality of everyday life."
          </p>
          <p className="text-gray-500 mt-3 text-sm">— Bill Cunningham</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/"><span className="font-display text-3xl font-semibold">BUY<span className="text-rose-600">LADIES</span></span></Link>
          </div>
          <h1 className="font-display text-3xl font-medium text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm mb-8">Join BuyLadies for exclusive deals and updates</p>

          {getErrors().length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
              {getErrors().map((err, i) => <p key={i}>{err}</p>)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">First Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input-field pl-9 text-sm" placeholder="Sarah" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Last Name</label>
                <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input-field text-sm" placeholder="Ahmed" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-9" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-9 pr-10" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={form.password2} onChange={(e) => setForm({ ...form, password2: e.target.value })} className="input-field pl-9" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 mt-2">
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-rose-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-rose-600 hover:underline">Privacy Policy</a>.
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-600 font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
