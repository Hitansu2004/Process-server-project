'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import {
    ArrowLeft, MessageCircle, X, Edit, Download, FileText,
    Calendar, Clock, MapPin, DollarSign, User, Package,
    CheckCircle, AlertCircle, TrendingUp, Zap, Building,
    Phone, Mail, Save, XCircle, Eye, Lock, Shield, Star
} from 'lucide-react'
import ChatWindow from '@/components/chat/ChatWindow'
import OrderHistory from '@/components/orders/OrderHistory'
import EditRecipientModal from '@/components/orders/EditRecipientModal'

export default function OrderDetailsNew() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
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
    const [showAcceptBidModal, setShowAcceptBidModal] = useState(false)
    const [selectedBid, setSelectedBid] = useState<any>(null)
    const [acceptingBid, setAcceptingBid] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<string>(Date.now().toString())
    
    // For accepting bids and counter-offers on GUIDED recipients
    const [actionLoading, setActionLoading] = useState(false)
    const [showCounterModal, setShowCounterModal] = useState<string | null>(null) // bidId when countering
    const [counterAmount, setCounterAmount] = useState('')
    const [counterNotes, setCounterNotes] = useState('')

    useEffect(() => {
        loadOrderDetails()
    }, [])

    // Reload data when returning from edit (timestamp changes)
    useEffect(() => {
        const timestamp = searchParams.get('t')
        if (timestamp && order) {
            console.log('Reloading order details after edit...')
            loadOrderDetails()
        }
    }, [searchParams])

    const loadOrderDetails = async () => {
        try {
            const token = sessionStorage.getItem('token')
            const orderData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())

            setOrder(orderData)

            // Load bids for all orders (including GUIDED recipient price proposals)
            const hasBiddingRecipients = orderData.recipients?.some((d: any) =>
                d.status === 'BIDDING' || d.status === 'OPEN'
            )
            const hasAssignedRecipients = orderData.recipients?.some((d: any) =>
                d.status === 'ASSIGNED' || d.status === 'IN_PROGRESS'
            )
            
            if (orderData.status === 'BIDDING' || orderData.status === 'PARTIALLY_ASSIGNED' || 
                orderData.status === 'ASSIGNED' || orderData.status === 'IN_PROGRESS' ||
                hasBiddingRecipients || hasAssignedRecipients) {
                try {
                    const bidsData = await api.getOrderBids(params.id as string, token!)
                    setBids(bidsData.sort((a: any, b: any) => a.bidAmount - b.bidAmount))
                } catch (error) {
                    console.error('Failed to load bids:', error)
                }
            }

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

            try {
                const editabilityData = await api.checkOrderEditability(params.id as string, token!)
                setEditability(editabilityData)
            } catch (error) {
                console.error('Failed to check editability:', error)
            }

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
            await loadOrderDetails()
            setTimeout(() => setShowSuccessModal(false), 3000)
        } catch (error) {
            alert('Failed to accept bid')
            setAcceptingBid(false)
        }
    }

    const handleCancelOrder = async () => {
        if (!cancelReason) {
            alert('Please select a cancellation reason')
            return
        }
        setCancelling(true)
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.roles?.[0]?.id || user.userId
            await api.cancelOrder(params.id as string, {
                cancellationReason: cancelReason,
                additionalNotes: cancelNotes
            }, token!, userId)
            setShowCancelModal(false)
            await loadOrderDetails()
        } catch (error) {
            console.error('Cancel order error:', error)
            alert('Failed to cancel order')
        } finally {
            setCancelling(false)
        }
    }
    
    // Accept bid handler for GUIDED recipient price proposals
    const handleAcceptGuidedBid = async (bid: any) => {
        if (!confirm(`Accept this price proposal of $${bid.bidAmount.toFixed(2)}?`)) return
        
        setActionLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            await api.acceptBid(bid.id, token!)
            
            alert('Price accepted! Order has been updated.')
            await loadOrderDetails()
        } catch (error) {
            console.error('Failed to accept:', error)
            alert('Failed to accept proposal. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    // Customer counter-offers
    const handleCounterOffer = async (bidId: string) => {
        if (!counterAmount || parseFloat(counterAmount) <= 0) {
            alert('Please enter a valid counter-offer amount')
            return
        }
        
        setActionLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            await api.counterOfferBid(bidId, parseFloat(counterAmount), counterNotes, token!)
            
            alert('Counter-offer submitted successfully!')
            setShowCounterModal(null)
            setCounterAmount('')
            setCounterNotes('')
            
            await loadOrderDetails()
        } catch (error) {
            console.error('Failed to submit counter-offer:', error)
            alert('Failed to submit counter-offer. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        }).format(amount || 0)
    }

    const calculateTotalPrice = (order: any): number => {
        if (order.recipients && order.recipients.length > 0) {
            const subtotal = order.recipients.reduce((sum: number, recipient: any) => {
                const isAutomatedPending = recipient.recipientType === 'AUTOMATED' &&
                    (recipient.status === 'OPEN' || recipient.status === 'BIDDING')

                const isDirectStandard = recipient.recipientType === 'GUIDED' && !recipient.quotedPrice && !recipient.negotiatedPrice

                if (isAutomatedPending || isDirectStandard) {
                    let recipientTotal = 0
                    if (recipient.processService) recipientTotal += 75
                    if (recipient.certifiedMail) recipientTotal += 25
                    if (recipient.rushService) recipientTotal += 50
                    if (recipient.remoteLocation) recipientTotal += 40
                    return sum + recipientTotal
                } else {
                    return sum + (parseFloat(recipient.finalAgreedPrice) || 0)
                }
            }, 0)

            // Add 3% processing fee
            return subtotal + (subtotal * 0.03)
        }
        return order.customerPaymentAmount || 0
    }

    const getBidsForRecipient = (recipientId: string) => {
        return bids.filter((b: any) => b.orderRecipientId === recipientId)
            .sort((a: any, b: any) => a.bidAmount - b.bidAmount)
    }

    const getStatusConfig = (status: string) => {
        const configs: any = {
            'OPEN': {
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                icon: <Clock className="w-5 h-5" />
            },
            'BIDDING': {
                color: 'from-yellow-500 to-orange-500',
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                icon: <TrendingUp className="w-5 h-5" />
            },
            'ASSIGNED': {
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                icon: <User className="w-5 h-5" />
            },
            'PARTIALLY_ASSIGNED': {
                color: 'from-indigo-500 to-purple-500',
                bg: 'bg-indigo-50',
                text: 'text-indigo-700',
                icon: <Package className="w-5 h-5" />
            },
            'IN_PROGRESS': {
                color: 'from-blue-600 to-indigo-600',
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                icon: <Package className="w-5 h-5" />
            },
            'COMPLETED': {
                color: 'from-green-500 to-green-600',
                bg: 'bg-green-50',
                text: 'text-green-700',
                icon: <CheckCircle className="w-5 h-5" />
            },
            'FAILED': {
                color: 'from-red-500 to-red-600',
                bg: 'bg-red-50',
                text: 'text-red-700',
                icon: <XCircle className="w-5 h-5" />
            },
            'CANCELLED': {
                color: 'from-gray-400 to-gray-500',
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                icon: <XCircle className="w-5 h-5" />
            }
        }
        return configs[status] || configs['OPEN']
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Loading order details...</p>
                </motion.div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-700 mb-6">Order not found</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
                    >
                        Go Back
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    const statusConfig = getStatusConfig(order.status)
    const totalPrice = calculateTotalPrice(order)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/orders')}
                            className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-700"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </motion.button>
                        <div className="flex-1">
                            <div className="flex items-center gap-4 flex-wrap">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {order.customName || order.orderNumber}
                                </h1>
                                {order.customName && (
                                    <span className="text-lg text-gray-500 font-medium">
                                        ({order.orderNumber})
                                    </span>
                                )}
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.text} font-semibold`}>
                                    {statusConfig.icon}
                                    <span>{order.status.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Created {formatDate(order.createdAt)}</span>
                                </div>
                                {order.deadline && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Due {formatDate(order.deadline)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowChat(true)}
                            className="relative flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-700 font-medium"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Chat
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </motion.button>

                        {editability?.canEdit && order.status !== 'CANCELLED' && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCancelModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-red-600 font-medium border-2 border-red-200 hover:border-red-300"
                            >
                                <X className="w-5 h-5" />
                                Cancel Order
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Document Information Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Document Information</h2>
                                </div>
                                {editability?.canEdit && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/orders/${params.id}/edit-document`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </motion.button>
                                )}
                            </div>

                            {/* Single Box Layout - Like Recipients */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-all">
                                <div className="space-y-4">
                                    {/* Document Type */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Document Type</p>
                                        <p className="text-base font-semibold text-gray-800">
                                            {order.documentType === 'OTHER' ? order.otherDocumentType : order.documentType?.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                    
                                    {/* Case Number */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Case Number</p>
                                        <p className="text-base font-semibold text-gray-800">{order.caseNumber || 'N/A'}</p>
                                    </div>
                                    
                                    {/* Jurisdiction */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Jurisdiction</p>
                                        <p className="text-base font-semibold text-gray-800">{order.jurisdiction || 'N/A'}</p>
                                    </div>
                                    
                                    {/* Initiator/Filed By Information */}
                                    {order.initiatorType && (
                                        <>
                                            {/* Filed By Section Header */}
                                            <div className="pt-4 border-t-2 border-gray-200">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800">Filed By</h3>
                                                </div>
                                            </div>
                                            
                                            {/* Who are you */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">Who are you</p>
                                                <p className="text-base font-semibold text-gray-800">
                                                    {order.initiatorType === 'SELF_REPRESENTED' ? 'Self-Represented' :
                                                     order.initiatorType === 'ATTORNEY' ? 'Attorney' :
                                                     order.initiatorType === 'LAW_FIRM' ? 'Law Firm' :
                                                     order.initiatorType === 'OTHER' ? 'Other' : order.initiatorType?.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                            
                                            {/* Name */}
                                            {(order.initiatorFirstName || order.initiatorLastName) && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {[order.initiatorFirstName, order.initiatorMiddleName, order.initiatorLastName].filter(Boolean).join(' ')}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Phone */}
                                            {order.initiatorPhone && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                                                    <p className="text-base font-semibold text-gray-800 flex items-center">
                                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                        {order.initiatorPhone}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Address */}
                                            {order.initiatorAddress && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                                                    <p className="text-base font-semibold text-gray-800 flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                        {[order.initiatorAddress, order.initiatorCity, order.initiatorState, order.initiatorZipCode].filter(Boolean).join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    
                                    {/* Special Instructions */}
                                    {order.specialInstructions && (
                                        <div className="pt-4 border-t-2 border-gray-200">
                                            <p className="text-xs font-medium text-gray-500 mb-1">Special Instructions</p>
                                            <p className="text-base font-semibold text-gray-800">{order.specialInstructions}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Documents List - Outside the single box */}
                            {order.documents && order.documents.length > 0 ? (
                                <div className="mt-6">
                                    <p className="text-sm text-gray-500 font-medium mb-3">Documents ({order.documents.length})</p>
                                    <div className="space-y-2">
                                            {order.documents.map((doc: any, index: number) => (
                                                <motion.button
                                                    key={doc.id || index}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={async () => {
                                                        try {
                                                            const token = sessionStorage.getItem('token')
                                                            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/documents/${doc.id}`, {
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            })

                                                            if (!response.ok) throw new Error('Download failed')

                                                            const blob = await response.blob()
                                                            const url = window.URL.createObjectURL(blob)
                                                            const a = document.createElement('a')
                                                            a.href = url
                                                            a.download = doc.fileName || `document-${index + 1}.pdf`
                                                            document.body.appendChild(a)
                                                            a.click()
                                                            window.URL.revokeObjectURL(url)
                                                            document.body.removeChild(a)
                                                        } catch (err) {
                                                            console.error('Download error:', err)
                                                            alert('Failed to download document. Please try again.')
                                                        }
                                                    }}
                                                    className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 rounded-xl transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                        <div className="text-left">
                                                            <p className="font-medium text-gray-800">{doc.fileName || `Document ${index + 1}`}</p>
                                                            <p className="text-xs text-gray-500">{doc.pageCount} pages • {doc.documentType || 'PDF'}</p>
                                                        </div>
                                                    </div>
                                                    <Download className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                                                </motion.button>
                                            ))}
                                        </div>
                                </div>
                            ) : order.documentUrl && (
                                <div className="mt-6">
                                    <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={async () => {
                                                try {
                                                    const token = sessionStorage.getItem('token')
                                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/document`, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    })

                                                    if (!response.ok) throw new Error('Download failed')

                                                    const blob = await response.blob()
                                                    const url = window.URL.createObjectURL(blob)
                                                    const a = document.createElement('a')
                                                    a.href = url
                                                    a.download = order.originalFileName || order.documentUrl.split('/').pop() || `order-${order.orderNumber}-document.pdf`
                                                    document.body.appendChild(a)
                                                    a.click()
                                                    window.URL.revokeObjectURL(url)
                                                    document.body.removeChild(a)
                                                } catch (err) {
                                                    console.error('Download error:', err)
                                                    alert('Failed to download document. Please try again.')
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Document
                                        </motion.button>
                                    </div>
                                )}
                        </motion.div>

                        {/* Recipients Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl text-white">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Recipients</h2>
                                        <p className="text-sm text-gray-500">{order.totalRecipients || 0} location(s)</p>
                                    </div>
                                </div>
                                {editability?.canEdit && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/orders/${params.id}/edit-recipients`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </motion.button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {order.recipients?.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((recipient: any, index: number) => (
                                    <motion.div
                                        key={recipient.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">
                                            Recipient {recipient.sequenceNumber || (index + 1)}
                                            {recipient.recipientOrderNumber && (
                                                <span className="text-sm font-normal text-gray-500 ml-2">
                                                    ({recipient.recipientOrderNumber})
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-600">{recipient.recipientName}</p>
                                        {/* Entity Type and Assignment Type Badges */}
                                        <div className="flex items-center gap-2 mt-2">
                                            {recipient.recipientEntityType && (
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                    recipient.recipientEntityType === 'ORGANIZATION' 
                                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>
                                                    {recipient.recipientEntityType === 'ORGANIZATION' ? 'Organization' : 'Individual'}
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                recipient.recipientType === 'GUIDED' 
                                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                            }`}>
                                                {recipient.recipientType === 'GUIDED' ? 'Direct Assignment' : 'Open Bidding'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-11 space-y-1">
                                    <p className="text-sm text-gray-700">{recipient.recipientAddress}</p>
                                    <p className="text-sm text-gray-600">ZIP: {recipient.recipientZipCode}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                recipient.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                recipient.status === 'ASSIGNED' || (recipient.recipientType === 'GUIDED' && recipient.assignedProcessServerId) ? 'bg-purple-100 text-purple-700' :
                                recipient.status === 'BIDDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {recipient.status === 'ASSIGNED' || (recipient.recipientType === 'GUIDED' && recipient.assignedProcessServerId) ? 'ASSIGNED' : recipient.status}
                            </span>
                        </div>                                        {/* Service Options Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {recipient.processService && (
                                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                    <Package className="w-3 h-3" />
                                                    Process Service
                                                </span>
                                            )}
                                            {recipient.certifiedMail && (
                                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                    <Mail className="w-3 h-3" />
                                                    Certified Mail
                                                </span>
                                            )}
                                            {recipient.rushService && (
                                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                    <Zap className="w-3 h-3" />
                                                    Rush Service
                                                </span>
                                            )}
                                            {recipient.remoteLocation && (
                                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                    <Building className="w-3 h-3" />
                                                    Remote Location
                                                </span>
                                            )}
                                        </div>

                                        {/* Service Options Fee - For GUIDED (Directly Assigned) Recipients Only */}
                                        {recipient.recipientType === 'GUIDED' && 
                                         (recipient.processService || recipient.certifiedMail || recipient.rushService || recipient.remoteLocation) && (() => {
                                            // Calculate total fee
                                            const totalFee = recipient.serviceOptionsFee || 
                                                ((recipient.processServiceFee || 0) +
                                                (recipient.certifiedMailFee || 0) +
                                                (recipient.rushServiceFee || 0) +
                                                (recipient.remoteServiceFee || 0));
                                            
                                            // If we have total but not individual fees, estimate equal distribution
                                            const servicesCount = [
                                                recipient.processService,
                                                recipient.certifiedMail,
                                                recipient.rushService,
                                                recipient.remoteLocation
                                            ].filter(Boolean).length;
                                            
                                            const estimatedPerService = servicesCount > 0 ? totalFee / servicesCount : 0;
                                            
                                            return (
                                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200 mb-4">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-gray-800 mb-1">Service Options Fee (Estimated)</h4>
                                                            <div className="space-y-1">
                                                                {recipient.processService && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-gray-700">• Process Service</span>
                                                                        <span className="font-semibold text-gray-800">
                                                                            ${(recipient.processServiceFee || estimatedPerService).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {recipient.certifiedMail && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-gray-700">• Certified Mail</span>
                                                                        <span className="font-semibold text-gray-800">
                                                                            ${(recipient.certifiedMailFee || estimatedPerService).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {recipient.rushService && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-gray-700">• Rush Service</span>
                                                                        <span className="font-semibold text-gray-800">
                                                                            ${(recipient.rushServiceFee || estimatedPerService).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {recipient.remoteLocation && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-gray-700">• Remote Service</span>
                                                                        <span className="font-semibold text-gray-800">
                                                                            ${(recipient.remoteServiceFee || estimatedPerService).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="border-t border-amber-300 mt-2 pt-2 flex justify-between items-center">
                                                                    <span className="text-xs font-bold text-gray-800">Total Service Options:</span>
                                                                    <span className="text-lg font-bold text-amber-600">
                                                                        ${totalFee.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-amber-700 mt-2 italic">
                                                                * Estimated price for directly assigned orders. Final price may vary based on actual delivery requirements.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* REMOVED PRICING: Price display */}

                                        {/* Price Proposals for GUIDED/directly assigned orders */}
                                        {recipient.recipientType === 'GUIDED' && 
                                         recipient.status === 'ASSIGNED' && 
                                         (() => {
                                            // Get bids for this recipient
                                            const recipientBids = bids.filter((bid: any) => 
                                                bid.orderRecipientId === recipient.id
                                            ).sort((a: any, b: any) => 
                                                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                            );

                                            const acceptedBid = recipientBids.find((bid: any) => bid.status === 'ACCEPTED');
                                            const pendingBids = recipientBids.filter((bid: any) => bid.status === 'PENDING');

                                            if (acceptedBid) {
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-300 mb-4"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                            <h4 className="text-sm font-bold text-gray-800">Price Accepted</h4>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-semibold text-gray-600">Agreed Price:</span>
                                                                <span className="text-xl font-bold text-green-600">
                                                                    ${acceptedBid.bidAmount.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2">You accepted the process server's price proposal.</p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else if (pendingBids.length > 0) {
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-300 mb-4"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <DollarSign className="w-5 h-5 text-amber-600" />
                                                            <h4 className="text-sm font-bold text-gray-800">Price Negotiation</h4>
                                                        </div>
                                                        
                                                        <div className="space-y-3">
                                                            {pendingBids.map((bid: any) => (
                                                                <div key={bid.id} className="bg-white rounded-lg p-3 border border-amber-200">
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs font-semibold text-gray-600">
                                                                                {bid.lastCounterBy === 'PROCESS_SERVER' || !bid.lastCounterBy ? 'PS Proposed:' : 'Your Counter:'}
                                                                            </span>
                                                                            <span className="text-lg font-bold text-blue-600">
                                                                                ${bid.bidAmount.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {bid.comment && bid.comment !== 'Price proposal for direct assignment' && (
                                                                            <div className="bg-blue-50 rounded p-2 border border-blue-200">
                                                                                <p className="text-xs font-semibold text-blue-700 mb-0.5">Note:</p>
                                                                                <p className="text-xs text-gray-700 italic">"{bid.comment}"</p>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Show customer's counter-offer if exists */}
                                                                        {bid.customerCounterAmount && (
                                                                            <div className="bg-purple-50 rounded p-2 border border-purple-200 mt-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs font-semibold text-purple-700">Your Counter:</span>
                                                                                    <span className="text-lg font-bold text-purple-600">
                                                                                        ${bid.customerCounterAmount.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                                {bid.customerCounterNotes && (
                                                                                    <p className="text-xs text-gray-600 mt-1 italic">"{bid.customerCounterNotes}"</p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        
                                                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                                                            <span className="text-xs font-semibold text-gray-600">Status:</span>
                                                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                                                {bid.lastCounterBy === 'CUSTOMER' && bid.customerCounterAmount 
                                                                                    ? 'Waiting for PS Response' 
                                                                                    : 'Awaiting Your Response'}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {bid.counterOfferCount > 0 && (
                                                                            <p className="text-xs text-gray-500">
                                                                                Negotiation round: {bid.counterOfferCount}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Action Buttons - Show if PS proposed or PS countered back */}
                                                                    {(bid.lastCounterBy !== 'CUSTOMER' || !bid.customerCounterAmount) && (
                                                                        <div className="mt-3 flex gap-2">
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.02 }}
                                                                                whileTap={{ scale: 0.98 }}
                                                                                onClick={() => handleAcceptGuidedBid(bid)}
                                                                                disabled={actionLoading}
                                                                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                                                                            >
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                Accept ${bid.bidAmount.toFixed(2)}
                                                                            </motion.button>
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.02 }}
                                                                                whileTap={{ scale: 0.98 }}
                                                                                onClick={() => setShowCounterModal(bid.id)}
                                                                                disabled={actionLoading}
                                                                                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                                                                            >
                                                                                <DollarSign className="w-4 h-4" />
                                                                                Counter-Offer
                                                                            </motion.button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Waiting message when customer countered */}
                                                                    {bid.lastCounterBy === 'CUSTOMER' && bid.customerCounterAmount && (
                                                                        <div className="mt-3 bg-yellow-50 rounded p-2 border border-yellow-200 flex items-center gap-2">
                                                                            <Clock className="w-4 h-4 text-yellow-600" />
                                                                            <p className="text-xs text-yellow-700">Waiting for Process Server to respond...</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                return null; // No proposals yet
                                            }
                                        })()}

                                        {/* Assigned Process Server */}
                                        {recipient.assignedProcessServerId && processServers[recipient.assignedProcessServerId] && (
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                <p className="text-xs text-gray-500 font-medium mb-2">Assigned to</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                        {(processServers[recipient.assignedProcessServerId].firstName?.[0] || '?')}
                                                        {(processServers[recipient.assignedProcessServerId].lastName?.[0] || '?')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">
                                                            {processServers[recipient.assignedProcessServerId].firstName || 'Unknown'}{' '}
                                                            {processServers[recipient.assignedProcessServerId].lastName || 'User'}
                                                        </p>
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            {processServers[recipient.assignedProcessServerId].successfulDeliveries || 0} completed orders
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Delivery Attempt History */}
                                        {recipient.attemptCount > 0 && (
                                            <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-blue-600" />
                                                        Delivery History
                                                    </h4>
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                        recipient.attemptCount >= recipient.maxAttempts 
                                                            ? 'bg-red-100 text-red-700' 
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {recipient.attemptCount} / {recipient.maxAttempts} Attempts
                                                    </span>
                                                </div>

                                                {recipient.attempts && recipient.attempts.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {recipient.attempts
                                                            .sort((a: any, b: any) => b.attemptNumber - a.attemptNumber)
                                                            .map((attempt: any) => (
                                                            <div 
                                                                key={attempt.id} 
                                                                className={`p-3 rounded-lg border-l-4 ${
                                                                    attempt.wasSuccessful 
                                                                        ? 'bg-green-50 border-green-500' 
                                                                        : 'bg-red-50 border-red-500'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                                            attempt.wasSuccessful 
                                                                                ? 'bg-green-500 text-white' 
                                                                                : 'bg-red-500 text-white'
                                                                        }`}>
                                                                            {attempt.wasSuccessful ? '✓' : '✗'}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-gray-800">
                                                                                Attempt #{attempt.attemptNumber}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {new Date(attempt.attemptTime || attempt.createdAt).toLocaleString('en-US', {
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    year: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                                        attempt.wasSuccessful 
                                                                            ? 'bg-green-500 text-white' 
                                                                            : 'bg-red-500 text-white'
                                                                    }`}>
                                                                        {attempt.wasSuccessful ? 'DELIVERED' : 'FAILED'}
                                                                    </span>
                                                                </div>
                                                                
                                                                {attempt.outcomeNotes && (
                                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                                        <p className="text-xs text-gray-500 mb-1 font-medium">Notes:</p>
                                                                        <p className="text-sm text-gray-700">{attempt.outcomeNotes}</p>
                                                                    </div>
                                                                )}
                                                                
                                                                {attempt.gpsLatitude && attempt.gpsLongitude && (
                                                                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                                        <MapPin className="w-3 h-3" />
                                                                        <span>Location: {attempt.gpsLatitude.toFixed(4)}, {attempt.gpsLongitude.toFixed(4)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">No detailed attempt history available</p>
                                                )}

                                                {recipient.deliveredAt && (
                                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <p className="text-xs text-green-700 font-medium flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Successfully delivered on {new Date(recipient.deliveredAt).toLocaleString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Bids Section */}
                                        {(recipient.status === 'BIDDING' || recipient.status === 'OPEN') && (() => {
                                            const recipientBids = getBidsForRecipient(recipient.id)
                                            return recipientBids.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4" />
                                                        Bids Received ({recipientBids.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {recipientBids.slice(0, 3).map((bid: any) => (
                                                            <motion.div
                                                                key={bid.id}
                                                                whileHover={{ scale: 1.02 }}
                                                                className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer"
                                                                onClick={() => handleAcceptBid(bid)}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-green-600 text-lg">
                                                                            {formatCurrency(bid.bidAmount)}
                                                                        </p>
                                                                        {bid.comment && (
                                                                            <p className="text-sm text-gray-600 mt-1">{bid.comment}</p>
                                                                        )}
                                                                    </div>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleAcceptBid(bid)
                                                                        }}
                                                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                                                                    >
                                                                        Accept
                                                                    </motion.button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Activity Log */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Activity Log</h2>
                            </div>
                            <OrderHistory orderId={params.id as string} key={lastUpdated} />
                        </motion.div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Price Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Price Summary</h2>
                            </div>

                            <div className="space-y-4">
                                {order.recipients?.sort((a: any, b: any) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)).map((recipient: any, index: number) => {
                                    const isAutomatedPending = recipient.recipientType === 'AUTOMATED' &&
                                        (recipient.status === 'OPEN' || recipient.status === 'BIDDING')
                                    
                                    // Find accepted bid for this recipient
                                    const acceptedBid = bids?.find((bid: any) => 
                                        bid.orderRecipientId === recipient.id && bid.status === 'ACCEPTED'
                                    )

                                    // Calculate estimated price for directly assigned recipients
                                    const estimatedPrice = recipient.serviceOptionsFee || 
                                        ((recipient.processServiceFee || 0) +
                                        (recipient.certifiedMailFee || 0) +
                                        (recipient.rushServiceFee || 0) +
                                        (recipient.remoteServiceFee || 0))

                                    return (
                                        <div key={recipient.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                                            <p className="font-medium text-gray-700 mb-2">
                                                Recipient {recipient.sequenceNumber || (index + 1)}
                                                {recipient.recipientOrderNumber && (
                                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                                        ({recipient.recipientOrderNumber})
                                                    </span>
                                                )}
                                            </p>
                                            {isAutomatedPending ? (
                                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-5 h-5 text-yellow-600" />
                                                        <span className="text-sm font-semibold text-yellow-800">Pending Bids</span>
                                                    </div>
                                                    <p className="text-xs text-yellow-700">
                                                        Waiting for process servers to submit bids for this delivery.
                                                    </p>
                                                </div>
                                            ) : acceptedBid ? (
                                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                            <span className="text-sm font-semibold text-green-800">Process Server Assigned</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                                                        <span className="text-sm text-green-700 font-medium">Agreed Price:</span>
                                                        <span className="text-xl font-bold text-green-600">${acceptedBid.bidAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ) : recipient.recipientType === 'GUIDED' && estimatedPrice > 0 ? (
                                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                                        <span className="text-sm font-semibold text-blue-800">Process Server Assigned</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                                                        <span className="text-sm text-blue-700 font-medium">Estimated Price:</span>
                                                        <span className="text-xl font-bold text-blue-600">${estimatedPrice.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs text-blue-600 mt-2">* Estimated based on service options</p>
                                                </div>
                                            ) : (
                                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                                        <span className="text-sm font-semibold text-blue-800">Process Server Assigned</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div >

            {/* Modals */}
            <AnimatePresence>
                {
                    showChat && (
                        <ChatWindow
                            orderId={params.id as string}
                            onClose={() => setShowChat(false)}
                        />
                    )
                }

                {
                    showCancelModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowCancelModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            >
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Cancel Order</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                                        <select
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        >
                                            <option value="">Select reason...</option>
                                            <option value="NO_LONGER_NEEDED">No longer needed</option>
                                            <option value="FOUND_ALTERNATIVE">Found alternative</option>
                                            <option value="TOO_EXPENSIVE">Too expensive</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                                        <textarea
                                            value={cancelNotes}
                                            onChange={(e) => setCancelNotes(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                            placeholder="Add any additional information..."
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowCancelModal(false)}
                                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                                        >
                                            Keep Order
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }

                {
                    showAcceptBidModal && selectedBid && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowAcceptBidModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            >
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Accept Bid</h3>
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                                    <p className="text-3xl font-bold text-green-600 mb-2">
                                        {formatCurrency(selectedBid.bidAmount)}
                                    </p>
                                    {selectedBid.comment && (
                                        <p className="text-gray-700">{selectedBid.comment}</p>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to accept this bid? The process server will be assigned to this delivery.
                                </p>
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowAcceptBidModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={confirmAcceptBid}
                                        disabled={acceptingBid}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {acceptingBid ? 'Accepting...' : 'Accept Bid'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }

                {
                    showSuccessModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.5, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0.5, rotate: 10 }}
                                className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
                                <p className="text-gray-600">Bid accepted successfully</p>
                            </motion.div>
                        </motion.div>
                    )
                }

                {
                    editingRecipient && (
                        <EditRecipientModal
                            recipient={editingRecipient}
                            order={order}
                            onClose={() => setEditingRecipient(null)}
                            onUpdate={() => loadOrderDetails()}
                        />
                    )
                }
                
                {/* Counter-Offer Modal */}
                {showCounterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCounterModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Submit Counter-Offer</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Counter-Offer Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={counterAmount}
                                        onChange={(e) => setCounterAmount(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-lg font-semibold"
                                        placeholder="Enter your counter-offer"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={counterNotes}
                                        onChange={(e) => setCounterNotes(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                        rows={3}
                                        placeholder="Add any notes about your counter-offer..."
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCounterOffer(showCounterModal)}
                                        disabled={actionLoading || !counterAmount || parseFloat(counterAmount) <= 0}
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                                    >
                                        {actionLoading ? 'Submitting...' : 'Submit Counter-Offer'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowCounterModal(null)
                                            setCounterAmount('')
                                            setCounterNotes('')
                                        }}
                                        className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    )
}
