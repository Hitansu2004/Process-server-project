'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function MyBids() {
    const router = useRouter()
    const [bids, setBids] = useState<any[]>([])
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

        // Find the PROCESS_SERVER role to get tenantUserRoleId
        const processServerRole = parsedUser.roles.find((r: any) => r.role === 'PROCESS_SERVER')

        if (processServerRole && processServerRole.id) {
            loadMyBids(processServerRole.id, token)
        } else {
            console.error('No PROCESS_SERVER role found for user')
            setLoading(false)
        }
    }, [router])

    const loadMyBids = async (tenantUserRoleId: string, token: string) => {
        try {
            // Get Profile to get the actual ProcessServerID
            const profileData = await api.getProcessServerProfile(tenantUserRoleId, token)
            const processServerId = profileData.id

            const data = await api.getMyBids(processServerId, token)
            setBids(data)
        } catch (error) {
            console.error('Failed to load bids:', error)
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

    const pendingBids = bids.filter(b => b.status === 'PENDING')
    const acceptedBids = bids.filter(b => b.status === 'ACCEPTED')
    const rejectedBids = bids.filter(b => b.status === 'REJECTED')

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Bids</h1>
                        <p className="text-gray-400 mt-1">Track all your bid submissions</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/orders')}
                            className="px-6 py-3 rounded-lg glass hover:bg-primary/20 transition"
                        >
                            Browse Orders
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 rounded-lg glass hover:bg-white/10 transition"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Pending Bids</h3>
                        <p className="text-3xl font-bold text-yellow-400">{pendingBids.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Accepted Bids</h3>
                        <p className="text-3xl font-bold text-green-400">{acceptedBids.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Bids</h3>
                        <p className="text-3xl font-bold">{bids.length}</p>
                    </div>
                </div>

                {/* Bids List */}
                {bids.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">You haven't placed any bids yet</p>
                        <button
                            onClick={() => router.push('/orders')}
                            className="btn-primary"
                        >
                            Browse Available Orders
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bids.map((bid) => (
                            <div
                                key={bid.id}
                                className="card hover:bg-white/5 transition cursor-pointer"
                                onClick={() => bid.orderId && router.push(`/orders/${bid.orderId}`)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">
                                                {bid.order?.orderNumber || (bid.orderId ? `Order ${bid.orderId.substring(0, 8)}...` : 'Order Details')}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bid.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                bid.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                                            <div>
                                                <p className="text-gray-400">Bid Amount</p>
                                                <p className="font-semibold text-primary text-lg">${bid.bidAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Submitted</p>
                                                <p className="font-medium">
                                                    {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {bid.createdAt ? new Date(bid.createdAt).toLocaleTimeString() : 'N/A'}
                                                </p>
                                            </div>
                                            {bid.order && (
                                                <div>
                                                    <p className="text-gray-400">Pickup Location</p>
                                                    <p className="font-medium truncate">{bid.order.pickupAddress}</p>
                                                    <p className="text-xs text-primary">ZIP: {bid.order.pickupZipCode}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right ml-4">
                                        <button className="text-sm text-primary hover:underline">
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
