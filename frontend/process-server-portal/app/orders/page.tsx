'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Package, Clock, TrendingUp, ArrowRight, Briefcase, Filter, Search } from 'lucide-react'
import { api } from '@/lib/api'

export default function AvailableOrders() {
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [filteredOrders, setFilteredOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        loadAvailableOrders(token)
    }, [router])

    const loadAvailableOrders = async (token: string) => {
        try {
            // Fetch all OPEN and BIDDING orders
            const data = await api.getAvailableOrders(token)
            setOrders(data)
            setFilteredOrders(data)
        } catch (error) {
            console.error('Failed to load available orders:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let filtered = orders

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.pickupZipCode?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredOrders(filtered)
    }, [orders, statusFilter, searchTerm])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600 font-medium">Loading available orders...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
            {/* Animated background elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="fixed top-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 -z-10"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90],
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="fixed bottom-20 right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 -z-10"
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3 mb-2"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Package className="text-green-600" size={36} />
                                </motion.div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Available Orders
                                </h1>
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-600 ml-12"
                            >
                                Browse and bid on delivery orders in your area
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex gap-3"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/bids')}
                                className="px-6 py-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-green-600 font-semibold border-2 border-green-100"
                            >
                                <TrendingUp size={20} />
                                My Bids
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold"
                            >
                                <Briefcase size={20} />
                                Dashboard
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by order number, address, or ZIP code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-12 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white/50 font-medium cursor-pointer appearance-none"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="OPEN">Open</option>
                                    <option value="BIDDING">Bidding</option>
                                </select>
                            </div>
                        </div>

                        {/* Results count */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-4 text-sm text-gray-600"
                        >
                            Showing <span className="font-bold text-green-600">{filteredOrders.length}</span> of{' '}
                            <span className="font-bold">{orders.length}</span> orders
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Orders Grid */}
                <AnimatePresence mode="wait">
                    {filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center border border-white/20"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Package className="text-gray-300 mx-auto mb-4" size={64} />
                            </motion.div>
                            <p className="text-gray-600 text-xl font-semibold mb-2">No orders match your filters</p>
                            <p className="text-gray-500">Try adjusting your search or filters to see more results</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredOrders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden border border-white/20 group"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                                                <p className="text-green-100 text-sm mt-1">
                                                    {order.customerName || 'Unknown Customer'}
                                                </p>
                                            </div>
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    order.status === 'OPEN'
                                                        ? 'bg-green-400 text-green-900'
                                                        : 'bg-yellow-400 text-yellow-900'
                                                }`}
                                            >
                                                {order.status}
                                            </motion.span>
                                        </div>
                                        {order.existingBidsCount > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 + 0.3 }}
                                                className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs"
                                            >
                                                <TrendingUp size={14} />
                                                {order.existingBidsCount} active bid{order.existingBidsCount > 1 ? 's' : ''}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6 space-y-4">
                                        {/* Pickup */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 + 0.4 }}
                                            className="flex gap-3"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                <MapPin className="text-green-600" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">Pickup Location</p>
                                                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                                    {order.pickupAddress || 'Address not specified'}
                                                </p>
                                                <p className="text-xs text-green-600 font-bold mt-1">ZIP: {order.pickupZipCode}</p>
                                            </div>
                                        </motion.div>

                                        {/* Dropoff */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 + 0.5 }}
                                            className="flex gap-3 border-t border-gray-200 pt-4"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <Package className="text-emerald-600" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">
                                                    {order.totalDropoffs} Dropoff{order.totalDropoffs > 1 ? 's' : ''}
                                                </p>
                                                {order.dropoffs && order.dropoffs[0] && (
                                                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                                        {order.dropoffs[0].dropoffAddress}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Deadline */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 + 0.6 }}
                                            className="flex gap-3 border-t border-gray-200 pt-4"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                                <Clock className="text-orange-600" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">Deadline</p>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {new Date(order.deadline).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {new Date(order.deadline).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Card Footer */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 + 0.7 }}
                                        className="p-4 border-t border-gray-200"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group-hover:from-green-700 group-hover:to-emerald-700"
                                        >
                                            View Details & Bid
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
