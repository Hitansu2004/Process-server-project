'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token')
        if (token) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-300">Loading...</p>
            </div>
        </div>
    )
}
