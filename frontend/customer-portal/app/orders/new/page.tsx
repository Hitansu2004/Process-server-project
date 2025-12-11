'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface ContactEntry {
    id: string
    processServerId: string
    nickname: string
    // Add other fields if needed, e.g., processServerName (needs to be fetched or included in contact entry)
    // For now, we'll assume contact entry has nickname or we fetch profile.
    // Actually, ContactBookEntry only has processServerId. We might need to fetch names.
    // Or the backend should return enriched data.
    // Let's assume for now we just show ID or Nickname.
}

export default function NewOrder() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [contactList, setContactList] = useState<ContactEntry[]>([])
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
        dropoffType: 'AUTOMATED', // Default
        assignedProcessServerId: '',
        finalAgreedPrice: '',
    }])

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const token = localStorage.getItem('token')
                const user = JSON.parse(localStorage.getItem('user') || '{}')
                // Use user ID directly (global_users.id) for contact list
                const userId = user.userId

                if (token && userId) {
                    const contacts = await api.getContactList(userId, token)
                    setContactList(contacts)
                }
            } catch (error) {
                console.error('Failed to fetch contacts:', error)
            }
        }
        fetchContacts()
    }, [])

    const addDropoff = () => {
        setDropoffs([...dropoffs, {
            recipientName: '',
            dropoffAddress: '',
            dropoffZipCode: '',
            dropoffType: 'AUTOMATED',
            assignedProcessServerId: '',
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

            const userIdToProfileId: { [key: string]: string } = {
                'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e': '78650ad7-23fc-4eb4-9a5c-f280f0463771', // customer1@example.com
                '17812fce-9c0b-493c-9e4b-0189fb1c31c8': 'c371b934-2f03-4d8e-8ec6-fdf3470c1aef', // customer2@example.com
                '9db8f52f-b73d-49a4-8831-48781f9d90a2': 'c3f5911b-8a2f-4315-b5fd-6f454df39d7e', // customer3@example.com
                '0e1b5d79-887f-4a2b-8450-01c385e4ed18': 'd25ec2b5-242a-4b35-80a4-3696c5da745e', // customer4@example.com
                'ab3435d4-7174-4989-b443-b9d60bff298f': '3708ddee-f034-4591-83f1-5bf2d6a160fb', // customer5@example.com
            }

            const customerId = userIdToProfileId[user.userId] || user.userId

            // Format deadline to include seconds for proper LocalDateTime parsing
            const formattedDeadline = formData.deadline.includes(':00:')
                ? formData.deadline
                : `${formData.deadline}:00`

            const orderData = {
                tenantId: user.roles[0]?.tenantId,
                customerId: customerId,
                ...formData,
                deadline: formattedDeadline,
                dropoffs: dropoffs.map(d => ({
                    ...d,
                    // Ensure assignedProcessServerId is null/undefined if AUTOMATED
                    assignedProcessServerId: d.dropoffType === 'AUTOMATED' ? null : d.assignedProcessServerId,
                    // Send finalAgreedPrice for GUIDED orders
                    finalAgreedPrice: d.dropoffType === 'GUIDED' && d.finalAgreedPrice ? parseFloat(d.finalAgreedPrice) : null,
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
                    <h1 className="text-3xl font-bold">Create New Order</h1>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-6">
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
                                    placeholder="123 Main St, New York, NY"
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

                        <div className="space-y-4">
                            {dropoffs.map((dropoff, index) => (
                                <div key={index} className="glass rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-medium">Dropoff #{index + 1}</h3>
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
                                                placeholder="John Doe"
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
                                                placeholder="456 Park Ave"
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
                                                placeholder="10003"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Assignment Type */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Assignment Type</label>
                                            <select
                                                value={dropoff.dropoffType}
                                                onChange={(e) => updateDropoff(index, 'dropoffType', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="AUTOMATED">Open Bid (Automated)</option>
                                                <option value="GUIDED">Direct Assign (Guided)</option>
                                            </select>
                                        </div>

                                        {dropoff.dropoffType === 'GUIDED' && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Select Process Server</label>
                                                <select
                                                    value={dropoff.assignedProcessServerId}
                                                    onChange={(e) => updateDropoff(index, 'assignedProcessServerId', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                >
                                                    <option value="">-- Select from Contact List --</option>
                                                    {contactList.map(contact => {
                                                        const isGlobal = contact.nickname?.startsWith('Global')
                                                        const typeLabel = isGlobal ? 'GLOBAL' : contact.entryType
                                                        return (
                                                            <option key={contact.id} value={contact.processServerId}>
                                                                {contact.nickname || contact.processServerId} ({typeLabel})
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                                {contactList.length === 0 && (
                                                    <p className="text-xs text-yellow-400 mt-1">
                                                        No contacts found. Add Process Servers to your Contact List first.
                                                    </p>
                                                )}

                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium mb-2">Offer Amount ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={dropoff.finalAgreedPrice || ''}
                                                        onChange={(e) => updateDropoff(index, 'finalAgreedPrice', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                        placeholder="100.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
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
                            <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                            <input
                                type="text"
                                value={formData.specialInstructions}
                                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Handle with care"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? 'Creating Order...' : 'Create Order'}
                    </button>
                </form>
            </div>
        </div>
    )
}
