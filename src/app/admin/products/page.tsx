'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'
import { Plus, Edit, Trash2, ArrowLeft, Search } from 'lucide-react'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    fetchProducts()
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const toggleStatus = async (id: string, status: string) => {
    const newStatus = status === 'active' ? 'inactive' : 'active'
    await supabase.from('products').update({ status: newStatus }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="min-h-screen bg-white"><AdminNavbar /><div className="text-center py-20">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-green-600 hover:underline flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Admin</Link>
            <h1 className="text-2xl font-bold text-gray-800">Products ({products.length})</h1>
          </div>
          <Link href="/admin/products/create" className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3">
          <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3">
            <Search size={16} className="text-gray-400" />
            <input
              type="text" placeholder="Search products..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-2 outline-none text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Product</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Category</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Discount</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Stock</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-500">No products found</td></tr>
                ) : filtered.map(product => (
                  <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <span>📦</span>}
                        </div>
                        <span className="font-medium text-gray-800 line-clamp-1 max-w-48">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{product.price}</td>
                    <td className="px-4 py-3">
                      {product.discount > 0 ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">{product.discount}%</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(product.id, product.status)}
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg"><Edit size={16} /></Link>
                        <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
