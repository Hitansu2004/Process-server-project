'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-md w-full relative border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center"
                                >
                                    <AlertCircle className="text-red-600" size={32} />
                                </motion.div>
                            </div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                            >
                                {title}
                            </motion.h2>

                            {/* Message */}
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 text-center mb-6"
                            >
                                {message}
                            </motion.p>

                            {/* Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex gap-3"
                            >
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm()
                                        onClose()
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
                                >
                                    {confirmText}
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
