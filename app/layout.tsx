import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DineEasy - Smart Restaurant Ordering System',
  description: 'Contactless dining experience with QR code ordering, real-time kitchen updates, and seamless payments.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#f59e0b',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}