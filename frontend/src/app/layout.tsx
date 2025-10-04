'use client';

import { Inter } from 'next/font/google'
import '@/styles/globals/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import OmiseScript from '@/components/OmiseScript'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <title>E-commerce Store</title>
        <meta name="description" content="Modern e-commerce platform built with Next.js" />
        <script src="https://cdn.omise.co/omise.js"></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <OmiseScript />
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
