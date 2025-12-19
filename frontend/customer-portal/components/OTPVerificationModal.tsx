'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Shield, X, AlertCircle, CheckCircle, Loader } from 'lucide-react'

interface OTPVerificationModalProps {
    isOpen: boolean
    email: string
    onVerify: (otp: string) => Promise<boolean>
    onClose: () => void
    onResendOTP: () => Promise<void>
}

export default function OTPVerificationModal({
    isOpen,
    email,
    onVerify,
    onClose,
    onResendOTP
}: OTPVerificationModalProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [countdown, setCountdown] = useState(60)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (isOpen && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isOpen, countdown])

    useEffect(() => {
        if (isOpen) {
            inputRefs.current[0]?.focus()
        }
    }, [isOpen])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        setError('')

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-verify when all filled
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerify(newOtp.join(''))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        if (!/^\d+$/.test(pastedData)) return

        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
        setOtp(newOtp)

        if (pastedData.length === 6) {
            handleVerify(pastedData)
        }
    }

    const handleVerify = async (otpValue: string) => {
        setError('')
        setLoading(true)

        try {
            const isValid = await onVerify(otpValue)
            if (isValid) {
                setSuccess(true)
                setTimeout(() => {
                    // Modal will close automatically on success
                }, 500)
            } else {
                setError('Invalid OTP. Please try again.')
                setOtp(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
            }
        } catch (err) {
            setError('Failed to verify OTP. Please try again.')
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        setError('')
        try {
            await onResendOTP()
            setCountdown(60)
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch (err) {
            setError('Failed to resend OTP. Please try again.')
        } finally {
            setResending(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>

                            {/* Header */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center mb-6"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4"
                                >
                                    <Shield className="text-white" size={32} />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Verify Your Email
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    We've sent a 6-digit code to
                                </p>
                                <p className="text-blue-600 font-semibold text-sm flex items-center justify-center gap-2 mt-1">
                                    <Mail size={16} />
                                    {email}
                                </p>
                            </motion.div>

                            {/* OTP Input */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-6"
                            >
                                <div className="flex gap-2 justify-center mb-4">
                                    {otp.map((digit, index) => (
                                        <motion.input
                                            key={index}
                                            ref={el => inputRefs.current[index] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            disabled={loading || success}
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.05, type: 'spring' }}
                                            className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
                                                digit
                                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border-gray-300 bg-white'
                                            } ${
                                                success ? 'border-green-500 bg-green-50' : ''
                                            } focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-50`}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                                    >
                                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success Message */}
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="text-green-500" size={20} />
                                        <p className="text-green-700 font-semibold">Verified Successfully!</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Loading State */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center gap-2 mb-4"
                                >
                                    <Loader className="animate-spin text-blue-500" size={20} />
                                    <span className="text-gray-600">Verifying...</span>
                                </motion.div>
                            )}

                            {/* Resend OTP */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                {countdown > 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Resend code in <span className="font-semibold text-blue-600">{countdown}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {resending ? 'Sending...' : 'Resend OTP'}
                                    </button>
                                )}
                            </motion.div>

                            {/* Info */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xs text-gray-500 text-center mt-4"
                            >
                                Please check your spam folder if you don't receive the code
                            </motion.p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
