'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import SessionManager from '@/lib/sessionManager'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    // Get tenant from session or URL
    const tenantId = typeof window !== 'undefined'
        ? sessionStorage.getItem('selectedTenant') || searchParams?.get('tenant') || 'tenant-1'
        : 'tenant-1'

    useEffect(() => {
        // Check for timeout or registration success
        if (searchParams?.get('timeout') === 'true') {
            setError('Session expired due to inactivity. Please login again.')
        } else if (searchParams?.get('registered') === 'true') {
            setSuccessMessage('Registration successful! Please login with your credentials.')
        }

        // Store tenant in session
        if (typeof window !== 'undefined' && tenantId) {
            sessionStorage.setItem('selectedTenant', tenantId)
        }
    }, [searchParams, tenantId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')
        setLoading(true)

        try {
            const response = await api.login(email, password, tenantId)

            // Use sessionStorage instead of localStorage
            sessionStorage.setItem('token', response.token)
            sessionStorage.setItem('user', JSON.stringify(response))
            sessionStorage.setItem('selectedTenant', tenantId)

            // Initialize session manager
            SessionManager.init()

            router.push('/dashboard')
        } catch (err) {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="card max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ProcessServe
                </h1>
                <p className="text-center text-gray-600 mb-8">Customer Portal</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={() => router.push('/register')}
                            className="text-primary hover:underline font-semibold"
                        >
                            Register here
                        </button>
                    </p>
                </div>

                <p className="text-center text-gray-400 mt-6 text-sm">
                    Test: customer1@example.com / password
                </p>
            </div>
        </div>
    )
}
