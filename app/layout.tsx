import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Algorithmic Trading Backtest Platform',
  description: 'Backtest your trading strategies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

