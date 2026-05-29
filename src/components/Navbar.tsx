'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ShoppingCart, User, Search, Menu, X, Package } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchCartCount(user.id)
    })
  }, [])

  const fetchCartCount = async (userId: string) => {
    const { data } = await supabase.from('cart').select('quantity').eq('user_id', userId)
    if (data) setCartCount(data.reduce((sum, item) => sum + item.quantity, 0))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search)}`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-green-600">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-extrabold text-green-600 whitespace-nowrap">
            🛒 A2Z Shop
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-green-600 rounded-l-lg px-4 py-2 outline-none text-sm"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700">
              <Search size={18} />
            </button>
          </form>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/cart" className="relative flex items-center gap-1 text-gray-700 hover:text-green-600 font-medium">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
                <Link href="/orders" className="flex items-center gap-1 text-gray-700 hover:text-green-600 font-medium text-sm">
                  <Package size={18} /> Orders
                </Link>
                <Link href="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-green-600 font-medium text-sm">
                  <User size={18} /> Account
                </Link>
                <button onClick={handleLogout} className="border border-green-600 text-green-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex mt-3 md:hidden">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-green-600 rounded-l-lg px-3 py-2 outline-none text-sm"
          />
          <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded-r-lg">
            <Search size={16} />
          </button>
        </form>

        {menuOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-2 pb-3 border-t pt-3">
            {user ? (
              <>
                <Link href="/cart" className="text-gray-700 font-medium py-1">Cart ({cartCount})</Link>
                <Link href="/orders" className="text-gray-700 font-medium py-1">My Orders</Link>
                <Link href="/dashboard" className="text-gray-700 font-medium py-1">Account</Link>
                <button onClick={handleLogout} className="text-left text-red-500 font-medium py-1">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 font-medium py-1">Login</Link>
                <Link href="/auth/register" className="text-green-600 font-semibold py-1">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}