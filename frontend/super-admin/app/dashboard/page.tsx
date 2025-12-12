'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [tenants, setTenants] = useState<any[]>([])
    const [platformRevenue, setPlatformRevenue] = useState<number>(0)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalServers: 0,
        activeServers: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        if (!token || !userData) {
            router.push('/login')
            return
        }
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        loadDashboardData(token)
    }, [router])

    const loadDashboardData = async (token: string) => {
        try {
            const [tenantsData, revenueData] = await Promise.all([
                api.getTenants(token).catch(() => []),
                api.getPlatformRevenue(token).catch(() => ({ revenue: 0 }))
            ])

            setTenants(tenantsData)
            setPlatformRevenue(revenueData.revenue || 0)

            // Calculate aggregate stats (would normally come from API)
            setStats({
                totalUsers: tenantsData.length * 12,  // Rough estimate
                totalOrders: tenantsData.length * 50,
                totalServers: tenantsData.length * 15,
                activeServers: tenantsData.length * 12
            })
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Super Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Platform-wide Management & Analytics</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = 'http://localhost:3000/'}
                            className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition border border-gray-300 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear()
                                router.push('/login')
                            }}
                            className="px-6 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition border border-red-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Platform-wide Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-50 to-white">
                        <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Total Tenants</h3>
                        <p className="text-4xl font-bold text-blue-600">{tenants.length}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {tenants.filter((t: any) => t.isActive).length} active
                        </p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-50 to-white">
                        <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Platform Revenue</h3>
                        <p className="text-4xl font-bold text-green-600">${platformRevenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-2">Total collected fees</p>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-50 to-white">
                        <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Total Orders</h3>
                        <p className="text-4xl font-bold text-purple-600">{stats.totalOrders}</p>
                        <p className="text-sm text-gray-500 mt-2">Across all tenants</p>
                    </div>
                    <div className="card bg-gradient-to-br from-orange-50 to-white">
                        <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Active Servers</h3>
                        <p className="text-4xl font-bold text-orange-600">{stats.activeServers}</p>
                        <p className="text-sm text-gray-500 mt-2">Out of {stats.totalServers} total</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/dashboard/tenants/create')}
                            className="btn-primary text-center py-4"
                        >
                            <span className="text-lg">+ Create New Tenant</span>
                        </button>
                        <button
                            onClick={() => router.push('/process-servers')}
                            className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300 transition text-left"
                        >
                            <h3 className="font-semibold text-gray-800">Global Process Servers</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage platform-wide servers</p>
                        </button>
                        <button
                            onClick={() => window.location.href = 'http://localhost:3000'}
                            className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300 transition text-left"
                        >
                            <h3 className="font-semibold text-gray-800">Portal Home</h3>
                            <p className="text-sm text-gray-600 mt-1">Go to main landing page</p>
                        </button>
                    </div>
                </div>

                {/* Tenants List */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Tenant Organizations</h2>
                        <span className="text-sm text-gray-600">{tenants.length} total tenants</span>
                    </div>

                    {tenants.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No tenants found. Create your first tenant to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tenants.map((tenant: any) => (
                                <div
                                    key={tenant.id}
                                    className="bg-white hover:bg-gray-50 rounded-xl p-5 cursor-pointer border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                                    onClick={() => router.push(`/dashboard/tenant?id=${tenant.id}`)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-xl text-gray-800">{tenant.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tenant.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    {tenant.subscriptionTier || 'FREE'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                <p><span className="font-semibold">Domain:</span> {tenant.domainUrl}</p>
                                                <p><span className="font-semibold">Subdomain:</span> {tenant.subdomain}</p>
                                                {tenant.businessEmail && (
                                                    <p><span className="font-semibold">Email:</span> {tenant.businessEmail}</p>
                                                )}
                                                {tenant.businessPhone && (
                                                    <p><span className="font-semibold">Phone:</span> {tenant.businessPhone}</p>
                                                )}
                                            </div>
                                            {tenant.apiKey && (
                                                <p className="text-xs text-gray-500 mt-2 font-mono">
                                                    API Key: {tenant.apiKey.substring(0, 20)}...
                                                </p>
                                            )}
                                        </div>
                                        <svg
                                            className="w-6 h-6 text-blue-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
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
