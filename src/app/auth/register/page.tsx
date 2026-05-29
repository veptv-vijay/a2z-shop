'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        role: 'customer',
      })
    }
    router.push('/')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-extrabold text-green-600">🛒 A2Z Shop</Link>
          <h2 className="text-xl font-bold text-gray-800 mt-3">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Register to start shopping</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-300 text-red-600 rounded-lg px-4 py-3 text-sm">{error}</div>}

          {[
            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Your full name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '10-digit mobile number' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Create a password' },
            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat your password' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type} required
                value={(form as any)[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 text-sm"
              />
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  )
}
