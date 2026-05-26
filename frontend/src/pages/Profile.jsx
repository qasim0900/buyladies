import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Save, Package, Heart, LogOut } from 'lucide-react'
import { updateProfile } from '../api/auth'
import { fetchProfile, logout } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })
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
    } catch (err) {
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

  if (!user) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container-page py-8">
          <h1 className="font-display text-3xl font-medium text-gray-900">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            <nav className="bg-white p-3 space-y-1">
              {[
                [User, 'Profile', '/profile', true],
                [Package, 'Orders', '/orders', false],
                [Heart, 'Wishlist', '/wishlist', false],
              ].map(([Icon, label, to, active]) => (
                <Link key={label} to={to} className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${active ? 'bg-gray-900 text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6">
              <h2 className="font-display text-xl font-medium text-gray-900 mb-6">Personal Information</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">First Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input-field pl-9" placeholder="First Name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Last Name</label>
                    <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input-field" placeholder="Last Name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={user.email} disabled className="input-field pl-9 bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-9" placeholder="+92 300 1234567" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary px-8">
                    {saving ? <Spinner size="sm" /> : <><Save size={15} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
