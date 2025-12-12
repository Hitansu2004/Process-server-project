'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [processServers, setProcessServers] = useState<any[]>([])
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
        loadDashboardData(parsedUser, token)
    }, [router])

    const loadDashboardData = async (user: any, token: string) => {
        try {
            const tenantId = user.roles[0]?.tenantId
            if (tenantId) {
                const [ordersData, processServersData] = await Promise.all([
                    api.getTenantOrders(tenantId, token),
                    api.getTenantProcessServers(tenantId, token).catch(() => [])
                ])
                setOrders(ordersData)
                setProcessServers(processServersData)
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Calculate total revenue from all non-cancelled orders
    const totalRevenue = orders
        .filter(o => o.status !== 'CANCELLED' && o.status !== 'DRAFT')
        .reduce((sum, o) => sum + (o.tenantProfit || 0), 0)

    const activeProcessServerCount = processServers.filter((d: any) =>
        d.status === 'ACTIVE' || d.status === 'AVAILABLE'
    ).length

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">Shop Management</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = 'http://localhost:3000/'}
                            className="glass px-4 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2"
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
                            className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <p className="text-gray-400 text-sm mb-2">Total Orders</p>
                        <p className="text-3xl font-bold text-primary">{orders.length}</p>
                    </div>
                    <div className="card">
                        <p className="text-gray-400 text-sm mb-2">Active Process Servers</p>
                        <p className="text-3xl font-bold text-primary">{activeProcessServerCount}</p>
                    </div>
                    <div className="card">
                        <p className="text-gray-400 text-sm mb-2">Your Total Profit</p>
                        <p className="text-3xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">After platform fees</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push('/orders')}
                            className="glass rounded-lg p-4 hover:bg-white/5 text-left transition"
                        >
                            <h3 className="font-semibold mb-2">Manage Orders</h3>
                            <p className="text-sm text-gray-400">View and manage all shop orders</p>
                        </button>
                        <button
                            onClick={() => router.push('/process-servers')}
                            className="glass rounded-lg p-4 hover:bg-white/5 text-left transition"
                        >
                            <h3 className="font-semibold mb-2">Manage Process Servers</h3>
                            <p className="text-sm text-gray-400">View process server stats and ratings</p>
                        </button>
                        <button
                            onClick={() => router.push('/customers')}
                            className="glass rounded-lg p-4 hover:bg-white/5 text-left transition"
                        >
                            <h3 className="font-semibold mb-2">View Customers</h3>
                            <p className="text-sm text-gray-400">Manage customer accounts</p>
                        </button>
                        <button
                            onClick={() => router.push('/settings')}
                            className="glass rounded-lg p-4 hover:bg-white/5 text-left transition"
                        >
                            <h3 className="font-semibold mb-2">Settings</h3>
                            <p className="text-sm text-gray-400">Configure shop preferences</p>
                        </button>
                        <button
                            onClick={() => router.push('/orders/new')}
                            className="glass rounded-lg p-4 hover:bg-white/5 text-left transition md:col-span-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        >
                            <h3 className="font-semibold mb-2 text-blue-300">Create Concierge Order</h3>
                            <p className="text-sm text-gray-400">Create order on behalf of customer with custom pricing</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
