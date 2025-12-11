import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = { title: 'ProcessServe - Admin Panel', description: 'Tenant admin panel' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (<html lang="en"><body className={inter.className}>{children}</body></html>)
}
