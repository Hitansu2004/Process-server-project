'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'

export default function OrderDetails() {
    const router = useRouter()
    const params = useParams()
    const [order, setOrder] = useState<any>(null)
    const [bids, setBids] = useState<any[]>([])
    const [processServers, setProcessServers] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrderDetails()
    }, [])

    const loadOrderDetails = async () => {
        try {
            const token = sessionStorage.getItem('token')

            // Load order details with dropoffs
            const orderData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())

            setOrder(orderData)

            // Load bids if order is in BIDDING status
            if (orderData.status === 'BIDDING') {
                const bidsData = await api.getOrderBids(params.id as string, token!)
                setBids(bidsData.sort((a: any, b: any) => a.bidAmount - b.bidAmount))
            }

            // Load process server details if order is ASSIGNED, IN_PROGRESS, or COMPLETED
            if (['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(orderData.status)) {
                if (orderData.dropoffs) {
                    const uniqueServerIds = Array.from(new Set(
                        orderData.dropoffs
                            .map((d: any) => d.assignedProcessServerId)
                            .filter((id: string) => id)
                    )) as string[]

                    const profiles: Record<string, any> = {}
                    await Promise.all(uniqueServerIds.map(async (id) => {
                        try {
                            const psData = await api.getProcessServerProfile(id, token!)
                            profiles[id] = psData
                        } catch (e) {
                            console.error(`Failed to load profile for ${id}`, e)
                        }
                    }))
                    setProcessServers(profiles)
                }
            }
        } catch (error) {
            console.error('Failed to load order details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm('Accept this bid? The process server will be assigned to this order.')) return

        try {
            const token = sessionStorage.getItem('token')
            await api.acceptBid(bidId, token!)
            alert('Bid accepted! Process server has been assigned.')
            router.push('/dashboard')
        } catch (error) {
            alert('Failed to accept bid')
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

    const calculateTotalPrice = (order: any): number | null => {
        // Calculate from dropoffs as source of truth
        if (order.dropoffs && order.dropoffs.length > 0) {
            const total = order.dropoffs.reduce((sum: number, dropoff: any) => {
                return sum + (dropoff.finalAgreedPrice || 0)
            }, 0)
            return total > 0 ? total : null
        }

        // Fallback to order-level prices
        return order.finalAgreedPrice || order.customerPaymentAmount || null
    }

    const getBidsForDropoff = (dropoffId: string) => {
        return bids
            .filter((bid: any) => bid.orderDropoffId === dropoffId)
            .sort((a: any, b: any) => a.bidAmount - b.bidAmount)
    }

    const getStatusColor = (status: string) => {
        const colors: any = {
            'OPEN': 'bg-blue-500/20 text-blue-400',
            'BIDDING': 'bg-yellow-500/20 text-yellow-400',
            'ASSIGNED': 'bg-purple-500/20 text-purple-400',
            'IN_PROGRESS': 'bg-blue-500/20 text-blue-400',
            'COMPLETED': 'bg-green-500/20 text-green-400',
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-xl text-gray-400">Order not found</p>
                    <button onClick={() => router.back()} className="btn-primary mt-4">Go Back</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
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
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-4">Order Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-400">Pickup Address</p>
                                    <p className="text-lg">{order.pickupAddress}</p>
                                    <p className="text-sm text-gray-400">ZIP: {order.pickupZipCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Deadline</p>
                                    <p className="text-lg">{formatDate(order.deadline)}</p>
                                </div>
                                {order.specialInstructions && (
                                    <div>
                                        <p className="text-sm text-gray-400">Special Instructions</p>
                                        <p className="text-lg">{order.specialInstructions}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-400">Total Dropoffs</p>
                                    <p className="text-lg">{order.totalDropoffs}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dropoffs */}
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-4">Dropoff Locations</h2>
                            <div className="space-y-4">
                                {order.dropoffs?.map((dropoff: any, index: number) => (
                                    <div key={dropoff.id} className="glass rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold">Dropoff {index + 1}: {dropoff.recipientName}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{dropoff.dropoffAddress}</p>
                                                <p className="text-sm text-gray-400">ZIP: {dropoff.dropoffZipCode}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dropoff.status)}`}>
                                                {dropoff.status}
                                            </span>
                                        </div>
                                        {dropoff.finalAgreedPrice && (
                                            <p className="text-sm mt-2">
                                                Price: <span className="font-semibold text-primary">${dropoff.finalAgreedPrice}</span>
                                            </p>
                                        )}

                                        {/* Show assigned process server */}
                                        {['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(order.status) && dropoff.assignedProcessServerId && processServers[dropoff.assignedProcessServerId] && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-sm text-gray-400">Assigned to</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                        {(processServers[dropoff.assignedProcessServerId].firstName?.[0] || '?')}{(processServers[dropoff.assignedProcessServerId].lastName?.[0] || '?')}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">
                                                            {processServers[dropoff.assignedProcessServerId].firstName || 'Unknown'} {processServers[dropoff.assignedProcessServerId].lastName || 'User'}
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

                                        {/* Show bids for BIDDING status dropoffs */}
                                        {order.status === 'BIDDING' && (() => {
                                            const dropoffBids = getBidsForDropoff(dropoff.id)
                                            return dropoffBids.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-semibold text-sm mb-2">
                                                        Bids for this location ({dropoffBids.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {dropoffBids.map((bid: any) => (
                                                            <div key={bid.id} className="bg-black/20 rounded p-3">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <p className="font-bold text-primary text-lg">
                                                                            ${bid.bidAmount.toFixed(2)}
                                                                        </p>
                                                                        {bid.comment && (
                                                                            <p className="text-sm text-gray-300 mt-1">{bid.comment}</p>
                                                                        )}
                                                                    </div>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bid.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                                        bid.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                            'bg-gray-500/20 text-gray-400'
                                                                        }`}>
                                                                        {bid.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-400">
                                                                    Placed: {formatDate(bid.createdAt)}
                                                                </p>
                                                                {bid.status === 'PENDING' && (
                                                                    <button
                                                                        onClick={() => handleAcceptBid(bid.id)}
                                                                        className="w-full mt-2 px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded text-sm font-semibold transition"
                                                                    >
                                                                        Accept This Bid
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        {/* Show delivery attempts for completed/in-progress dropoffs */}
                                        {dropoff.attempts && dropoff.attempts.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <h4 className="font-semibold text-sm">Delivery Attempts</h4>
                                                {dropoff.attempts
                                                    .sort((a: any, b: any) => a.attemptNumber - b.attemptNumber)
                                                    .map((attempt: any, idx: number) => (
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
                                                            {attempt.photoProofUrl && (
                                                                <div className="mt-2">
                                                                    <img
                                                                        src={attempt.photoProofUrl}
                                                                        alt="Delivery proof"
                                                                        className="rounded max-h-48 cursor-pointer hover:opacity-80"
                                                                        onClick={() => window.open(attempt.photoProofUrl, '_blank')}
                                                                        onError={(e) => {
                                                                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23374151" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="14"%3EPhoto Not Available%3C/text%3E%3C/svg%3E'
                                                                        }}
                                                                    />
                                                                </div>
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
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Summary */}
                        {(() => {
                            const totalPrice = calculateTotalPrice(order)
                            return totalPrice && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
                                    <div className="space-y-2">
                                        {order.dropoffs && order.dropoffs.length > 1 && (
                                            <>
                                                {order.dropoffs.map((dropoff: any, idx: number) => (
                                                    dropoff.finalAgreedPrice && (
                                                        <div key={dropoff.id} className="flex justify-between text-sm">
                                                            <span className="text-gray-400">Dropoff {idx + 1}</span>
                                                            <span className="font-semibold">${dropoff.finalAgreedPrice}</span>
                                                        </div>
                                                    )
                                                ))}
                                                <div className="border-t border-gray-700 my-2"></div>
                                            </>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Amount</span>
                                            <span className="font-bold text-primary text-xl">
                                                ${totalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Process Server Info - For ASSIGNED/IN_PROGRESS/COMPLETED orders */}
                        {['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(order.status) && Object.keys(processServers).length > 0 && (
                            <div className="space-y-4">
                                {Object.values(processServers).map((ps: any) => (
                                    <div key={ps.id} className="card">
                                        <h3 className="text-lg font-semibold mb-4">Assigned Process Server</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-400">Name</p>
                                                <p className="font-semibold">{ps.firstName || 'Unknown'} {ps.lastName || 'User'}</p>
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

                        {/* Completion Info */}
                        {order.status === 'COMPLETED' && (
                            <div className="card">
                                {/* Rating Section */}
                                <div className="pt-2">
                                    <h4 className="font-semibold mb-3">Rate Process Server(s)</h4>
                                    <div className="space-y-6">
                                        {Object.values(processServers).map((ps: any) => (
                                            <div key={ps.id} className="space-y-2">
                                                <p className="text-sm font-medium">{ps.firstName} {ps.lastName}</p>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => {
                                                                if (confirm(`Rate ${ps.firstName} ${star} stars?`)) {
                                                                    api.submitRating({
                                                                        orderId: order.id,
                                                                        customerId: order.customerId,
                                                                        processServerId: ps.id,
                                                                        ratingValue: star,
                                                                        reviewText: "Great service!" // Placeholder
                                                                    }, sessionStorage.getItem('token')!)
                                                                        .then(() => alert('Rating submitted!'))
                                                                        .catch(err => alert('Failed to submit rating'))
                                                                }
                                                            }}
                                                            className="text-2xl hover:scale-110 transition"
                                                        >
                                                            ⭐
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <p className="text-xs text-gray-400">Click a star to rate each server</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
