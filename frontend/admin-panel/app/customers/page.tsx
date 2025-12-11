'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function CustomersManagement() {
    const router = useRouter()
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
            loadCustomers(tenantId, token)
        }
    }, [router])

    const loadCustomers = async (tenantId: string, token: string) => {
        try {
            const data = await api.getTenantCustomers(tenantId, token)
            setCustomers(data)
        } catch (error) {
            console.error('Failed to load customers:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    const [selectedCustomerContacts, setSelectedCustomerContacts] = useState<any[]>([])
    const [showContactsModal, setShowContactsModal] = useState(false)
    const [selectedCustomerName, setSelectedCustomerName] = useState('')

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
                        <p className="text-gray-400 mt-1">View all customer accounts</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Customers</h3>
                        <p className="text-3xl font-bold">{customers.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-primary">
                            {customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Active Customers</h3>
                        <p className="text-3xl font-bold text-green-400">
                            {customers.filter(c => c.totalOrders > 0).length}
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
                        customers.map((customer) => (
                            <div key={customer.id} className="card hover:bg-white/5 transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-lg mb-3">
                                                {customer.firstName} {customer.lastName}
                                            </h3>
                                            <button
                                                onClick={() => viewContacts(customer, localStorage.getItem('token') || '')}
                                                className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30 transition"
                                            >
                                                View Contacts
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400">Email</p>
                                                <p className="font-medium">{customer.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Phone</p>
                                                <p className="font-medium">{customer.phoneNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Total Orders</p>
                                                <p className="font-semibold text-primary">
                                                    {customer.totalOrders || 0}
                                                </p>
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

                                        {customer.companyName && (
                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                <p className="text-xs text-gray-400">
                                                    Company: <span className="text-white font-medium">{customer.companyName}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
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
        </div>
    )
}
