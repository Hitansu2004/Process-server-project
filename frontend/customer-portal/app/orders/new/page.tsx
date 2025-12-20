'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import ProcessServerCard from '@/components/ProcessServerCard'
import { Search, Star, Phone, MapPin, Award } from 'lucide-react'

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
    const [customerProfileId, setCustomerProfileId] = useState<string | null>(null)
    const [sortFilter, setSortFilter] = useState<string>('default') // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [minRating, setMinRating] = useState<number>(0)
    const [minOrders, setMinOrders] = useState<number>(0)
    const [formData, setFormData] = useState({
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

                    // Fetch customer profile to get the real ID
                    let profileId = user.roles?.[0]?.customerProfileId

                    if (!profileId) {
                        try {
                            const profile = await api.getCustomerProfile(userId, token)
                            profileId = profile.id
                        } catch (e) {
                            console.error("Failed to fetch customer profile", e)
                        }
                    }

                    if (profileId) {
                        setCustomerProfileId(profileId)
                        try {
                            const defaultRes = await api.getDefaultProcessServer(profileId, token)
                            if (defaultRes.processServerId) {
                                setDefaultProcessServerId(defaultRes.processServerId)
                            }
                        } catch (e) {
                            console.error("Failed to fetch default process server", e)
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
        let contactsWithDetails = contacts
            .map(contact => ({
                contact,
                details: processServerDetails[contact.processServerId]
            }))
            .filter(item => item.details) // Only include contacts with details

        // Apply search filter
        if (searchQuery) {
            contactsWithDetails = contactsWithDetails.filter(item => {
                const name = item.contact.nickname || item.details.name
                return name.toLowerCase().includes(searchQuery.toLowerCase())
            })
        }

        // Apply rating filter
        if (minRating > 0) {
            contactsWithDetails = contactsWithDetails.filter(item =>
                Number(item.details.currentRating) >= minRating
            )
        }

        // Apply orders filter
        if (minOrders > 0) {
            contactsWithDetails = contactsWithDetails.filter(item =>
                item.details.totalOrdersAssigned >= minOrders
            )
        }

        // Apply sorting
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

            // Use tenant_user_role_id from user's first role (this is the customer_id in orders)
            const customerId = user.roles?.[0]?.id || user.userId

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

                                                    {/* Inline Dropdown Filters */}
                                                    {contactList.length > 0 && (
                                                        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 p-3 glass rounded-lg border border-gray-700">
                                                            {/* Search */}
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search by name..."
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                    className="w-full pl-10 pr-3 py-2 glass rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                                />
                                                            </div>

                                                            {/* Rating Filter */}
                                                            <select
                                                                value={minRating}
                                                                onChange={(e) => setMinRating(Number(e.target.value))}
                                                                className="w-full px-3 py-2 glass rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                            >
                                                                <option value={0}>All Ratings</option>
                                                                <option value={4}>4+ Stars</option>
                                                                <option value={4.5}>4.5+ Stars</option>
                                                                <option value={4.8}>4.8+ Stars</option>
                                                            </select>

                                                            {/* Orders Filter */}
                                                            <select
                                                                value={minOrders}
                                                                onChange={(e) => setMinOrders(Number(e.target.value))}
                                                                className="w-full px-3 py-2 glass rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                            >
                                                                <option value={0}>All Orders</option>
                                                                <option value={5}>5+ Orders</option>
                                                                <option value={10}>10+ Orders</option>
                                                                <option value={20}>20+ Orders</option>
                                                            </select>

                                                            {/* Sort By */}
                                                            <select
                                                                value={sortFilter}
                                                                onChange={(e) => setSortFilter(e.target.value)}
                                                                className="w-full px-3 py-2 glass rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                            >
                                                                <option value="default">Sort: Default</option>
                                                                <option value="highest-rated">Sort: Highest Rated</option>
                                                                <option value="highest-success">Sort: Success Rate</option>
                                                                <option value="most-orders">Sort: Most Orders</option>
                                                                <option value="most-worked">Sort: Most Worked</option>
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* Compact List View */}
                                                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                                        {getSortedContacts(contactList).map(contact => {
                                                            const details = processServerDetails[contact.processServerId]
                                                            if (!details) return null

                                                            const isSelected = dropoff.assignedProcessServerId === contact.processServerId
                                                            const isDefault = contact.processServerId === defaultProcessServerId

                                                            return (
                                                                <div
                                                                    key={contact.id}
                                                                    onClick={() => updateDropoff(index, 'assignedProcessServerId', contact.processServerId)}
                                                                    className={`glass rounded-lg p-4 border-2 transition-all cursor-pointer hover:bg-white/10 ${isSelected ? 'border-primary bg-primary/10' : 'border-transparent'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        {/* Avatar */}
                                                                        <div className="relative flex-shrink-0">
                                                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                                                                                {details.profilePhotoUrl ? (
                                                                                    <img
                                                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/profile-photo/${details.profilePhotoUrl}`}
                                                                                        alt={contact.nickname || details.name}
                                                                                        className="w-full h-full object-cover"
                                                                                        onError={(e) => {
                                                                                            e.currentTarget.style.display = 'none'
                                                                                            const initials = (contact.nickname || details.name).split(' ').map(n => n[0]).join('')
                                                                                            e.currentTarget.parentElement!.textContent = initials
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    (contact.nickname || details.name).split(' ').map(n => n[0]).join('')
                                                                                )}
                                                                            </div>
                                                                            {isDefault && (
                                                                                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full border border-white flex items-center justify-center">
                                                                                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Info */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                                <h3 className="font-semibold text-base truncate">
                                                                                    {contact.nickname || details.name}
                                                                                </h3>
                                                                                {isSelected && (
                                                                                    <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-semibold flex-shrink-0">
                                                                                        ✓ SELECTED
                                                                                    </span>
                                                                                )}
                                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                                    <span className="text-sm font-medium">
                                                                                        {Number(details.currentRating).toFixed(1)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="font-medium text-green-400">{details.successRate?.toFixed(0)}%</span>
                                                                                    <span>Success</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Award className="w-4 h-4" />
                                                                                    <span>{details.totalOrdersAssigned || 0} orders</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="text-green-400">{details.successfulDeliveries || 0}</span>
                                                                                    <span>/ {details.totalOrdersAssigned || 0} delivered</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
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
