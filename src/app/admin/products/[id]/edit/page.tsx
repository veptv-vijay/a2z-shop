'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminNavbar from '@/components/AdminNavbar'
import { ArrowLeft, Save } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Toys', 'Grocery', 'Other']

export default function EditProductPage() {
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()

  useEffect(() => { checkAdminAndLoad() }, [])

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/admin/login'); return }
    const { data } = await supabase.from('products').select('*').eq('id', params.id).single()
    if (data) setForm(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('products').update({
      name: form.name, description: form.description, category: form.category,
      brand: form.brand, price: parseFloat(form.price), discount: parseFloat(form.discount) || 0,
      stock: parseInt(form.stock), image_url: form.image_url, status: form.status,
    }).eq('id', params.id)
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/admin/products')
  }

  if (!form) return <div className="min-h-screen bg-white"><AdminNavbar /><div className="text-center py-20">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/products" className="text-green-600 hover:underline flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Products</Link>
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-300 text-red-600 rounded-lg px-4 py-3 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
              <input type="text" value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
              <input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Discount (%)</label>
              <input type="number" min="0" max="99" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Count *</label>
              <input type="number" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
              <input type="url" value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm" />
              {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-lg border" onError={e => (e.currentTarget.style.display = 'none')} />}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/admin/products" className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Save size={16} /> {loading ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
