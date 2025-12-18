'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GoogleSignInButton from '@/components/GoogleSignInButton'

export default function AdminRegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [step, setStep] = useState<'form' | 'otp'>('form')
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    })

    // Get tenant from session or URL
    const tenantId = typeof window !== 'undefined'
        ? sessionStorage.getItem('selectedTenant') || new URLSearchParams(window.location.search).get('tenant') || 'tenant-1'
        : 'tenant-1'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        // Check if it's a Gmail address
        const isGmail = formData.email.toLowerCase().endsWith('@gmail.com')

        if (!isGmail && step === 'form') {
            // Non-Gmail users need OTP verification
            await sendOtp()
            return
        }

        // If OTP verified or Gmail user, proceed with registration
        await registerUser()
    }

    const sendOtp = async () => {
        setLoading(true)
        try {
            const response = await fetch('http://localhost:8080/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            })

            const data = await response.json()

            if (response.ok) {
                setOtpSent(true)
                setStep('otp')
                setError('')
            } else {
                setError(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            setError('Failed to send OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const verifyOtpAndRegister = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP')
            return
        }

        setLoading(true)
        try {
            // First verify OTP
            const verifyResponse = await fetch('http://localhost:8080/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp
                })
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.verified) {
                // OTP verified, now register
                await registerUser()
            } else {
                setError(verifyData.error || 'Invalid OTP')
                setLoading(false)
            }
        } catch (err) {
            setError('Verification failed. Please try again.')
            setLoading(false)
        }
    }

    const registerUser = async () => {
        setLoading(true)
        try {
            const response = await fetch('http://localhost:8080/api/auth/register/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenantId,
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber
                })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/login?registered=true')
                }, 2000)
            } else {
                setError(data.error || 'Registration failed')
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credential: string) => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch('http://localhost:8080/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken: credential,
                    tenantId: tenantId,
                    role: 'ADMIN'
                })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/login?registered=true')
                }, 2000)
            } else {
                setError(data.error || 'Google registration failed')
            }
        } catch (err) {
            setError('Failed to register with Google')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError('Google Sign-In failed')
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="card max-w-md w-full text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
            <div className="card max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Registration</h1>
                    <p className="text-gray-600">Create admin account for tenant management</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Google Sign-In Button */}
                <div className="mb-6">
                    <GoogleSignInButton 
                        onSuccess={handleGoogleSuccess} 
                        onError={handleGoogleError}
                        text="signup_with"
                    />
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or register with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 'form' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Min 6 characters"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg font-semibold"
                    >
                        {loading ? (formData.email.toLowerCase().endsWith('@gmail.com') ? 'Creating Account...' : 'Sending OTP...') : (formData.email.toLowerCase().endsWith('@gmail.com') ? 'Create Admin Account' : 'Send OTP & Continue')}
                    </button>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                                <p className="text-gray-600">We've sent a 6-digit verification code to:</p>
                                <p className="font-semibold text-gray-900 mt-1">{formData.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                    Enter Verification Code
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="000000"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">Code expires in 10 minutes</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('form')
                                        setOtp('')
                                        setError('')
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={verifyOtpAndRegister}
                                    disabled={loading || otp.length !== 6}
                                    className="flex-1 btn-primary py-3 font-semibold disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Register'}
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={sendOtp}
                                    disabled={loading}
                                    className="text-sm text-primary hover:underline font-semibold"
                                >
                                    Didn't receive code? Resend
                                </button>
                            </div>
                        </>
                    )}
                </form>

                {step === 'form' && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={() => router.push('/login')}
                                className="text-primary hover:underline font-semibold"
                            >
                                Login here
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
