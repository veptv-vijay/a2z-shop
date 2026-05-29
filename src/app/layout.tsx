import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'A2Z Shop — Best Deals Online',
  description: 'Shop everything at A2Z — best prices, fast delivery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
