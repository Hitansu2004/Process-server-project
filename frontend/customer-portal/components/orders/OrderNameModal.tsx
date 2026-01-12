'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText } from 'lucide-react'

interface OrderNameModalProps {
    isOpen: boolean
    onClose: () => void
    onContinue: (orderName: string) => void
}

export default function OrderNameModal({ isOpen, onClose, onContinue }: OrderNameModalProps) {
    const [orderName, setOrderName] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!orderName.trim()) {
            setError('Order name is required')
            return
        }

        if (orderName.length > 255) {
            setError('Order name cannot exceed 255 characters')
            return
        }

        onContinue(orderName.trim())
        setOrderName('')
        setError('')
    }

    const handleClose = () => {
        setOrderName('')
        setError('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Name Your Order</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <p className="text-gray-600 mb-4">
                                Give your order a memorable name to easily identify it later.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={orderName}
                                    onChange={(e) => {
                                        setOrderName(e.target.value)
                                        setError('')
                                    }}
                                    placeholder="e.g., Smith vs. Jones"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    autoFocus
                                    maxLength={255}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {orderName.length}/255 characters
                                </p>
                                {error && (
                                    <p className="text-sm text-red-600 mt-2">{error}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Continue
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
