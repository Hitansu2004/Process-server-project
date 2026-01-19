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
    
    // Price proposal states (uses bidding system)
    const [showProposeModal, setShowProposeModal] = useState<string | null>(null) // recipientId
    const [proposeAmount, setProposeAmount] = useState('')
    const [proposeNotes, setProposeNotes] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    
    // Counter-offer from PS side
    const [showCounterModal, setShowCounterModal] = useState<string | null>(null) // bidId
    const [counterAmount, setCounterAmount] = useState('')
    const [counterNotes, setCounterNotes] = useState('')

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

    const loadOrderDetails = async (orderId: string, token: string, profileId?: string) => {
        try {
            const [orderData, bidsData] = await Promise.all([
                api.getOrderById(orderId, token),
                api.getOrderBids(orderId, token)
            ])

            setOrder(orderData)
            setBids(bidsData)
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
            const processServerId = profile.id
            
            // Use the bidding system for GUIDED orders - place a bid on the direct assignment
            await api.placeBid({
                orderId: params.id,
                processServerId,
                bidAmount: parseFloat(proposeAmount),
                orderRecipientId: recipientId,
                comment: proposeNotes || 'Price proposal for direct assignment'
            }, token!)
            
            alert('Price proposal submitted successfully!')
            setShowProposeModal(null)
            setProposeAmount('')
            setProposeNotes('')
            
            // Reload order to show the new bid
            await loadOrderDetails(params.id, token!)
        } catch (error) {
            console.error('Failed to submit bid:', error)
            alert('Failed to submit price proposal. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    // PS accepts customer's counter-offer
    const handleAcceptCustomerCounter = async (bidId: string) => {
        if (!confirm('Accept customer counter-offer?')) return
        
        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            await api.acceptCustomerCounter(bidId, token!)
            
            alert('Counter-offer accepted! Price has been updated.')
            await loadOrderDetails(params.id, token!)
        } catch (error) {
            console.error('Failed to accept:', error)
            alert('Failed to accept counter-offer. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    // PS rejects and counters back
    const handleRejectAndCounter = async (bidId: string) => {
        if (!counterAmount || parseFloat(counterAmount) <= 0) {
            alert('Please enter a valid counter-offer amount')
            return
        }
        
        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            await api.rejectAndCounter(bidId, parseFloat(counterAmount), counterNotes, token!)
            
            alert('Counter-offer submitted successfully!')
            setShowCounterModal(null)
            setCounterAmount('')
            setCounterNotes('')
            
            await loadOrderDetails(params.id, token!)
        } catch (error) {
            console.error('Failed to counter:', error)
            alert('Failed to submit counter-offer. Please try again.')
        } finally {
            setActionLoading(false)
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
                            onClick={() => router.push('/dashboard')}
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
                            </div>

                            {/* Display all documents */}
                            {order.documents && order.documents.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700 mb-4">Documents ({order.documents.length})</p>
                                    <div className="space-y-3">
                                        {order.documents.map((doc: any, index: number) => (
                                            <motion.div
                                                key={doc.id || index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{doc.fileName || `Document ${index + 1}`}</p>
                                                            <p className="text-sm text-gray-500">{doc.pageCount} pages • {doc.documentType || 'PDF'}</p>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={async () => {
                                                            try {
                                                                const token = localStorage.getItem('token')
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
                                                                alert('Failed to download document.')
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fallback for old single document structure */}
                            {!order.documents?.length && order.documentUrl && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
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
                                                <h3 className="font-bold text-gray-800">
                                                    Recipient #{index + 1}
                                                    {recipient.recipientOrderNumber && (
                                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                                            ({recipient.recipientOrderNumber})
                                                        </span>
                                                    )}
                                                </h3>
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

                                                {/* Assigned Process Server Info - Only for GUIDED recipients */}
                                                {recipient.recipientType === 'GUIDED' && recipient.status === 'ASSIGNED' && recipient.assignedProcessServerId && (
                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mt-4">
                                                        <div className="flex items-start gap-2">
                                                            <User className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-bold text-gray-800 mb-1">Assigned Process Server</h4>
                                                                <p className="text-sm text-gray-700">
                                                                    {recipient.assignedProcessServerId === profile?.id 
                                                                        ? 'You are assigned to this recipient' 
                                                                        : `Assigned to Process Server ID: ${recipient.assignedProcessServerId}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Service Options Fee - Only for GUIDED recipients */}
                                                {recipient.recipientType === 'GUIDED' && 
                                                 (recipient.processService || recipient.certifiedMail || recipient.rushService || recipient.remoteLocation) && (
                                                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200 mt-4">
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-bold text-gray-800 mb-1">Service Options Fee (Estimated)</h4>
                                                                <div className="space-y-1">
                                                                    {recipient.processService && (
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-gray-700">• Process Service</span>
                                                                            <span className="font-semibold text-gray-800">$50.00</span>
                                                                        </div>
                                                                    )}
                                                                    {recipient.certifiedMail && (
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-gray-700">• Certified Mail</span>
                                                                            <span className="font-semibold text-gray-800">$50.00</span>
                                                                        </div>
                                                                    )}
                                                                    {recipient.rushService && (
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-gray-700">• Rush Service</span>
                                                                            <span className="font-semibold text-gray-800">$50.00</span>
                                                                        </div>
                                                                    )}
                                                                    {recipient.remoteLocation && (
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-gray-700">• Remote Location</span>
                                                                            <span className="font-semibold text-gray-800">$50.00</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="border-t border-amber-300 mt-2 pt-2 flex justify-between items-center">
                                                                        <span className="text-xs font-bold text-gray-800">Total Service Options:</span>
                                                                        <span className="text-lg font-bold text-amber-600">
                                                                            ${[
                                                                                recipient.processService ? 50 : 0,
                                                                                recipient.certifiedMail ? 50 : 0,
                                                                                recipient.rushService ? 50 : 0,
                                                                                recipient.remoteLocation ? 50 : 0
                                                                            ].reduce((a, b) => a + b, 0).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-amber-700 mt-2 italic">
                                                                    * Estimated price for directly assigned orders. Final price may vary based on actual delivery requirements.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Place Bid Button - For OPEN/BIDDING recipients */}
                                                {(recipient.status === 'OPEN' || recipient.status === 'BIDDING') && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        {showProposeModal === recipient.id ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="space-y-3"
                                                            >
                                                                <div>
                                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                                        Your Bid Amount ($)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={proposeAmount}
                                                                        onChange={(e) => setProposeAmount(e.target.value)}
                                                                        placeholder="Enter your bid amount"
                                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-700"
                                                                        step="0.01"
                                                                        min="0"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                                        Notes (Optional)
                                                                    </label>
                                                                    <textarea
                                                                        value={proposeNotes}
                                                                        onChange={(e) => setProposeNotes(e.target.value)}
                                                                        placeholder="Add any notes about your bid..."
                                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-700"
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={async () => {
                                                                            if (!proposeAmount || parseFloat(proposeAmount) <= 0) {
                                                                                alert('Please enter a valid bid amount');
                                                                                return;
                                                                            }
                                                                            
                                                                            setActionLoading(true);
                                                                            try {
                                                                                const token = localStorage.getItem('token');
                                                                                await api.placeBid({
                                                                                    orderId: order.id,
                                                                                    orderRecipientId: recipient.id,
                                                                                    processServerId: profile?.id || user?.userId,
                                                                                    bidAmount: parseFloat(proposeAmount),
                                                                                    notes: proposeNotes || undefined
                                                                                }, token!);
                                                                                
                                                                                alert('Bid placed successfully!');
                                                                                setShowProposeModal(null);
                                                                                setProposeAmount('');
                                                                                setProposeNotes('');
                                                                                
                                                                                // Reload order details
                                                                                loadOrderDetails(params.id, token!, profile?.id);
                                                                            } catch (error: any) {
                                                                                alert(error.message || 'Failed to place bid');
                                                                            } finally {
                                                                                setActionLoading(false);
                                                                            }
                                                                        }}
                                                                        disabled={actionLoading}
                                                                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <DollarSign className="w-5 h-5" />
                                                                        {actionLoading ? 'Submitting...' : 'Submit Bid'}
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => {
                                                                            setShowProposeModal(null);
                                                                            setProposeAmount('');
                                                                            setProposeNotes('');
                                                                        }}
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
                                                                onClick={() => setShowProposeModal(recipient.id)}
                                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <TrendingUp className="w-5 h-5" />
                                                                Place Bid for this Recipient
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                )}

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

                                                {/* Price Proposal Section - Show for GUIDED recipients assigned to this PS */}
                                                {recipient.recipientType === 'GUIDED' && 
                                                 recipient.assignedProcessServerId === profile?.id && 
                                                 recipient.status === 'ASSIGNED' && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        {(() => {
                                                            // Find bids for this recipient
                                                            const recipientBids = bids.filter((bid: any) => 
                                                                bid.orderRecipientId === recipient.id &&
                                                                bid.processServerId === profile?.id
                                                            ).sort((a: any, b: any) => 
                                                                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                                            );

                                                            const acceptedBid = recipientBids.find((bid: any) => bid.status === 'ACCEPTED');
                                                            const pendingBids = recipientBids.filter((bid: any) => bid.status === 'PENDING');

                                                            if (acceptedBid) {
                                                                return (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                                            <h4 className="font-bold text-gray-800">Price Accepted</h4>
                                                                        </div>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-sm text-gray-600">Agreed Price:</span>
                                                                            <span className="text-xl font-bold text-green-600">
                                                                                ${acceptedBid.bidAmount.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-2">Customer accepted your proposal</p>
                                                                    </motion.div>
                                                                );
                                                            } else if (pendingBids.length > 0) {
                                                                return (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <Clock className="w-5 h-5 text-amber-600" />
                                                                            <h4 className="font-bold text-gray-800">Price Negotiation</h4>
                                                                        </div>
                                                                        {pendingBids.map((bid: any) => (
                                                                            <div key={bid.id} className="mb-3 pb-3 border-b border-amber-200 last:border-0">
                                                                                <div className="space-y-2">
                                                                                    <div className="flex justify-between text-sm">
                                                                                        <span className="text-gray-600">Your Proposed Price:</span>
                                                                                        <span className="font-bold text-gray-800">
                                                                                            ${bid.bidAmount.toFixed(2)}
                                                                                        </span>
                                                                                    </div>
                                                                                    
                                                                                    {/* Show customer counter-offer if exists */}
                                                                                    {bid.customerCounterAmount && (
                                                                                        <div className="bg-purple-50 rounded p-2 border border-purple-200 mt-2">
                                                                                            <div className="flex justify-between items-center">
                                                                                                <span className="text-xs font-semibold text-purple-700">Customer Counter:</span>
                                                                                                <span className="text-lg font-bold text-purple-600">
                                                                                                    ${bid.customerCounterAmount.toFixed(2)}
                                                                                                </span>
                                                                                            </div>
                                                                                            {bid.customerCounterNotes && (
                                                                                                <p className="text-xs text-gray-600 mt-1 italic">"{bid.customerCounterNotes}"</p>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-xs font-semibold text-gray-600">Status:</span>
                                                                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                                                            {bid.customerCounterAmount 
                                                                                                ? (bid.lastCounterBy === 'CUSTOMER' ? 'Customer Countered' : 'Waiting for Customer')
                                                                                                : 'Waiting for Customer'}
                                                                                        </span>
                                                                                    </div>
                                                                                    
                                                                                    {bid.counterOfferCount > 0 && (
                                                                                        <p className="text-xs text-gray-500">
                                                                                            Round {bid.counterOfferCount} of negotiation
                                                                                        </p>
                                                                                    )}
                                                                                    
                                                                                    {/* Action buttons when customer has countered */}
                                                                                    {bid.customerCounterAmount && bid.lastCounterBy === 'CUSTOMER' && (
                                                                                        <div className="flex gap-2 mt-2">
                                                                                            <motion.button
                                                                                                whileHover={{ scale: 1.02 }}
                                                                                                whileTap={{ scale: 0.98 }}
                                                                                                onClick={() => handleAcceptCustomerCounter(bid.id)}
                                                                                                disabled={actionLoading}
                                                                                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                                                                                            >
                                                                                                <CheckCircle className="w-4 h-4" />
                                                                                                Accept ${bid.customerCounterAmount.toFixed(2)}
                                                                                            </motion.button>
                                                                                            <motion.button
                                                                                                whileHover={{ scale: 1.02 }}
                                                                                                whileTap={{ scale: 0.98 }}
                                                                                                onClick={() => setShowCounterModal(bid.id)}
                                                                                                disabled={actionLoading}
                                                                                                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                                                                                            >
                                                                                                <DollarSign className="w-4 h-4" />
                                                                                                Counter Back
                                                                                            </motion.button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </motion.div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => setShowProposeModal(recipient.id)}
                                                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <DollarSign className="w-5 h-5" />
                                                                        Propose Price
                                                                    </motion.button>
                                                                );
                                                            }
                                                        })()}
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
                                            // Find my accepted bid
                                            const myBid = bids.find((bid: any) => 
                                                bid.processServerId === (user?.processServerProfileId || user?.userId) && 
                                                bid.status === 'ACCEPTED'
                                            );

                                            if (myBid) {
                                                const bidAmount = myBid.bidAmount;
                                                const platformFee = bidAmount * 0.15;
                                                const earnings = bidAmount - platformFee;

                                                return (
                                                    <>
                                                        <div className="space-y-2 pb-3 border-b border-gray-200">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Accepted Bid Amount</span>
                                                                <span className="font-semibold text-gray-800">${bidAmount.toFixed(2)}</span>
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
                                            }
                                            
                                            return (
                                                <div className="text-center py-4 text-gray-500">
                                                    <p className="text-sm">No bid accepted yet</p>
                                                </div>
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

                        {/* Note: Individual recipient bidding moved to each recipient card */}
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
                
                {/* Counter-Offer Modal for PS */}
                {showCounterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCounterModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                                <h3 className="text-xl font-bold text-gray-800">Counter Customer's Offer</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Counter Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={counterAmount}
                                        onChange={(e) => setCounterAmount(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-700 font-semibold"
                                        placeholder="Enter counter amount"
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
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-700"
                                        rows={3}
                                        placeholder="Explain your counter-offer..."
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleRejectAndCounter(showCounterModal)}
                                        disabled={actionLoading || !counterAmount || parseFloat(counterAmount) <= 0}
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                                    >
                                        {actionLoading ? 'Submitting...' : 'Submit Counter'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowCounterModal(null);
                                            setCounterAmount('');
                                            setCounterNotes('');
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
