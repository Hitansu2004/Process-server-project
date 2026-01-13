'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { 
    ArrowLeft, FileText, MapPin, Calendar, DollarSign, 
    CheckCircle, Clock, Package, User, Zap, Building,
    Download, AlertCircle, TrendingUp, XCircle, Mail
} from 'lucide-react'

export default function OrderDetails({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [bids, setBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [bidAmount, setBidAmount] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [selectedRecipient, setSelectedRecipient] = useState<any>(null)
    const [attemptNotes, setAttemptNotes] = useState('')
    const [recordingAttempt, setRecordingAttempt] = useState(false)
    
    // Negotiation states - SIMPLIFIED
    const [negotiations, setNegotiations] = useState<Record<string, any>>({}) // recipientId -> negotiation data
    const [showProposeModal, setShowProposeModal] = useState<string | null>(null) // recipientId
    const [proposeAmount, setProposeAmount] = useState('')
    const [proposeNotes, setProposeNotes] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        const processServerRole = parsedUser.roles.find((r: any) => r.role === 'PROCESS_SERVER')
        if (processServerRole && processServerRole.id) {
            api.getProcessServerProfile(processServerRole.id, token)
                .then(profileData => {
                    setProfile(profileData)
                    // Load order details after profile is loaded, passing profileId
                    loadOrderDetails(params.id, token, profileData.id)
                })
                .catch(err => {
                    console.error('Failed to load profile:', err)
                    // Still load order details even if profile fails
                    loadOrderDetails(params.id, token)
                })
        } else {
            loadOrderDetails(params.id, token)
        }
    }, [params.id, router])
    
    // Load negotiations for GUIDED recipients
    const loadNegotiationsForOrder = async (orderData: any, token: string, profileId?: string) => {
        if (!orderData.recipients) return
        
        const currentProfileId = profileId || profile?.id
        if (!currentProfileId) return
        
        const guidedRecipients = orderData.recipients.filter((r: any) => 
            r.recipientType === 'GUIDED' && 
            r.status === 'ASSIGNED' &&
            r.assignedProcessServerId === currentProfileId
        )
        
        const negotiationsData: Record<string, any> = {}
        for (const recipient of guidedRecipients) {
            try {
                const negotiation = await api.getActiveNegotiation(recipient.id, token)
                if (negotiation) {
                    negotiationsData[recipient.id] = negotiation
                }
            } catch (err) {
                console.log(`No active negotiation for recipient ${recipient.id}`)
            }
        }
        setNegotiations(negotiationsData)
    }

    const loadOrderDetails = async (orderId: string, token: string, profileId?: string) => {
        try {
            const [orderData, bidsData] = await Promise.all([
                api.getOrderById(orderId, token),
                api.getOrderBids(orderId, token)
            ])

            setOrder(orderData)
            setBids(bidsData)
            
            // Load negotiations for all GUIDED recipients
            await loadNegotiationsForOrder(orderData, token, profileId)
        } catch (error) {
            console.error('Failed to load order:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const token = localStorage.getItem('token')
            const processServerId = profile?.id || user?.userId

            const availableRecipients = order.recipients?.filter((d: any) =>
                d.status === 'OPEN' || d.status === 'BIDDING'
            );

            if (availableRecipients && availableRecipients.length > 0) {
                const firstAvailable = availableRecipients[0];
                await api.placeBid({
                    orderId: params.id,
                    processServerId,
                    bidAmount: parseFloat(bidAmount),
                    orderRecipientId: firstAvailable.id,
                    comment: ''
                }, token!)

                alert('Bid submitted successfully!')
                await loadOrderDetails(params.id, token!)
                setBidAmount('')
            } else {
                alert('No available recipients to bid on')
            }
        } catch (error) {
            console.error('Failed to place bid:', error)
            alert('Failed to submit bid. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRecordAttempt = async (wasSuccessful: boolean) => {
        if (!selectedRecipient) return

        setRecordingAttempt(true)
        try {
            const token = localStorage.getItem('token')
            const processServerId = user.processServerProfileId || user.userId

            const attemptData = {
                recipientId: selectedRecipient.id,
                processServerId: processServerId,
                wasSuccessful,
                outcomeNotes: attemptNotes || (wasSuccessful ? 'Delivered successfully' : 'Delivery failed'),
                gpsLatitude: 40.7128,
                gpsLongitude: -74.0060,
                photoProofUrl: null
            }

            await api.recordDeliveryAttempt(attemptData, token!)
            alert(wasSuccessful ? 'Delivery marked as successful!' : 'Attempt recorded.')

            loadOrderDetails(params.id, token!)
            setSelectedRecipient(null)
            setAttemptNotes('')
        } catch (error) {
            console.error('Failed to record attempt:', error)
            alert('Failed to record delivery attempt. Please try again.')
        } finally {
            setRecordingAttempt(false)
        }
    }
    
    const handleProposePrice = async (recipientId: string) => {
        if (!proposeAmount || parseFloat(proposeAmount) <= 0) {
            alert('Please enter a valid price amount')
            return
        }
        
        if (!profile?.id) {
            alert('Process server profile not loaded')
            return
        }
        
        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const processServerId = profile.id // Use process server profile ID, not user ID
            
            await api.proposePrice(
                recipientId,
                parseFloat(proposeAmount),
                proposeNotes || 'Price proposal',
                processServerId,
                token!
            )
            
            alert('Price proposal submitted successfully!')
            setShowProposeModal(null)
            setProposeAmount('')
            setProposeNotes('')
            
            // Reload order
            await loadOrderDetails(params.id, token!)
        } catch (error) {
            console.error('Failed to propose price:', error)
            alert('Failed to submit price proposal. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }
    
    const handleAcceptCounterOffer = async (negotiationId: string) => {
        if (!confirm('Accept this counter-offer?')) return
        
        if (!profile?.id) {
            alert('Process server profile not loaded')
            return
        }
        
        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const processServerId = profile.id
            
            await api.acceptNegotiation(
                negotiationId,
                'Accepting counter-offer',
                processServerId,
                'PROCESS_SERVER',
                token!
            )
            
            alert('Counter-offer accepted! Price has been updated.')
            await loadOrderDetails(params.id, token!)
        } catch (error) {
            console.error('Failed to accept:', error)
            alert('Failed to accept counter-offer. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }
    
    const handleRejectCounterOffer = async (negotiationId: string) => {
        const reason = prompt('Please provide a reason for rejection:')
        if (!reason) return
        
        if (!profile?.id) {
            alert('Process server profile not loaded')
            return
        }
        
        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const processServerId = profile.id
            
            await api.rejectNegotiation(
                negotiationId,
                reason,
                processServerId,
                'PROCESS_SERVER',
                token!
            )
            
            alert('Counter-offer rejected. You keep this assignment with the original price.')
            await loadOrderDetails(params.id, token!)
        } catch (error) {
            console.error('Failed to reject:', error)
            alert('Failed to reject counter-offer. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusConfig = (status: string) => {
        const configs: any = {
            'OPEN': { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Clock className="w-4 h-4" /> },
            'BIDDING': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <TrendingUp className="w-4 h-4" /> },
            'ASSIGNED': { bg: 'bg-purple-50', text: 'text-purple-700', icon: <User className="w-4 h-4" /> },
            'IN_PROGRESS': { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Package className="w-4 h-4" /> },
            'COMPLETED': { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
            'DELIVERED': { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
            'FAILED': { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="w-4 h-4" /> },
            'CANCELLED': { bg: 'bg-gray-50', text: 'text-gray-700', icon: <XCircle className="w-4 h-4" /> }
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
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl"
                    >
                        Go Back
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    const myAcceptedBid = bids.find((b: any) =>
        b.processServerId === (user?.processServerProfileId || user?.userId) &&
        b.status === 'ACCEPTED'
    )
    const isMyOrder = !!myAcceptedBid

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
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
                            <h1 className="text-3xl font-bold text-gray-800">{order.orderNumber}</h1>
                            <p className="text-gray-500 mt-1">Order Details</p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Customer</p>
                                <p className="text-xl font-semibold text-gray-800">{order.customerName}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Document Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">Document Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Document Type</p>
                                    <p className="font-semibold text-gray-800">
                                        {order.documentType === 'OTHER' ? order.otherDocumentType : order.documentType?.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Case Number</p>
                                    <p className="font-semibold text-gray-800">{order.caseNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Jurisdiction</p>
                                    <p className="font-semibold text-gray-800">{order.jurisdiction || 'N/A'}</p>
                                </div>
                                {order.documentUrl && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-500 mb-2">Uploaded Document</p>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
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
                                                        a.download = order.documentUrl;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                        document.body.removeChild(a);
                                                    })
                                                    .catch(err => alert('Failed to download document'));
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Document
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Recipients */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-lg"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">Recipient Locations ({order.recipients?.length || 0})</h2>
                            </div>
                            <div className="space-y-4">
                                {order.recipients && order.recipients.map((recipient: any, index: number) => {
                                    const statusConfig = getStatusConfig(recipient.status)
                                    const recipientBid = bids.find((b: any) =>
                                        b.orderRecipientId === recipient.id &&
                                        b.processServerId === (user?.processServerProfileId || user?.userId) &&
                                        b.status === 'ACCEPTED'
                                    )
                                    const canRecordAttempt = recipientBid && 
                                        (recipient.status === 'ASSIGNED' || recipient.status === 'IN_PROGRESS') &&
                                        recipient.attemptCount < recipient.maxAttempts

                                    return (
                                        <motion.div
                                            key={recipient.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-gray-800">Recipient #{index + 1}</h3>
                                                <span className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                                    {statusConfig.icon}
                                                    {recipient.status}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Recipient</p>
                                                    <p className="font-semibold text-gray-800">{recipient.recipientName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Address</p>
                                                    <p className="font-semibold text-gray-800">{recipient.recipientAddress}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">ZIP Code</p>
                                                    <p className="font-semibold text-blue-600">{recipient.recipientZipCode}</p>
                                                </div>

                                                {/* Service Badges */}
                                                <div className="flex gap-2 flex-wrap">
                                                    {recipient.processService && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
                                                            <Package className="w-3 h-3" />
                                                            Process Service
                                                        </span>
                                                    )}
                                                    {recipient.certifiedMail && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            Certified Mail
                                                        </span>
                                                    )}
                                                    {recipient.rushService && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                                                            <Zap className="w-3 h-3" />
                                                            Rush Service
                                                        </span>
                                                    )}
                                                    {recipient.remoteLocation && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                                                            <Building className="w-3 h-3" />
                                                            Remote Location
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Delivery History */}
                                                {recipient.attemptCount > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                                <Package className="w-4 h-4" />
                                                                Delivery History
                                                            </p>
                                                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
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
                                                                    <motion.div 
                                                                        key={attempt.id}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        className={`p-4 rounded-lg ${
                                                                            attempt.wasSuccessful 
                                                                                ? 'bg-green-50 border border-green-200' 
                                                                                : 'bg-red-50 border border-red-200'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                {attempt.wasSuccessful ? (
                                                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                                                ) : (
                                                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                                                )}
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-gray-800">
                                                                                        Attempt #{attempt.attemptNumber}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
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
                                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                                                attempt.wasSuccessful 
                                                                                    ? 'bg-green-200 text-green-800' 
                                                                                    : 'bg-red-200 text-red-800'
                                                                            }`}>
                                                                                {attempt.wasSuccessful ? 'DELIVERED' : 'FAILED'}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {attempt.outcomeNotes && (
                                                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                                                <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                                                                <p className="text-sm text-gray-700">{attempt.outcomeNotes}</p>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {attempt.gpsLatitude && attempt.gpsLongitude && (
                                                                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                                                <MapPin className="w-3 h-3" />
                                                                                <span>GPS: {attempt.gpsLatitude.toFixed(4)}, {attempt.gpsLongitude.toFixed(4)}</span>
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-500 italic">No attempt details available</p>
                                                        )}

                                                        {recipient.deliveredAt && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                                                            >
                                                                <p className="text-sm text-green-700 flex items-center gap-2 font-semibold">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Delivered on {new Date(recipient.deliveredAt).toLocaleString('en-US', {
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Record Attempt */}
                                                {canRecordAttempt && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        {selectedRecipient?.id === recipient.id ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="space-y-3"
                                                            >
                                                                <textarea
                                                                    value={attemptNotes}
                                                                    onChange={(e) => setAttemptNotes(e.target.value)}
                                                                    placeholder="Delivery notes (optional)"
                                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700"
                                                                    rows={2}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleRecordAttempt(true)}
                                                                        disabled={recordingAttempt}
                                                                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <CheckCircle className="w-5 h-5" />
                                                                        Mark Delivered
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleRecordAttempt(false)}
                                                                        disabled={recordingAttempt}
                                                                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <XCircle className="w-5 h-5" />
                                                                        Failed Attempt
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => setSelectedRecipient(null)}
                                                                        className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                                                                    >
                                                                        Cancel
                                                                    </motion.button>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => setSelectedRecipient(recipient)}
                                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                                            >
                                                                Record Delivery Attempt
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Price Negotiation Section - Show for GUIDED recipients assigned to this PS */}
                                                {recipient.recipientType === 'GUIDED' && 
                                                 recipient.assignedProcessServerId === profile?.id && 
                                                 recipient.status === 'ASSIGNED' && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        {negotiations[recipient.id] ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
                                                            >
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <DollarSign className="w-5 h-5 text-amber-600" />
                                                                    <h4 className="font-bold text-gray-800">Active Price Negotiation</h4>
                                                                </div>
                                                                <div className="space-y-2 mb-3">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-600">Your Proposed Price:</span>
                                                                        <span className="font-bold text-gray-800">
                                                                            ${negotiations[recipient.id].proposedAmount?.toFixed(2) || '0.00'}
                                                                        </span>
                                                                    </div>
                                                                    {negotiations[recipient.id].counterOfferAmount && (
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">Customer Counter Offer:</span>
                                                                            <span className="font-bold text-blue-600">
                                                                                ${negotiations[recipient.id].counterOfferAmount?.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-600">Status:</span>
                                                                        <span className={`font-semibold ${
                                                                            negotiations[recipient.id].status === 'PENDING' && !negotiations[recipient.id].counterOfferAmount
                                                                                ? 'text-orange-600' 
                                                                                : negotiations[recipient.id].status === 'PENDING' && negotiations[recipient.id].counterOfferAmount
                                                                                ? 'text-blue-600'
                                                                                : 'text-gray-600'
                                                                        }`}>
                                                                            {negotiations[recipient.id].status === 'PENDING' && !negotiations[recipient.id].counterOfferAmount
                                                                                ? 'Waiting for Customer Response' 
                                                                                : negotiations[recipient.id].status === 'PENDING' && negotiations[recipient.id].counterOfferAmount
                                                                                ? 'Customer Countered - Action Required'
                                                                                : negotiations[recipient.id].status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                {negotiations[recipient.id].status === 'PENDING' && 
                                                                 negotiations[recipient.id].counterOfferAmount && (
                                                                    <div className="flex gap-2 mt-3">
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                            onClick={() => handleAcceptCounterOffer(negotiations[recipient.id].id)}
                                                                            disabled={actionLoading}
                                                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4" />
                                                                            Accept ${negotiations[recipient.id].counterOfferAmount?.toFixed(2)}
                                                                        </motion.button>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                            onClick={() => handleRejectCounterOffer(negotiations[recipient.id].id)}
                                                                            disabled={actionLoading}
                                                                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                            Reject
                                                                        </motion.button>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ) : recipient.finalAgreedPrice && recipient.negotiationStatus === 'ACCEPTED' ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                                    <h4 className="font-bold text-gray-800">Price Agreed</h4>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-gray-600">Final Agreed Price:</span>
                                                                    <span className="text-xl font-bold text-green-600">
                                                                        ${recipient.finalAgreedPrice.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-2">Negotiation completed successfully</p>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => setShowProposeModal(recipient.id)}
                                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <DollarSign className="w-5 h-5" />
                                                                Propose Price
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* Additional Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-lg"
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Additional Information</h2>
                            <div className="space-y-4">
                                {/* Deadline */}
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <p className="text-sm font-semibold text-gray-600">Deadline</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {new Date(order.deadline).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <h3 className="text-lg font-bold text-gray-800">Payment Breakdown</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {(() => {
                                            const myRecipients = order.recipients?.filter((d: any) =>
                                                d.assignedProcessServerId === profile?.id
                                            ) || [];

                                            let basePrice = 0;
                                            let rushFee = 0;
                                            let remoteFee = 0;

                                            myRecipients.forEach((recipient: any) => {
                                                const agreedPrice = parseFloat(recipient.finalAgreedPrice) || 0;
                                                const rush = recipient.rushService ? (parseFloat(recipient.rushServiceFee) || 50) : 0;
                                                const remote = recipient.remoteLocation ? (parseFloat(recipient.remoteLocationFee) || 40) : 0;
                                                
                                                basePrice += agreedPrice - rush - remote;
                                                rushFee += rush;
                                                remoteFee += remote;
                                            });

                                            const subtotal = basePrice + rushFee + remoteFee;
                                            const platformFee = subtotal * 0.15;
                                            const earnings = subtotal - platformFee;

                                            return (
                                                <>
                                                    <div className="space-y-2 pb-3 border-b border-gray-200">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Service Fee</span>
                                                            <span className="font-semibold text-gray-800">${basePrice.toFixed(2)}</span>
                                                        </div>
                                                        {rushFee > 0 && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600 flex items-center gap-1">
                                                                    <Zap className="w-3 h-3 text-red-500" />
                                                                    Rush Service
                                                                </span>
                                                                <span className="font-semibold text-gray-800">${rushFee.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {remoteFee > 0 && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600 flex items-center gap-1">
                                                                    <Building className="w-3 h-3 text-purple-500" />
                                                                    Remote Location
                                                                </span>
                                                                <span className="font-semibold text-gray-800">${remoteFee.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-sm font-semibold pt-2">
                                                            <span className="text-gray-700">Subtotal</span>
                                                            <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-sm py-2">
                                                        <span className="text-red-600 font-semibold">Platform Fee (15%)</span>
                                                        <span className="font-bold text-red-600">-${platformFee.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 border-2 border-green-300">
                                                        <span className="text-green-700 font-bold text-lg">Your Earnings</span>
                                                        <span className="font-bold text-green-700 text-xl">${earnings.toFixed(2)}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>


                    {/* Right Column - Bidding */}
                    <div className="space-y-6">
                        {/* My Bid Status */}
                        {bids.find((b: any) => b.processServerId === (user?.processServerProfileId || user?.userId)) && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200"
                            >
                                <h2 className="text-xl font-bold text-gray-800 mb-4">My Bid</h2>
                                {(() => {
                                    const myBid = bids.find((b: any) => b.processServerId === (user?.processServerProfileId || user?.userId))
                                    const statusConfig = getStatusConfig(myBid.status)
                                    return (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Status</span>
                                                <span className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                                                    {statusConfig.icon}
                                                    {myBid.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Bid Amount</span>
                                                <span className="text-2xl font-bold text-blue-600">${myBid.bidAmount}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">Submitted</span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(myBid.createdAt).toLocaleDateString()}<br/>
                                                    {new Date(myBid.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            {myBid.comment && (
                                                <div className="pt-4 border-t border-gray-200">
                                                    <p className="text-gray-600 text-sm mb-1 font-medium">Comment</p>
                                                    <p className="text-sm italic text-gray-700">"{myBid.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}
                            </motion.div>
                        )}

                        {/* Place Bid */}
                        {(() => {
                            const hasAvailableRecipients = order.recipients?.some((d: any) =>
                                d.status === 'OPEN' || d.status === 'BIDDING'
                            );
                            const canBid = !isMyOrder &&
                                !bids.find((b: any) => b.processServerId === (user?.processServerProfileId || user?.userId)) &&
                                ((order.status === 'OPEN' || order.status === 'BIDDING' || order.status === 'PARTIALLY_ASSIGNED') && hasAvailableRecipients);

                            return canBid ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg"
                                >
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Place Your Bid</h2>
                                    <form onSubmit={handlePlaceBid} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bid Amount ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700 font-semibold"
                                                placeholder="Enter your bid"
                                                required
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Bid'}
                                        </motion.button>
                                    </form>
                                </motion.div>
                            ) : null;
                        })()}
                    </div>
                </div>

                {/* Propose Price Modal */}
                {showProposeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowProposeModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="w-6 h-6 text-amber-600" />
                                <h3 className="text-xl font-bold text-gray-800">Propose Price</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Proposed Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={proposeAmount}
                                        onChange={(e) => setProposeAmount(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-gray-700 font-semibold"
                                        placeholder="Enter proposed price"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={proposeNotes}
                                        onChange={(e) => setProposeNotes(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-gray-700"
                                        rows={3}
                                        placeholder="Add any notes or justification..."
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleProposePrice(showProposeModal)}
                                        disabled={actionLoading || !proposeAmount || parseFloat(proposeAmount) <= 0}
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                                    >
                                        {actionLoading ? 'Proposing...' : 'Propose Price'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowProposeModal(null);
                                            setProposeAmount('');
                                            setProposeNotes('');
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
            </div>
        </div>
    )
}
