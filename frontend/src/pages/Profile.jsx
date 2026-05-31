import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Package, Heart, LogOut } from 'lucide-react'
import { updateProfile } from '../api/auth'
import { fetchProfile, logout } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'

const GRID_TEXTURE = {
  backgroundImage:
    'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),' +
    'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
}

function formatMemberSince(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })
  } catch {
    return null
  }
}

export default function Profile() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const wishlistCount = useSelector((s) => s.wishlist?.count ?? 0)

  const [form,   setForm]   = useState({ first_name: '', last_name: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' })
  }, [user, isAuthenticated])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      await dispatch(fetchProfile())
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    toast.success('Signed out successfully')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const memberSince  = formatMemberSince(user.date_joined)
  const displayName  = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email

  const NAV_LINKS = [
    { icon: User,    label: 'Profile',  to: '/profile',  active: true  },
    { icon: Package, label: 'Orders',   to: '/orders',   active: false },
    { icon: Heart,   label: 'Wishlist', to: '/wishlist', active: false },
  ]

  return (
    <div
      className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8] flex flex-col selection:bg-[#C9A84C] selection:text-[#0D0D0D]"
    >
      {/* Subtle grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={GRID_TEXTURE}
      />

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-[#1E1E1E]"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
          <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-2">
            Members' Private Area
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight">
                {user.first_name ? (
                  <>
                    {user.first_name}{' '}
                    <span className="italic text-[#C9A84C]">{user.last_name}</span>
                  </>
                ) : (
                  <span className="italic text-[#C9A84C]">{user.email}</span>
                )}
              </h1>
              <p className="text-[#5A5A5A] text-xs tracking-wider mt-1.5">
                {user.email}
                {memberSince && <> · Member since {memberSince}</>}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 text-center sm:pb-1">
              {wishlistCount > 0 && (
                <div>
                  <p className="font-display text-xl text-[#C9A84C] font-medium">{wishlistCount}</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] mt-0.5">Saved</p>
                </div>
              )}
              {memberSince && (
                <div>
                  <p className="font-display text-xl text-[#C9A84C] font-medium">{memberSince}</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] mt-0.5">Since</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── BODY ───────────────────────────────────────────────────── */}
      <div className="flex-1 relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row gap-14">

          {/* Sidebar */}
          <aside className="md:w-48 flex-shrink-0">
            <nav className="space-y-1">
              {NAV_LINKS.map(({ icon: Icon, label, to, active }) => (
                <Link
                  key={label}
                  to={to}
                  className={`flex items-center gap-3 w-full py-3 text-sm transition-all border-l-2 pl-3 ${
                    active
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-[#5A5A5A] hover:text-[#F5F0E8] hover:border-[#2A2A2A]'
                  }`}
                >
                  <Icon size={14} />
                  <span className="tracking-wide">{label}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-[#1E1E1E]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full py-3 text-sm text-[#3A3A3A] hover:text-[#F5F0E8] transition-colors pl-3 border-l-2 border-transparent hover:border-[#2A2A2A]"
                >
                  <LogOut size={14} />
                  <span className="tracking-wide">Sign Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 max-w-lg"
          >
            <h2 className="font-display text-xl font-medium text-[#F5F0E8] mb-8 pb-4 border-b border-[#1E1E1E]">
              Personal Information
            </h2>

            <form onSubmit={handleSave}>
              {/* First + Last name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div className="group border-b border-[#2A2A2A] focus-within:border-[#C9A84C] transition-colors pb-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] group-focus-within:text-[#C9A84C] transition-colors mb-2">
                    First Name
                  </label>
                  <input
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="First name"
                    className="w-full bg-transparent text-[#F5F0E8] text-sm outline-none placeholder-[#3A3A3A]"
                  />
                </div>
                <div className="group border-b border-[#2A2A2A] focus-within:border-[#C9A84C] transition-colors pb-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] group-focus-within:text-[#C9A84C] transition-colors mb-2">
                    Last Name
                  </label>
                  <input
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Last name"
                    className="w-full bg-transparent text-[#F5F0E8] text-sm outline-none placeholder-[#3A3A3A]"
                  />
                </div>
              </div>

              {/* Email — read-only */}
              <div className="border-b border-[#1E1E1E] pb-2 mb-8">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#3A3A3A] mb-2">
                  Email Address
                </label>
                <input
                  value={user.email}
                  disabled
                  className="w-full bg-transparent text-[#3A3A3A] text-sm outline-none cursor-not-allowed"
                />
                <p className="text-[10px] text-[#2A2A2A] mt-1.5 tracking-wider">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div className="group border-b border-[#2A2A2A] focus-within:border-[#C9A84C] transition-colors pb-2 mb-12">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] group-focus-within:text-[#C9A84C] transition-colors mb-2">
                  Phone Number
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="w-full bg-transparent text-[#F5F0E8] text-sm outline-none placeholder-[#3A3A3A]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 border border-[#C9A84C] text-[#C9A84C] text-xs tracking-[0.25em] uppercase hover:bg-[#C9A84C] hover:text-[#0D0D0D] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <Spinner size="sm" /> : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center py-4 border-t border-[#1E1E1E]">
        <p className="text-[#2A2A2A] text-[10px] tracking-[0.3em] uppercase">
          Heritage · Craft · Elegance
        </p>
      </div>
    </div>
  )
}
