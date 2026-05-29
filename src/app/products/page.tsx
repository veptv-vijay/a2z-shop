'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ShoppingCart, Star, Filter, SlidersHorizontal } from 'lucide-react'

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Toys', 'Grocery']

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState(100000)
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || ''

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam)
    fetchProducts()
  }, [searchQuery, categoryParam])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').eq('status', 'active')
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)
    if (categoryParam && categoryParam !== 'All') query = query.eq('category', categoryParam)
    const { data } = await query.order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.price <= priceRange)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'discount') return b.discount - a.discount
      return 0
    })

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {searchQuery && (
          <p className="text-gray-600 mb-4">Search results for: <strong>"{searchQuery}"</strong> — {filtered.length} products found</p>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</h3>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Category</h4>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm mb-1 transition ${selectedCategory === cat ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-green-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Max Price: ₹{priceRange.toLocaleString()}</h4>
                <input
                  type="range" min="100" max="100000" value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹100</span><span>₹1,00,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm">{filtered.length} products</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            {/* Mobile Categories */}
            <div className="flex gap-2 overflow-x-auto pb-3 md:hidden mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">😕</p>
                <p className="text-gray-500 text-lg">No products found</p>
                <Link href="/products" className="text-green-600 hover:underline mt-2 inline-block">Clear filters</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => {
                  const discounted = product.discount > 0
                    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
                    : product.price.toFixed(2)
                  return (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition group">
                      <Link href={`/products/${product.id}`}>
                        <div className="bg-gray-50 h-44 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
                          ) : (
                            <span className="text-5xl">📦</span>
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
                        <p className="text-xs text-gray-500">{product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-700 font-bold">₹{discounted}</span>
                          {product.discount > 0 && <span className="text-gray-400 text-xs line-through">₹{product.price}</span>}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-500">{product.rating || '4.0'}</span>
                        </div>
                        {product.stock > 0 ? (
                          <button onClick={() => addToCart(product.id)}
                            className="w-full mt-2 bg-green-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition flex items-center justify-center gap-1">
                            <ShoppingCart size={12} /> Add to Cart
                          </button>
                        ) : (
                          <button disabled className="w-full mt-2 bg-gray-200 text-gray-500 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed">Out of Stock</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
