'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Clock, Trash2, Edit, Calendar, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface Draft {
    id: string
    draftName: string
    currentStep: number
    updatedAt: string
    expiresAt: string
    documentData: string
    recipientsData: string
}

export default function DraftsPage() {
    const router = useRouter()
    const [drafts, setDrafts] = useState<Draft[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        loadDrafts()
    }, [])

    const loadDrafts = async () => {
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const customerId = user.roles?.[0]?.id || user.userId

            if (!token || !customerId) {
                router.push('/login')
                return
            }

            const draftsData = await api.getCustomerDrafts(customerId, token)
            setDrafts(draftsData)
        } catch (error) {
            console.error('Failed to load drafts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleContinueDraft = (draftId: string) => {
        router.push(`/orders/create?draftId=${draftId}`)
    }

    const handleDeleteDraft = async (draftId: string) => {
        if (!confirm('Are you sure you want to delete this draft?')) return

        try {
            setDeletingId(draftId)
            const token = sessionStorage.getItem('token')
            if (!token) return

            await api.deleteDraft(draftId, token)
            setDrafts(drafts.filter(d => d.id !== draftId))
        } catch (error) {
            console.error('Failed to delete draft:', error)
            alert('Failed to delete draft. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    const getDaysUntilExpiration = (expiresAt: string) => {
        const now = new Date()
        const expiry = new Date(expiresAt)
        const diffTime = expiry.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const getRecipientCount = (recipientsData: string) => {
        try {
            const recipients = JSON.parse(recipientsData)
            return Array.isArray(recipients) ? recipients.length : 0
        } catch {
            return 0
        }
    }

    const getStepName = (step: number) => {
        const steps = ['Document Details', 'Recipients', 'Service Options', 'Review', 'Payment']
        return steps[step - 1] || 'Unknown'
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading drafts...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Saved Drafts
                            </h1>
                            <p className="text-gray-600">
                                Continue working on your incomplete orders
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/orders/create?new=true')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            New Order
                        </button>
                    </div>
                </motion.div>

                {/* Drafts List */}
                {drafts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-12 text-center"
                    >
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No drafts found</h3>
                        <p className="text-gray-500 mb-6">
                            Start creating an order and it will be automatically saved as a draft
                        </p>
                        <button
                            onClick={() => router.push('/orders/create')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Create Your First Order
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4 md:gap-6">
                        {drafts.map((draft, index) => {
                            const daysLeft = getDaysUntilExpiration(draft.expiresAt)
                            const recipientCount = getRecipientCount(draft.recipientsData)
                            const isExpiringSoon = daysLeft <= 2

                            return (
                                <motion.div
                                    key={draft.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Draft Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 mb-3">
                                                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                        {draft.draftName}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Edit className="w-4 h-4" />
                                                            Step {draft.currentStep}/5: {getStepName(draft.currentStep)}
                                                        </span>
                                                        {recipientCount > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="w-4 h-4" />
                                                                {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    Last saved: {new Date(draft.updatedAt).toLocaleString()}
                                                </span>
                                                <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-orange-600 font-medium' : ''}`}>
                                                    {isExpiringSoon && <AlertCircle className="w-4 h-4" />}
                                                    <Calendar className="w-4 h-4" />
                                                    Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleContinueDraft(draft.id)}
                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                                            >
                                                <Edit className="w-5 h-5" />
                                                Continue
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDraft(draft.id)}
                                                disabled={deletingId === draft.id}
                                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all disabled:opacity-50"
                                            >
                                                {deletingId === draft.id ? (
                                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{draft.currentStep}/5 steps completed</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(draft.currentStep / 5) * 100}%` }}
                                                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
