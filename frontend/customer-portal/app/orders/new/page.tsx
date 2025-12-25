'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Search, Star, Phone, MapPin, Award, Plus, ChevronDown, Check, User, X, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface ProcessServerDetails {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    profilePhotoUrl: string
    currentRating: number
    successRate: number
    totalOrdersAssigned: number
    successfulDeliveries: number
    operatingZipCodes: string
}

interface ContactEntry {
    id: string
    processServerId: string
    nickname: string
    entryType: string
    activationStatus?: string
    processServerDetails?: ProcessServerDetails | null
}

interface Dropoff {
    recipientName: string
    dropoffAddress: string
    dropoffZipCode: string
    dropoffType: string
    assignedProcessServerId: string
    finalAgreedPrice: string
    dropoffStateId: number | null
    dropoffCityId: number | null
    rushService: boolean
    remoteLocation: boolean
    serviceType: 'PROCESS_SERVICE' | 'CERTIFIED_MAIL'
}

// Modal Component using React Portal
function ProcessServerModal({
    isOpen,
    onClose,
    contacts,
    selectedId,
    onSelect,
    defaultServerId,
    searchQuery,
    setSearchQuery,
    sortFilter,
    setSortFilter,
    minRating,
    setMinRating,
    minOrders,
    setMinOrders
}: {
    isOpen: boolean
    onClose: () => void
    contacts: ContactEntry[]
    selectedId: string
    onSelect: (id: string) => void
    defaultServerId: string | null
    searchQuery: string
    setSearchQuery: (q: string) => void
    sortFilter: string
    setSortFilter: (f: string) => void
    minRating: number
    setMinRating: (r: number) => void
    minOrders: number
    setMinOrders: (o: number) => void
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Select Process Server</h2>
                                <p className="text-sm text-gray-600 mt-1">{contacts.length} available servers</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="px-4 pt-4 pb-2 border-b border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone, zip..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Rating Filter */}
                                <select
                                    value={minRating}
                                    onChange={(e) => setMinRating(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value={0}>All Orders</option>
                                    <option value={5}>5+ Orders</option>
                                    <option value={10}>10+ Orders</option>
                                    <option value={20}>20+ Orders</option>
                                </select>

                                {/* Sort */}
                                <select
                                    value={sortFilter}
                                    onChange={(e) => setSortFilter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="default">Sort: Default</option>
                                    <option value="highest-rated">Sort: Highest Rated</option>
                                    <option value="highest-success">Sort: Success Rate</option>
                                    <option value="most-orders">Sort: Most Orders</option>
                                    <option value="most-worked">Sort: Most Worked</option>
                                </select>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {contacts.map((contact, idx) => {
                                    // Create fallback details if missing
                                    const details = contact.processServerDetails || {
                                        id: contact.processServerId,
                                        name: contact.nickname || 'Unknown Server',
                                        firstName: contact.nickname?.split(' ')[0] || 'Unknown',
                                        lastName: contact.nickname?.split(' ').slice(1).join(' ') || '',
                                        email: '',
                                        phoneNumber: '',
                                        profilePhotoUrl: '',
                                        currentRating: 0,
                                        successRate: 0,
                                        totalOrdersAssigned: 0,
                                        successfulDeliveries: 0,
                                        operatingZipCodes: ''
                                    }

                                    const isActivated = contact.activationStatus !== 'NOT_ACTIVATED'

                                    const isSelected = selectedId === contact.processServerId
                                    const isDefault = contact.processServerId === defaultServerId

                                    return (
                                        <motion.button
                                            key={contact.id}
                                            type="button"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => {
                                                onSelect(contact.processServerId)
                                                onClose()
                                            }}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Avatar */}
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-md">
                                                        {details.profilePhotoUrl ? (
                                                            <img
                                                                src={`http://localhost:8080/api/process-servers/profile-photo/${details.profilePhotoUrl}`}
                                                                alt={contact.nickname || details.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none'
                                                                    const initials = (contact.nickname || details.name).split(' ').map((n: string) => n[0]).join('')
                                                                    if (e.currentTarget.parentElement) {
                                                                        e.currentTarget.parentElement.textContent = initials
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            (contact.nickname || details.name).split(' ').map((n: string) => n[0]).join('')
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                    {isDefault && !isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                                            <Star className="w-3 h-3 text-white fill-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate flex items-center gap-2">
                                                        {contact.nickname || details.name}
                                                        {!isActivated && (
                                                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium border border-yellow-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </h3>

                                                    <div className="flex items-center gap-4 text-sm mb-2">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-semibold text-gray-900">{Number(details.currentRating).toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-green-600 font-semibold">{details.successRate?.toFixed(0)}%</span>
                                                            <span className="text-gray-500">Success</span>
                                                        </div>
                                                    </div>

                                                    {/* Contact Details */}
                                                    <div className="space-y-1 mb-2">
                                                        {details.email && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                                <span className="truncate">{details.email}</span>
                                                            </div>
                                                        )}
                                                        {details.phoneNumber && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                                <span>{details.phoneNumber}</span>
                                                            </div>
                                                        )}
                                                        {details.operatingZipCodes && (
                                                            <div className="flex items-start gap-2 text-xs text-gray-600">
                                                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    {(() => {
                                                                        try {
                                                                            const cleanedZipCodes = details.operatingZipCodes.replace(/\\/g, '')
                                                                            const zipCodes = JSON.parse(cleanedZipCodes)
                                                                            if (Array.isArray(zipCodes) && zipCodes.length > 0) {
                                                                                return (
                                                                                    <span className="line-clamp-2">
                                                                                        {zipCodes.slice(0, 8).join(', ')}
                                                                                        {zipCodes.length > 8 && ` +${zipCodes.length - 8} more`}
                                                                                    </span>
                                                                                )
                                                                            }
                                                                        } catch (e) {
                                                                            return <span>ZIP codes available</span>
                                                                        }
                                                                        return <span>ZIP codes available</span>
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Award className="w-3 h-3" />
                                                            <span>{details.totalOrdersAssigned || 0} orders</span>
                                                        </div>
                                                        {details.totalOrdersAssigned > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    <span className="text-green-600 font-medium">{details.successfulDeliveries || 0}</span> / {details.totalOrdersAssigned} delivered
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}

export default function NewOrder() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [contactList, setContactList] = useState<ContactEntry[]>([])
    const [defaultProcessServerId, setDefaultProcessServerId] = useState<string | null>(null)
    const [customerProfileId, setCustomerProfileId] = useState<string | null>(null)
    const [sortFilter, setSortFilter] = useState<string>('default')
    const [searchQuery, setSearchQuery] = useState('')
    const [minRating, setMinRating] = useState<number>(0)
    const [minOrders, setMinOrders] = useState<number>(0)
    const [modalOpen, setModalOpen] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        specialInstructions: '',
        deadline: '',
        documentType: '',
        otherDocumentType: '',
        caseNumber: '',
        jurisdiction: '',
    })
    const [dropoffs, setDropoffs] = useState<Dropoff[]>([{
        recipientName: '',
        dropoffAddress: '',
        dropoffZipCode: '',
        dropoffType: 'AUTOMATED',
        assignedProcessServerId: '',
        finalAgreedPrice: '',
        dropoffStateId: null,
        dropoffCityId: null,
        rushService: false,
        remoteLocation: false,
        serviceType: 'PROCESS_SERVICE',
    }])
    const dropoffRefs = useRef<(HTMLDivElement | null)[]>([])

    const [states, setStates] = useState<any[]>([])
    const [citiesByDropoff, setCitiesByDropoff] = useState<Record<number, any[]>>({})

    // Filter and sort function
    const filterAndSortContacts = (contacts: ContactEntry[]) => {
        let filtered = contacts.filter(contact => {
            // Allow all contacts, even if not activated or missing details
            // We will handle missing details in the render function
            return true
        })

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(contact => {
                const server = contact.processServerDetails
                const nicknameMatch = contact.nickname?.toLowerCase().includes(searchQuery.toLowerCase())

                // If server details exist, check them
                if (server) {
                    const nameMatch = `${server.firstName} ${server.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                    const emailMatch = server.email.toLowerCase().includes(searchQuery.toLowerCase())
                    const phoneMatch = server.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())

                    // Check zip codes
                    let zipMatch = false
                    if (server.operatingZipCodes) {
                        try {
                            const cleanedZipCodes = server.operatingZipCodes.replace(/\\/g, '')
                            const zipCodes = JSON.parse(cleanedZipCodes)
                            if (Array.isArray(zipCodes)) {
                                zipMatch = zipCodes.some((zip: any) => String(zip).includes(searchQuery))
                            }
                        } catch (e) {
                            zipMatch = server.operatingZipCodes.includes(searchQuery)
                        }
                    }

                    return nameMatch || nicknameMatch || emailMatch || phoneMatch || zipMatch
                }

                // If no server details (e.g. invited user), check nickname or processServerId (which might be email)
                const idMatch = contact.processServerId?.toLowerCase().includes(searchQuery.toLowerCase())
                return nicknameMatch || idMatch
            })
        }



        // Apply rating filter
        if (minRating > 0) {
            filtered = filtered.filter(contact =>
                contact.processServerDetails && contact.processServerDetails.currentRating >= minRating
            )
        }

        // Apply orders filter
        if (minOrders > 0) {
            filtered = filtered.filter(contact =>
                contact.processServerDetails && contact.processServerDetails.totalOrdersAssigned >= minOrders
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const detailsA = a.processServerDetails
            const detailsB = b.processServerDetails

            // Handle missing details (put them at the bottom or treat as 0)
            if (!detailsA && !detailsB) return 0
            if (!detailsA) return 1
            if (!detailsB) return -1

            switch (sortFilter) {
                case 'highest-rated':
                    return detailsB.currentRating - detailsA.currentRating
                case 'highest-success':
                    return detailsB.successRate - detailsA.successRate
                case 'most-orders':
                    return detailsB.totalOrdersAssigned - detailsA.totalOrdersAssigned
                case 'most-worked':
                    return detailsB.successfulDeliveries - detailsA.successfulDeliveries
                default:
                    return 0
            }
        })

        return filtered
    }

    // Filter contacts in render body - exact same pattern as contacts page
    const filteredContacts = filterAndSortContacts(contactList)

    useEffect(() => {
        const loadStates = async () => {
            try {
                const statesData = await api.getStates()
                setStates(statesData)
            } catch (error) {
                console.error('Failed to load states:', error)
            }
        }
        loadStates()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token')
                const user = JSON.parse(sessionStorage.getItem('user') || '{}')
                const userId = user.userId

                if (token && userId) {
                    const contacts = await api.getContactList(userId, token)

                    // Enrich contacts with detailed process server info
                    const enrichedContacts = await Promise.all(
                        contacts.map(async (contact: ContactEntry) => {
                            // Try to fetch details, but handle failure or non-activated status
                            try {
                                // If not activated, we might not get full details, but let's try or just return basic info
                                if (contact.activationStatus === 'NOT_ACTIVATED') {
                                    return {
                                        ...contact,
                                        processServerDetails: null // Will be handled in render
                                    }
                                }

                                const details = await api.getProcessServerDetails(contact.processServerId, token)
                                return {
                                    ...contact,
                                    processServerDetails: details
                                }
                            } catch (error) {
                                console.error(`Failed to fetch details for ${contact.processServerId}:`, error)
                                return {
                                    ...contact,
                                    processServerDetails: null
                                }
                            }
                        })
                    )

                    setContactList(enrichedContacts)

                    // Fetch customer profile
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

    const addDropoff = () => {
        const newDropoff = {
            recipientName: '',
            dropoffAddress: '',
            dropoffZipCode: '',
            dropoffType: 'AUTOMATED',
            assignedProcessServerId: '',
            finalAgreedPrice: '',
            dropoffStateId: null as number | null,
            dropoffCityId: null as number | null,
            rushService: false,
            remoteLocation: false,
            serviceType: 'PROCESS_SERVICE' as 'PROCESS_SERVICE' | 'CERTIFIED_MAIL',
        }
        setDropoffs([...dropoffs, newDropoff])

        setTimeout(() => {
            const newIndex = dropoffs.length
            dropoffRefs.current[newIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 100)
    }

    const removeDropoff = (index: number) => {
        setDropoffs(dropoffs.filter((_, i) => i !== index))
    }

    const updateDropoff = (index: number, field: string, value: any) => {
        const updated = [...dropoffs]
        updated[index] = { ...updated[index], [field]: value }
        setDropoffs(updated)
    }

    const handleStateChange = async (index: number, stateId: number) => {
        const updated = [...dropoffs]
        updated[index].dropoffStateId = stateId
        updated[index].dropoffCityId = null
        updated[index].dropoffZipCode = ''
        setDropoffs(updated)

        try {
            const cities = await api.getCitiesByState(stateId)
            setCitiesByDropoff({ ...citiesByDropoff, [index]: cities })
        } catch (error) {
            console.error('Failed to load cities:', error)
        }
    }

    const handleCityChange = async (index: number, cityId: number) => {
        const updated = [...dropoffs]
        updated[index].dropoffCityId = cityId

        try {
            const city = await api.getCityById(cityId)
            updated[index].dropoffZipCode = city.zipCode
            setDropoffs(updated)
        } catch (error) {
            console.error('Failed to get city details:', error)
        }
    }



    // Persistence Logic
    useEffect(() => {
        const savedFormData = localStorage.getItem('newOrder_formData')
        const savedDropoffs = localStorage.getItem('newOrder_dropoffs')

        if (savedFormData) {
            try {
                setFormData(JSON.parse(savedFormData))
            } catch (e) {
                console.error("Failed to parse saved form data", e)
            }
        }

        if (savedDropoffs) {
            try {
                setDropoffs(JSON.parse(savedDropoffs))
            } catch (e) {
                console.error("Failed to parse saved dropoffs", e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('newOrder_formData', JSON.stringify(formData))
    }, [formData])

    useEffect(() => {
        localStorage.setItem('newOrder_dropoffs', JSON.stringify(dropoffs))
    }, [dropoffs])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const customerId = user.roles?.[0]?.id || user.userId
            const formattedDeadline = formData.deadline.includes(':00:')
                ? formData.deadline
                : `${formData.deadline}:00`

            const orderData = {
                tenantId: user.roles[0]?.tenantId,
                customerId: customerId,
                ...formData,
                deadline: formattedDeadline,
                documentType: formData.documentType,
                otherDocumentType: formData.documentType === 'OTHER' ? formData.otherDocumentType : null,
                caseNumber: formData.caseNumber,
                jurisdiction: formData.jurisdiction,
                dropoffs: dropoffs.map(d => ({
                    ...d,
                    assignedProcessServerId: d.dropoffType === 'AUTOMATED' ? null : d.assignedProcessServerId,
                    finalAgreedPrice: d.dropoffType === 'GUIDED' && d.finalAgreedPrice ? parseFloat(d.finalAgreedPrice) : null,
                })),
            }

            const newOrder = await api.createOrder(orderData, token!)

            // Clear saved data on success
            localStorage.removeItem('newOrder_formData')
            localStorage.removeItem('newOrder_dropoffs')

            router.push(`/orders/${newOrder.id}`)
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
                                    type="datetime-local"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                            <textarea
                                value={formData.specialInstructions}
                                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                                placeholder="Handle with care..."
                            />
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
                                <div
                                    key={index}
                                    ref={(el) => { dropoffRefs.current[index] = el }}
                                    className="glass rounded-lg p-4"
                                >
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
                                            <label className="block text-sm font-medium mb-2">State *</label>
                                            <select
                                                value={dropoff.dropoffStateId || ''}
                                                onChange={(e) => handleStateChange(index, Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            >
                                                <option value="">Select State</option>
                                                {states.map(state => (
                                                    <option key={state.id} value={state.id}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">City *</label>
                                            <select
                                                value={dropoff.dropoffCityId || ''}
                                                onChange={(e) => handleCityChange(index, Number(e.target.value))}
                                                disabled={!dropoff.dropoffStateId}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                required
                                            >
                                                <option value="">Select City</option>
                                                {(citiesByDropoff[index] || []).map(city => (
                                                    <option key={city.id} value={city.id}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                value={dropoff.dropoffZipCode}
                                                readOnly
                                                className="w-full px-4 py-3 rounded-lg glass bg-gray-800/50 cursor-not-allowed"
                                                placeholder="Auto-fills when city selected"
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
                                                    <label className="block text-sm font-medium mb-3 text-gray-700">
                                                        Select Process Server
                                                        {contactList.length > 0 && (
                                                            <span className="ml-2 text-xs text-gray-500">
                                                                ({contactList.length} available)
                                                            </span>
                                                        )}
                                                    </label>

                                                    {contactList.length > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setModalOpen(index)}
                                                            className="w-full px-5 py-4 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-left flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1">
                                                                {dropoff.assignedProcessServerId ? (
                                                                    <>
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                                            <Check className="w-5 h-5 text-white" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="text-gray-900 font-semibold">
                                                                                {(() => {
                                                                                    const contact = contactList.find(c => c.processServerId === dropoff.assignedProcessServerId)
                                                                                    const details = contact?.processServerDetails
                                                                                    return contact?.nickname || details?.name || 'Unknown Server'
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-xs text-gray-600 flex items-center gap-2">
                                                                                <span className="flex items-center gap-1">
                                                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                                    {(() => {
                                                                                        const contact = contactList.find(c => c.processServerId === dropoff.assignedProcessServerId)
                                                                                        return Number(contact?.processServerDetails?.currentRating || 0).toFixed(1)
                                                                                    })()}
                                                                                </span>
                                                                                <span>•</span>
                                                                                <span>
                                                                                    {(() => {
                                                                                        const contact = contactList.find(c => c.processServerId === dropoff.assignedProcessServerId)
                                                                                        return contact?.processServerDetails?.totalOrdersAssigned || 0
                                                                                    })()} orders
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                            <User className="w-5 h-5 text-gray-400" />
                                                                        </div>
                                                                        <span className="text-gray-500">Select a Process Server</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
                                                        </button>
                                                    ) : (
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

                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium mb-2">Offer Amount ($)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={dropoff.finalAgreedPrice || ''}
                                                            onChange={(e) => updateDropoff(index, 'finalAgreedPrice', e.target.value)}
                                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Type Selection */}
                                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                                            <label className="block text-sm font-medium mb-2">Order Type</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <label className={`flex items-center gap-3 p-3 rounded-lg glass cursor-pointer transition-colors ${dropoff.serviceType === 'PROCESS_SERVICE' ? 'bg-blue-50 border-blue-200' : 'hover:bg-white/40'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={dropoff.serviceType === 'PROCESS_SERVICE'}
                                                        onChange={() => updateDropoff(index, 'serviceType', 'PROCESS_SERVICE')}
                                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="font-medium text-gray-900">Process Service</span>
                                                        <p className="text-xs text-gray-500">Standard service of process</p>
                                                    </div>
                                                </label>

                                                <label className={`flex items-center gap-3 p-3 rounded-lg glass cursor-pointer transition-colors ${dropoff.serviceType === 'CERTIFIED_MAIL' ? 'bg-blue-50 border-blue-200' : 'hover:bg-white/40'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={dropoff.serviceType === 'CERTIFIED_MAIL'}
                                                        onChange={() => updateDropoff(index, 'serviceType', 'CERTIFIED_MAIL')}
                                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="font-medium text-gray-900">Certified Mail</span>
                                                        <p className="text-xs text-gray-500">Delivery via USPS Certified Mail</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Service Options */}
                                        <div className="mt-4 pt-4 border-t border-gray-200/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="flex items-center gap-3 p-3 rounded-lg glass hover:bg-white/40 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={dropoff.rushService}
                                                    onChange={(e) => updateDropoff(index, 'rushService', e.target.checked)}
                                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <div>
                                                    <span className="font-medium text-gray-900">Rush Service</span>
                                                    <p className="text-xs text-gray-500">Expedited delivery (+ $50.00)</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 rounded-lg glass hover:bg-white/40 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={dropoff.remoteLocation}
                                                    onChange={(e) => updateDropoff(index, 'remoteLocation', e.target.checked)}
                                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <div>
                                                    <span className="font-medium text-gray-900">Remote Location</span>
                                                    <p className="text-xs text-gray-500">Hard to reach area (+ $30.00)</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info */}


                    {/* Payment Summary */}
                    <div className="glass rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">💳</span> Payment Summary
                        </h3>

                        <div className="space-y-3">
                            {dropoffs.map((dropoff, i) => {
                                // For Automated orders, base price is 0 (determined by bid later)
                                // For Guided orders, use the entered price or 0
                                const basePrice = dropoff.dropoffType === 'AUTOMATED'
                                    ? 0
                                    : (dropoff.finalAgreedPrice ? parseFloat(dropoff.finalAgreedPrice) : 0)

                                const rushFee = dropoff.rushService ? 50.00 : 0
                                const remoteFee = dropoff.remoteLocation ? 30.00 : 0
                                const subtotal = basePrice + rushFee + remoteFee

                                return (
                                    <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                                        <div>
                                            <span className="font-medium text-gray-700">Dropoff #{i + 1}</span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Base: ${basePrice.toFixed(2)}
                                                {dropoff.rushService && <span className="text-blue-600 ml-2">• Rush (+$50)</span>}
                                                {dropoff.remoteLocation && <span className="text-purple-600 ml-2">• Remote (+$30)</span>}
                                            </div>
                                        </div>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                )
                            })}

                            <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total Estimated Cost</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ${dropoffs.reduce((acc, d) => {
                                        const base = d.dropoffType === 'AUTOMATED'
                                            ? 0
                                            : (d.finalAgreedPrice ? parseFloat(d.finalAgreedPrice) : 0)
                                        return acc + base + (d.rushService ? 50.00 : 0) + (d.remoteLocation ? 30.00 : 0)
                                    }, 0).toFixed(2)}
                                </span>
                            </div>
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

                {/* Floating Action Button */}
                <button
                    type="button"
                    onClick={addDropoff}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
                    aria-label="Add Dropoff"
                >
                    <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        Add Dropoff
                    </span>
                    {dropoffs.length > 1 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                            {dropoffs.length}
                        </span>
                    )}
                </button>
            </div >

            {/* Modal Portal */}
            {
                dropoffs.map((dropoff, index) => (
                    <ProcessServerModal
                        key={`modal-${index}`}
                        isOpen={modalOpen === index}
                        onClose={() => setModalOpen(null)}
                        contacts={filteredContacts}
                        selectedId={dropoff.assignedProcessServerId}
                        onSelect={(id) => updateDropoff(index, 'assignedProcessServerId', id)}
                        defaultServerId={defaultProcessServerId}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortFilter={sortFilter}
                        setSortFilter={setSortFilter}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        minOrders={minOrders}
                        setMinOrders={setMinOrders}
                    />
                ))
            }
        </div >
    )
}
