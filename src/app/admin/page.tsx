'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'
import { Package, ShoppingBag, Users, IndianRupee, Plus, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    fetchStats()
  }

  const fetchStats = async () => {
    const [{ count: pCount }, { count: oCount }, { count: uCount }, { data: orders }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount').eq('status', 'delivered'),
    ])
    const revenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0
    setStats({ products: pCount || 0, orders: oCount || 0, users: uCount || 0, revenue })
    const { data: recent } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8)
    setRecentOrders(recent || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="text-center py-20">Loading Admin Panel...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link href="/admin/products/create" className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: stats.products, icon: <Package size={24} />, color: 'bg-green-50 text-green-600', link: '/admin/products' },
            { label: 'Total Orders', value: stats.orders, icon: <ShoppingBag size={24} />, color: 'bg-blue-50 text-blue-600', link: '/admin/orders' },
            { label: 'Total Users', value: stats.users, icon: <Users size={24} />, color: 'bg-purple-50 text-purple-600', link: '/admin/users' },
            { label: 'Total Revenue', value: `₹${stats.revenue.toFixed(0)}`, icon: <IndianRupee size={24} />, color: 'bg-yellow-50 text-yellow-600', link: '/admin/orders' },
          ].map((stat, i) => (
            <Link key={i} href={stat.link} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-extrabold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Manage Products', desc: 'Add, edit, delete products', href: '/admin/products', icon: '📦', color: 'border-green-200 hover:border-green-500' },
            { label: 'Manage Orders', desc: 'View and update orders', href: '/admin/orders', icon: '🛵', color: 'border-blue-200 hover:border-blue-500' },
            { label: 'Manage Users', desc: 'View all registered users', href: '/admin/users', icon: '👥', color: 'border-purple-200 hover:border-purple-500' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className={`bg-white rounded-xl border-2 p-5 transition ${item.color}`}>
              <span className="text-4xl">{item.icon}</span>
              <h3 className="font-bold text-gray-800 mt-3">{item.label}</h3>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-semibold">Order ID</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Date</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Amount</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Status</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 font-mono font-semibold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-2 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="py-2 font-semibold text-green-700">₹{order.total_amount.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'dispatched' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{order.status}</span>
                      </td>
                      <td className="py-2">
                        <Link href="/admin/orders" className="text-green-600 hover:underline text-xs font-semibold">Manage</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
