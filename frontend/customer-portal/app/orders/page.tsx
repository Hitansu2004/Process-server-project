'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Package, Calendar, User, MapPin, Eye, ArrowUpDown, Filter, DollarSign, FileText, Clock } from 'lucide-react'
import Pagination from '@/components/Pagination'

interface Order {
    id: string
    orderNumber: string
    customerId: string
    status: string
    specialInstructions: string
    deadline: string
    createdAt: string
    updatedAt: string
    customerPaymentAmount: number
    documentType: string
    dropoffs?: Array<{
        id: string
        address: string
        recipientName: string
    }>
}

type SortField = 'orderNumber' | 'createdAt' | 'status' | 'deadline' | 'amount'
type SortDirection = 'asc' | 'desc'

export default function OrdersListPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [sortField, setSortField] = useState<SortField>('createdAt')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(25)

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.userId

            if (token && userId) {
                const data = await api.getCustomerOrders(userId, token)
                setOrders(data)
            }
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'OPEN': 'bg-blue-100 text-blue-700 border-blue-300',
            'BIDDING': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'ASSIGNED': 'bg-purple-100 text-purple-700 border-purple-300',
            'IN_PROGRESS': 'bg-indigo-100 text-indigo-700 border-indigo-300',
            'COMPLETED': 'bg-green-100 text-green-700 border-green-300',
            'FAILED': 'bg-red-100 text-red-700 border-red-300',
            'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-300'
        }
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300'
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0)
    }

    // Filter and sort orders
    const filteredOrders = orders.filter(order =>
        statusFilter === 'ALL' || order.status === statusFilter
    )

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let comparison = 0

        switch (sortField) {
            case 'orderNumber':
                comparison = a.orderNumber.localeCompare(b.orderNumber)
                break
            case 'createdAt':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                break
            case 'status':
                comparison = a.status.localeCompare(b.status)
                break
            case 'deadline':
                comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                break
            case 'amount':
                comparison = (a.customerPaymentAmount || 0) - (b.customerPaymentAmount || 0)
                break
        }

        return sortDirection === 'asc' ? comparison : -comparison
    })

    // Pagination logic
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)
    const paginatedOrders = sortedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items)
        setCurrentPage(1) // Reset to first page when changing items per page
    }

    const statuses = ['ALL', 'OPEN', 'BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                                <Package className="w-10 h-10 text-primary" />
                                All Orders
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Comprehensive view of all your service orders
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/orders/new')}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2 font-semibold"
                        >
                            <Package className="w-5 h-5" />
                            Create New Order
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="glass rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
                            <div className="text-sm text-gray-600">Total Orders</div>
                        </div>
                        <div className="glass rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {orders.filter(o => o.status === 'COMPLETED').length}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="glass rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {orders.filter(o => o.status === 'IN_PROGRESS').length}
                            </div>
                            <div className="text-sm text-gray-600">In Progress</div>
                        </div>
                        <div className="glass rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {orders.filter(o => o.status === 'OPEN' || o.status === 'BIDDING').length}
                            </div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="glass rounded-lg p-4 flex items-center gap-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                        <div className="flex gap-2 flex-wrap">
                            {statuses.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${statusFilter === status
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block glass rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-300">
                            <tr>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => handleSort('orderNumber')}
                                >
                                    <div className="flex items-center gap-2">
                                        Order #
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Recipient
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Created
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => handleSort('deadline')}
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Deadline
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => handleSort('amount')}
                                >
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Price
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        Status
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => router.push(`/orders/${order.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800">{order.orderNumber}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <FileText className="w-3 h-3" />
                                                {order.documentType?.replace('_', ' ') || 'Document'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">
                                                {order.dropoffs?.[0]?.recipientName || 'Unknown Recipient'}
                                            </div>
                                            {order.dropoffs && order.dropoffs.length > 1 && (
                                                <div className="text-xs text-blue-600 mt-1">
                                                    +{order.dropoffs.length - 1} other(s)
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(order.deadline)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            {formatCurrency(order.customerPaymentAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    router.push(`/orders/${order.id}`)
                                                }}
                                                className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={sortedOrders.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {sortedOrders.length === 0 ? (
                        <div className="glass rounded-lg p-12 text-center text-gray-500">
                            No orders found
                        </div>
                    ) : (
                        paginatedOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="glass rounded-lg p-4 cursor-pointer hover:shadow-md transition"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-gray-800">{order.orderNumber}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">
                                            {order.dropoffs?.[0]?.recipientName || 'Unknown'}
                                            {order.dropoffs && order.dropoffs.length > 1 && ` (+${order.dropoffs.length - 1})`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(order.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(order.deadline)}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            {order.documentType?.replace('_', ' ') || 'Document'}
                                        </div>
                                        <div className="font-bold text-gray-800">
                                            {formatCurrency(order.customerPaymentAmount)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-sm font-medium"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Mobile Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedOrders.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>
        </div>
    )
}
