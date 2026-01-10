'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import {
    Edit, Lock, X, MessageCircle, Eye, ArrowLeft, Calendar, Clock,
    FileText, MapPin, DollarSign, User, Package, CheckCircle,
    AlertCircle, TrendingUp, Zap, Building, Phone, Mail, Save, XCircle
} from 'lucide-react'
import ChatWindow from '@/components/chat/ChatWindow'
import OrderHistory from '@/components/orders/OrderHistory'
import EditRecipientModal from '@/components/orders/EditRecipientModal'
import EditDocumentModal from '@/components/orders/EditDocumentModal'

export default function OrderDetails() {
    const router = useRouter()
    const params = useParams()
    const [order, setOrder] = useState<any>(null)
    const [bids, setBids] = useState<any[]>([])
    const [processServers, setProcessServers] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [editability, setEditability] = useState<any>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelNotes, setCancelNotes] = useState('')
    const [showChat, setShowChat] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [editingRecipient, setEditingRecipient] = useState<any>(null)
    const [editingDocument, setEditingDocument] = useState(false)
    const [showAcceptBidModal, setShowAcceptBidModal] = useState(false)
    const [selectedBid, setSelectedBid] = useState<any>(null)
    const [acceptingBid, setAcceptingBid] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<string>(Date.now().toString())

    useEffect(() => {
        loadOrderDetails()
    }, [])

    const loadOrderDetails = async () => {
        try {
            const token = sessionStorage.getItem('token')

            // Load order details with recipients
            const orderData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())

            setOrder(orderData)

            // Load bids if order has recipients with BIDDING status
            const hasBiddingRecipients = orderData.recipients?.some((d: any) =>
                d.status === 'BIDDING' || d.status === 'OPEN'
            );
            if (orderData.status === 'BIDDING' || orderData.status === 'PARTIALLY_ASSIGNED' || hasBiddingRecipients) {
                const bidsData = await api.getOrderBids(params.id as string, token!)
                setBids(bidsData.sort((a: any, b: any) => a.bidAmount - b.bidAmount))
            }

            // Load process server details if order is ASSIGNED, IN_PROGRESS, or COMPLETED
            if (['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(orderData.status)) {
                if (orderData.recipients) {
                    const uniqueServerIds = Array.from(new Set(
                        orderData.recipients
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

            // Requirement 8: Check if order is editable
            try {
                const editabilityData = await api.checkOrderEditability(params.id as string, token!)
                setEditability(editabilityData)
            } catch (error) {
                console.error('Failed to check editability:', error)
            }

            // Update timestamp to trigger activity log refresh
            setLastUpdated(Date.now().toString())
        } catch (error) {
            console.error('Failed to load order details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptBid = async (bid: any) => {
        setSelectedBid(bid)
        setShowAcceptBidModal(true)
    }

    const confirmAcceptBid = async () => {
        if (!selectedBid) return

        setAcceptingBid(true)
        try {
            const token = sessionStorage.getItem('token')
            await api.acceptBid(selectedBid.id, token!)
            setShowAcceptBidModal(false)
            setAcceptingBid(false)
            setSelectedBid(null)
            setShowSuccessModal(true)
            // Reload order details to show updated status
            await loadOrderDetails()
            // Auto-hide success modal after 3 seconds
            setTimeout(() => {
                setShowSuccessModal(false)
            }, 3000)
        } catch (error) {
            alert('Failed to accept bid')
            setAcceptingBid(false)
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
        // Calculate from recipients as source of truth
        if (order.recipients && order.recipients.length > 0) {
            const total = order.recipients.reduce((sum: number, recipient: any) => {
                const isAutomatedPending = recipient.recipientType === 'AUTOMATED' &&
                    (recipient.status === 'OPEN' || recipient.status === 'BIDDING');

                if (isAutomatedPending) {
                    // For AUTOMATED pending orders, show estimated fees
                    const rushFee = recipient.rushService ? 50 : 0;
                    const remoteFee = recipient.remoteLocation ? 30 : 0;
                    return sum + rushFee + remoteFee;
                } else {
                    // For assigned/completed, use actual finalAgreedPrice
                    const recipientTotal = parseFloat(recipient.finalAgreedPrice) || 0;
                    return sum + recipientTotal;
                }
            }, 0)
            return total > 0 ? total : null
        }

        // Fallback to order-level prices
        return order.finalAgreedPrice || order.customerPaymentAmount || null
    }

    // Requirement 8: Cancel order handler
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a cancellation reason')
            return
        }

        setCancelling(true)
        try {
            const token = sessionStorage.getItem('token')
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}')

            await api.cancelOrder(
                params.id as string,
                {
                    cancellationReason: cancelReason,
                    additionalNotes: cancelNotes
                },
                token!,
                userData.userId
            )

            alert('Order cancelled successfully')
            setShowCancelModal(false)
            await loadOrderDetails() // Reload order
        } catch (error: any) {
            alert(error.message || 'Failed to cancel order')
        } finally {
            setCancelling(false)
        }
    }

    const getBidsForRecipient = (recipientId: string) => {
        return bids
            .filter((bid: any) => bid.orderRecipientId === recipientId)
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
                    <div className="flex items-center gap-3">
                        {/* 3. Removed global Edit Button */}

                        {/* Requirement 9: Chat Button */}
                        <button
                            onClick={() => setShowChat(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium transition-colors relative"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Cancel Button (for editable orders) */}
                        {editability?.canEdit && order.status !== 'CANCELLED' && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors border border-red-500/30"
                            >
                                <X className="w-4 h-4" />
                                Cancel Order
                            </button>
                        )}

                        {/* Lock Indicator */}
                        {editability && !editability.canEdit && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500/10 text-gray-500 border border-gray-500/30">
                                <Lock className="w-4 h-4" />
                                <span className="text-sm font-medium">{editability.lockReason}</span>
                            </div>
                        )}

                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-4">Order Information</h2>
                            <div className="space-y-3">
                                {order.pickupAddress && (
                                    <div>
                                        <p className="text-sm text-gray-400">Pickup Address</p>
                                        <p className="text-lg">{order.pickupAddress}</p>
                                        <p className="text-sm text-gray-400">ZIP: {order.pickupZipCode}</p>
                                    </div>
                                )}
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
                                    <p className="text-sm text-gray-400">Total Recipients</p>
                                    <p className="text-lg">{order.totalRecipients}</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Information */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Document Information</h2>
                                {editability?.canEdit && (
                                    <button
                                        onClick={() => router.push(`/orders/${params.id}/edit-document`)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">Document Type</p>
                                    <p className="text-lg font-medium">
                                        {order.documentType === 'OTHER' ? order.otherDocumentType : order.documentType?.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Case Number</p>
                                    <p className="text-lg font-medium">{order.caseNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Jurisdiction</p>
                                    <p className="text-lg font-medium">{order.jurisdiction || 'N/A'}</p>
                                </div>
                                {order.documentUrl && (
                                    <div className="md:col-span-2 pt-2">
                                        <p className="text-sm text-gray-400 mb-2">Uploaded Document</p>
                                        <button
                                            onClick={() => {
                                                const token = sessionStorage.getItem('token');
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
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download Document
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recipients */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Recipient Locations</h2>
                                {editability?.canEdit && (
                                    <button
                                        onClick={() => router.push(`/orders/${params.id}/edit-recipients`)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4">
                                {order.recipients?.map((recipient: any, index: number) => (
                                    <div key={recipient.id} className="glass rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold">Recipient {index + 1}: {recipient.recipientName}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{recipient.recipientAddress}</p>
                                                <p className="text-sm text-gray-400">ZIP: {recipient.recipientZipCode}</p>

                                                {/* Badges for Rush and Remote */}
                                                <div className="flex gap-2 mt-2">
                                                    {recipient.rushService && (
                                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                                            ⚡ Rush Service
                                                        </span>
                                                    )}
                                                    {recipient.remoteLocation && (
                                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                            🏝️ Remote Location
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(recipient.status)}`}>
                                                    {recipient.status}
                                                </span>

                                                {/* Independent Recipient Editing */}
                                                {recipient.canEdit && (
                                                    <button
                                                        onClick={() => setEditingRecipient(recipient)}
                                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                        title="Edit Recipient"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {
                                            recipient.finalAgreedPrice && (
                                                <p className="text-sm mt-2">
                                                    Price: <span className="font-semibold text-primary">
                                                        ${parseFloat(recipient.finalAgreedPrice).toFixed(2)}
                                                    </span>
                                                </p>
                                            )
                                        }

                                        {/* Show assigned process server */}
                                        {
                                            ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(order.status) && recipient.assignedProcessServerId && processServers[recipient.assignedProcessServerId] && (
                                                <div className="mt-3 pt-3 border-t border-white/10">
                                                    <p className="text-sm text-gray-400">Assigned to</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                            {(processServers[recipient.assignedProcessServerId].firstName?.[0] || '?')}{(processServers[recipient.assignedProcessServerId].lastName?.[0] || '?')}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">
                                                                {processServers[recipient.assignedProcessServerId].firstName || 'Unknown'} {processServers[recipient.assignedProcessServerId].lastName || 'User'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {processServers[recipient.assignedProcessServerId].successfulDeliveries > 0
                                                                    ? `${processServers[recipient.assignedProcessServerId].successfulDeliveries} Completed Orders`
                                                                    : 'New Process Server'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        {/* Show bids for BIDDING status recipients */}
                                        {
                                            (recipient.status === 'BIDDING' || recipient.status === 'OPEN') && (() => {
                                                const recipientBids = getBidsForRecipient(recipient.id)
                                                return recipientBids.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4 className="font-semibold text-sm mb-2">
                                                            Bids for this location ({recipientBids.length})
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {recipientBids.map((bid: any) => (
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
                                                                            onClick={() => handleAcceptBid(bid)}
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
                                            })()
                                        }

                                        {/* Show delivery attempts for completed/in-progress recipients */}
                                        {
                                            recipient.attempts && recipient.attempts.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    <h4 className="font-semibold text-sm">Delivery Attempts</h4>
                                                    {recipient.attempts
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
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Service Options */}
                        {order.recipients && order.recipients.length > 0 && (
                            <div className="card">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">Service Options</h2>
                                    {editability?.canEdit && (
                                        <button
                                            onClick={() => router.push(`/orders/${params.id}/edit-service`)}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span className="text-sm font-medium">Edit</span>
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-400">Service Type</p>
                                        <p className="text-lg font-medium">
                                            {order.recipients[0].serviceType?.replace(/_/g, ' ') ||
                                                (order.recipients[0].processService ? 'Process Service' :
                                                    order.recipients[0].certifiedMail ? 'Certified Mail' : 'N/A')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Rush Service</p>
                                        <p className="text-lg font-medium">
                                            {order.recipients[0].rushService ? '⚡ Yes' : 'No'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Remote Location</p>
                                        <p className="text-lg font-medium">
                                            {order.recipients[0].remoteLocation ? '🏝️ Yes' : 'No'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Summary */}
                        {(() => {
                            const totalPrice = calculateTotalPrice(order)
                            return totalPrice && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
                                    <div className="space-y-3">
                                        {order.recipients && order.recipients.map((recipient: any, idx: number) => {
                                            // For AUTOMATED recipients that haven't been assigned yet, show estimated fees
                                            // For assigned recipients, show actual values from database
                                            const isAutomatedPending = recipient.recipientType === 'AUTOMATED' &&
                                                (recipient.status === 'OPEN' || recipient.status === 'BIDDING');

                                            let rushFee = parseFloat(recipient.rushServiceFee) || 0;
                                            let remoteFee = parseFloat(recipient.remoteLocationFee) || 0;
                                            let basePrice = 0;

                                            // If AUTOMATED and pending, calculate from bids or estimate
                                            if (isAutomatedPending) {
                                                rushFee = recipient.rushService ? 50 : 0;
                                                remoteFee = recipient.remoteLocation ? 30 : 0;

                                                // Check if there's an ACCEPTED bid for this recipient (not pending!)
                                                const recipientBids = bids.filter((b: any) => b.orderRecipientId === recipient.id);
                                                const acceptedBid = recipientBids.find((b: any) => b.status === 'ACCEPTED');

                                                if (acceptedBid) {
                                                    // Only show actual amount if bid is ACCEPTED
                                                    basePrice = parseFloat(acceptedBid.bidAmount) || 0;
                                                } else {
                                                    // Don't show pending bid amounts - show as "Pending"
                                                    basePrice = 0; // Will be displayed as "Pending bids"
                                                }
                                            } else {
                                                basePrice = parseFloat(recipient.finalAgreedPrice) || 0;
                                                basePrice = basePrice - rushFee - remoteFee;
                                            }

                                            // Calculate total
                                            const estimatedTotal = basePrice + rushFee + remoteFee;
                                            const hasPendingBids = isAutomatedPending && basePrice === 0;

                                            return (
                                                <div key={recipient.id} className="text-sm py-2 border-b border-gray-700 last:border-0">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-medium text-gray-300">
                                                            Recipient {idx + 1}
                                                            {hasPendingBids && <span className="text-xs text-yellow-500 ml-2 italic">(pending bids)</span>}
                                                        </span>
                                                        <span className="font-medium">
                                                            {hasPendingBids ? 'Pending' : `$${estimatedTotal.toFixed(2)}`}
                                                        </span>
                                                    </div>
                                                    {!hasPendingBids && (
                                                        <div className="text-xs text-gray-500 space-y-1">
                                                            <div className="flex justify-between">
                                                                <span>Base Price</span>
                                                                <span>${basePrice.toFixed(2)}</span>
                                                            </div>
                                                            {rushFee > 0 && (
                                                                <div className="flex justify-between text-blue-400">
                                                                    <span>Rush Service</span>
                                                                    <span>+${rushFee.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            {remoteFee > 0 && (
                                                                <div className="flex justify-between text-purple-400">
                                                                    <span>Remote Location</span>
                                                                    <span>+${remoteFee.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        <div className="pt-2 mt-2 border-t border-gray-600 flex justify-between items-center">
                                            <span className="text-gray-300 font-bold">Total Amount</span>
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
                                                    {order.recipients
                                                        .filter((d: any) => d.assignedProcessServerId === ps.id)
                                                        .reduce((sum: number, d: any) => sum + (d.attempts?.length || 0), 0)}
                                                </p>
                                            </div>
                                            {/* Show assigned recipients */}
                                            <div className="pt-2 border-t border-white/10">
                                                <p className="text-xs text-gray-400 mb-1">Assigned Recipients</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {order.recipients
                                                        .map((d: any, idx: number) => ({ ...d, index: idx + 1 }))
                                                        .filter((d: any) => d.assignedProcessServerId === ps.id)
                                                        .map((d: any) => (
                                                            <span key={d.id} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                                                Recipient {d.index}
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

                        {/* Activity Log */}
                        {order && (
                            <OrderHistory orderId={order.id} lastUpdated={lastUpdated} />
                        )}
                    </div>
                </div>
            </div>

            {/* Requirement 8: Cancel Order Modal */}
            {
                showCancelModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white">Cancel Order</h3>
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false)
                                        setCancelReason('')
                                        setCancelNotes('')
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">
                                        Cancellation Reason *
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                        rows={3}
                                        placeholder="Please provide a reason for cancellation"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">
                                        Additional Notes (optional)
                                    </label>
                                    <textarea
                                        value={cancelNotes}
                                        onChange={(e) => setCancelNotes(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                        rows={2}
                                        placeholder="Any additional information"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowCancelModal(false)
                                            setCancelReason('')
                                            setCancelNotes('')
                                        }}
                                        className="flex-1 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
                                        disabled={cancelling}
                                    >
                                        Keep Order
                                    </button>
                                    <button
                                        onClick={handleCancelOrder}
                                        className="flex-1 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={cancelling || !cancelReason.trim()}
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Requirement 9: Chat Window */}
            {
                showChat && (
                    <ChatWindow
                        orderId={params.id as string}
                        onClose={() => setShowChat(false)}
                    />
                )
            }


            {/* Edit Recipient Modal */}
            {editingRecipient && (
                <EditRecipientModal
                    recipient={editingRecipient}
                    order={order}
                    onClose={() => setEditingRecipient(null)}
                    onUpdate={loadOrderDetails}
                />
            )}
            {/* Edit Document Modal */}
            {editingDocument && (
                <EditDocumentModal
                    order={order}
                    onClose={() => setEditingDocument(false)}
                    onUpdate={loadOrderDetails}
                />
            )}

            {/* Accept Bid Modal */}
            {showAcceptBidModal && selectedBid && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-primary/20 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Accept This Bid?</h3>
                            <p className="text-gray-400 text-sm">The process server will be assigned to this recipient</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400 text-sm">Bid Amount</span>
                                <span className="text-3xl font-bold text-primary">${selectedBid.bidAmount.toFixed(2)}</span>
                            </div>
                            {selectedBid.comment && (
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">Process Server Note</p>
                                    <p className="text-sm text-gray-200 italic">"{selectedBid.comment}"</p>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-gray-400 mb-2">Total with fees</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">Base Price</span>
                                        <span className="text-white">${selectedBid.bidAmount.toFixed(2)}</span>
                                    </div>
                                    {(() => {
                                        const recipient = order?.recipients?.find((d: any) =>
                                            bids.some((b: any) => b.id === selectedBid.id && b.orderRecipientId === d.id)
                                        );
                                        const rushFee = recipient?.rushService ? 50 : 0;
                                        const remoteFee = recipient?.remoteLocation ? 30 : 0;
                                        const total = selectedBid.bidAmount + rushFee + remoteFee;

                                        return (
                                            <>
                                                {rushFee > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-blue-400">Rush Service</span>
                                                        <span className="text-blue-400">+${rushFee.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {remoteFee > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-purple-400">Remote Location</span>
                                                        <span className="text-purple-400">+${remoteFee.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-base font-bold border-t border-white/10 pt-2 mt-2">
                                                    <span className="text-white">Total</span>
                                                    <span className="text-primary">${total.toFixed(2)}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAcceptBidModal(false)
                                    setSelectedBid(null)
                                }}
                                className="flex-1 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                                disabled={acceptingBid}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAcceptBid}
                                className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                disabled={acceptingBid}
                            >
                                {acceptingBid ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Accepting...
                                    </span>
                                ) : (
                                    'Accept Bid'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-br from-green-900/95 via-gray-900/95 to-gray-800/95 rounded-2xl p-8 max-w-md w-full border border-green-500/30 shadow-2xl shadow-green-500/20 transform animate-in zoom-in duration-300">
                        <div className="text-center">
                            {/* Animated Success Icon */}
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                                <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                                    <svg className="w-12 h-12 text-white animate-in zoom-in duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Success Message */}
                            <h3 className="text-3xl font-bold text-white mb-3 animate-in slide-in-from-bottom duration-500">
                                Bid Accepted!
                            </h3>
                            <p className="text-lg text-gray-300 mb-6 animate-in slide-in-from-bottom duration-500 delay-100">
                                Process server has been assigned.
                            </p>

                            {/* Decorative Elements */}
                            <div className="flex justify-center gap-2 mb-6">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
