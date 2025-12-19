'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertCircle, ArrowRight, Briefcase, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        // Check for registration success message
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('registered') === 'true') {
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 5000)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await api.login(email, password)
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response))

            // Fetch process server profile to get the profile ID
            try {
                // Extract tenantUserRoleId from the first role (assuming single tenant context for now)
                const tenantUserRoleId = response.roles?.[0]?.id
                if (!tenantUserRoleId) throw new Error('No tenant role found')

                const profileData = await api.getProcessServerProfile(tenantUserRoleId, response.token)
                // Store profile ID for use in bidding and attempts
                const userWithProfile = { ...response, processServerProfileId: profileData.id }
                localStorage.setItem('user', JSON.stringify(userWithProfile))
            } catch (profileError) {
                console.error('Failed to fetch profile:', profileError)
                // Continue anyway - will try to use user ID as fallback
            }

            router.push('/dashboard')
        } catch (err) {
            setError('Invalid credentials. Please check your email and password.')
        } finally {
            setLoading(false)
        }
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
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 border border-white/20"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="inline-block mb-3"
                    >
                        <Briefcase className="text-green-600" size={40} />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        ProcessServe
                    </h1>
                    <p className="text-gray-600">Delivery Portal</p>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3"
                        >
                            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-green-700 font-semibold text-sm">Registration Successful!</p>
                                <p className="text-green-600 text-xs mt-1">Your account is pending admin approval. You'll be notified once approved.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                        >
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                placeholder="server1@example.com"
                                required
                            />
                        </div>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                placeholder="••••••••"
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
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                                />
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login
                                <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Register Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-center"
                >
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={() => router.push('/register')}
                            className="text-green-600 hover:text-emerald-600 font-semibold transition-colors"
                        >
                            Register here
                        </button>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
