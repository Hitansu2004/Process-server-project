'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [tenants, setTenants] = useState<any[]>([])
    const [platformRevenue, setPlatformRevenue] = useState<number>(0)
    useEffect(() => {
        const token = localStorage.getItem('token'); const userData = localStorage.getItem('user')
        if (!token || !userData) { router.push('/login'); return }
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        loadTenants(token)
        loadPlatformRevenue(token)
    }, [router])
    const loadTenants = async (token: string) => {
        try { const data = await api.getTenants(token); setTenants(data) } catch (error) { console.error(error) }
    }
    const loadPlatformRevenue = async (token: string) => {
        try {
            const data = await api.getPlatformRevenue(token)
            setPlatformRevenue(data.revenue || 0)
        } catch (error) {
            console.error('Failed to load platform revenue:', error)
        }
    }
    if (!user) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div><h1 className="text-3xl font-bold">Super Admin Dashboard</h1><p className="text-gray-400 mt-1">Platform Management</p></div>
                    <button onClick={() => { localStorage.clear(); router.push('/login') }} className="px-6 py-3 rounded-lg glass hover:bg-red-500/20 transition">Logout</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card"><h3 className="text-gray-400 text-sm mb-2">Total Tenants</h3><p className="text-3xl font-bold">{tenants.length}</p></div>
                    <div className="card"><h3 className="text-gray-400 text-sm mb-2">Active Tenants</h3><p className="text-3xl font-bold text-primary">{tenants.filter((t: any) => t.isActive).length}</p></div>
                    <div className="card"><h3 className="text-gray-400 text-sm mb-2">Platform Revenue</h3><p className="text-3xl font-bold text-green-500">${platformRevenue.toFixed(2)}</p></div>
                </div>
                <div className="card mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Tenants</h2>
                        <div className="flex gap-4">
                            <button onClick={() => router.push('/process-servers')} className="px-4 py-2 glass rounded-lg hover:bg-white/10">Manage Global Servers</button>
                            <button className="btn-primary">+ New Tenant</button>
                        </div>
                    </div>
                    {tenants.length === 0 ? (
                        <div className="text-center py-12 text-gray-400"><p>Loading tenants...</p></div>
                    ) : (
                        <div className="space-y-4">
                            {tenants.map((tenant: any) => (
                                <div
                                    key={tenant.id}
                                    className="glass rounded-lg p-4 cursor-pointer hover:bg-white/5 transition"
                                    onClick={() => router.push(`/dashboard/tenant?id=${tenant.id}`)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{tenant.name}</h3>
                                            <p className="text-sm text-gray-400 mt-1">{tenant.domainUrl}</p>
                                            <p className="text-sm text-gray-500 mt-1">API Key: {tenant.apiKey?.substring(0, 20)}...</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {tenant.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
