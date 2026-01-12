'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function NewConciergeOrder() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState<any[]>([])
    const [processServers, setProcessServers] = useState<any[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState('')

    const [formData, setFormData] = useState({
        pickupAddress: '',
        pickupStateId: null as number | null,
        pickupCityId: null as number | null,
        pickupZipCode: '',
        specialInstructions: '',
        deadline: '',
        caseNumber: '',
        jurisdiction: '',
        documentType: '',
        otherDocumentType: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const user = JSON.parse(localStorage.getItem('user') || '{}')
                const tenantId = user.roles[0]?.tenantId

                if (token && tenantId) {
                    const [custData, psData] = await Promise.all([
                        api.getTenantCustomers(tenantId, token),
                        api.getTenantProcessServers(tenantId, token)
                    ])
                    setCustomers(custData)
                    setProcessServers(psData)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            }
        }
        fetchData()
    }, [])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const user = JSON.parse(localStorage.getItem('user') || '{}')

            // Format deadline to include seconds for proper LocalDateTime parsing
            const formattedDeadline = formData.deadline.includes(':00:')
                ? formData.deadline
                : `${formData.deadline}:00`

            const orderData = {
                tenantId: user.roles[0]?.tenantId,
                customerId: selectedCustomer,
                ...formData,
                deadline: formattedDeadline,
                documentType: formData.documentType,
                otherDocumentType: formData.documentType === 'OTHER' ? formData.otherDocumentType : null
            }

            await api.createOrder(orderData, token!)
            router.push('/dashboard')
        } catch (error) {
            console.error('Order creation error:', error)
            alert('Failed to create order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold">New Concierge Order</h1>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-6">
                    {/* Customer Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Select Customer</label>
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="">-- Select Customer --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.firstName} {c.lastName} ({c.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Document Details */}
                    <div className="glass rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📄</span> Document Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Case Number</label>
                                <input
                                    type="text"
                                    value={formData.caseNumber}
                                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. CV-2024-1234"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Jurisdiction</label>
                                <input
                                    type="text"
                                    value={formData.jurisdiction}
                                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Superior Court of California"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Type of Document</label>
                                <select
                                    value={formData.documentType}
                                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                >
                                    <option value="">Select Document Type</option>
                                    <option value="CRIMINAL_CASE">Criminal Case</option>
                                    <option value="CIVIL_COMPLAINT">Civil Complaint</option>
                                    <option value="RESTRAINING_ORDER">Restraining Order</option>
                                    <option value="HOUSE_ARREST">House Arrest</option>
                                    <option value="EVICTION_NOTICE">Eviction Notice</option>
                                    <option value="SUBPOENA">Subpoena</option>
                                    <option value="DIVORCE_PAPERS">Divorce Papers</option>
                                    <option value="CHILD_CUSTODY">Child Custody</option>
                                    <option value="SMALL_CLAIMS">Small Claims</option>
                                    <option value="BANKRUPTCY">Bankruptcy</option>
                                    <option value="OTHER">Other</option>
                                </select>

                                {formData.documentType === 'OTHER' && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={formData.otherDocumentType}
                                            onChange={(e) => setFormData({ ...formData, otherDocumentType: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Please specify document type"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Deadline</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Special Instructions</label>
                            <textarea
                                value={formData.specialInstructions}
                                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                                placeholder="Handle with care..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? 'Creating Order...' : 'Create Concierge Order'}
                    </button>
                </form>

            </div>
        </div>
    )
}
