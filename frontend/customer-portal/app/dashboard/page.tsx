'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Helper function to get customer profile ID from user ID
    const getUserCustomerId = (userId: string): string => {
        const userIdToProfileId: { [key: string]: string } = {
            'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e': '78650ad7-23fc-4eb4-9a5c-f280f0463771', // customer1@example.com
            '17812fce-9c0b-493c-9e4b-0189fb1c31c8': 'c371b934-2f03-4d8e-8ec6-fdf3470c1aef', // customer2@example.com
            '9db8f52f-b73d-49a4-8831-48781f9d90a2': 'c3f5911b-8a2f-4315-b5fd-6f454df39d7e', // customer3@example.com
            '0e1b5d79-887f-4a2b-8450-01c385e4ed18': 'd25ec2b5-242a-4b35-80a4-3696c5da745e', // customer4@example.com
            'ab3435d4-7174-4989-b443-b9d60bff298f': '3708ddee-f034-4591-83f1-5bf2d6a160fb', // customer5@example.com
        }
        return userIdToProfileId[userId] || userId
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        // Use customer profile ID instead of user ID
        const customerId = getUserCustomerId(parsedUser.userId)
        loadOrders(customerId, token)
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

    const handleLogout = () => {
        localStorage.clear()
        router.push('/login')
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
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}!</p>
                    </div>
                    <div className="flex gap-4">
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
                        <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold">{orders.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Active</h3>
                        <p className="text-3xl font-bold text-primary">
                            {orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Completed</h3>
                        <p className="text-3xl font-bold text-green-500">
                            {orders.filter(o => o.status === 'COMPLETED').length}
                        </p>
                    </div>
                </div>

                {/* Orders List */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="mb-4">No orders yet</p>
                            <button
                                onClick={() => router.push('/orders/new')}
                                className="btn-primary"
                            >
                                Create Your First Order
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    className="glass rounded-lg p-4 hover:bg-white/5 cursor-pointer transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {order.pickupAddress} → {order.totalDropoffs} dropoff(s)
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                                                order.status === 'BIDDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {order.finalAgreedPrice && (
                                        <p className="mt-2 text-sm">
                                            Price: <span className="font-semibold text-primary">${order.finalAgreedPrice}</span>
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
