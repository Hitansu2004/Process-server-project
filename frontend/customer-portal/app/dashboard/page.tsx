'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import SessionManager from '@/lib/sessionManager'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Initialize state from sessionStorage or defaults
    const [statusFilter, setStatusFilter] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_statusFilter') || 'ALL'
        return 'ALL'
    })
    const [minPrice, setMinPrice] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_minPrice') || ''
        return ''
    })
    const [maxPrice, setMaxPrice] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_maxPrice') || ''
        return ''
    })
    const [dropoffFilter, setDropoffFilter] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_dropoffFilter') || ''
        return ''
    })

    // Persist filters to sessionStorage whenever they change
    useEffect(() => {
        sessionStorage.setItem('dashboard_statusFilter', statusFilter)
    }, [statusFilter])

    useEffect(() => {
        sessionStorage.setItem('dashboard_minPrice', minPrice)
    }, [minPrice])

    useEffect(() => {
        sessionStorage.setItem('dashboard_maxPrice', maxPrice)
    }, [maxPrice])

    useEffect(() => {
        sessionStorage.setItem('dashboard_dropoffFilter', dropoffFilter)
    }, [dropoffFilter])

    const clearFilters = () => {
        setStatusFilter('ALL')
        setMinPrice('')
        setMaxPrice('')
        setDropoffFilter('')
        sessionStorage.removeItem('dashboard_statusFilter')
        sessionStorage.removeItem('dashboard_minPrice')
        sessionStorage.removeItem('dashboard_maxPrice')
        sessionStorage.removeItem('dashboard_dropoffFilter')
    }

    useEffect(() => {
        const token = sessionStorage.getItem('token')
        const userData = sessionStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Initialize session manager
        SessionManager.init()

        // Use user ID directly as we now use Global User IDs for orders
        loadOrders(parsedUser.userId, token)
    }, [router])

    const loadOrders = async (customerId: string, token: string) => {
        try {
            const data = await api.getCustomerOrders(customerId, token)
            setOrders(data)
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateOrderPrice = (order: any): number | null => {
        // Calculate from dropoffs as source of truth
        if (order.dropoffs && order.dropoffs.length > 0) {
            const total = order.dropoffs.reduce((sum: number, dropoff: any) => {
                return sum + (dropoff.finalAgreedPrice || 0)
            }, 0)
            if (total > 0) return total
        }

        // Fallback to order-level prices
        if (order.finalAgreedPrice) return order.finalAgreedPrice
        if (order.customerPaymentAmount) return order.customerPaymentAmount

        return null
    }

    const handleLogout = () => {
        SessionManager.clear()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }



    const filteredOrders = orders.filter(order => {
        // Status Filter
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'ASSIGNED') {
                if (order.status !== 'ASSIGNED' && order.status !== 'PARTIALLY_ASSIGNED') return false
            } else if (order.status !== statusFilter) {
                return false
            }
        }

        // Price Filter
        const price = calculateOrderPrice(order) || 0
        if (minPrice && price < parseFloat(minPrice)) return false
        if (maxPrice && price > parseFloat(maxPrice)) return false

        // Dropoff Filter
        if (dropoffFilter && order.totalDropoffs !== parseInt(dropoffFilter)) return false

        return true
    })

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}!</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = 'http://localhost:3000/'}
                            className="px-4 py-2 rounded-lg glass hover:bg-white/10 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home
                        </button>
                        <button
                            onClick={() => router.push('/orders/new')}
                            className="btn-primary"
                        >
                            + New Order
                        </button>
                        <button
                            onClick={() => router.push('/contacts')}
                            className="px-4 py-2 rounded-lg glass hover:bg-white/10"
                        >
                            Contacts
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 rounded-lg glass hover:bg-red-500/20 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Active</h3>
                        <p className="text-3xl font-bold text-primary">
                            {orders.filter(o =>
                                o.status !== 'COMPLETED' &&
                                o.status !== 'FAILED' &&
                                o.status !== 'CANCELLED'
                            ).length}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-500 text-sm mb-2">Completed</h3>
                        <p className="text-3xl font-bold text-green-500">
                            {orders.filter(o => o.status === 'COMPLETED').length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm text-gray-500 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg glass bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="OPEN">Open</option>
                                <option value="BIDDING">Bidding</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="FAILED">Failed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="block text-sm text-gray-500 mb-1">Min Price</label>
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                placeholder="Min $"
                                className="w-full px-4 py-2 rounded-lg glass bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm text-gray-500 mb-1">Max Price</label>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="Max $"
                                className="w-full px-4 py-2 rounded-lg glass bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-sm text-gray-500 mb-1">Dropoffs</label>
                            <input
                                type="number"
                                value={dropoffFilter}
                                onChange={(e) => setDropoffFilter(e.target.value)}
                                placeholder="Count"
                                className="w-full px-4 py-2 rounded-lg glass bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 rounded-lg glass hover:bg-black/5 text-sm h-[42px] text-gray-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
                        <span className="text-gray-500 text-sm">
                            Showing {filteredOrders.length} of {orders.length} orders
                        </span>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="mb-4">No orders match your filters</p>
                            {orders.length === 0 && (
                                <button
                                    onClick={() => router.push('/orders/new')}
                                    className="btn-primary"
                                >
                                    Create Your First Order
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    className="glass rounded-lg p-4 hover:bg-white/5 cursor-pointer transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {order.pickupAddress} → {order.totalDropoffs} dropoff(s)
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'BIDDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status === 'PARTIALLY_ASSIGNED' ? 'ASSIGNED' : order.status}
                                        </span>
                                    </div>
                                    {(() => {
                                        const price = calculateOrderPrice(order)
                                        return price && (
                                            <p className="mt-2 text-sm">
                                                Price: <span className="font-semibold text-green-600">${price}</span>
                                            </p>
                                        )
                                    })()}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
