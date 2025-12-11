'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
export default function Home() {
    const router = useRouter()
    useEffect(() => { const token = localStorage.getItem('token'); token ? router.push('/dashboard') : router.push('/login') }, [router])
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
}
