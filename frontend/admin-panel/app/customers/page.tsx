'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function CustomersManagement() {
    const router = useRouter()
    const [customers, setCustomers] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fix: Move hooks to top level before any conditional returns
    const [selectedCustomerContacts, setSelectedCustomerContacts] = useState<any[]>([])
    const [showContactsModal, setShowContactsModal] = useState(false)
    const [selectedCustomerName, setSelectedCustomerName] = useState('')
    const [selectedOrders, setSelectedOrders] = useState<any[]>([])
    const [showOrdersModal, setShowOrdersModal] = useState(false)
    const [ordersModalTitle, setOrdersModalTitle] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const user = JSON.parse(userData)
        const tenantId = user.roles[0]?.tenantId
        if (tenantId) {
            loadData(tenantId, token)
        }
    }, [router])

    const loadData = async (tenantId: string, token: string) => {
        try {
            // Fetch both customers and orders to calculate statistics
            const [customersData, ordersData] = await Promise.all([
                api.getTenantCustomers(tenantId, token),
                api.getTenantOrders(tenantId, token)
            ])
            setCustomers(customersData)
            setOrders(ordersData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateCustomerStats = (customer: any) => {
        // Find all orders for this customer
        const customerOrders = orders.filter(order => order.customerId === customer.globalUserId)

        const totalOrders = customerOrders.length
        const openOrders = customerOrders.filter(o => o.status === 'OPEN' || o.status === 'BIDDING')
        const inProgress = customerOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED')
        const completed = customerOrders.filter(o => o.status === 'COMPLETED')
        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.customerPaymentAmount || 0), 0)

        return { totalOrders, openOrders, inProgress, completed, totalSpent }
    }

    const viewContacts = async (customer: any, token: string) => {
        try {
            const contacts = await api.searchContacts(customer.globalUserId, '', token)
            setSelectedCustomerContacts(contacts)
            setSelectedCustomerName(`${customer.firstName || 'Customer'} ${customer.lastName || ''}`)
            setShowContactsModal(true)
        } catch (error) {
            console.error('Failed to load contacts:', error)
            alert('Failed to load contacts')
        }
    }

    const viewOrders = (ordersList: any[], title: string) => {
        setSelectedOrders(ordersList)
        setOrdersModalTitle(title)
        setShowOrdersModal(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Calculate overall stats
    const totalRevenue = customers.reduce((sum, customer) => {
        const stats = calculateCustomerStats(customer)
        return sum + stats.totalSpent
    }, 0)

    const totalOrders = orders.length
    const activeCustomers = customers.filter(c => calculateCustomerStats(c).totalOrders > 0).length

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Customers Management</h1>
                        <p className="text-gray-400 mt-1">View all customer accounts and their activity</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Customers</h3>
                        <p className="text-3xl font-bold">{customers.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Active Customers</h3>
                        <p className="text-3xl font-bold text-green-400">
                            {activeCustomers}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-primary">
                            {totalOrders}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-yellow-400">
                            ${totalRevenue.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Customers List */}
                <div className="space-y-4">
                    {customers.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-400">No customers registered yet</p>
                        </div>
                    ) : (
                        customers.map((customer) => {
                            const stats = calculateCustomerStats(customer)

                            return (
                                <div key={customer.id} className="card hover:bg-white/5 transition">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {customer.firstName} {customer.lastName}
                                                    </h3>
                                                    {stats.totalOrders > 0 && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary">
                                                            {stats.totalOrders} Total Orders
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => viewContacts(customer, localStorage.getItem('token') || '')}
                                                    className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30 transition"
                                                >
                                                    View Contacts
                                                </button>
                                            </div>

                                            {/* Customer Basic Info */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3 pb-3 border-b border-white/10">
                                                <div>
                                                    <p className="text-gray-400">Customer ID</p>
                                                    <p className="font-medium text-xs break-all">{customer.globalUserId || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Email</p>
                                                    <p className="font-medium text-xs break-all">{customer.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Phone</p>
                                                    <p className="font-medium">{customer.phoneNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Joined</p>
                                                    <p className="font-medium">
                                                        {customer.createdAt
                                                            ? new Date(customer.createdAt).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Order Statistics */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Total Spent</p>
                                                    <p className="font-semibold text-green-400">
                                                        ${stats.totalSpent.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Open Orders</p>
                                                    <button
                                                        onClick={() => viewOrders(stats.openOrders, `${customer.firstName} ${customer.lastName} - Open Orders`)}
                                                        className="font-semibold text-yellow-400 hover:underline cursor-pointer"
                                                        disabled={stats.openOrders.length === 0}
                                                    >
                                                        {stats.openOrders.length}
                                                    </button>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">In Progress</p>
                                                    <button
                                                        onClick={() => viewOrders(stats.inProgress, `${customer.firstName} ${customer.lastName} - In Progress Orders`)}
                                                        className="font-semibold text-blue-400 hover:underline cursor-pointer"
                                                        disabled={stats.inProgress.length === 0}
                                                    >
                                                        {stats.inProgress.length}
                                                    </button>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Completed</p>
                                                    <p className="font-semibold text-green-400">
                                                        {stats.completed.length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Contacts Modal */}
            {showContactsModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Contact Book: {selectedCustomerName}</h2>
                            <button
                                onClick={() => setShowContactsModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {selectedCustomerContacts.length === 0 ? (
                                <p className="text-gray-400 text-center">No contacts found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedCustomerContacts.map((contact) => (
                                        <div key={contact.id} className="p-4 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{contact.nickname || 'No Nickname'}</p>
                                                <p className="text-sm text-gray-400">ID: {contact.processServerId}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${contact.entryType === 'AUTO_ADDED'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {contact.entryType}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Modal */}
            {showOrdersModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{ordersModalTitle}</h2>
                            <button
                                onClick={() => setShowOrdersModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {selectedOrders.length === 0 ? (
                                <p className="text-gray-400 text-center">No orders found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedOrders.map((order) => (
                                        <div key={order.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-lg">{order.orderNumber}</p>
                                                    <p className="text-sm text-gray-400">
                                                        Pickup: {order.pickupAddress}, {order.pickupZipCode}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                                                        order.status === 'BIDDING' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                                <div>
                                                    <p className="text-gray-400">Recipients</p>
                                                    <p className="font-medium">{order.recipients?.length || 0}</p>
                                                </div>
                                                {order.finalAgreedPrice && (
                                                    <div>
                                                        <p className="text-gray-400">Price</p>
                                                        <p className="font-medium text-green-400">${order.finalAgreedPrice.toFixed(2)}</p>
                                                    </div>
                                                )}
                                                {order.deadline && (
                                                    <div className="col-span-2">
                                                        <p className="text-gray-400">Deadline</p>
                                                        <p className="font-medium">{new Date(order.deadline).toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
