'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function OrderDetails({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [bids, setBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [bidAmount, setBidAmount] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [selectedDropoff, setSelectedDropoff] = useState<any>(null)
    const [attemptNotes, setAttemptNotes] = useState('')
    const [recordingAttempt, setRecordingAttempt] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        loadOrderDetails(params.id, token)
    }, [params.id, router])

    const loadOrderDetails = async (orderId: string, token: string) => {
        try {
            const [orderData, bidsData] = await Promise.all([
                api.getOrderById(orderId, token),
                api.getOrderBids(orderId, token)
            ])

            // If customer name is unknown, try to fetch it
            if (orderData.customerName === 'Unknown Customer' || !orderData.customerName) {
                try {
                    let customer;
                    if (orderData.customerId.startsWith('tur-')) {
                        customer = await api.getCustomerByTenantUserRoleId(orderData.customerId)
                    } else {
                        customer = await api.getUser(orderData.customerId)
                    }

                    if (customer) {
                        orderData.customerName = `${customer.firstName} ${customer.lastName}`
                    }
                } catch (err) {
                    console.error('Failed to fetch customer details:', err)
                }
            }

            setOrder(orderData)
            setBids(bidsData)
        } catch (error) {
            console.error('Failed to load order details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bidAmount || !user || !order) return

        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')

            // Get process server profile ID from user object (stored during login)
            const processServerId = user.processServerProfileId || user.userId

            // Find the first available dropoff (OPEN or BIDDING status)
            const availableDropoff = order.dropoffs?.find((d: any) =>
                d.status === 'OPEN' || d.status === 'BIDDING' || d.status === 'PENDING'
            )

            if (!availableDropoff) {
                alert('No available dropoffs to bid on')
                return
            }

            const bidData = {
                orderDropoffId: availableDropoff.id,
                processServerId: processServerId,
                bidAmount: parseFloat(bidAmount),
            }

            await api.placeBid(bidData, token!)
            alert('Bid placed successfully!')
            // Reload order to show updated bid
            loadOrderDetails(params.id, token!)
            setBidAmount('')
        } catch (error) {
            console.error('Failed to place bid:', error)
            alert(error instanceof Error ? error.message : 'Failed to place bid. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRecordAttempt = async (wasSuccessful: boolean) => {
        if (!selectedDropoff || !user) return

        setRecordingAttempt(true)
        try {
            const token = localStorage.getItem('token')

            // Get process server profile ID from user object (stored during login)
            const processServerId = user.processServerProfileId || user.userId

            // Get GPS coordinates (mock for now - in real app would use navigator.geolocation)
            const attemptData = {
                dropoffId: selectedDropoff.id,
                processServerId: processServerId,
                wasSuccessful,
                outcomeNotes: attemptNotes || (wasSuccessful ? 'Delivered successfully' : 'Delivery failed'),
                gpsLatitude: 40.7128, // Mock GPS - NYC
                gpsLongitude: -74.0060,
                photoProofUrl: null // Would upload photo in real implementation
            }

            await api.recordDeliveryAttempt(attemptData, token!)
            alert(wasSuccessful ? 'Delivery marked as successful!' : 'Attempt recorded.')

            // Reload order details
            loadOrderDetails(params.id, token!)
            setSelectedDropoff(null)
            setAttemptNotes('')
        } catch (error) {
            console.error('Failed to record attempt:', error)
            alert('Failed to record delivery attempt. Please try again.')
        } finally {
            setRecordingAttempt(false)
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
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="card text-center">
                    <p className="text-xl text-gray-400">Order not found</p>
                    <button onClick={() => router.push('/orders')} className="btn-primary mt-4">
                        Back to Available Orders
                    </button>
                </div>
            </div>
        )
    }

    const isMyOrder = order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED'

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
                        <p className="text-sm text-gray-300 font-medium mt-1">Customer: {order.customerName}</p>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pickup Information Removed as per request */}

                        {/* Order Information */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-primary">📄</span> Document Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">Document Type</p>
                                    <p className="font-medium">
                                        {order.documentType === 'OTHER' ? order.otherDocumentType : order.documentType?.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Case Number</p>
                                    <p className="font-medium">{order.caseNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Jurisdiction</p>
                                    <p className="font-medium">{order.jurisdiction || 'N/A'}</p>
                                </div>
                                {order.documentUrl && (
                                    <div className="md:col-span-2 pt-2">
                                        <p className="text-sm text-gray-400 mb-2">Uploaded Document</p>
                                        <button
                                            onClick={() => {
                                                const token = localStorage.getItem('token');
                                                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/document`, {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                })
                                                    .then(response => response.blob())
                                                    .then(blob => {
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = order.documentUrl; // Use actual filename with original extension
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                        document.body.removeChild(a);
                                                    })
                                                    .catch(err => alert('Failed to download document'));
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors font-semibold"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Document
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dropoff Information with Delivery Actions */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-primary">📍</span> Dropoff Locations ({order.totalDropoffs})
                            </h2>
                            <div className="space-y-4">
                                {order.dropoffs && order.dropoffs.map((dropoff: any, index: number) => (
                                    <div key={dropoff.id} className={`glass rounded-lg p-4 ${dropoff.status === 'DELIVERED' ? 'border-2 border-green-500/50' :
                                        dropoff.status === 'FAILED' ? 'border-2 border-red-500/50' : ''
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold">Dropoff #{dropoff.sequenceNumber}</h3>
                                            <span className={`text-xs px-2 py-1 rounded ${dropoff.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                                                dropoff.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                                    dropoff.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {dropoff.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div>
                                                <p className="text-gray-400">Recipient</p>
                                                <p className="font-medium">{dropoff.recipientName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Address</p>
                                                <p className="font-medium">{dropoff.dropoffAddress}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">ZIP Code</p>
                                                <p className="font-medium text-primary">{dropoff.dropoffZipCode}</p>
                                            </div>

                                            {/* Badges for Rush and Remote */}
                                            <div className="flex gap-2 mt-2">
                                                {dropoff.rushService && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                                        ⚡ Rush Service
                                                    </span>
                                                )}
                                                {dropoff.remoteLocation && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                        🏝️ Remote Location
                                                    </span>
                                                )}
                                            </div>

                                            {dropoff.attemptCount > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-gray-400">Attempts</p>
                                                    <p className="font-medium">{dropoff.attemptCount} / {dropoff.maxAttempts}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Delivery Action Buttons for Assigned Orders */}
                                        {isMyOrder && dropoff.status !== 'DELIVERED' && dropoff.status !== 'FAILED' && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                {selectedDropoff?.id === dropoff.id ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={attemptNotes}
                                                            onChange={(e) => setAttemptNotes(e.target.value)}
                                                            placeholder="Delivery notes (optional)"
                                                            className="w-full px-3 py-2 rounded-lg glass text-sm"
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRecordAttempt(true)}
                                                                disabled={recordingAttempt}
                                                                className="flex-1 bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                                            >
                                                                ✓ Mark Delivered
                                                            </button>
                                                            <button
                                                                onClick={() => handleRecordAttempt(false)}
                                                                disabled={recordingAttempt}
                                                                className="flex-1 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                                            >
                                                                ✗ Failed Attempt
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedDropoff(null)}
                                                                className="px-3 py-2 rounded-lg glass text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setSelectedDropoff(dropoff)}
                                                        className="w-full bg-primary hover:bg-primary/80 px-4 py-2 rounded-lg text-sm font-semibold"
                                                    >
                                                        Record Delivery Attempt
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Additional Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Deadline</p>
                                    <p className="font-medium">
                                        {new Date(order.deadline).toLocaleDateString()}<br />
                                        {new Date(order.deadline).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Payment Breakdown</p>
                                        <div className="space-y-1">
                                            {(() => {
                                                // Calculate the actual customer payment (base + rush + remote fees)
                                                const customerPayment = order.dropoffs?.reduce((sum: number, d: any) => {
                                                    const basePrice = parseFloat(d.finalAgreedPrice) || 0;
                                                    const rushFee = parseFloat(d.rushServiceFee) || 0;
                                                    const remoteFee = parseFloat(d.remoteLocationFee) || 0;
                                                    return sum + basePrice + rushFee + remoteFee;
                                                }, 0) || 0;

                                                const platformFee = customerPayment * 0.15;
                                                const processServerEarnings = customerPayment - platformFee;

                                                return (
                                                    <>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-300">Customer Paid:</span>
                                                            <span className="font-medium">${customerPayment.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-red-400">Platform Fee (15%):</span>
                                                            <span className="font-medium text-red-400">-${platformFee.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm border-t border-white/10 pt-1 mt-1">
                                                            <span className="text-green-400 font-bold">Your Earnings:</span>
                                                            <span className="font-bold text-green-400">${processServerEarnings.toFixed(2)}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                {order.specialInstructions && (
                                    <div className="col-span-2">
                                        <p className="text-gray-400 text-sm">Special Instructions</p>
                                        <p className="font-medium">{order.specialInstructions}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bidding Section */}
                    <div className="space-y-6">
                        {/* My Bid Status */}
                        {bids.find((b: any) => b.processServerId === (user?.processServerProfileId || user?.userId)) && (
                            <div className="card border-2 border-primary/20">
                                <h2 className="text-xl font-bold mb-4 text-primary">My Bid</h2>
                                {(() => {
                                    const myBid = bids.find((b: any) => b.processServerId === (user?.processServerProfileId || user?.userId))
                                    return (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Status</span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${myBid.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                    myBid.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {myBid.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Bid Amount</span>
                                                <span className="text-2xl font-bold text-primary">${myBid.bidAmount}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Submitted</span>
                                                <span className="text-sm">
                                                    {new Date(myBid.createdAt).toLocaleDateString()} {new Date(myBid.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            {myBid.comment && (
                                                <div className="pt-4 border-t border-white/10">
                                                    <p className="text-gray-400 text-sm mb-1">Comment</p>
                                                    <p className="text-sm italic">"{myBid.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}
                            </div>
                        )}

                        {/* Place Bid */}
                        {!isMyOrder && !bids.find((b: any) => b.processServerId === (user?.processServerProfileId || user?.userId)) && (order.status === 'OPEN' || order.status === 'BIDDING') && (
                            <div className="card">
                                <h2 className="text-xl font-bold mb-4">Place Your Bid</h2>
                                <form onSubmit={handlePlaceBid} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Bid Amount ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Enter your bid"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary w-full disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Bid'}
                                    </button>
                                </form>
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    )
}
