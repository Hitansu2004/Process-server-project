'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import ConfirmModal from '@/components/ConfirmModal'

import AssignedOrdersModal from '@/components/AssignedOrdersModal'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [assignedOrders, setAssignedOrders] = useState<any[]>([])
    const [availableOrders, setAvailableOrders] = useState<any[]>([])
    const [myBids, setMyBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [assignedFilter, setAssignedFilter] = useState('ALL')
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [showAssignedModal, setShowAssignedModal] = useState(false)
    const [isGlobal, setIsGlobal] = useState(false)
    const [toggleLoading, setToggleLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    })

    const filteredAssignedOrders = assignedOrders.filter(order => {
        if (assignedFilter === 'ALL') return true

        // Check dropoff types
        // If any dropoff is GUIDED, it's considered a Direct Assignment (at least partially)
        // If all dropoffs are AUTOMATED, it's a Bidding Won order

        const hasGuided = order.dropoffs?.some((d: any) => d.dropoffType === 'GUIDED')

        if (assignedFilter === 'DIRECT') {
            return hasGuided
        } else if (assignedFilter === 'BIDDING') {
            return !hasGuided // If no guided dropoffs, it must be bidding (or empty/legacy)
        }
        return true
    })

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        if (!token || !userData) {
            router.push('/login')
            return
        }
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Find the PROCESS_SERVER role to get tenantUserRoleId
        const processServerRole = parsedUser.roles.find((r: any) => r.role === 'PROCESS_SERVER')

        if (processServerRole && processServerRole.id) {
            loadDashboardData(processServerRole.id, token)
        } else {
            console.error('No PROCESS_SERVER role found for user')
            setLoading(false)
        }
    }, [router])

    const loadDashboardData = async (tenantUserRoleId: string, token: string) => {
        try {
            // 1. Get Profile to get the actual ProcessServerID (profile.id)
            const profileData = await api.getProcessServerProfile(tenantUserRoleId, token)
            setProfile(profileData)
            setIsGlobal(profileData.isGlobal || false)

            const processServerId = profileData.id

            // Load assigned orders
            const assigned = await api.getDeliveryPersonOrders(processServerId, token)
            setAssignedOrders(assigned)

            // Check for new assignments to show popup
            const newAssignments = assigned.filter((o: any) => o.status === 'ASSIGNED')
            const hasSeenPopup = sessionStorage.getItem('hasSeenAssignedPopup')

            if (newAssignments.length > 0 && !hasSeenPopup) {
                setShowAssignedModal(true)
                sessionStorage.setItem('hasSeenAssignedPopup', 'true')
            }

            // Load available orders
            const available = await api.getAvailableOrders(token)
            setAvailableOrders(available)

            // Load my bids
            const bids = await api.getMyBids(processServerId, token)
            setMyBids(bids)
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleGlobal = async () => {
        setToggleLoading(true)
        try {
            const token = localStorage.getItem('token')
            const processServerRole = user.roles.find((r: any) => r.role === 'PROCESS_SERVER')

            if (!token || !processServerRole) {
                throw new Error('Authentication required')
            }

            const newGlobalStatus = !isGlobal
            await api.toggleGlobalVisibility(processServerRole.id, newGlobalStatus, token)

            setIsGlobal(newGlobalStatus)
            showToast(
                newGlobalStatus
                    ? 'You are now visible in the global directory! 🌍'
                    : 'You are no longer visible in the global directory',
                'success'
            )
        } catch (error) {
            console.error('Failed to toggle global visibility:', error)
            showToast('Failed to update global visibility', 'error')
        } finally {
            setToggleLoading(false)
        }
    }

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, visible: true })
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
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
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full relative z-10"
            />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 relative overflow-hidden">
            <AssignedOrdersModal
                isOpen={showAssignedModal}
                onClose={() => setShowAssignedModal(false)}
                orders={assignedOrders.filter(o => o.status === 'ASSIGNED')}
            />

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
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -90, 0],
                }}
                transition={{ duration: 18, repeat: Infinity }}
                className="absolute top-1/2 right-1/3 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast.visible && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-4 right-4 z-50"
                        >
                            <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
                                    'bg-red-500/90 border-red-400 text-white'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {toast.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5" />
                                    )}
                                    <p className="font-medium">{toast.message}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Process Server Dashboard</h1>
                        <p className="text-gray-600 mt-2 text-lg">Welcome, {user?.firstName}!</p>
                        {profile && (
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-yellow-500 font-bold text-lg">★ {profile.currentRating}</span>
                                <span className="text-sm text-gray-500">({profile.totalOrdersAssigned} Orders)</span>

                                {/* Global Visibility Toggle */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                                    className="ml-6"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleToggleGlobal}
                                        disabled={toggleLoading}
                                        className={`relative flex items-center gap-3 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all overflow-hidden ${isGlobal
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                                : 'bg-white/90 backdrop-blur-xl text-gray-700 border-2 border-gray-300 hover:border-green-500'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {/* Animated background shimmer when active */}
                                        {isGlobal && !toggleLoading && (
                                            <motion.div
                                                animate={{
                                                    x: ['-100%', '100%'],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            />
                                        )}

                                        {toggleLoading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                />
                                                <span className="relative z-10">Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <motion.div
                                                    animate={isGlobal ? {
                                                        rotate: [0, 360],
                                                        scale: [1, 1.2, 1]
                                                    } : {}}
                                                    transition={{
                                                        duration: 0.6,
                                                        ease: "easeOut"
                                                    }}
                                                >
                                                    <Globe className="w-5 h-5 relative z-10" />
                                                </motion.div>
                                                <span className="relative z-10">
                                                    {isGlobal ? 'Visible Globally' : 'Go Global'}
                                                </span>
                                                {isGlobal && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{
                                                            scale: [0, 1.2, 1],
                                                            opacity: [0, 1, 1]
                                                        }}
                                                        transition={{ duration: 0.4 }}
                                                        className="w-2 h-2 bg-white rounded-full relative z-10 shadow-lg"
                                                    >
                                                        <motion.div
                                                            animate={{
                                                                scale: [1, 1.5, 1],
                                                                opacity: [0.8, 0, 0.8]
                                                            }}
                                                            transition={{
                                                                duration: 1.5,
                                                                repeat: Infinity
                                                            }}
                                                            className="absolute inset-0 bg-white rounded-full"
                                                        />
                                                    </motion.div>
                                                )}
                                            </>
                                        )}
                                    </motion.button>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-xs text-gray-500 mt-2 text-center"
                                    >
                                        {isGlobal ? (
                                            <span className="flex items-center justify-center gap-1">
                                                <motion.span
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="w-1.5 h-1.5 bg-green-500 rounded-full"
                                                />
                                                Customers can find you
                                            </span>
                                        ) : (
                                            'Make yourself discoverable'
                                        )}
                                    </motion.p>
                                </motion.div>
                            </div>
                        )}
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex gap-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/orders')}
                            className="btn-primary shadow-lg hover:shadow-xl transition-all"
                        >
                            Browse Orders
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/bids')}
                            className="px-6 py-3 rounded-lg glass hover:bg-primary/20 transition shadow-md"
                        >
                            My Bids
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowLogoutModal(true)}
                            className="px-6 py-3 rounded-lg glass hover:bg-red-500/20 transition shadow-md"
                        >
                            Logout
                        </motion.button>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">Total Assigned</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {profile?.totalOrdersAssigned || 0}
                        </p>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">Total Completed</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {profile?.successfulDeliveries || 0}
                        </p>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">Total Earnings</h3>
                        <p className="text-3xl font-bold text-green-400">
                            ${assignedOrders
                                .filter(order => order.status !== 'FAILED' && order.status !== 'CANCELLED')
                                .reduce((sum, order) => sum + (order.processServerPayout || (order.finalAgreedPrice * 0.85) || 0), 0)
                                .toFixed(2)}
                        </p>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">Total Pending</h3>
                        <p className="text-3xl font-bold text-yellow-500">
                            {(profile?.totalOrdersAssigned || 0) - (profile?.successfulDeliveries || 0)}
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">Success Rate</h3>
                        <p className="text-3xl font-bold text-blue-500">
                            {profile ? `${Math.min(((profile.successfulDeliveries / (profile.totalOrdersAssigned || 1)) * 100), 100).toFixed(1)}%` : '0.0%'}
                        </p>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">Available Orders</h3>
                        <p className="text-3xl font-bold text-primary">
                            {availableOrders.length}
                        </p>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">My Bids (Pending)</h3>
                        <p className="text-3xl font-bold text-yellow-500">
                            {myBids.filter(b => b.status === 'PENDING').length}
                        </p>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <h3 className="text-gray-500 text-sm mb-2">My Rating</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-yellow-500">
                                {profile?.currentRating || '0.0'}
                            </p>
                            <span className="text-sm text-gray-400">/ 5.0</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="card bg-white/80 backdrop-blur-xl shadow-lg"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">My Assigned Deliveries</h2>
                        <div className="flex bg-black/20 p-1 rounded-lg">
                            <button
                                onClick={() => setAssignedFilter('ALL')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${assignedFilter === 'ALL' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setAssignedFilter('DIRECT')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${assignedFilter === 'DIRECT' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Direct Assigned
                            </button>
                            <button
                                onClick={() => setAssignedFilter('BIDDING')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${assignedFilter === 'BIDDING' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Bidding Won
                            </button>
                        </div>
                    </div>

                    {filteredAssignedOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No deliveries found for this filter.</p>
                            {assignedOrders.length === 0 && (
                                <p className="mt-2 text-sm">Browse available orders and place bids to get started!</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAssignedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    className="glass rounded-lg p-4 hover:bg-white/5 cursor-pointer transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                                {/* Show badge for order type */}
                                                {order.dropoffs?.some((d: any) => d.dropoffType === 'GUIDED') ? (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                                        DIRECT
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                                        BID
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">{order.customerName}</p>
                                            <p className="text-sm text-gray-500 mt-1">{order.pickupAddress}</p>
                                            <p className="text-sm text-green-600 font-medium mt-2">Your Earnings: ${order.processServerPayout || order.finalAgreedPrice}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    localStorage.clear()
                    router.push('/login')
                }}
                title="Logout Confirmation"
                message="Are you sure you want to logout?"
                confirmText="Yes, Logout"
                cancelText="Cancel"
            />
        </div>
    )
}
