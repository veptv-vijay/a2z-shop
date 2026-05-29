'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { User, Package, ShoppingCart, Edit } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profile)
    const { data: orders } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    setOrders(orders || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-white"><AdminNavbar /><div className="text-center py-20">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            {profile?.phone && <p className="text-sm text-gray-600">📞 {profile.phone}</p>}
            <p className="text-xs text-green-600 mt-2 font-semibold capitalize">{profile?.role || 'Customer'}</p>
          </div>

          <Link href="/orders" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 transition">
            <div className="flex items-center gap-3">
              <Package size={32} className="text-green-600" />
              <div>
                <p className="font-bold text-gray-800">My Orders</p>
                <p className="text-2xl font-extrabold text-green-700">{orders.length}</p>
              </div>
            </div>
          </Link>

          <Link href="/cart" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 transition">
            <div className="flex items-center gap-3">
              <ShoppingCart size={32} className="text-green-600" />
              <div>
                <p className="font-bold text-gray-800">My Cart</p>
                <p className="text-sm text-gray-500">View items in cart</p>
              </div>
            </div>
          </Link>
        </div>

        {orders.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Recent Orders</h2>
              <Link href="/orders" className="text-green-600 text-sm hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">₹{order.total_amount.toFixed(2)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'dispatched' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
