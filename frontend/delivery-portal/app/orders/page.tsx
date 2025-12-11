'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function AvailableOrders() {
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        loadAvailableOrders(token)
    }, [router])

    const loadAvailableOrders = async (token: string) => {
        try {
            // Fetch all OPEN and BIDDING orders
            const data = await api.getAvailableOrders(token)
            setOrders(data)
        } catch (error) {
            console.error('Failed to load available orders:', error)
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

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Available Orders</h1>
                        <p className="text-gray-400 mt-1">Browse and bid on delivery orders</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/bids')}
                            className="px-6 py-3 rounded-lg glass hover:bg-primary/20 transition"
                        >
                            My Bids
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 rounded-lg glass hover:bg-white/10 transition"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>

                {/* Orders Grid */}
                {orders.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-400 text-lg">No available orders at the moment</p>
                        <p className="text-gray-500 text-sm mt-2">Check back later for new delivery opportunities</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="card hover:scale-105 transition-transform cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 ${order.status === 'OPEN' ? 'bg-green-500/20 text-green-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {order.existingBidsCount > 0 && (
                                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                            {order.existingBidsCount} bid{order.existingBidsCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-400">Pickup</p>
                                        <p className="font-medium">{order.pickupAddress}</p>
                                        <p className="text-primary">ZIP: {order.pickupZipCode}</p>
                                    </div>

                                    <div className="border-t border-gray-700 pt-2">
                                        <p className="text-gray-400">{order.totalDropoffs} Dropoff{order.totalDropoffs > 1 ? 's' : ''}</p>
                                        {order.dropoffs && order.dropoffs[0] && (
                                            <p className="font-medium truncate">{order.dropoffs[0].dropoffAddress}</p>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-700 pt-2">
                                        <p className="text-gray-400">Deadline</p>
                                        <p className="font-medium">
                                            {new Date(order.deadline).toLocaleDateString()} {new Date(order.deadline).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                <button className="btn-primary w-full mt-4">
                                    View Details & Bid
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
