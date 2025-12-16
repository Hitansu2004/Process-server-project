'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await api.login(email, password)
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response))

            // Fetch process server profile to get the profile ID
            try {
                // Extract tenantUserRoleId from the first role (assuming single tenant context for now)
                const tenantUserRoleId = response.roles?.[0]?.id
                if (!tenantUserRoleId) throw new Error('No tenant role found')

                const profileData = await api.getProcessServerProfile(tenantUserRoleId, response.token)
                // Store profile ID for use in bidding and attempts
                const userWithProfile = { ...response, processServerProfileId: profileData.id }
                localStorage.setItem('user', JSON.stringify(userWithProfile))
            } catch (profileError) {
                console.error('Failed to fetch profile:', profileError)
                // Continue anyway - will try to use user ID as fallback
            }

            router.push('/dashboard')
        } catch (err) {
            setError('Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ProcessServe
                </h1>
                <p className="text-center text-gray-400 mb-8">Delivery Portal</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm mb-2">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                            Register here
                        </Link>
                    </p>
                    <p className="text-gray-500 text-xs">Test: driver1@example.com / Password123!</p>
                </div>
            </div>
        </div>
    )
}
