'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, LogIn, CheckCircle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import SessionManager from '@/lib/sessionManager'
import OTPVerificationModal from '@/components/OTPVerificationModal'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [showOTPModal, setShowOTPModal] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [pendingToken, setPendingToken] = useState('')
    const [pendingUserData, setPendingUserData] = useState<any>(null)

    const tenantId = typeof window !== 'undefined'
        ? sessionStorage.getItem('selectedTenant') || searchParams?.get('tenant') || 'tenant-main-001'
        : 'tenant-main-001'

    useEffect(() => {
        if (searchParams?.get('timeout') === 'true') {
            setError('Session expired due to inactivity. Please login again.')
        } else if (searchParams?.get('registered') === 'true') {
            setSuccessMessage('Registration successful! Please login with your credentials.')
        }

        if (typeof window !== 'undefined' && tenantId) {
            sessionStorage.setItem('selectedTenant', tenantId)
        }
    }, [searchParams, tenantId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')
        setLoading(true)

        try {
            const response = await api.login(email, password, tenantId)

            // Check if email is verified
            if (response.emailVerified === false || response.emailVerified === 0) {
                // Store user data temporarily
                setPendingToken(response.token)
                setPendingUserData(response)
                setUserEmail(email)

                // Send OTP to email
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp?email=${encodeURIComponent(email)}`, {
                        method: 'POST',
                    })
                    setShowOTPModal(true)
                } catch (otpError) {
                    console.error('Error sending OTP:', otpError)
                    setError('Failed to send OTP. Please try again.')
                }
            } else {
                // Email already verified, proceed with login
                // Check if user has CUSTOMER role
                const hasCustomerRole = response.roles?.some((role: any) => role.role === 'CUSTOMER')
                if (!hasCustomerRole) {
                    setError('Access denied. This portal is for customers only. Please use the correct portal for your role.')
                    setLoading(false)
                    return
                }
                
                sessionStorage.setItem('token', response.token)
                sessionStorage.setItem('user', JSON.stringify(response))
                sessionStorage.setItem('selectedTenant', tenantId)

                SessionManager.init()

                router.push('/dashboard')
            }
        } catch (err) {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    const handleOTPVerify = async (otp: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp?email=${encodeURIComponent(userEmail)}&otp=${otp}`,
                {
                    method: 'POST',
                }
            )

            if (response.ok) {
                // OTP verified successfully, now complete the login
                // Check if user has CUSTOMER role
                const hasCustomerRole = pendingUserData.roles?.some((role: any) => role.role === 'CUSTOMER')
                if (!hasCustomerRole) {
                    setError('Access denied. This portal is for customers only. Please use the correct portal for your role.')
                    setShowOTPModal(false)
                    return false
                }
                
                sessionStorage.setItem('token', pendingToken)
                sessionStorage.setItem('user', JSON.stringify({ ...pendingUserData, emailVerified: true }))
                sessionStorage.setItem('selectedTenant', tenantId)

                SessionManager.init()

                setShowOTPModal(false)
                router.push('/dashboard')
                return true
            } else {
                throw new Error('OTP verification failed')
            }
        } catch (error) {
            console.error('OTP verification error:', error)
            return false
        }
    }

    const handleResendOTP = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp?email=${encodeURIComponent(userEmail)}`, {
                method: 'POST',
            })
        } catch (error) {
            console.error('Error resending OTP:', error)
            throw error
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90],
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border border-white/50"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-blue-50 rounded-2xl">
                            <Sparkles className="text-blue-600 w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 text-lg">Login to your account</p>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3"
                        >
                            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                <span className="text-base">Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-base">Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Register Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center"
                >
                    <p className="text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <button
                            onClick={() => router.push('/register')}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                        >
                            Create an account
                        </button>
                    </p>
                </motion.div>
            </motion.div>

            {/* OTP Verification Modal */}
            <OTPVerificationModal
                isOpen={showOTPModal}
                email={userEmail}
                onVerify={handleOTPVerify}
                onClose={() => {
                    setShowOTPModal(false)
                    setPendingToken('')
                    setPendingUserData(null)
                }}
                onResendOTP={handleResendOTP}
            />
        </div>
    )
}
