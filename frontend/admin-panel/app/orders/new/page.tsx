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
        pickupZipCode: '',
        specialInstructions: '',
        deadline: '',
    })

    const [dropoffs, setDropoffs] = useState([{
        recipientName: '',
        dropoffAddress: '',
        dropoffZipCode: '',
        dropoffType: 'GUIDED', // Default for Concierge
        assignedProcessServerId: '',
        customerPrice: '',
        finalAgreedPrice: '',
    }])

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

    const addDropoff = () => {
        setDropoffs([...dropoffs, {
            recipientName: '',
            dropoffAddress: '',
            dropoffZipCode: '',
            dropoffType: 'GUIDED',
            assignedProcessServerId: '',
            customerPrice: '',
            finalAgreedPrice: '',
        }])
    }

    const removeDropoff = (index: number) => {
        setDropoffs(dropoffs.filter((_, i) => i !== index))
    }

    const updateDropoff = (index: number, field: string, value: string) => {
        const updated = [...dropoffs]
        updated[index] = { ...updated[index], [field]: value }
        setDropoffs(updated)
    }

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
                dropoffs: dropoffs.map(d => ({
                    ...d,
                    customerPrice: d.customerPrice ? parseFloat(d.customerPrice) : null,
                    finalAgreedPrice: d.finalAgreedPrice ? parseFloat(d.finalAgreedPrice) : null,
                })),
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

                    {/* Pickup Info */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Pickup Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Pickup Address</label>
                                <input
                                    type="text"
                                    value={formData.pickupAddress}
                                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="123 Main St"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    value={formData.pickupZipCode}
                                    onChange={(e) => setFormData({ ...formData, pickupZipCode: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="10001"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dropoffs */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Delivery Destinations</h2>
                            <button
                                type="button"
                                onClick={addDropoff}
                                className="px-4 py-2 glass rounded-lg hover:bg-primary/20 transition"
                            >
                                + Add Dropoff
                            </button>
                        </div>

                        <div className="space-y-6">
                            {dropoffs.map((dropoff, index) => (
                                <div key={index} className="glass rounded-lg p-6 border border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-medium text-lg">Dropoff #{index + 1}</h3>
                                        {dropoffs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDropoff(index)}
                                                className="text-red-500 hover:text-red-400 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Recipient Name</label>
                                            <input
                                                type="text"
                                                value={dropoff.recipientName}
                                                onChange={(e) => updateDropoff(index, 'recipientName', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Address</label>
                                            <input
                                                type="text"
                                                value={dropoff.dropoffAddress}
                                                onChange={(e) => updateDropoff(index, 'dropoffAddress', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                value={dropoff.dropoffZipCode}
                                                onChange={(e) => updateDropoff(index, 'dropoffZipCode', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Concierge Pricing & Assignment */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-blue-300">Customer Price ($)</label>
                                            <input
                                                type="number"
                                                value={dropoff.customerPrice}
                                                onChange={(e) => updateDropoff(index, 'customerPrice', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                                step="0.01"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Amount charged to customer</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-green-300">Process Server Payout ($)</label>
                                            <input
                                                type="number"
                                                value={dropoff.finalAgreedPrice}
                                                onChange={(e) => updateDropoff(index, 'finalAgreedPrice', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="0.00"
                                                step="0.01"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Amount paid to server</p>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Assign Process Server</label>

                                            {/* Process Server List */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 mb-4">
                                                {processServers.map(ps => {
                                                    console.log('Rendering Process Server:', ps);
                                                    const successRate = ps.totalOrdersAssigned > 0
                                                        ? (ps.successfulDeliveries / ps.totalOrdersAssigned) * 100
                                                        : 0;

                                                    // Robust name resolution
                                                    const displayName = ps.firstName && ps.lastName
                                                        ? `${ps.firstName} ${ps.lastName}`
                                                        : ps.user?.firstName && ps.user?.lastName
                                                            ? `${ps.user.firstName} ${ps.user.lastName}`
                                                            : ps.email || 'Unknown Server';

                                                    return (
                                                        <div
                                                            key={ps.id}
                                                            onClick={() => updateDropoff(index, 'assignedProcessServerId', ps.id)}
                                                            className={`glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer relative border-2 ${dropoff.assignedProcessServerId === ps.id
                                                                ? 'border-primary bg-primary/10'
                                                                : 'border-transparent'
                                                                }`}
                                                        >
                                                            {/* Selected Badge */}
                                                            {dropoff.assignedProcessServerId === ps.id && (
                                                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                                                    ✓ Selected
                                                                </div>
                                                            )}

                                                            <div className="flex flex-col items-center text-center">
                                                                {/* Profile Photo */}
                                                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0 mb-4 ring-4 ring-white/10">
                                                                    {ps.profilePhotoUrl ? (
                                                                        <img src={ps.profilePhotoUrl} alt={displayName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <img
                                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`}
                                                                            alt={displayName}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    )}
                                                                </div>

                                                                {/* Name */}
                                                                <h3 className="font-bold text-xl mb-3 text-gray-900">{displayName}</h3>

                                                                {/* Rating Stars */}
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <div className="flex items-center gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <span key={i} className={`text-xl ${i < Math.floor(ps.currentRating || 0) ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                                                ★
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm text-gray-500 font-semibold">
                                                                        {(ps.currentRating || 0).toFixed(1)}
                                                                    </span>
                                                                </div>

                                                                {/* Stats Grid */}
                                                                <div className="w-full grid grid-cols-2 gap-4 mb-4">
                                                                    <div className="glass rounded-lg p-3">
                                                                        <div className="text-2xl font-bold text-primary">{successRate.toFixed(0)}%</div>
                                                                        <div className="text-xs text-gray-400 mt-1">Success Rate</div>
                                                                    </div>
                                                                    <div className="glass rounded-lg p-3">
                                                                        <div className="text-2xl font-bold text-blue-400">
                                                                            {ps.totalOrdersAssigned || 0}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400 mt-1">Total Orders</div>
                                                                    </div>
                                                                </div>

                                                                {/* Success Rate Progress Bar */}
                                                                <div className="w-full">
                                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                                        <span className="text-gray-400">Deliveries</span>
                                                                        <span className="font-semibold text-green-400">
                                                                            {ps.successfulDeliveries || 0} / {ps.totalOrdersAssigned || 0}
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                                                        <div
                                                                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                                                                            style={{ width: `${Math.min(successRate, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Deadline</label>
                            <input
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Special Instructions</label>
                            <input
                                type="text"
                                value={formData.specialInstructions}
                                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
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
