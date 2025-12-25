'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import SessionManager from '@/lib/sessionManager'
import ConfirmModal from '@/components/ConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [orderCounts, setOrderCounts] = useState<any>(null)

    // Initialize state from sessionStorage or defaults
    const [statusFilter, setStatusFilter] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_statusFilter') || 'ALL'
        return 'ALL'
    })
    const [dateRange, setDateRange] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_dateRange') || 'all'
        return 'all'
    })
    const [customStartDate, setCustomStartDate] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_customStartDate') || ''
        return ''
    })
    const [customEndDate, setCustomEndDate] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_customEndDate') || ''
        return ''
    })
    const [sortOrder, setSortOrder] = useState(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('dashboard_sortOrder') || 'newest'
        return 'newest'
    })

    // Persist filters to sessionStorage whenever they change
    useEffect(() => {
        sessionStorage.setItem('dashboard_statusFilter', statusFilter)
    }, [statusFilter])

    useEffect(() => {
        sessionStorage.setItem('dashboard_dateRange', dateRange)
    }, [dateRange])

    useEffect(() => {
        sessionStorage.setItem('dashboard_customStartDate', customStartDate)
    }, [customStartDate])

    useEffect(() => {
        sessionStorage.setItem('dashboard_customEndDate', customEndDate)
    }, [customEndDate])

    useEffect(() => {
        sessionStorage.setItem('dashboard_sortOrder', sortOrder)
    }, [sortOrder])

    const clearFilters = () => {
        setStatusFilter('ALL')
        setDateRange('all')
        setCustomStartDate('')
        setCustomEndDate('')
        setSortOrder('newest')
        sessionStorage.removeItem('dashboard_statusFilter')
        sessionStorage.removeItem('dashboard_dateRange')
        sessionStorage.removeItem('dashboard_customStartDate')
        sessionStorage.removeItem('dashboard_customEndDate')
        sessionStorage.removeItem('dashboard_sortOrder')
    }

    useEffect(() => {
        const token = sessionStorage.getItem('token')
        const userData = sessionStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Initialize session manager
        SessionManager.init()

        // Use tenant_user_role_id from user's first role (this is the customer_id in orders)
        const customerId = parsedUser.roles?.[0]?.id || parsedUser.userId
        loadOrders(customerId, token)
    }, [router])

    const [showWelcomeModal, setShowWelcomeModal] = useState(false)
    const [assignedOrders, setAssignedOrders] = useState<any[]>([])

    useEffect(() => {
        const checkNewUserOrders = async () => {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')

            // Check if we just registered/activated (could use a query param or just check orders)
            // For now, let's just check if there are orders assigned to me that are "OPEN" or "ASSIGNED" 
            // and I have 0 completed orders (indicating I'm new).
            // OR simpler: Check for a "welcome" flag in sessionStorage set during login/register

            const isNewUser = sessionStorage.getItem('isNewUser') === 'true'

            if (isNewUser && token && user.userId) {
                try {
                    // Fetch orders assigned to me
                    // If I am a process server
                    if (user.roles?.some((r: any) => r.role === 'PROCESS_SERVER')) {
                        const myOrders = await api.getProcessServerOrders(user.roles[0].id, token)
                        if (myOrders && myOrders.length > 0) {
                            setAssignedOrders(myOrders)
                            setShowWelcomeModal(true)
                            sessionStorage.removeItem('isNewUser') // Show only once
                        }
                    }
                } catch (e) {
                    console.error("Failed to check for assigned orders", e)
                }
            }
        }

        checkNewUserOrders()
    }, [])

    const loadOrders = async (customerId: string, token: string) => {
        try {
            const data = await api.getCustomerOrders(customerId, token)
            setOrders(data)

            // Requirement 8: Fetch order counts
            try {
                const counts = await api.getOrderCounts(customerId, token)
                setOrderCounts(counts)
            } catch (error) {
                console.error('Failed to load order counts:', error)
            }
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateOrderPrice = (order: any): number | null => {
        // Calculate from dropoffs as source of truth
        if (order.dropoffs && order.dropoffs.length > 0) {
            const total = order.dropoffs.reduce((sum: number, dropoff: any) => {
                return sum + (dropoff.finalAgreedPrice || 0)
            }, 0)
            if (total > 0) return total
        }

        // Fallback to order-level prices
        if (order.finalAgreedPrice) return order.finalAgreedPrice
        if (order.customerPaymentAmount) return order.customerPaymentAmount

        return null
    }

    const handleLogout = () => {
        SessionManager.clear()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"></div>
                </motion.div>
            </div>
        )
    }

    // Date range filter logic
    const getDateRangeFilter = () => {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (dateRange) {
            case 'last-week':
                const lastWeek = new Date(startOfDay)
                lastWeek.setDate(lastWeek.getDate() - 7)
                return { start: lastWeek, end: now }
            case 'last-2-weeks':
                const last2Weeks = new Date(startOfDay)
                last2Weeks.setDate(last2Weeks.getDate() - 14)
                return { start: last2Weeks, end: now }
            case 'last-month':
                const lastMonth = new Date(startOfDay)
                lastMonth.setMonth(lastMonth.getMonth() - 1)
                return { start: lastMonth, end: now }
            case 'last-3-months':
                const last3Months = new Date(startOfDay)
                last3Months.setMonth(last3Months.getMonth() - 3)
                return { start: last3Months, end: now }
            case 'custom':
                if (customStartDate && customEndDate) {
                    return {
                        start: new Date(customStartDate),
                        end: new Date(customEndDate + 'T23:59:59')
                    }
                }
                return null
            default:
                return null
        }
    }

    const filteredOrders = orders.filter(order => {
        // Status Filter
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'ASSIGNED') {
                if (order.status !== 'ASSIGNED' && order.status !== 'PARTIALLY_ASSIGNED') return false
            } else if (order.status !== statusFilter) {
                return false
            }
        }

        // Date Range Filter
        const dateFilter = getDateRangeFilter()
        if (dateFilter) {
            const orderDate = new Date(order.createdAt)
            if (orderDate < dateFilter.start || orderDate > dateFilter.end) return false
        }

        return true
    }).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return (
        <div className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">Welcome back, {user?.firstName}!</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/orders/new')}
                            className="relative px-4 py-2.5 text-sm sm:text-base rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
                        >
                            <span className="relative z-10">
                                <span className="sm:hidden">+ Order</span>
                                <span className="hidden sm:inline">+ New Order</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/contacts')}
                            className="px-4 py-2.5 text-sm sm:text-base rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                        >
                            Contacts
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowLogoutModal(true)}
                            className="px-4 py-2.5 text-sm sm:text-base rounded-xl bg-white/90 backdrop-blur-xl border border-red-200 hover:border-red-300 transition-all shadow-sm hover:shadow-md text-red-600 font-medium"
                        >
                            Logout
                        </motion.button>
                    </div>
                </motion.div>

                {/* Requirement 8: Order Status Counts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                >
                    {orderCounts && [
                        { status: 'TOTAL', label: 'Total Orders', color: 'from-blue-600 to-purple-600', icon: '📊' },
                        { status: 'OPEN', label: 'Open', color: 'from-yellow-500 to-orange-500', icon: '📋' },
                        { status: 'BIDDING', label: 'Bidding', color: 'from-purple-500 to-pink-500', icon: '🏷️' },
                        { status: 'ASSIGNED', label: 'Assigned', color: 'from-blue-500 to-cyan-500', icon: '👤' },
                        { status: 'IN_PROGRESS', label: 'In Progress', color: 'from-orange-500 to-red-500', icon: '🚀' },
                        { status: 'COMPLETED', label: 'Completed', color: 'from-green-500 to-emerald-500', icon: '✅' },
                        { status: 'CANCELLED', label: 'Cancelled', color: 'from-gray-500 to-gray-600', icon: '❌' },
                        { status: 'FAILED', label: 'Failed', color: 'from-red-600 to-red-700', icon: '⚠️' },
                    ].map(({ status, label, color, icon }) => (
                        <motion.button
                            key={status}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => status !== 'TOTAL' && setStatusFilter(status)}
                            className={`bg-white/90 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-gray-200 shadow-md hover:shadow-lg transition-all text-left ${status !== 'TOTAL' ? 'cursor-pointer hover:border-gray-300' : 'cursor-default'
                                } ${statusFilter === status ? 'ring-2 ring-blue-500 border-blue-300' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-gray-600 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
                                    {label}
                                </h3>
                                <span className="text-lg sm:text-xl">{icon}</span>
                            </div>
                            <p className={`text-xl sm:text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                                {orderCounts[status] || 0}
                            </p>
                            {status !== 'TOTAL' && (
                                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">
                                    Click to filter
                                </p>
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Filters Toggle Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-gray-300 text-sm font-medium w-full sm:w-auto justify-center sm:justify-start shadow-sm hover:shadow-md transition-all"
                    >
                        <motion.svg
                            animate={{ rotate: showFilters ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                        <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                        {(statusFilter !== 'ALL' || dateRange !== 'all') && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full font-semibold"
                            >
                                Active
                            </motion.span>
                        )}
                    </motion.button>
                </motion.div>

                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="OPEN">Open</option>
                                            <option value="BIDDING">Bidding</option>
                                            <option value="ASSIGNED">Assigned</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="FAILED">Failed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Date Range</label>
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="last-week">Last Week</option>
                                            <option value="last-2-weeks">Last 2 Weeks</option>
                                            <option value="last-month">Last Month</option>
                                            <option value="last-3-months">Last 3 Months</option>
                                            <option value="custom">Custom Range</option>
                                        </select>
                                    </div>
                                    {dateRange === 'custom' && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2, delay: 0.05 }}
                                            >
                                                <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">End Date</label>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </motion.div>
                                        </>
                                    )}
                                    <div className={dateRange === 'custom' ? 'sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
                                        <div>
                                            <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Sort By</label>
                                            <select
                                                value={sortOrder}
                                                onChange={(e) => setSortOrder(e.target.value)}
                                                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">&nbsp;</label>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={clearFilters}
                                                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-sm font-medium text-gray-700 transition-all shadow-sm hover:shadow-md"
                                            >
                                                Clear Filters
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Orders List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg"
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Your Orders
                        </h2>
                        <span className="text-gray-500 text-xs sm:text-sm font-medium">
                            Showing {filteredOrders.length} of {orders.length} orders
                        </span>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 sm:py-16"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="mb-4 text-gray-500 text-sm sm:text-base">No orders match your filters</p>
                            {orders.length === 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/orders/new')}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                                >
                                    Create Your First Order
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredOrders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileHover={{ scale: 1.01, y: -2 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => router.push(`/orders/${order.id}`)}
                                        className="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-blue-300 cursor-pointer transition-all shadow-sm hover:shadow-lg group overflow-hidden"
                                    >
                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                                        <div className="relative z-10 flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                                                    {order.orderNumber}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 break-words flex items-center gap-2">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{order.pickupAddress}</span>
                                                    <span className="flex-shrink-0">→ {order.totalDropoffs} dropoff(s)</span>
                                                </p>
                                            </div>
                                            <motion.span
                                                whileHover={{ scale: 1.05 }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${order.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                                                    order.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700' :
                                                        order.status === 'BIDDING' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700' :
                                                            'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700'
                                                    }`}
                                            >
                                                {order.status === 'PARTIALLY_ASSIGNED' ? 'ASSIGNED' : order.status}
                                            </motion.span>
                                        </div>
                                        {(() => {
                                            const price = calculateOrderPrice(order)
                                            return price && (
                                                <p className="relative z-10 mt-3 text-xs sm:text-sm flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="font-semibold text-green-600">${price}</span>
                                                </p>
                                            )
                                        })()}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title="Logout Confirmation"
                message="Are you sure you want to logout?"
                confirmText="Yes, Logout"
                cancelText="Cancel"
            />
            {/* Welcome Modal for New Users */}
            <AnimatePresence>
                {showWelcomeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🎉</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h2>
                                <p className="text-gray-600 mb-6">
                                    Your account is now active. We found <strong>{assignedOrders.length} orders</strong> already assigned to you!
                                </p>

                                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left max-h-60 overflow-y-auto">
                                    {assignedOrders.map((order, i) => (
                                        <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                            <div>
                                                <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                Assigned
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowWelcomeModal(false)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                                >
                                    View My Orders
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
