'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, ShoppingBag, Users, LayoutDashboard, LogOut } from 'lucide-react'

export default function AdminNavbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <nav className="bg-green-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-extrabold flex items-center gap-2">
            🛒 A2Z Admin
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-1.5 text-green-100 hover:text-white text-sm font-medium">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href="/admin/products" className="flex items-center gap-1.5 text-green-100 hover:text-white text-sm font-medium">
              <Package size={16} /> Products
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-1.5 text-green-100 hover:text-white text-sm font-medium">
              <ShoppingBag size={16} /> Orders
            </Link>
            <Link href="/admin/users" className="flex items-center gap-1.5 text-green-100 hover:text-white text-sm font-medium">
              <Users size={16} /> Users
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="text-green-100 hover:text-white text-sm font-medium">
            View Store →
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded-lg text-sm font-semibold">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  )
}