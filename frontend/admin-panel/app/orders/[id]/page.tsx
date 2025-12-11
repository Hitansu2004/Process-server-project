'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [customer, setCustomer] = useState<any>(null)
    const [processServer, setProcessServer] = useState<any>(null)
    const [bids, setBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        loadOrderDetails(params.id, token)
    }, [params.id, router])

    const loadOrderDetails = async (orderId: string, token: string) => {
        try {
            const orderData = await api.getOrderDetails(orderId, token)
            setOrder(orderData)

            // Load customer data if available
            if (orderData.customerId) {
                // Customer info would come from the order endpoint or a separate API
                // For now, we'll use what's in the order object
            }

            // Load process server data if assigned
            if (orderData.assignedProcessServerId) {
                // Process server info would come from user service
                // For now, we'll use what's in the order object
            }

            // Load bids
            if (orderData.bids) {
                setBids(orderData.bids)
            }
        } catch (error) {
            console.error('Failed to load order details:', error)
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

    if (!order) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-5xl mx-auto card text-center py-12">
                    <p className="text-gray-400">Order not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
                        <p className="text-gray-400 mt-1">Order Details</p>
                    </div>
                    <span className={`ml-auto px-4 py-2 rounded-full text-sm font-semibold ${order.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-400' :
                            order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                                order.status === 'BIDDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                        }`}>
                        {order.status}
                    </span>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Customer Information */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-primary">👤</span> Customer Information
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-400">Customer ID</p>
                                <p className="font-medium">{order.customerId || 'N/A'}</p>
                            </div>
                            {order.customerName && (
                                <div>
                                    <p className="text-gray-400">Name</p>
                                    <p className="font-medium">{order.customerName}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Process Server Information */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-primary">🚗</span> Process Server
                        </h2>
                        {order.assignedProcessServerId ? (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-400">Server ID</p>
                                    <p className="font-medium">{order.assignedProcessServerId}</p>
                                </div>
                                {order.assignedDeliveryPersonName && (
                                    <div>
                                        <p className="text-gray-400">Name</p>
                                        <p className="font-medium">{order.assignedDeliveryPersonName}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-400">Assignment Method</p>
                                    <p className="font-medium">
                                        {bids && bids.some(b => b.status === 'ACCEPTED') ? '📊 Via Bid' : '✋ Direct Assignment'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">Not assigned yet</p>
                        )}
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-primary">💰</span> Payment Breakdown
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass p-4 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Customer Payment</p>
                            <p className="text-2xl font-bold text-green-400">
                                ${(order.customerPaymentAmount || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="glass p-4 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Server Payout</p>
                            <p className="text-2xl font-bold text-blue-400">
                                ${(order.processServerPayout || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="glass p-4 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Tenant Commission</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                ${(order.tenantCommission || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="glass p-4 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Tenant Profit</p>
                            <p className="text-2xl font-bold text-primary">
                                ${(order.tenantProfit || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bid Information */}
                {bids && bids.length > 0 && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-primary">📊</span> Bids ({bids.length})
                        </h2>
                        <div className="space-y-3">
                            {bids.map((bid) => (
                                <div key={bid.id} className="glass p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">
                                            Server ID: {bid.processServerId}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(bid.createdAt).toLocaleString()}
                                        </p>
                                        {bid.comment && (
                                            <p className="text-sm text-gray-300 mt-1">{bid.comment}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            ${bid.bidAmount}
                                        </p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${bid.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                bid.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {bid.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dropoffs */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-primary">📍</span> Dropoff Locations ({order.dropoffs?.length || 0})
                    </h2>
                    <div className="space-y-4">
                        {order.dropoffs && order.dropoffs.length > 0 ? (
                            order.dropoffs.map((dropoff: any, index: number) => (
                                <div key={dropoff.id} className="glass p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold">Dropoff #{dropoff.sequenceNumber || index + 1}</p>
                                            <p className="text-sm text-gray-400">Recipient: {dropoff.recipientName}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${dropoff.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                                                dropoff.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {dropoff.status}
                                        </span>
                                    </div>
                                    <p className="text-sm">{dropoff.dropoffAddress}</p>
                                    <p className="text-sm text-gray-400">ZIP: {dropoff.dropoffZipCode}</p>
                                    {dropoff.finalAgreedPrice && (
                                        <p className="text-sm text-primary mt-2">
                                            Agreed Price: ${dropoff.finalAgreedPrice}
                                        </p>
                                    )}
                                    {dropoff.attemptCount !== undefined && (
                                        <p className="text-sm text-gray-400 mt-1">
                                            Attempts: {dropoff.attemptCount}/{dropoff.maxAttempts || 'N/A'}
                                        </p>
                                    )}
                                    {dropoff.deliveredAt && (
                                        <p className="text-sm text-green-400 mt-1">
                                            Delivered: {new Date(dropoff.deliveredAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No dropoffs</p>
                        )}
                    </div>
                </div>

                {/* Order Timeline */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-primary">📅</span> Order Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400">Created</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Deadline</p>
                            <p className="font-medium">{new Date(order.deadline).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Pickup Address</p>
                            <p className="font-medium">{order.pickupAddress}</p>
                            <p className="text-xs text-gray-400">ZIP: {order.pickupZipCode}</p>
                        </div>
                        {order.specialInstructions && (
                            <div>
                                <p className="text-gray-400">Special Instructions</p>
                                <p className="font-medium">{order.specialInstructions}</p>
                            </div>
                        )}
                        {order.completedAt && (
                            <div>
                                <p className="text-gray-400">Completed</p>
                                <p className="font-medium text-green-400">
                                    {new Date(order.completedAt).toLocaleString()}
                                </p>
                            </div>
                        )}
                        {order.assignedAt && (
                            <div>
                                <p className="text-gray-400">Assigned</p>
                                <p className="font-medium">{new Date(order.assignedAt).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
