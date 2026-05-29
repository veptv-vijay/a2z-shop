'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ShoppingCart, Star, Truck, Shield, RefreshCw, ArrowLeft } from 'lucide-react'

export default function ProductDetailPage() {
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', params.id).single()
    setProduct(data)
    setLoading(false)
  }

  const addToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setAdding(true)
    const { data: existing } = await supabase.from('cart').select('*').eq('user_id', user.id).eq('product_id', product.id).single()
    if (existing) {
      await supabase.from('cart').update({ quantity: existing.quantity + quantity }).eq('id', existing.id)
    } else {
      await supabase.from('cart').insert({ user_id: user.id, product_id: product.id, quantity })
    }
    setAdding(false)
    alert('Added to cart!')
  }

  const buyNow = async () => {
    await addToCart()
    router.push('/cart')
  }

  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="text-center py-20 text-gray-500">Loading...</div></div>
  if (!product) return <div className="min-h-screen bg-white"><Navbar /><div className="text-center py-20 text-gray-500">Product not found</div></div>

  const discounted = product.discount > 0
    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
    : product.price.toFixed(2)
  const savings = product.discount > 0 ? (product.price - Number(discounted)).toFixed(2) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/products" className="flex items-center gap-1 text-green-600 hover:underline mb-4 text-sm">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-gray-50 rounded-xl flex items-center justify-center min-h-72 overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="max-h-96 w-full object-contain" />
            ) : (
              <span className="text-9xl">📦</span>
            )}
          </div>

          {/* Details */}
          <div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{product.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">{product.name}</h1>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className={i <= Math.floor(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-gray-500 text-sm">({product.reviews_count || 0} reviews)</span>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-4xl font-extrabold text-green-700">₹{discounted}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                  <span className="bg-green-600 text-white text-sm font-bold px-2 py-0.5 rounded">{product.discount}% OFF</span>
                </>
              )}
            </div>
            {savings > 0 && <p className="text-green-600 text-sm mt-1">You save ₹{savings}!</p>}

            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

            {product.brand && <p className="mt-3 text-sm text-gray-500">Brand: <span className="font-semibold text-gray-700">{product.brand}</span></p>}

            <div className="mt-4">
              {product.stock > 0 ? (
                <p className="text-green-600 font-semibold text-sm">✓ In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-red-500 font-semibold text-sm">✗ Out of Stock</p>
              )}
            </div>

            {product.stock > 0 && (
              <>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-gray-700 font-medium text-sm">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg font-bold">−</button>
                    <span className="px-4 py-1.5 font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg font-bold">+</button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={addToCart} disabled={adding}
                    className="flex-1 border-2 border-green-600 text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition flex items-center justify-center gap-2">
                    <ShoppingCart size={18} /> {adding ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button onClick={buyNow}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
                    Buy Now
                  </button>
                </div>
              </>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: <Truck size={16} />, text: 'Free Delivery' },
                { icon: <RefreshCw size={16} />, text: '7 Day Return' },
                { icon: <Shield size={16} />, text: 'Secure Payment' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-green-600">{item.icon}</div>
                  <span className="text-xs text-gray-600 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
