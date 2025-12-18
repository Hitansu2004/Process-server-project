'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Phone, Send, CheckCircle, AlertCircle, Sparkles, ArrowRight, MapPin, Briefcase } from 'lucide-react'
import { api } from '@/lib/api'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [sendingOtp, setSendingOtp] = useState(false)
    const [emailLocked, setEmailLocked] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        operatingZipCodes: '',
        tenantId: ''
    })

    const isGmail = (email: string) => email.toLowerCase().endsWith('@gmail.com')

    // Fetch tenant ID and pre-fill email from URL on mount
    useEffect(() => {
        // Check for email parameter in URL
        const urlParams = new URLSearchParams(window.location.search)
        const emailParam = urlParams.get('email')
        
        if (emailParam) {
            setFormData(prev => ({ ...prev, email: emailParam }))
            setEmailLocked(true)
        }
        
        api.getTenants()
            .then(tenants => {
                if (tenants.length > 0) {
                    setFormData(prev => ({ ...prev, tenantId: tenants[0].id }))
                } else {
                    setError('No active tenants found. Please contact support.')
                }
            })
            .catch(err => {
                console.error('Failed to fetch tenants:', err)
                setError('Failed to load system configuration')
            })
    }, [])

    const sendOtp = async () => {
        setError('')
        setSendingOtp(true)

        try {
            const response = await fetch('http://localhost:8080/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            })

            const data = await response.json()

            if (response.ok) {
                setOtpSent(true)
                setError('')
            } else {
                setError(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setSendingOtp(false)
        }
    }

    const verifyOtpAndRegister = async () => {
        setError('')
        setLoading(true)

        try {
            const verifyResponse = await fetch('http://localhost:8080/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp
                })
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
                setError(verifyData.error || 'Invalid OTP')
                setLoading(false)
                return
            }

            await registerUser()
        } catch (err) {
            setError('Failed to verify OTP')
            setLoading(false)
        }
    }

    const registerUser = async () => {
        try {
            await api.registerProcessServer(formData)
            setSuccess(true)
            setTimeout(() => {
                router.push('/login?registered=true')
            }, 2000)
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (!formData.tenantId) {
            setError('System configuration missing. Please refresh the page.')
            return
        }

        if (isGmail(formData.email)) {
            setLoading(true)
            await registerUser()
        } else {
            if (!otpSent) {
                setError('Please send and verify OTP first')
                return
            }
            if (!otp) {
                setError('Please enter the OTP')
                return
            }
            await verifyOtpAndRegister()
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="bg-white rounded-3xl shadow-2xl p-12 max-w-md"
                    >
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ 
                                duration: 0.6,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                            className="text-green-500 text-7xl mb-6 flex justify-center"
                        >
                            <CheckCircle size={80} />
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Registration Submitted!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Your process server application has been submitted for admin approval.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            You will be notified once your account is approved.
                        </p>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-sm text-gray-500"
                        >
                            Redirecting to login...
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90],
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-20 right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 max-w-2xl w-full relative z-10 border border-white/20"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-4"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="inline-block mb-2"
                    >
                        <Briefcase className="text-green-600" size={32} />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                        Process Server Registration
                    </h1>
                    <p className="text-gray-600 text-sm">Join our network of professional servers</p>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2"
                        >
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                First Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                    placeholder="John"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Last Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                    placeholder="Doe"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="you@example.com"
                                disabled={otpSent || emailLocked}
                            />
                        </div>
                        
                        {/* Email Locked Indicator */}
                        {emailLocked && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 p-2 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center gap-2"
                            >
                                <Lock className="text-green-500" size={18} />
                                <p className="text-sm text-green-700 font-medium">
                                    Email pre-filled from invitation
                                </p>
                            </motion.div>
                        )}

                        {/* Send OTP Button for Regular or Invited Users */}
                        {!isGmail(formData.email) && formData.email && formData.firstName && formData.lastName && !otpSent && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={sendOtp}
                                disabled={sendingOtp}
                                className="mt-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                            >
                                {sendingOtp ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Send size={20} />
                                        </motion.div>
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send OTP to Email
                                    </>
                                )}
                            </motion.button>
                        )}

                        {/* OTP Sent Success Message */}
                        {otpSent && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 p-2 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center gap-2"
                            >
                                <CheckCircle className="text-green-500" size={18} />
                                <p className="text-sm text-green-700 font-medium">
                                    OTP sent! Check your email inbox
                                </p>
                            </motion.div>
                        )}

                        {/* Gmail Detected Message */}
                        {isGmail(formData.email) && formData.email && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center gap-2"
                            >
                                <CheckCircle className="text-blue-500" size={18} />
                                <p className="text-sm text-blue-700 font-medium">
                                    Gmail detected - OTP not required
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* OTP Input */}
                    <AnimatePresence>
                        {!isGmail(formData.email) && otpSent && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-white/50 text-center text-xl font-bold tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 text-center">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Phone Number & Operating Zip Codes */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Operating Zip Codes
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.operatingZipCodes}
                                    onChange={(e) => setFormData({ ...formData, operatingZipCodes: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                    placeholder="90210, 90001"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                    placeholder="Min 6 characters"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                    placeholder="Repeat password"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || (!isGmail(formData.email) && !otpSent)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                                />
                                Submitting Application...
                            </>
                        ) : (
                            <>
                                Register as Process Server
                                <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>

                    {!isGmail(formData.email) && !otpSent && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-gray-500 text-center"
                        >
                            Please send and verify OTP to enable registration
                        </motion.p>
                    )}
                </form>

                {/* Login Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 text-center"
                >
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="text-green-600 hover:text-emerald-600 font-semibold transition-colors"
                        >
                            Login here
                        </button>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
