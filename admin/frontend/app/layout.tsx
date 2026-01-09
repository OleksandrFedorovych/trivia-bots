import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trivia Bots Admin Dashboard',
  description: 'Manage trivia bots, leagues, and analyze game results',
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


