'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        operatingZipCodes: '',
        tenantId: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Fetch tenant ID on mount
    useEffect(() => {
        api.getTenants()
            .then(tenants => {
                if (tenants.length > 0) {
                    setFormData(prev => ({ ...prev, tenantId: tenants[0].id }))
                } else {
                    setError('No active tenants found. Please contact support.')
                }
            })
            .catch(err => {
                console.error('Failed to fetch tenants:', err)
                setError('Failed to load system configuration')
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.tenantId) {
            setError('System configuration missing (Tenant ID). Please refresh or contact support.')
            return
        }

        setLoading(true)
        try {
            await api.registerProcessServer(formData)
            alert('Registration successful! Please login.')
            router.push('/login')
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || JSON.stringify(err) || 'Registration failed')
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
                <p className="text-center text-gray-400 mb-8">Process Server Registration</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Operating Zip Codes (comma separated)</label>
                        <input
                            type="text"
                            value={formData.operatingZipCodes}
                            onChange={(e) => setFormData({ ...formData, operatingZipCodes: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. 90210, 90001"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
