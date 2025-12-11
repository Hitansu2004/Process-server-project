'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true)
        try { const res = await api.login(email, password); localStorage.setItem('token', res.token); localStorage.setItem('user', JSON.stringify(res)); router.push('/dashboard') }
        catch (err) { setError('Invalid credentials') } finally { setLoading(false) }
    }
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ProcessServe</h1>
                <p className="text-center text-gray-400 mb-8">Super Admin</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">{error}</div>}
                    <div><label className="block text-sm font-medium mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                    <div><label className="block text-sm font-medium mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                    <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
                </form>
                <p className="text-center text-gray-400 mt-6 text-sm">Test: admin@processserve.com / Password123!</p>
            </div>
        </div>
    )
}
