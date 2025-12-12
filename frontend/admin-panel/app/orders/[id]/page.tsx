'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [customer, setCustomer] = useState<any>(null)
    const [processServers, setProcessServers] = useState<Record<string, any>>({})
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

            // Load bids
            try {
                const bidsData = await api.getOrderBids(orderId, token)
                setBids(bidsData)
            } catch (e) {
                console.error('Failed to load bids:', e)
            }

            // Load process server profiles if order has assigned servers
            if (orderData.dropoffs) {
                const uniqueServerIds = Array.from(new Set(
                    orderData.dropoffs
                        .map((d: any) => d.assignedProcessServerId)
                        .filter((id: string) => id)
                )) as string[]

                const profiles: Record<string, any> = {}
                await Promise.all(uniqueServerIds.map(async (id) => {
                    try {
                        const psData = await api.getProcessServerProfile(id, token)
                        profiles[id] = psData
                    } catch (e) {
                        console.error(`Failed to load profile for ${id}`, e)
                    }
                }))
                setProcessServers(profiles)
            }
        } catch (error) {
            console.error('Failed to load order details:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        const colors: any = {
            'OPEN': 'bg-green-500/20 text-green-400',
            'BIDDING': 'bg-yellow-500/20 text-yellow-400',
            'ASSIGNED': 'bg-purple-500/20 text-purple-400',
            'IN_PROGRESS': 'bg-blue-500/20 text-blue-400',
            'COMPLETED': 'bg-green-500/20 text-green-400',
            'DELIVERED': 'bg-green-500/20 text-green-400',
            'FAILED': 'bg-red-500/20 text-red-400',
            'CANCELLED': 'bg-gray-500/20 text-gray-400'
        }
        return colors[status] || 'bg-gray-500/20 text-gray-400'
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
            <div className="max-w-6xl mx-auto">
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
                        <p className="text-gray-400 mt-1">
                            Created {formatDate(order.createdAt)}
                        </p>
                        {order.customerName && (
                            <p className="text-sm text-gray-300 font-medium mt-1">Customer: {order.customerName}</p>
                        )}
                    </div>
                    <span className={`ml-auto px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-primary">📦</span> Order Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Pickup Address</p>
                                    <p className="font-medium">{order.pickupAddress}</p>
                                    <p className="text-xs text-primary">ZIP: {order.pickupZipCode}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Deadline</p>
                                    <p className="font-medium">{formatDate(order.deadline)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Total Dropoffs</p>
                                    <p className="font-medium">{order.totalDropoffs}</p>
                                </div>
                                {order.specialInstructions && (
                                    <div className="col-span-2">
                                        <p className="text-gray-400">Special Instructions</p>
                                        <p className="font-medium">{order.specialInstructions}</p>
                                    </div>
                                )}
                                {order.completedAt && (
                                    <div>
                                        <p className="text-gray-400">Completed</p>
                                        <p className="font-medium text-green-400">
                                            {formatDate(order.completedAt)}
                                        </p>
                                    </div>
                                )}
                                {order.assignedAt && (
                                    <div>
                                        <p className="text-gray-400">Assigned</p>
                                        <p className="font-medium">{formatDate(order.assignedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dropoffs with Delivery Attempts */}
                        <div className="card">
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
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dropoff.status)}`}>
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
                                                    Delivered: {formatDate(dropoff.deliveredAt)}
                                                </p>
                                            )}

                                            {/* Show assigned process server for this dropoff */}
                                            {dropoff.assignedProcessServerId && processServers[dropoff.assignedProcessServerId] && (
                                                <div className="mt-3 pt-3 border-t border-white/10">
                                                    <p className="text-sm text-gray-400 mb-2">Assigned to</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                            {(processServers[dropoff.assignedProcessServerId].firstName?.[0] || 'S')}{(processServers[dropoff.assignedProcessServerId].lastName?.[0] || '2')}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">
                                                                {processServers[dropoff.assignedProcessServerId].firstName || 'Server'} {processServers[dropoff.assignedProcessServerId].lastName || 'Name'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {processServers[dropoff.assignedProcessServerId].successfulDeliveries > 0
                                                                    ? `${processServers[dropoff.assignedProcessServerId].successfulDeliveries} Completed Orders`
                                                                    : 'New Process Server'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show delivery attempts */}
                                            {dropoff.attempts && dropoff.attempts.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    <h4 className="font-semibold text-sm">Delivery Attempts</h4>
                                                    {dropoff.attempts
                                                        .sort((a: any, b: any) => a.attemptNumber - b.attemptNumber)
                                                        .map((attempt: any) => (
                                                            <div key={attempt.id} className="bg-black/20 rounded p-3 text-sm">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="font-semibold">Attempt {attempt.attemptNumber}</span>
                                                                    {attempt.wasSuccessful ? (
                                                                        <span className="text-green-400 text-xs">✓ Successful</span>
                                                                    ) : (
                                                                        <span className="text-red-400 text-xs">✗ Failed</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-400 text-xs mb-1">{formatDate(attempt.attemptTime)}</p>
                                                                {attempt.outcomeNotes && (
                                                                    <p className="text-gray-300">{attempt.outcomeNotes}</p>
                                                                )}
                                                                {attempt.gpsLatitude && attempt.gpsLongitude && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        📍 GPS: {attempt.gpsLatitude}, {attempt.gpsLongitude}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">No dropoffs</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div className="card">
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
                            <div className="card">
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
                                                    {formatDate(bid.createdAt)}
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
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-primary">👤</span> Customer
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-400">Customer ID</p>
                                    <p className="font-medium text-xs break-all">{order.customerId || 'N/A'}</p>
                                </div>
                                {order.customerName && (
                                    <div>
                                        <p className="text-gray-400">Name</p>
                                        <p className="font-medium">{order.customerName}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Process Server Summary - Show all assigned servers */}
                        {Object.keys(processServers).length > 0 && (
                            <div className="space-y-4">
                                {Object.values(processServers).map((ps: any) => (
                                    <div key={ps.id} className="card">
                                        <h3 className="text-lg font-semibold mb-4">Assigned Process Server</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-400">Name</p>
                                                <p className="font-semibold">{ps.firstName || 'Server'} {ps.lastName || 'Name'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Rating</p>
                                                <p className="font-semibold">
                                                    ⭐ {(ps.currentRating || 0).toFixed(1)} / 5.0
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Total Completed Orders</p>
                                                <p className="font-semibold">
                                                    {ps.successfulDeliveries > 0 ? ps.successfulDeliveries : <span className="text-blue-400">New</span>}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Success Rate</p>
                                                <p className="font-semibold text-green-400">
                                                    {ps.totalOrdersAssigned > 0
                                                        ? ((ps.successfulDeliveries / ps.totalOrdersAssigned) * 100).toFixed(1)
                                                        : 0}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Attempts</p>
                                                <p className="font-semibold">
                                                    {order.dropoffs
                                                        .filter((d: any) => d.assignedProcessServerId === ps.id)
                                                        .reduce((sum: number, d: any) => sum + (d.attempts?.length || 0), 0)}
                                                </p>
                                            </div>
                                            {/* Show assigned dropoffs */}
                                            <div className="pt-2 border-t border-white/10">
                                                <p className="text-xs text-gray-400 mb-1">Assigned Dropoffs</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {order.dropoffs
                                                        .map((d: any, idx: number) => ({ ...d, index: idx + 1 }))
                                                        .filter((d: any) => d.assignedProcessServerId === ps.id)
                                                        .map((d: any) => (
                                                            <span key={d.id} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                                                Dropoff {d.index}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
