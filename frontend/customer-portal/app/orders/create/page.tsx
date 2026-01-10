'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, FileText, MapPin, Package, Eye, CreditCard, Save } from 'lucide-react'
import StepIndicator from '@/components/orders/create/StepIndicator'
import DocumentStep from '@/components/orders/create/DocumentStep'
import RecipientsStep from '@/components/orders/create/RecipientsStep'
import ServiceOptionsStep from '@/components/orders/create/ServiceOptionsStep'
import ReviewStep from '@/components/orders/create/ReviewStep'
import PaymentStep from '@/components/orders/create/PaymentStep'
import { api } from '@/lib/api'

interface Recipient {
    id: string
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    notes: string
    stateId?: number
    assignmentType: 'AUTOMATED' | 'GUIDED'
    processServerId?: string
    processServerName?: string
    processService: boolean
    certifiedMail: boolean
    rushService: boolean
    remoteService: boolean
    quotedPrice?: number
    negotiatedPrice?: number
    priceStatus?: 'QUOTED' | 'NEGOTIATING' | 'ACCEPTED'
}

export default function CreateOrderWizard() {
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [draftId, setDraftId] = useState<string | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const [documentData, setDocumentData] = useState({
        caseNumber: '',
        jurisdiction: '',
        documentType: '',
        deadline: '',
        document: null as File | null,
        filePageCount: 0,
    })

    const [recipients, setRecipients] = useState<Recipient[]>([])

    // Load draft or edit order from API after mount
    useEffect(() => {
        const loadInitialData = async () => {
            setIsMounted(true)
            console.log('🎬 Component mounted, loading data...')

            const token = sessionStorage.getItem('token')
            if (!token) {
                console.log('No token found, redirecting to login')
                router.push('/login')
                return
            }

            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const customerId = user.roles?.[0]?.id || user.userId

            if (!customerId) {
                console.log('No customer ID found, redirecting to login')
                router.push('/login')
                return
            }

            // Check URL parameters
            const urlParams = new URLSearchParams(window.location.search)
            const isNewOrder = urlParams.get('new') === 'true'
            const editOrderId = urlParams.get('orderId')
            const startStep = urlParams.get('step')

            if (isNewOrder) {
                console.log('🆕 New order requested')
                window.history.replaceState({}, '', window.location.pathname)
                return
            }

            if (editOrderId) {
                console.log('📝 Loading draft/order:', editOrderId)
                setDraftId(editOrderId)
                await loadOrderData(editOrderId, token)
            } else {
                // Check for existing drafts to resume
                try {
                    console.log('🔍 Checking for existing drafts...')
                    const drafts = await api.getCustomerDrafts(customerId, token)
                    if (drafts && drafts.length > 0) {
                        // Sort by last modified (assuming backend returns date or ID is roughly chronological)
                        // For now, just take the first one or the one with highest ID/date
                        const latestDraft = drafts[0] // You might want to sort this
                        console.log('📂 Found existing draft, resuming:', latestDraft.id)

                        // Ask user if they want to resume? For now, auto-resume
                        setDraftId(latestDraft.id)
                        await loadOrderData(latestDraft.id, token)

                        // Update URL
                        window.history.replaceState({}, '', `/orders/create?orderId=${latestDraft.id}`)
                    }
                } catch (error) {
                    console.error('❌ Failed to check for drafts:', error)
                }
            }
        }

        const loadOrderData = async (id: string, token: string) => {
            try {
                // Fetch the order/draft data from database
                const order = await api.getOrder(id, token)
                console.log('✅ Loaded order data from database:', order)

                // Check if this is a draft or published order
                const isDraft = order.status === 'DRAFT'
                setIsEditMode(!isDraft)  // Only set edit mode if it's a published order

                // Load document data
                setDocumentData({
                    caseNumber: order.caseNumber || '',
                    jurisdiction: order.jurisdiction || '',
                    documentType: order.documentType || '',
                    deadline: order.deadline || '',
                    document: null,
                    filePageCount: order.pageCount || 0,
                })

                // Load recipients data
                if (order.recipients && Array.isArray(order.recipients)) {
                    const loadedRecipients = order.recipients.map((recipient: any, index: number) => ({
                        id: recipient.id || `recipient-${index}`,
                        firstName: recipient.recipientName?.split(' ')[0] || '',
                        lastName: recipient.recipientName?.split(' ').slice(1).join(' ') || '',
                        address: recipient.recipientAddress || '',
                        city: recipient.city || '',
                        state: recipient.state || '',
                        zipCode: recipient.recipientZipCode || '',
                        notes: recipient.notes || recipient.specialInstructions || '',
                        stateId: recipient.stateId,
                        assignmentType: recipient.recipientType || 'AUTOMATED',
                        processServerId: recipient.assignedProcessServerId,
                        processServerName: recipient.processServerName,
                        processService: recipient.serviceType === 'PROCESS_SERVICE' || recipient.processService,
                        certifiedMail: recipient.serviceType === 'CERTIFIED_MAIL' || recipient.certifiedMail,
                        rushService: recipient.rushService || false,
                        remoteService: recipient.remoteLocation || recipient.remoteService || false,
                        quotedPrice: recipient.quotedPrice,
                        negotiatedPrice: recipient.negotiatedPrice,
                        priceStatus: recipient.priceStatus,
                    }))
                    setRecipients(loadedRecipients)
                    console.log('✅ Loaded recipients from database:', loadedRecipients)
                }
            } catch (error: any) {
                console.error('❌ Failed to load order:', error)
                if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                    console.log('Authentication expired, redirecting to login')
                    sessionStorage.clear()
                    router.push('/login')
                    return
                }
                // alert('Failed to load order data. Please try again.')
            }
        }

        loadInitialData()
    }, [])

    // Auto-save to database with debouncing
    const saveDraftToDatabase = useCallback(async () => {
        if (!isMounted || isEditMode) return

        const token = sessionStorage.getItem('token')
        if (!token) return

        const user = JSON.parse(sessionStorage.getItem('user') || '{}')
        const customerId = user.roles?.[0]?.id || user.userId
        const tenantId = user.roles?.[0]?.tenantId

        if (!customerId || !tenantId) return

        const hasData = documentData.caseNumber || documentData.jurisdiction ||
            documentData.documentType || documentData.deadline || recipients.length > 0

        if (!hasData) return

        // Format deadline to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
        let formattedDeadline = null
        if (documentData.deadline) {
            // Ensure it has time component
            formattedDeadline = documentData.deadline.includes('T')
                ? documentData.deadline
                : `${documentData.deadline}T00:00:00`
        }

        const draftData = {
            tenantId,
            customerId,
            caseNumber: documentData.caseNumber || null,
            jurisdiction: documentData.jurisdiction || null,
            documentType: documentData.documentType || null,
            deadline: formattedDeadline,
            pageCount: documentData.filePageCount || null,
            recipients: recipients.map(r => ({
                recipientName: `${r.firstName} ${r.lastName}`.trim() || null,
                recipientAddress: r.address || null,
                recipientZipCode: r.zipCode || null,
                city: r.city || null,
                state: r.state || null,
                stateId: r.stateId ? String(r.stateId) : null,
                notes: r.notes || null,
                recipientType: r.assignmentType || 'AUTOMATED',
                serviceType: r.processService ? 'PROCESS_SERVICE' : r.certifiedMail ? 'CERTIFIED_MAIL' : 'PROCESS_SERVICE',
                processService: r.processService || false,
                certifiedMail: r.certifiedMail || false,
                rushService: r.rushService || false,
                remoteLocation: r.remoteService || false,
                assignedProcessServerId: r.processServerId || null,
                processServerName: r.processServerName || null,
                quotedPrice: r.quotedPrice || null,
                negotiatedPrice: r.negotiatedPrice || null,
                priceStatus: r.priceStatus || null,
            }))
        }

        try {
            setIsSaving(true)
            let savedDraft
            if (draftId) {
                savedDraft = await api.updateDraft(draftId, draftData, token)
                console.log('💾 Draft updated in database:', savedDraft.id)
            } else {
                savedDraft = await api.saveDraft(draftData, token)
                console.log('💾 New draft saved to database:', savedDraft.id)
                setDraftId(savedDraft.id)
                // Update URL with draft ID
                window.history.replaceState({}, '', `/orders/create?orderId=${savedDraft.id}&step=${currentStep}`)
            }
        } catch (error) {
            console.error('❌ Failed to save draft to database:', error)
        } finally {
            setIsSaving(false)
        }
    }, [isMounted, draftId, isEditMode, documentData, recipients, currentStep])

    // Debounced auto-save effect
    useEffect(() => {
        if (!isMounted) return

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

        saveTimeoutRef.current = setTimeout(() => {
            saveDraftToDatabase()
        }, 2000)

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        }
    }, [isMounted, documentData, recipients, saveDraftToDatabase])

    const steps = [
        { number: 1, title: 'Document Details', icon: FileText, description: 'Case information & documents' },
        { number: 2, title: 'Recipients', icon: MapPin, description: 'Delivery destinations' },
        { number: 3, title: 'Service Options', icon: Package, description: 'Type & urgency' },
        { number: 4, title: 'Review', icon: Eye, description: 'Verify your order' },
        { number: 5, title: 'Payment', icon: CreditCard, description: 'Complete your order' },
    ]

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(documentData.caseNumber.trim() && documentData.jurisdiction.trim() &&
                    documentData.documentType && documentData.deadline && documentData.document)
            case 2:
                return recipients.length > 0 && recipients.every(r =>
                    r.firstName && r.lastName && r.address && r.city && r.state && r.zipCode)
            case 3:
                return recipients.every(r => r.processService || r.certifiedMail)
            default:
                return true
        }
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 5) {
                setCurrentStep(currentStep + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } else {
            alert('Please fill in all required fields before continuing.')
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')

            if (!token) {
                alert('Please log in to create an order')
                router.push('/login')
                return
            }

            const customerId = user.roles?.[0]?.id || user.userId

            if (!customerId || !user.roles?.[0]?.tenantId) {
                alert('User information is incomplete. Please log in again.')
                router.push('/login')
                return
            }

            // If editing, save changes and return to dashboard
            if (isEditMode) {
                const updateData = {
                    caseNumber: documentData.caseNumber,
                    jurisdiction: documentData.jurisdiction,
                    documentType: documentData.documentType,
                    deadline: documentData.deadline,
                    recipients: recipients.map(r => ({
                        recipientName: `${r.firstName} ${r.lastName}`,
                        recipientAddress: r.address,
                        recipientZipCode: r.zipCode,
                        recipientType: r.assignmentType,
                        serviceType: r.processService ? 'PROCESS_SERVICE' : 'CERTIFIED_MAIL',
                        rushService: r.rushService,
                        remoteLocation: r.remoteService,
                        assignedProcessServerId: r.processServerId,
                    }))
                }

                await api.updateOrder(draftId!, updateData, token, customerId)
                alert('Order updated successfully!')
                router.push('/orders')
                return
            }

            const orderData = {
                tenantId: user.roles[0]?.tenantId,
                customerId: customerId,
                caseNumber: documentData.caseNumber,
                jurisdiction: documentData.jurisdiction,
                documentType: documentData.documentType?.toUpperCase(),
                deadline: documentData.deadline,
                status: 'OPEN',
                recipients: recipients.map(r => ({
                    recipientName: `${r.firstName} ${r.lastName}`.trim(),
                    recipientAddress: r.address,
                    recipientZipCode: r.zipCode,
                    city: r.city,
                    state: r.state,
                    stateId: r.stateId ? String(r.stateId) : null,
                    notes: r.notes,
                    specialInstructions: r.notes,
                    recipientType: r.assignmentType,
                    serviceType: r.processService ? 'PROCESS_SERVICE' : r.certifiedMail ? 'CERTIFIED_MAIL' : null,
                    processService: r.processService,
                    certifiedMail: r.certifiedMail,
                    rushService: r.rushService,
                    remoteLocation: r.remoteService,
                    assignedProcessServerId: r.processServerId,
                    processServerName: r.processServerName,
                    finalAgreedPrice: (() => {
                        if (r.assignmentType === 'GUIDED' && !r.negotiatedPrice && !r.quotedPrice) {
                            let price = 0
                            if (r.processService) price += 75
                            if (r.certifiedMail) price += 25
                            if (r.rushService) price += 50
                            if (r.remoteService) price += 40
                            return price
                        }
                        return r.negotiatedPrice || r.quotedPrice
                    })(),
                    customerPrice: (() => {
                        if (r.assignmentType === 'GUIDED' && !r.negotiatedPrice && !r.quotedPrice) {
                            let price = 0
                            if (r.processService) price += 75
                            if (r.certifiedMail) price += 25
                            if (r.rushService) price += 50
                            if (r.remoteService) price += 40
                            return price
                        }
                        return r.negotiatedPrice || r.quotedPrice
                    })(),
                    quotedPrice: r.quotedPrice,
                    priceStatus: r.priceStatus,
                }))
            }

            console.log('📤 Submitting order:', orderData)

            const createdOrder = await api.createOrder(orderData, token)

            console.log('✅ Order created:', createdOrder)
            console.log('📄 Order ID:', createdOrder.id)

            // Delete draft if it exists
            if (draftId) {
                try {
                    await api.deleteDraft(draftId, token)
                    console.log('🗑️ Draft deleted')
                } catch (error) {
                    console.error('❌ Failed to delete draft:', error)
                }
            }

            // Show success modal
            setShowSuccessModal(true)

            // Redirect after animation
            setTimeout(() => {
                router.push('/dashboard')
            }, 2500)

        } catch (error: any) {
            console.error('❌ Order creation failed:', error)
            console.error('Response data:', error.response?.data)
            console.error('Status:', error.response?.status)
            alert(error.message || 'Failed to create order. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {isEditMode ? 'Edit Order' : 'Create New Order'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditMode ? 'Update your order details' : 'Complete the steps below to submit your request'}
                    </p>
                    {isSaving && (
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mt-2">
                            <Save className="w-4 h-4 animate-pulse" />
                            <span>Saving draft...</span>
                        </div>
                    )}
                </motion.div>

                {/* Step Indicator */}
                <StepIndicator steps={steps} currentStep={currentStep} />

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
                    >
                        {currentStep === 1 && (
                            <DocumentStep
                                data={documentData}
                                onChange={setDocumentData}
                            />
                        )}
                        {currentStep === 2 && (
                            <RecipientsStep
                                data={recipients}
                                onChange={setRecipients}
                            />
                        )}
                        {currentStep === 3 && (
                            <ServiceOptionsStep
                                recipients={recipients}
                                onChange={setRecipients}
                                deadline={documentData.deadline}
                            />
                        )}
                        {currentStep === 4 && (
                            <ReviewStep
                                documentData={documentData}
                                recipients={recipients}
                                onEditStep={(step: number) => setCurrentStep(step + 1)}
                            />
                        )}
                        {currentStep === 5 && (
                            <PaymentStep
                                documentData={documentData}
                                recipients={recipients}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-center gap-4"
                >
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${currentStep === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    {currentStep < 5 ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    {isEditMode ? 'Save Changes' : 'Submit Order'}
                                </>
                            )}
                        </motion.button>
                    )}
                </motion.div>

                {/* Step Progress Text */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    Step {currentStep} of 5 • {steps[currentStep - 1].title}
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white rounded-3xl p-12 max-w-md w-full mx-4 text-center shadow-2xl"
                        >
                            {/* Animated Checkmark */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
                                className="relative mx-auto w-24 h-24 mb-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full"
                                />
                                <motion.svg
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                                    className="absolute inset-0 w-full h-full"
                                    viewBox="0 0 50 50"
                                >
                                    <motion.path
                                        d="M14,25 L22,33 L36,17"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </motion.svg>
                            </motion.div>

                            {/* Success Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h3 className="text-3xl font-bold text-gray-800 mb-3">
                                    Order Created!
                                </h3>
                                <p className="text-gray-600 text-lg mb-6">
                                    Your order has been successfully submitted
                                </p>
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/dashboard')}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Go to Dashboard
                                </motion.button>
                            </motion.div>

                            {/* Confetti Effect */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ delay: 0.4, duration: 1 }}
                                className="absolute inset-0 pointer-events-none"
                            >
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: "50%", x: "50%", scale: 0 }}
                                        animate={{
                                            y: [null, `-${Math.random() * 200 + 100}%`],
                                            x: [null, `${(Math.random() - 0.5) * 200}%`],
                                            scale: [null, 1, 0],
                                            rotate: [0, Math.random() * 360]
                                        }}
                                        transition={{ delay: 0.4 + i * 0.02, duration: 1 }}
                                        className="absolute w-3 h-3 rounded-full"
                                        style={{
                                            background: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][i % 5]
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
