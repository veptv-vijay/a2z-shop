'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [placing, setPlacing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', user.id)
    setCartItems(data || [])
    setLoading(false)
  }

  const updateQuantity = async (cartId: string, qty: number) => {
    if (qty < 1) { removeItem(cartId); return }
    await supabase.from('cart').update({ quantity: qty }).eq('id', cartId)
    setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: qty } : item))
  }

  const removeItem = async (cartId: string) => {
    await supabase.from('cart').delete().eq('id', cartId)
    setCartItems(prev => prev.filter(item => item.id !== cartId))
  }

  const getDiscountedPrice = (product: any) => {
    if (product.discount > 0) return product.price - (product.price * product.discount / 100)
    return product.price
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (getDiscountedPrice(item.products) * item.quantity), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = async () => {
    if (!address.trim()) { alert('Please enter delivery address'); return }
    if (!phone.trim()) { alert('Please enter phone number'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setPlacing(true)

    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      product_name: item.products.name,
      quantity: item.quantity,
      price: getDiscountedPrice(item.products),
      total: getDiscountedPrice(item.products) * item.quantity,
    }))

    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      items: orderItems,
      total_amount: subtotal,
      delivery_address: address,
      phone_number: phone,
      status: 'pending',
      payment_method: 'Cash on Delivery',
    })

    if (!error) {
      await supabase.from('cart').delete().eq('user_id', user.id)
      // Update stock
      for (const item of cartItems) {
        await supabase.from('products').update({ stock: item.products.stock - item.quantity }).eq('id', item.product_id)
      }
      router.push('/orders?success=true')
    } else {
      alert('Error placing order. Please try again.')
    }
    setPlacing(false)
  }

  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="text-center py-20 text-gray-500">Loading cart...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/products" className="flex items-center gap-1 text-green-600 hover:underline mb-4 text-sm">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Cart ({totalItems} items)</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Link href="/products" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map(item => {
                const dp = getDiscountedPrice(item.products)
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.products.image_url ? (
                        <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                      ) : <span className="text-3xl">📦</span>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.products.name}</h3>
                      <p className="text-xs text-gray-500">{item.products.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-green-700 font-bold">₹{dp.toFixed(2)}</span>
                        {item.products.discount > 0 && <span className="text-gray-400 text-xs line-through">₹{item.products.price}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg">−</button>
                          <span className="px-3 py-1 font-semibold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg">+</button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-800">₹{(dp * item.quantity).toFixed(2)}</span>
                          <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Items ({totalItems})</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-green-600">FREE</span></div>
                  <div className="flex justify-between text-gray-600"><span>Payment</span><span>Cash on Delivery</span></div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-base">
                    <span>Total</span><span className="text-green-700">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-3">Delivery Details</h3>
                <textarea
                  placeholder="Full delivery address with pincode..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 resize-none mb-3"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                />
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {placing ? 'Placing Order...' : '🛵 Place Order (COD)'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">Cash on Delivery — Pay when you receive</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
