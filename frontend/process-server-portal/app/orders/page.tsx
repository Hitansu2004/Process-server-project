'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Package, Clock, TrendingUp, Briefcase, Filter, Search, ChevronDown, User, Calendar } from 'lucide-react'
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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 font-medium">Loading available orders...</p>
                </div>
            </div>
        )
    }

    const getStatusBadge = (status: string) => {
        const configs: any = {
            'OPEN': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
            'BIDDING': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
            'PARTIALLY_ASSIGNED': { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
        }
        const config = configs[status] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' }
        
        return (
            <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit`}>
                <span className={`${config.dot} w-2 h-2 rounded-full`}></span>
                {status.replace('_', ' ')}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Available Orders</h1>
                            <p className="text-gray-600">Browse and bid on delivery orders in your area</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/bids')}
                                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <TrendingUp size={18} />
                                My Bids
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all flex items-center gap-2"
                            >
                                <Briefcase size={18} />
                                Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by order number, address, or ZIP code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none text-sm"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative min-w-[160px]">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none font-medium cursor-pointer appearance-none pr-10 text-sm"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="OPEN">Open</option>
                                    <option value="BIDDING">Bidding</option>
                                    <option value="PARTIALLY_ASSIGNED">Partially Assigned</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-3 text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of{' '}
                            <span className="font-semibold text-gray-900">{orders.length}</span> orders
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="text-gray-300 mx-auto mb-4" size={48} />
                            <p className="text-gray-600 text-lg font-medium mb-2">No orders match your filters</p>
                            <p className="text-gray-500 text-sm">Try adjusting your search or filters to see more results</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Order Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Pickup Address
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            ZIP Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Recipients
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Deadline
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/orders/${order.id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900 text-sm">{order.orderNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <User className="text-green-600" size={16} />
                                                    </div>
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {order.customerName || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="text-gray-400 flex-shrink-0" size={16} />
                                                    <span className="text-sm text-gray-700 max-w-xs truncate">
                                                        {order.recipients?.[0]?.recipientAddress || 'Address not specified'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700 font-mono">
                                                    {order.recipients?.[0]?.recipientZipCode || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Package className="text-gray-400" size={16} />
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {order.recipients?.length || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="text-gray-400" size={16} />
                                                    <div className="text-sm">
                                                        <div className="text-gray-900 font-medium">
                                                            {new Date(order.deadline).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(order.deadline).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        router.push(`/orders/${order.id}`)
                                                    }}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                >
                                                    View & Bid
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
