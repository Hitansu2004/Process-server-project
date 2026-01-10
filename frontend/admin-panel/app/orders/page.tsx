'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function OrdersManagement() {
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const user = JSON.parse(userData)
        const tenantId = user.roles[0]?.tenantId
        if (tenantId) {
            loadOrders(tenantId, token)
        }
    }, [router])

    const loadOrders = async (tenantId: string, token: string) => {
        try {
            const data = await api.getTenantOrders(tenantId, token)
            setOrders(data)
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    const filteredOrders = filter === 'ALL'
        ? orders
        : filter === 'ADMIN_ORDERS'
            ? orders.filter(o => {
                try {
                    const config = typeof o.pricingConfig === 'string'
                        ? JSON.parse(o.pricingConfig)
                        : o.pricingConfig;
                    return config?.type === 'GUIDED';
                } catch {
                    return false;
                }
            })
            : orders.filter(o => o.status === filter)

    const stats = {
        total: orders.length,
        open: orders.filter(o => o.status === 'OPEN').length,
        bidding: orders.filter(o => o.status === 'BIDDING').length,
        inProgress: orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Orders Management</h1>
                        <p className="text-gray-400 mt-1">Manage all shop orders</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="card text-center">
                        <p className="text-gray-400 text-xs mb-1">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-gray-400 text-xs mb-1">Open</p>
                        <p className="text-2xl font-bold text-green-400">{stats.open}</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-gray-400 text-xs mb-1">Bidding</p>
                        <p className="text-2xl font-bold text-yellow-400">{stats.bidding}</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-gray-400 text-xs mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-gray-400 text-xs mb-1">Completed</p>
                        <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex gap-2 flex-wrap">
                        {['ALL', 'OPEN', 'BIDDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg transition ${filter === status
                                    ? 'bg-primary text-white'
                                    : 'glass hover:bg-white/5'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                        <div className="w-px bg-gray-700 mx-2"></div>
                        <button
                            onClick={() => setFilter('ADMIN_ORDERS')}
                            className={`px-4 py-2 rounded-lg transition ${filter === 'ADMIN_ORDERS'
                                ? 'bg-purple-500 text-white'
                                : 'glass hover:bg-white/5'
                                }`}
                        >
                            👔 Admin Orders
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-400">No orders found</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="card hover:bg-white/5 cursor-pointer transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                            {(() => {
                                                try {
                                                    const config = typeof order.pricingConfig === 'string'
                                                        ? JSON.parse(order.pricingConfig)
                                                        : order.pricingConfig;
                                                    return config?.type === 'GUIDED' && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-300">
                                                            ADMIN ORDER
                                                        </span>
                                                    );
                                                } catch {
                                                    return null;
                                                }
                                            })()}
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-400' :
                                                order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                                                    order.status === 'BIDDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-green-500/20 text-green-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400">Pickup</p>
                                                <p className="font-medium">{order.pickupAddress}</p>
                                                <p className="text-xs text-primary">ZIP: {order.pickupZipCode}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Recipients</p>
                                                <p className="font-medium">{order.totalRecipients} location(s)</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Deadline</p>
                                                <p className="font-medium">
                                                    {new Date(order.deadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Your Profit</p>
                                                <p className="font-semibold text-primary">
                                                    {order.tenantProfit != null ? `$${order.tenantProfit}` : 'Pending'}
                                                </p>
                                            </div>
                                        </div>

                                        {order.assignedDeliveryPersonName && (
                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                <p className="text-xs text-gray-400">
                                                    Assigned to: <span className="text-white font-medium">{order.assignedDeliveryPersonName}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
