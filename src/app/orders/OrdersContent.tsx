'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Package, CheckCircle, Clock, Truck } from 'lucide-react'

const STATUS_CONFIG: any = {
  pending: { label: 'Order Placed', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={14} /> },
  dispatched: { label: 'Dispatched', color: 'bg-purple-100 text-purple-700', icon: <Truck size={14} /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <Package size={14} /> },
}

export default function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="text-center py-20">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {success && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-bold text-green-800">Order Placed Successfully!</p>
              <p className="text-green-600 text-sm">We will contact you for delivery.</p>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No orders yet</p>
            <Link href="/products" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-700">{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.icon} {status.label}</span>
                      <p className="text-green-700 font-bold text-lg mt-1">₹{order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                        <span className="font-semibold">₹{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-2 grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <p className="font-semibold text-gray-700 mb-0.5">Delivery Address</p>
                      <p>{order.delivery_address}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-0.5">Payment</p>
                      <p>{order.payment_method}</p>
                      {order.tracking_number && <p className="font-mono text-green-700 mt-1">{order.tracking_number}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
