'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import ProcessServerCard from '@/components/ProcessServerCard'

interface ContactEntry {
    id: string
    processServerId: string
    nickname: string
    entryType: string
}

interface ProcessServerDetails {
    id: string
    name: string
    profilePhotoUrl: string
    currentRating: number
    successRate: number
    totalOrdersAssigned: number
    successfulDeliveries: number
}

export default function NewOrder() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [contactList, setContactList] = useState<ContactEntry[]>([])
    const [processServerDetails, setProcessServerDetails] = useState<Record<string, ProcessServerDetails>>({})
    const [defaultProcessServerId, setDefaultProcessServerId] = useState<string | null>(null)
    const [sortFilter, setSortFilter] = useState<string>('default') // Filter state
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
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token')
                const user = JSON.parse(sessionStorage.getItem('user') || '{}')
                const userId = user.userId

                if (token && userId) {
                    // Fetch contact list
                    const contacts = await api.getContactList(userId, token)
                    setContactList(contacts)

                    // Fetch process server details for each contact
                    const detailsPromises = contacts.map((contact: ContactEntry) =>
                        api.getProcessServerDetails(contact.processServerId, token)
                            .catch(() => null)
                    )
                    const detailsResults = await Promise.all(detailsPromises)
                    const detailsMap: Record<string, ProcessServerDetails> = {}
                    detailsResults.forEach((details, index) => {
                        if (details) {
                            detailsMap[contacts[index].processServerId] = details
                        }
                    })
                    setProcessServerDetails(detailsMap)

                    // Fetch default process server
                    const customerProfileId = user.roles[0]?.customerProfileId
                    if (customerProfileId) {
                        const defaultRes = await api.getDefaultProcessServer(customerProfileId, token)
                        if (defaultRes.processServerId) {
                            setDefaultProcessServerId(defaultRes.processServerId)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            }
        }
        fetchData()
    }, [])

    // Sort and filter process servers based on selected filter
    const getSortedContacts = (contacts: ContactEntry[]) => {
        const contactsWithDetails = contacts
            .map(contact => ({
                contact,
                details: processServerDetails[contact.processServerId]
            }))
            .filter(item => item.details) // Only include contacts with details

        switch (sortFilter) {
            case 'highest-rated':
                return contactsWithDetails
                    .sort((a, b) => Number(b.details.currentRating) - Number(a.details.currentRating))
                    .map(item => item.contact)
            case 'highest-success':
                return contactsWithDetails
                    .sort((a, b) => b.details.successRate - a.details.successRate)
                    .map(item => item.contact)
            case 'most-orders':
                return contactsWithDetails
                    .sort((a, b) => b.details.totalOrdersAssigned - a.details.totalOrdersAssigned)
                    .map(item => item.contact)
            case 'most-worked':
                return contactsWithDetails
                    .sort((a, b) => b.details.successfulDeliveries - a.details.successfulDeliveries)
                    .map(item => item.contact)
            default:
                return contacts
        }
    }

    const addDropoff = () => {
        setDropoffs([...dropoffs, {
            recipientName: '',
            dropoffAddress: '',
            dropoffZipCode: '',
            dropoffType: 'AUTOMATED',
            assignedProcessServerId: '',
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
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')

            const customerId = user.userId

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
                                    <div className="space-y-4">
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
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-3">
                                                        Select Process Server
                                                        {contactList.length > 0 && (
                                                            <span className="ml-2 text-xs text-gray-400">
                                                                ({contactList.length} available)
                                                            </span>
                                                        )}
                                                    </label>

                                                    {/* Filter/Sort Buttons */}
                                                    {contactList.length > 0 && (
                                                        <div className="mb-4 flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSortFilter('default')}
                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sortFilter === 'default'
                                                                        ? 'bg-primary text-white'
                                                                        : 'glass hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                Default
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSortFilter('highest-rated')}
                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sortFilter === 'highest-rated'
                                                                        ? 'bg-primary text-white'
                                                                        : 'glass hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                ⭐ Highest Rated
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSortFilter('highest-success')}
                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sortFilter === 'highest-success'
                                                                        ? 'bg-primary text-white'
                                                                        : 'glass hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                📈 Highest Success Rate
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSortFilter('most-orders')}
                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sortFilter === 'most-orders'
                                                                        ? 'bg-primary text-white'
                                                                        : 'glass hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                📦 Most Orders Completed
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSortFilter('most-worked')}
                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sortFilter === 'most-worked'
                                                                        ? 'bg-primary text-white'
                                                                        : 'glass hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                🤝 Most Worked With
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
                                                        {getSortedContacts(contactList).map(contact => {
                                                            const details = processServerDetails[contact.processServerId]
                                                            if (!details) return null

                                                            return (
                                                                <ProcessServerCard
                                                                    key={contact.id}
                                                                    id={contact.processServerId}
                                                                    name={contact.nickname || details.name}
                                                                    profilePhotoUrl={details.profilePhotoUrl}
                                                                    currentRating={Number(details.currentRating) || 0}
                                                                    successRate={details.successRate || 0}
                                                                    totalOrdersAssigned={details.totalOrdersAssigned}
                                                                    successfulDeliveries={details.successfulDeliveries}
                                                                    isDefault={contact.processServerId === defaultProcessServerId}
                                                                    isSelected={dropoff.assignedProcessServerId === contact.processServerId}
                                                                    onSelect={() => updateDropoff(index, 'assignedProcessServerId', contact.processServerId)}
                                                                    onSetDefault={async () => {
                                                                        try {
                                                                            const token = sessionStorage.getItem('token')
                                                                            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
                                                                            const customerProfileId = user.roles[0]?.customerProfileId
                                                                            if (token && customerProfileId) {
                                                                                await api.setDefaultProcessServer(customerProfileId, contact.processServerId, token)
                                                                                setDefaultProcessServerId(contact.processServerId)
                                                                            }
                                                                        } catch (error) {
                                                                            console.error('Failed to set default:', error)
                                                                        }
                                                                    }}
                                                                />
                                                            )
                                                        })}
                                                    </div>

                                                    {contactList.length === 0 && (
                                                        <div className="glass rounded-lg p-8 text-center">
                                                            <div className="text-4xl mb-3">👥</div>
                                                            <p className="text-yellow-400 font-medium mb-2">
                                                                No contacts found
                                                            </p>
                                                            <p className="text-sm text-gray-400">
                                                                Add Process Servers to your Contact List first.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
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
