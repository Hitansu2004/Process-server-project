'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import GoogleSignInButton from '@/components/GoogleSignInButton'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true)
        try {
            const res = await api.login(email, password);
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res));
            router.push('/dashboard')
        } catch (err) {
            setError('Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credential: string) => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken: credential,
                    role: 'ADMIN'
                })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data))
                router.push('/dashboard')
            } else {
                setError(data.error || 'Google authentication failed')
            }
        } catch (err) {
            setError('Failed to authenticate with Google')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError('Google Sign-In failed')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ProcessServe</h1>
                <p className="text-center text-gray-400 mb-8">Admin Panel</p>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">{error}</div>}

                {/* Google Sign-In Button */}
                <div className="mb-6">
                    <GoogleSignInButton
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="signin_with"
                    />
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary" required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
                </form>
                <p className="text-center text-gray-400 mt-6 text-sm">Test: owner@processserve-ny.com / Password123!</p>
            </div>
        </div>
    )
}