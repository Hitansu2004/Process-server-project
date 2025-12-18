import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'info'
    isVisible: boolean
    onClose: () => void
    duration?: number
}

export default function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    const icons = {
        success: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        info: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }

    const styles = {
        success: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            icon: 'text-white',
            text: 'text-white'
        },
        error: {
            bg: 'bg-gradient-to-r from-red-500 to-red-600',
            icon: 'text-white',
            text: 'text-white'
        },
        info: {
            bg: 'bg-gradient-to-r from-blue-500 to-purple-600',
            icon: 'text-white',
            text: 'text-white'
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    }}
                    className="fixed top-6 right-6 z-50 max-w-md"
                >
                    <div className={`${styles[type].bg} rounded-2xl shadow-2xl backdrop-blur-xl p-4 flex items-center gap-4`}>
                        <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 500,
                                damping: 20,
                                delay: 0.1
                            }}
                            className={`flex-shrink-0 ${styles[type].icon}`}
                        >
                            {icons[type]}
                        </motion.div>
                        <div className="flex-1">
                            <p className={`font-semibold ${styles[type].text}`}>
                                {message}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className={`flex-shrink-0 ${styles[type].text} hover:opacity-80 transition-opacity`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
