'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [assignedOrders, setAssignedOrders] = useState<any[]>([])
    const [availableOrders, setAvailableOrders] = useState<any[]>([])
    const [myBids, setMyBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [assignedFilter, setAssignedFilter] = useState('ALL')

    const filteredAssignedOrders = assignedOrders.filter(order => {
        if (assignedFilter === 'ALL') return true

        // Check dropoff types
        // If any dropoff is GUIDED, it's considered a Direct Assignment (at least partially)
        // If all dropoffs are AUTOMATED, it's a Bidding Won order

        const hasGuided = order.dropoffs?.some((d: any) => d.dropoffType === 'GUIDED')

        if (assignedFilter === 'DIRECT') {
            return hasGuided
        } else if (assignedFilter === 'BIDDING') {
            return !hasGuided // If no guided dropoffs, it must be bidding (or empty/legacy)
        }
        return true
    })

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        if (!token || !userData) {
            router.push('/login')
            return
        }
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Find the PROCESS_SERVER role to get tenantUserRoleId
        const processServerRole = parsedUser.roles.find((r: any) => r.role === 'PROCESS_SERVER')

        if (processServerRole && processServerRole.id) {
            loadDashboardData(processServerRole.id, token)
        } else {
            console.error('No PROCESS_SERVER role found for user')
            setLoading(false)
        }
    }, [router])

    const loadDashboardData = async (tenantUserRoleId: string, token: string) => {
        try {
            // 1. Get Profile to get the actual ProcessServerID (profile.id)
            const profileData = await api.getProcessServerProfile(tenantUserRoleId, token)
            setProfile(profileData)

            const processServerId = profileData.id

            // Load assigned orders
            const assigned = await api.getDeliveryPersonOrders(processServerId, token)
            setAssignedOrders(assigned)

            // Load available orders
            const available = await api.getAvailableOrders(token)
            setAvailableOrders(available)

            // Load my bids
            const bids = await api.getMyBids(processServerId, token)
            setMyBids(bids)
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Process Server Dashboard</h1>
                        <p className="text-gray-400 mt-1">Welcome, {user?.firstName}!</p>
                        {profile && (
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-yellow-500 font-bold">★ {profile.currentRating}</span>
                                <span className="text-sm text-gray-500">({profile.totalOrdersAssigned} Orders)</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = 'http://localhost:3000/'}
                            className="px-6 py-3 rounded-lg glass hover:bg-white/10 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home
                        </button>
                        <button
                            onClick={() => router.push('/orders')}
                            className="btn-primary"
                        >
                            Browse Orders
                        </button>
                        <button
                            onClick={() => router.push('/bids')}
                            className="px-6 py-3 rounded-lg glass hover:bg-primary/20 transition"
                        >
                            My Bids
                        </button>
                        <button
                            onClick={() => { localStorage.clear(); router.push('/login') }}
                            className="px-6 py-3 rounded-lg glass hover:bg-red-500/20 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Total Assigned</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {profile?.totalOrdersAssigned || 0}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Total Earnings</h3>
                        <p className="text-3xl font-bold text-green-400">
                            ${assignedOrders
                                .filter(order => order.status !== 'FAILED' && order.status !== 'CANCELLED')
                                .reduce((sum, order) => sum + (order.processServerPayout || (order.finalAgreedPrice * 0.85) || 0), 0)
                                .toFixed(2)}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Total Pending</h3>
                        <p className="text-3xl font-bold text-yellow-500">
                            {(profile?.totalOrdersAssigned || 0) - (profile?.successfulDeliveries || 0)}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Success Rate</h3>
                        <p className="text-3xl font-bold text-blue-500">
                            {profile ? `${Math.min(((profile.successfulDeliveries / (profile.totalOrdersAssigned || 1)) * 100), 100).toFixed(1)}%` : '0.0%'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Available Orders</h3>
                        <p className="text-3xl font-bold text-primary">
                            {availableOrders.length}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">My Bids (Pending)</h3>
                        <p className="text-3xl font-bold text-yellow-500">
                            {myBids.filter(b => b.status === 'PENDING').length}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">My Rating</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-yellow-500">
                                {profile?.currentRating || '0.0'}
                            </p>
                            <span className="text-sm text-gray-400">/ 5.0</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">My Assigned Deliveries</h2>
                        <div className="flex bg-black/20 p-1 rounded-lg">
                            <button
                                onClick={() => setAssignedFilter('ALL')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${assignedFilter === 'ALL' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setAssignedFilter('DIRECT')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${assignedFilter === 'DIRECT' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Direct Assigned
                            </button>
                            <button
                                onClick={() => setAssignedFilter('BIDDING')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${assignedFilter === 'BIDDING' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Bidding Won
                            </button>
                        </div>
                    </div>

                    {filteredAssignedOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No deliveries found for this filter.</p>
                            {assignedOrders.length === 0 && (
                                <p className="mt-2 text-sm">Browse available orders and place bids to get started!</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAssignedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    className="glass rounded-lg p-4 hover:bg-white/5 cursor-pointer transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                                {/* Show badge for order type */}
                                                {order.dropoffs?.some((d: any) => d.dropoffType === 'GUIDED') ? (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                                        DIRECT
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                                        BID
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">{order.customerName}</p>
                                            <p className="text-sm text-gray-500 mt-1">{order.pickupAddress}</p>
                                            <p className="text-sm text-green-600 font-medium mt-2">Your Earnings: ${order.processServerPayout || order.finalAgreedPrice}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>{order.status}</span>
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
