'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function GlobalProcessServers() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [servers, setServers] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        state: '',
        zipCode: '',
    })

    const fetchServers = async () => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const data = await api.getAllProcessServers(token)
                setServers(data)
            }
        } catch (error) {
            console.error('Failed to fetch servers:', error)
        }
    }

    useEffect(() => {
        fetchServers()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('token')

            // 1. Register User
            const userRes = await api.registerUser({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: 'PROCESS_SERVER',
                tenantId: 'global', // Special flag or ID for global servers
            })

            // 2. Create Profile
            await api.createProcessServerProfile({
                userId: userRes.id, // Assuming register returns user object with ID
                phone: formData.phone,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                radius: 50, // Default radius
                status: 'ACTIVE',
                verificationDocs: {}, // Empty for now
            }, token!)

            setShowForm(false)
            setFormData({
                email: '', password: '', firstName: '', lastName: '',
                phone: '', city: '', state: '', zipCode: ''
            })
            fetchServers()
            alert('Global Process Server created successfully!')
        } catch (error) {
            console.error('Creation error:', error)
            alert('Failed to create process server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                        >
                            ← Back
                        </button>
                        <h1 className="text-3xl font-bold">Global Process Servers</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                    >
                        {showForm ? 'Cancel' : '+ New Global Server'}
                    </button>
                </div>

                {showForm && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-semibold mb-4">Register New Global Server</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Zip Code</label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg glass"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? 'Creating...' : 'Create Server'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servers.map((server) => (
                        <div key={server.id} className="glass rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{server.firstName} {server.lastName}</h3>
                                    <p className="text-sm text-gray-400">{server.city}, {server.state}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${server.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {server.status}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-300">
                                <p>Rating: {server.currentRating || 'N/A'}</p>
                                <p>Total Orders: {server.totalOrdersAssigned || 0}</p>
                                <p>Radius: {server.radius} miles</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
