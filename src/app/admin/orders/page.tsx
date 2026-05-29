'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'
import { ArrowLeft, Package } from 'lucide-react'

const STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [trackingInputs, setTrackingInputs] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    fetchOrders()
  }

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const updateTracking = async (orderId: string) => {
    const tracking = trackingInputs[orderId]
    if (!tracking) return
    await supabase.from('orders').update({ tracking_number: tracking }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tracking_number: tracking } : o))
    alert('Tracking number saved!')
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="text-center py-20">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-green-600 hover:underline flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Admin</Link>
          <h1 className="text-2xl font-bold text-gray-800">Orders ({orders.length})</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Package size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-wrap gap-4 justify-between mb-4">
                  <div>
                    <p className="font-mono font-bold text-gray-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">📞 {order.phone_number}</p>
                    <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-700 font-bold text-xl">₹{order.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Cash on Delivery</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">ITEMS</p>
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                      <span className="font-semibold">₹{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 items-center border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-500"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Tracking No:</label>
                    <input
                      type="text"
                      placeholder={order.tracking_number || "Enter courier tracking number"}
                      defaultValue={order.tracking_number || ''}
                      onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-500 min-w-0"
                    />
                    <button
                      onClick={() => updateTracking(order.id)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 whitespace-nowrap"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
