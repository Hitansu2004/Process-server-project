'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import SessionManager from '@/lib/sessionManager'
import ConfirmModal from '@/components/ConfirmModal'
import OrderNameModal from '@/components/orders/OrderNameModal'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter, LogOut, Users, Package, Clock, CheckCircle2, Search, Edit2 } from 'lucide-react'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [drafts, setDrafts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [showOrderNameModal, setShowOrderNameModal] = useState(false)
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
    const [editingOrderName, setEditingOrderName] = useState('')
    const [orderCounts, setOrderCounts] = useState<any>(null)
    const [draftCount, setDraftCount] = useState<number>(0)
    const [searchQuery, setSearchQuery] = useState('')

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

    // Persist filters to sessionStorage
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
        setSearchQuery('')
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
        SessionManager.init()

        const customerId = parsedUser.roles?.[0]?.id || parsedUser.userId
        loadOrders(customerId, token)
    }, [router])

    const loadOrders = async (customerId: string, token: string) => {
        try {
            const data = await api.getCustomerOrders(customerId, token)
            setOrders(data)

            try {
                const counts = await api.getOrderCounts(customerId, token)
                setOrderCounts(counts)
            } catch (error) {
                console.error('Failed to load order counts:', error)
            }

            try {
                const draftCountData = await api.getDraftCount(customerId, token)
                setDraftCount(draftCountData.count || 0)
            } catch (error) {
                console.error('Failed to load draft count:', error)
            }

            try {
                const draftsData = await api.getCustomerDrafts(customerId, token)
                setDrafts(draftsData || [])
            } catch (error) {
                console.error('Failed to load drafts:', error)
                setDrafts([])
            }
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateOrderPrice = (order: any): number | null => {
        if (order.customerPaymentAmount) {
            return parseFloat(order.customerPaymentAmount);
        }

        if (order.recipients && order.recipients.length > 0) {
            const subtotal = order.recipients.reduce((sum: number, recipient: any) => {
                const isAutomatedPending = recipient.recipientType === 'AUTOMATED' &&
                    (recipient.status === 'OPEN' || recipient.status === 'BIDDING');

                if (isAutomatedPending) {
                    const rushFee = recipient.rushService ? 50 : 0;
                    const remoteFee = recipient.remoteLocation ? 30 : 0;
                    return sum + rushFee + remoteFee;
                } else {
                    const recipientTotal = parseFloat(recipient.finalAgreedPrice) || 0;
                    return sum + recipientTotal;
                }
            }, 0);

            if (subtotal > 0) {
                const processingFee = subtotal * 0.03;
                return subtotal + processingFee;
            }
        }

        if (order.finalAgreedPrice) {
            return parseFloat(order.finalAgreedPrice);
        }

        return null;
    }

    const determineStartStep = (order: any): number => {
        const hasDocumentData = order.caseNumber || order.jurisdiction || order.documentType || order.deadline
        const hasRecipients = order.recipients && order.recipients.length > 0

        if (!hasDocumentData) return 1
        if (!hasRecipients) return 2
        return 3
    }

    const handleOrderClick = (order: any) => {
        router.push(`/orders/${order.id}`)
    }

    const handleLogout = () => {
        SessionManager.clear()
        router.push('/login')
    }

    const handleNewOrderClick = () => {
        setShowOrderNameModal(true)
    }

    const handleOrderNameContinue = (orderName: string) => {
        setShowOrderNameModal(false)
        // Navigate to order creation with order name in URL
        router.push(`/orders/create?new=true&orderName=${encodeURIComponent(orderName)}`)
    }

    const handleEditOrderName = async (orderId: string, currentName: string) => {
        setEditingOrderId(orderId)
        setEditingOrderName(currentName || '')
    }

    const handleSaveOrderName = async (orderId: string) => {
        try {
            const token = sessionStorage.getItem('token')
            if (!token) return

            await api.updateOrderName(orderId, editingOrderName, token)

            // Reload orders to reflect the change
            const userData = sessionStorage.getItem('user')
            if (userData) {
                const parsedUser = JSON.parse(userData)
                const customerId = parsedUser.roles?.[0]?.id || parsedUser.userId
                await loadOrders(customerId, token)
            }

            setEditingOrderId(null)
            setEditingOrderName('')
        } catch (error) {
            console.error('Failed to update order name:', error)
            alert('Failed to update order name. Please try again.')
        }
    }

    const handleCancelEditName = () => {
        setEditingOrderId(null)
        setEditingOrderName('')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full"></div>
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

    // Merge orders and drafts
    const allItems = [
        ...orders.map(order => ({ ...order, itemType: 'order' })),
        ...drafts.map(draft => ({
            ...draft,
            itemType: 'draft',
            status: 'DRAFT',
            orderNumber: draft.draftName,
            caseNumber: draft.documentData ? JSON.parse(draft.documentData).caseNumber : null,
            jurisdiction: draft.documentData ? JSON.parse(draft.documentData).jurisdiction : null,
            documentType: draft.documentData ? JSON.parse(draft.documentData).documentType : null,
            recipients: draft.recipientsData ? JSON.parse(draft.recipientsData) : [],
            createdAt: draft.updatedAt || draft.createdAt
        }))
    ]

    const filteredOrders = allItems.filter(item => {
        // Status Filter
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'ASSIGNED') {
                if (item.status !== 'ASSIGNED' && item.status !== 'PARTIALLY_ASSIGNED') return false
            } else if (item.status !== statusFilter) {
                return false
            }
        }

        // Comprehensive Search Filter - Search across ALL order/draft fields
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const price = item.itemType === 'order' ? calculateOrderPrice(item) : null

            // Search order/draft-level fields
            const matchesOrderNumber = item.orderNumber?.toLowerCase().includes(query)
            const matchesCaseNumber = item.caseNumber?.toLowerCase().includes(query)
            const matchesJurisdiction = item.jurisdiction?.toLowerCase().includes(query)
            const matchesDocumentType = item.documentType?.toLowerCase().includes(query)
            const matchesOrderInstructions = item.specialInstructions?.toLowerCase().includes(query)
            const matchesPrice = price?.toString().includes(query.replace('$', ''))
            const matchesDraftName = item.draftName?.toLowerCase().includes(query)

            // Search recipient details
            const matchesRecipient = item.recipients?.some((recipient: any) => {
                const recipientName = recipient.recipientName?.toLowerCase() || ''
                const recipientAddress = recipient.recipientAddress?.toLowerCase() || ''
                const recipientInstructions = recipient.specialInstructions?.toLowerCase() || ''
                const recipientCity = recipient.city?.toLowerCase() || ''
                const recipientState = recipient.state?.toLowerCase() || ''
                const recipientZip = recipient.recipientZipCode?.toLowerCase() || ''

                return recipientName.includes(query) ||
                    recipientAddress.includes(query) ||
                    recipientInstructions.includes(query) ||
                    recipientCity.includes(query) ||
                    recipientState.includes(query) ||
                    recipientZip.includes(query)
            })

            if (!matchesOrderNumber && !matchesCaseNumber && !matchesJurisdiction &&
                !matchesDocumentType && !matchesOrderInstructions && !matchesPrice && !matchesRecipient && !matchesDraftName) {
                return false
            }
        }

        // Date Range Filter
        const dateFilter = getDateRangeFilter()
        if (dateFilter) {
            const itemDate = new Date(item.createdAt)
            if (itemDate < dateFilter.start || itemDate > dateFilter.end) return false
        }

        return true
    }).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    // Calculate key metrics
    const activeOrders = orderCounts ? (orderCounts.OPEN || 0) + (orderCounts.BIDDING || 0) + (orderCounts.ASSIGNED || 0) + (orderCounts.IN_PROGRESS || 0) : 0
    const completedOrders = orderCounts?.COMPLETED || 0

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user?.firstName}!
                            </h1>
                            <p className="text-gray-500 mt-1">Manage your service orders</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/contacts')}
                                className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-all flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                <span className="hidden sm:inline">Contacts</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowLogoutModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNewOrderClick}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                New Order
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Key Metrics - Simplified */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
                >
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Clock className="w-8 h-8 text-blue-600" />
                            <span className="text-3xl font-bold text-blue-600">{activeOrders}</span>
                        </div>
                        <h3 className="text-sm font-medium text-blue-900">Active Orders</h3>
                        <p className="text-xs text-blue-700 mt-1">In progress & pending</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                            <span className="text-3xl font-bold text-green-600">{completedOrders}</span>
                        </div>
                        <h3 className="text-sm font-medium text-green-900">Completed</h3>
                        <p className="text-xs text-green-700 mt-1">Successfully delivered</p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Edit2 className="w-8 h-8 text-purple-600" />
                            <span className="text-3xl font-bold text-purple-600">{draftCount}</span>
                        </div>
                        <h3 className="text-sm font-medium text-purple-900">Saved Drafts</h3>
                    </motion.div>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders (number, case, jurisdiction, recipient, amount, notes...)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-6 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                        {(statusFilter !== 'ALL' || dateRange !== 'all') && (
                            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                                Active
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 bg-gray-50 rounded-xl p-6 border border-gray-200"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="DRAFT">Draft</option>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="last-week">Last Week</option>
                                            <option value="last-2-weeks">Last 2 Weeks</option>
                                            <option value="last-month">Last Month</option>
                                            <option value="last-3-months">Last 3 Months</option>
                                            <option value="custom">Custom Range</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                                        <button
                                            onClick={clearFilters}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-sm font-medium text-gray-700 transition-all"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                                {dateRange === 'custom' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Orders List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Your Orders</h2>
                        <span className="text-sm text-gray-500">
                            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                        </span>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-6">No orders found</p>
                            {orders.length === 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleNewOrderClick}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Create Your First Order
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredOrders.map((order, index) => {
                                    const price = calculateOrderPrice(order)
                                    const statusColors: Record<string, string> = {
                                        'OPEN': 'bg-blue-50 text-blue-700 border-blue-200',
                                        'BIDDING': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                                        'ASSIGNED': 'bg-purple-50 text-purple-700 border-purple-200',
                                        'PARTIALLY_ASSIGNED': 'bg-purple-50 text-purple-700 border-purple-200',
                                        'IN_PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200',
                                        'COMPLETED': 'bg-green-50 text-green-700 border-green-200',
                                        'FAILED': 'bg-red-50 text-red-700 border-red-200',
                                        'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-200',
                                        'DRAFT': 'bg-purple-50 text-purple-700 border-purple-200'
                                    }

                                    return (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            whileHover={{ y: -2 }}
                                            onClick={() => order.itemType === 'draft' ? router.push(`/orders/create?draftId=${order.id}`) : handleOrderClick(order)}
                                            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {editingOrderId === order.id ? (
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={editingOrderName}
                                                                    onChange={(e) => setEditingOrderName(e.target.value)}
                                                                    className="flex-1 px-3 py-1 text-lg font-semibold border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSaveOrderName(order.id)
                                                                    }}
                                                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleCancelEditName()
                                                                    }}
                                                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h3 className="font-semibold text-lg text-gray-900">
                                                                    {order.customName || order.orderNumber}
                                                                </h3>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleEditOrderName(order.id, order.customName || order.orderNumber)
                                                                    }}
                                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                                    title="Edit order name"
                                                                >
                                                                    <Edit2 className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || statusColors['OPEN']}`}>
                                                            {order.status === 'PARTIALLY_ASSIGNED' ? 'ASSIGNED' : order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {order.totalRecipients} {order.totalRecipients === 1 ? 'recipient' : 'recipients'}
                                                        {order.documentType && ` • ${order.documentType.replace(/_/g, ' ')}`}
                                                    </p>
                                                </div>
                                                {price && (
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-green-600">${price.toFixed(2)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Logout Modal */}
            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title="Logout Confirmation"
                message="Are you sure you want to logout?"
                confirmText="Yes, Logout"
                cancelText="Cancel"
            />

            {/* Order Name Modal */}
            <OrderNameModal
                isOpen={showOrderNameModal}
                onClose={() => setShowOrderNameModal(false)}
                onContinue={handleOrderNameContinue}
            />
        </div>
    )
}
