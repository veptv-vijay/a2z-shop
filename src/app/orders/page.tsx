import { Suspense } from 'react'
import OrdersContent from './OrdersContent'

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  )
}