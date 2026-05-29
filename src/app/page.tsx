'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ShoppingCart, Star, Tag, Truck, Shield, RefreshCw } from 'lucide-react'

const CATEGORIES = [
  { name: 'Electronics', emoji: '📱' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Home', emoji: '🏠' },
  { name: 'Books', emoji: '📚' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Toys', emoji: '🧸' },
  { name: 'Grocery', emoji: '🛒' },
]

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (data) {
      setFeatured(data.slice(0, 4))
      setProducts(data.slice(4, 12))
    }
    setLoading(false)
  }

  const addToCart = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: existing } = await supabase.from('cart').select('*').eq('user_id', user.id).eq('product_id', productId).single()
    if (existing) {
      await supabase.from('cart').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('cart').insert({ user_id: user.id, product_id: productId, quantity: 1 })
    }
    alert('Added to cart!')
  }

  const discountedPrice = (price: number, discount: number) => {
    return (price - (price * discount / 100)).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Shop Everything <br />at <span className="text-yellow-300">Best Prices</span>
            </h1>
            <p className="text-green-100 text-lg mb-6">Millions of products. Cash on delivery. Fast shipping across India.</p>
            <Link href="/products" className="bg-white text-green-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-50 transition shadow-lg inline-block">
              Shop Now →
            </Link>
          </div>
          <div className="flex-1 text-center text-8xl">🛍️</div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-green-50 py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck size={24} />, title: 'Fast Delivery', sub: 'Pan India shipping' },
            { icon: <Shield size={24} />, title: 'Secure Shopping', sub: '100% safe checkout' },
            { icon: <RefreshCw size={24} />, title: 'Easy Returns', sub: '7 day return policy' },
            { icon: <Tag size={24} />, title: 'Best Prices', sub: 'Lowest price guaranteed' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
              <div className="text-green-600">{f.icon}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link href={`/products?category=${cat.name}`} key={cat.name}
              className="flex flex-col items-center gap-2 bg-white border-2 border-green-100 rounded-xl p-3 hover:border-green-500 hover:bg-green-50 transition cursor-pointer">
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-6 px-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
            <Link href="/products" className="text-green-600 font-semibold hover:underline text-sm">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      )}

      {/* More Products */}
      {products.length > 0 && (
        <section className="py-6 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">More Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition inline-block">
              View All Products
            </Link>
          </div>
        </section>
      )}

      {loading && (
        <div className="text-center py-20 text-gray-500">Loading products...</div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-6 mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-green-400 font-bold text-lg mb-3">🛒 A2Z Shop</h3>
            <p className="text-gray-400 text-sm">Your one-stop shop for everything you need.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-1 text-gray-400 text-sm">
              <Link href="/products" className="hover:text-green-400">All Products</Link>
              <Link href="/cart" className="hover:text-green-400">My Cart</Link>
              <Link href="/orders" className="hover:text-green-400">My Orders</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Categories</h4>
            <div className="flex flex-col gap-1 text-gray-400 text-sm">
              {CATEGORIES.slice(0, 4).map(c => (
                <Link key={c.name} href={`/products?category=${c.name}`} className="hover:text-green-400">{c.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <div className="flex flex-col gap-1 text-gray-400 text-sm">
              <span>Cash on Delivery</span>
              <span>7 Day Returns</span>
              <span>Pan India Shipping</span>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm mt-8 border-t border-gray-700 pt-6">
          © {new Date().getFullYear()} A2Z Shop. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function ProductCard({ product, onAddToCart }: { product: any, onAddToCart: (id: string) => void }) {
  const discounted = product.discount > 0
    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
    : product.price.toFixed(2)

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition group">
      <Link href={`/products/${product.id}`}>
        <div className="bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
          ) : (
            <span className="text-6xl">📦</span>
          )}
        </div>
      </Link>
      <div className="p-3">
        {product.discount > 0 && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{product.discount}% OFF</span>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 mt-1 text-sm line-clamp-2 hover:text-green-600">{product.name}</h3>
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-green-700 font-bold text-lg">₹{discounted}</span>
          {product.discount > 0 && (
            <span className="text-gray-400 text-sm line-through">₹{product.price}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-500">{product.rating || '4.0'} ({product.reviews_count || 0})</span>
        </div>
        {product.stock > 0 ? (
          <button
            onClick={() => onAddToCart(product.id)}
            className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        ) : (
          <button disabled className="w-full mt-3 bg-gray-200 text-gray-500 py-2 rounded-lg text-sm font-semibold cursor-not-allowed">
            Out of Stock
          </button>
        )}
      </div>
    </div>
  )
}
