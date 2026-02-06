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

interface Recipient {
    recipientEntityType?: string
    firstName?: string
    middleName?: string
    lastName?: string
    organizationName?: string
    authorizedAgent?: string
    email?: string
    phone?: string
    recipientName: string
    recipientAddress: string
    recipientCity: string
    recipientZipCode: string
    recipientType: string
    assignedProcessServerId: string
    finalAgreedPrice: string
    recipientStateId: number | null
    recipientCityId: number | null
    rushService: boolean
    remoteLocation: boolean
    processService: boolean
    certifiedMail: boolean
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
    const [uploadProgress, setUploadProgress] = useState(0)
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
        initiatorType: '',
        initiatorFirstName: '',
        initiatorMiddleName: '',
        initiatorLastName: '',
        initiatorAddress: '',
        initiatorCity: '',
        initiatorState: '',
        initiatorZipCode: '',
        initiatorPhone: '',
        hearingDate: '',
        personalServiceDate: '',
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePageCount, setFilePageCount] = useState<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [recipients, setRecipients] = useState<Recipient[]>([{
        recipientEntityType: 'INDIVIDUAL',
        firstName: '',
        middleName: '',
        lastName: '',
        organizationName: '',
        authorizedAgent: '',
        email: '',
        phone: '',
        recipientName: '',
        recipientAddress: '',
        recipientCity: '',
        recipientZipCode: '',
        recipientType: 'AUTOMATED',
        assignedProcessServerId: '',
        finalAgreedPrice: '',
        recipientStateId: null,
        recipientCityId: null,
        rushService: false,
        remoteLocation: false,
        processService: true,
        certifiedMail: false,
    }])
    const recipientRefs = useRef<(HTMLDivElement | null)[]>([])

    const [states, setStates] = useState<any[]>([])
    const [citiesByRecipient, setCitiesByRecipient] = useState<Record<number, any[]>>({})

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

    const addRecipient = () => {
        const newRecipient = {
            recipientEntityType: 'INDIVIDUAL',
            firstName: '',
            middleName: '',
            lastName: '',
            organizationName: '',
            authorizedAgent: '',
            email: '',
            phone: '',
            recipientName: '',
            recipientAddress: '',
            recipientCity: '',
            recipientZipCode: '',
            recipientType: 'AUTOMATED',
            assignedProcessServerId: '',
            finalAgreedPrice: '',
            recipientStateId: null as number | null,
            recipientCityId: null as number | null,
            rushService: false,
            remoteLocation: false,
            processService: true,
            certifiedMail: false,
        }
        setRecipients([...recipients, newRecipient])

        setTimeout(() => {
            const newIndex = recipients.length
            recipientRefs.current[newIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 100)
    }

    const removeRecipient = (index: number) => {
        setRecipients(recipients.filter((_, i) => i !== index))
    }

    const updateRecipient = (index: number, field: string, value: any) => {
        const updated = [...recipients]
        updated[index] = { ...updated[index], [field]: value }
        setRecipients(updated)
    }

    const handleStateChange = async (index: number, stateId: number) => {
        const updated = [...recipients]
        updated[index].recipientStateId = stateId
        updated[index].recipientCityId = null
        updated[index].recipientZipCode = ''
        setRecipients(updated)

        try {
            const cities = await api.getCitiesByState(stateId)
            setCitiesByRecipient({ ...citiesByRecipient, [index]: cities })
        } catch (error) {
            console.error('Failed to load cities:', error)
        }
    }

    const handleCityChange = async (index: number, cityId: number) => {
        const updated = [...recipients]
        updated[index].recipientCityId = cityId
        // ZIP code is now manually entered, not auto-populated
        setRecipients(updated)
    }

    // Count PDF pages using pdf.js
    const countPDFPages = async (file: File): Promise<number | null> => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return null
        }

        try {
            const arrayBuffer = await file.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)

            // Simple PDF page count by looking for /Type /Page entries
            const text = new TextDecoder('latin1').decode(uint8Array)
            const pageMatches = text.match(/\/Type\s*\/Page[^s]/g)

            if (pageMatches) {
                return pageMatches.length
            }

            return null
        } catch (error) {
            console.error('Error counting PDF pages:', error)
            return null
        }
    }

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        setSelectedFile(file)

        // Count pages for PDF files
        if (file.name.toLowerCase().endsWith('.pdf')) {
            const pageCount = await countPDFPages(file)
            setFilePageCount(pageCount)
        } else {
            setFilePageCount(null)
        }
    }

    // Drag and drop file handlers
    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer?.files
        if (files && files.length > 0) {
            const file = files[0]

            // Validate file type
            const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
            if (!validTypes.includes(fileExtension)) {
                alert('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files only.')
                return
            }

            // Validate file size
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit. Please choose a smaller file.')
                return
            }

            handleFileSelect(file)
        }
    }

    const handleBackToDashboard = async () => {
        // Check if form has any data
        const hasFormData =
            formData.caseNumber.trim() !== '' ||
            formData.jurisdiction.trim() !== '' ||
            formData.documentType !== '' ||
            formData.deadline !== '' ||
            formData.specialInstructions.trim() !== '' ||
            selectedFile !== null ||
            recipients.some(d =>
                d.recipientName.trim() !== '' ||
                d.recipientAddress.trim() !== '' ||
                d.recipientCity.trim() !== '' ||
                d.recipientZipCode.trim() !== ''
            )

        if (hasFormData) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?')
            if (!confirmed) {
                return
            }
            // Clear localStorage and navigate
            localStorage.removeItem('newOrder_formData')
            localStorage.removeItem('newOrder_recipients')
        }
        router.push('/dashboard')
    }



    // Persistence Logic
    useEffect(() => {
        const savedFormData = localStorage.getItem('newOrder_formData')
        const savedRecipients = localStorage.getItem('newOrder_recipients')

        if (savedFormData) {
            try {
                setFormData(JSON.parse(savedFormData))
            } catch (e) {
                console.error("Failed to parse saved form data", e)
            }
        }

        if (savedRecipients) {
            try {
                setRecipients(JSON.parse(savedRecipients))
            } catch (e) {
                console.error("Failed to parse saved recipients", e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('newOrder_formData', JSON.stringify(formData))
    }, [formData])

    useEffect(() => {
        localStorage.setItem('newOrder_recipients', JSON.stringify(recipients))
    }, [recipients])

    const handleSubmit = async (e: React.FormEvent | null) => {
        if (e) e.preventDefault()
        await saveOrder()
    }

    const saveOrder = async () => {
        setLoading(true)

        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const customerId = user.roles?.[0]?.id || user.userId

            const deadline = formData.deadline
                ? (formData.deadline.includes(':00:') ? formData.deadline : `${formData.deadline}:00`)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T12:00:00'

            const orderData = {
                tenantId: user.roles[0]?.tenantId,
                customerId: customerId,
                ...formData,
                deadline: deadline,
                documentType: formData.documentType || formData.documentType,
                otherDocumentType: formData.documentType === 'OTHER' ? formData.otherDocumentType : null,
                caseNumber: formData.caseNumber || '',
                jurisdiction: formData.jurisdiction || '',
                recipients: recipients.map(r => ({
                    ...r,
                    assignedProcessServerId: r.recipientType === 'AUTOMATED' ? null : r.assignedProcessServerId,
                    finalAgreedPrice: r.recipientType === 'GUIDED' && r.finalAgreedPrice ? parseFloat(r.finalAgreedPrice) : null,
                })),
            }

            const newOrder = await api.createOrder(orderData, token!)

            if (selectedFile) {
                try {
                    await api.uploadOrderDocument(newOrder.id, selectedFile, token!, (progress) => {
                        setUploadProgress(progress)
                    })
                } catch (uploadError) {
                    console.error('Failed to upload document:', uploadError)
                    alert('Order created but document upload failed. Please try uploading again from the order details page.')
                }
            }

            // Clear saved data on success
            localStorage.removeItem('newOrder_formData')
            localStorage.removeItem('newOrder_recipients')

            alert('Order created successfully!')
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
                        type="button"
                        onClick={handleBackToDashboard}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold">Create New Order</h1>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-6">
                    {/* Who Are You Section */}
                    <div className="glass rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">👤</span> Who Are You?
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">I am:</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, initiatorType: 'SELF_REPRESENTED' })}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formData.initiatorType === 'SELF_REPRESENTED'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-semibold">Self-Represented</div>
                                        <div className="text-sm text-gray-600">Filing on my own behalf</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, initiatorType: 'ATTORNEY' })}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formData.initiatorType === 'ATTORNEY'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-semibold">Attorney</div>
                                        <div className="text-sm text-gray-600">Representing a client</div>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.initiatorFirstName}
                                        onChange={(e) => setFormData({ ...formData, initiatorFirstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Middle Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.initiatorMiddleName}
                                        onChange={(e) => setFormData({ ...formData, initiatorMiddleName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Middle Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.initiatorLastName}
                                        onChange={(e) => setFormData({ ...formData, initiatorLastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Address</label>
                                <input
                                    type="text"
                                    value={formData.initiatorAddress}
                                    onChange={(e) => setFormData({ ...formData, initiatorAddress: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Street Address"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <input
                                        type="text"
                                        value={formData.initiatorCity}
                                        onChange={(e) => setFormData({ ...formData, initiatorCity: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">State</label>
                                    <input
                                        type="text"
                                        value={formData.initiatorState}
                                        onChange={(e) => setFormData({ ...formData, initiatorState: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                    <input
                                        type="text"
                                        value={formData.initiatorZipCode}
                                        onChange={(e) => setFormData({ ...formData, initiatorZipCode: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="ZIP"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.initiatorPhone}
                                    onChange={(e) => setFormData({ ...formData, initiatorPhone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>
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
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Hearing Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.hearingDate}
                                    onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Personal Service Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.personalServiceDate}
                                    onChange={(e) => setFormData({ ...formData, personalServiceDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Upload Document (PDF, Word, Images)</label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isDragging
                                        ? 'bg-blue-50 border-blue-500 scale-105'
                                        : 'hover:bg-gray-50 border-gray-300'
                                        }`}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className={`w-8 h-8 mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className={`mb-2 text-sm transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-500'}`}>
                                            <span className="font-semibold">{isDragging ? 'Drop file here' : 'Click to upload'}</span> {!isDragging && 'or drag and drop'}
                                        </p>
                                        <p className={`text-xs transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-500'}`}>PDF, DOC, DOCX, JPG, PNG</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0]
                                                if (file.size > 5 * 1024 * 1024) {
                                                    alert('File size exceeds 5MB limit. Please choose a smaller file.')
                                                    e.target.value = '' // Reset input
                                                    return
                                                }
                                                handleFileSelect(file)
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            {selectedFile && (
                                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-green-900 truncate">
                                                    {selectedFile.name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-green-700">
                                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                                    </span>
                                                    {filePageCount !== null && (
                                                        <span className="text-xs text-green-700 font-medium bg-green-100 px-2 py-0.5 rounded">
                                                            📄 {filePageCount} {filePageCount === 1 ? 'page' : 'pages'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {selectedFile.type === 'application/pdf' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = URL.createObjectURL(selectedFile)
                                                            window.open(url, '_blank')
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                                                        title="View PDF"
                                                    >
                                                        👁 View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = URL.createObjectURL(selectedFile)
                                                            const a = document.createElement('a')
                                                            a.href = url
                                                            a.download = selectedFile.name
                                                            document.body.appendChild(a)
                                                            a.click()
                                                            document.body.removeChild(a)
                                                            URL.revokeObjectURL(url)
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                                                        title="Download PDF"
                                                    >
                                                        ⬇ Download
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFile(null)
                                                    setFilePageCount(null)
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                                title="Remove file"
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <p className="text-xs text-center mt-1 text-gray-500">{uploadProgress}% Uploading...</p>
                            </div>
                        )}

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

                    {/* Recipients */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Delivery Destinations</h2>
                            <button
                                type="button"
                                onClick={addRecipient}
                                className="px-4 py-2 glass rounded-lg hover:bg-primary/20 transition"
                            >
                                + Add Recipient
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recipients.map((recipient, index) => (
                                <div
                                    key={index}
                                    ref={(el) => { recipientRefs.current[index] = el }}
                                    className="glass rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-medium">Recipient #{index + 1}</h3>
                                        {recipients.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeRecipient(index)}
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
                                                value={recipient.recipientName}
                                                onChange={(e) => updateRecipient(index, 'recipientName', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Middle Name (Optional)</label>
                                            <input
                                                type="text"
                                                value={recipient.middleName || ''}
                                                onChange={(e) => updateRecipient(index, 'middleName', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Middle"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                                            <input
                                                type="email"
                                                value={recipient.email || ''}
                                                onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                                            <input
                                                type="tel"
                                                value={recipient.phone || ''}
                                                onChange={(e) => updateRecipient(index, 'phone', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Address</label>
                                            <input
                                                type="text"
                                                value={recipient.recipientAddress}
                                                onChange={(e) => updateRecipient(index, 'recipientAddress', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="456 Park Ave"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                value={recipient.recipientZipCode}
                                                onChange={(e) => updateRecipient(index, 'recipientZipCode', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass"
                                                placeholder="Enter ZIP code"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">State *</label>
                                            <select
                                                value={recipient.recipientStateId || ''}
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
                                            <input
                                                type="text"
                                                value={recipient.recipientCity || ''}
                                                onChange={(e) => updateRecipient(index, 'recipientCity', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Enter city name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Assignment Type */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Assignment Type</label>
                                            <select
                                                value={recipient.recipientType}
                                                onChange={(e) => updateRecipient(index, 'recipientType', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="AUTOMATED">Open Bid (Automated)</option>
                                                <option value="GUIDED">Direct Assign (Guided)</option>
                                            </select>
                                        </div>

                                        {recipient.recipientType === 'GUIDED' && (
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
                                                                {recipient.assignedProcessServerId ? (
                                                                    <>
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                                            <Check className="w-5 h-5 text-white" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="text-gray-900 font-semibold">
                                                                                {(() => {
                                                                                    const contact = contactList.find(c => c.processServerId === recipient.assignedProcessServerId)
                                                                                    const details = contact?.processServerDetails
                                                                                    return contact?.nickname || details?.name || 'Unknown Server'
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-xs text-gray-600 flex items-center gap-2">
                                                                                <span className="flex items-center gap-1">
                                                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                                    {(() => {
                                                                                        const contact = contactList.find(c => c.processServerId === recipient.assignedProcessServerId)
                                                                                        return Number(contact?.processServerDetails?.currentRating || 0).toFixed(1)
                                                                                    })()}
                                                                                </span>
                                                                                <span>•</span>
                                                                                <span>
                                                                                    {(() => {
                                                                                        const contact = contactList.find(c => c.processServerId === recipient.assignedProcessServerId)
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
                                                            value={recipient.finalAgreedPrice || ''}
                                                            onChange={(e) => updateRecipient(index, 'finalAgreedPrice', e.target.value)}
                                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Type Selection */}
                                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                                            <label className="block text-sm font-medium mb-2">Order Type <span className="text-gray-400 text-xs">(Select one or both)</span></label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <label className={`flex items-center gap-3 p-3 rounded-lg glass cursor-pointer transition-colors border-2 ${recipient.processService ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-white/40'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={recipient.processService}
                                                        onChange={(e) => updateRecipient(index, 'processService', e.target.checked)}
                                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <span className="font-medium text-gray-900">Process Service</span>
                                                        <p className="text-xs text-gray-500">Standard service of process</p>
                                                    </div>
                                                </label>

                                                <label className={`flex items-center gap-3 p-3 rounded-lg glass cursor-pointer transition-colors border-2 ${recipient.certifiedMail ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-white/40'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={recipient.certifiedMail}
                                                        onChange={(e) => updateRecipient(index, 'certifiedMail', e.target.checked)}
                                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
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
                                                    checked={recipient.rushService}
                                                    onChange={(e) => updateRecipient(index, 'rushService', e.target.checked)}
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
                                                    checked={recipient.remoteLocation}
                                                    onChange={(e) => updateRecipient(index, 'remoteLocation', e.target.checked)}
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
                            {recipients.map((recipient, i) => {
                                // For Automated orders, base is $0 (pending bid), but show estimated fees
                                // For Guided orders, base = offer amount, then add fees on top
                                const basePrice = recipient.recipientType === 'AUTOMATED'
                                    ? 0
                                    : (recipient.finalAgreedPrice ? parseFloat(recipient.finalAgreedPrice) : 0)

                                // Show fees for both GUIDED and AUTOMATED
                                // For AUTOMATED, these are estimated fees that will be added when bid is accepted
                                const rushFee = recipient.rushService ? 50.00 : 0
                                const remoteFee = recipient.remoteLocation ? 30.00 : 0
                                const subtotal = basePrice + rushFee + remoteFee

                                return (
                                    <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                                        <div>
                                            <span className="font-medium text-gray-700">Recipient #{i + 1}</span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Base: ${basePrice.toFixed(2)}
                                                {recipient.recipientType === 'AUTOMATED' && basePrice === 0 && <span className="text-gray-400 ml-2 italic">• Price pending bid</span>}
                                                {rushFee > 0 && <span className="text-blue-600 ml-2">• Rush (+$50)</span>}
                                                {remoteFee > 0 && <span className="text-purple-600 ml-2">• Remote (+$30)</span>}
                                            </div>
                                        </div>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                )
                            })}

                            <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total Estimated Cost</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ${recipients.reduce((acc, d) => {
                                        const base = d.recipientType === 'AUTOMATED'
                                            ? 0
                                            : (d.finalAgreedPrice ? parseFloat(d.finalAgreedPrice) : 0)
                                        // Show fees for both GUIDED and AUTOMATED
                                        const rushFee = d.rushService ? 50.00 : 0
                                        const remoteFee = d.remoteLocation ? 30.00 : 0
                                        return acc + base + rushFee + remoteFee
                                    }, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>



                    <div className="flex gap-4">
                        <button
                            type="button"
                            disabled={loading}
                            className="btn-secondary w-full disabled:opacity-50"
                        >
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Creating Order...' : 'Create Order'}
                        </button>
                    </div>
                </form>

                {/* Floating Action Button */}
                <button
                    type="button"
                    onClick={addRecipient}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
                    aria-label="Add Recipient"
                >
                    <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        Add Recipient
                    </span>
                    {recipients.length > 1 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                            {recipients.length}
                        </span>
                    )}
                </button>
            </div >

            {/* Modal Portal */}
            {
                recipients.map((recipient, index) => (
                    <ProcessServerModal
                        key={`modal-${index}`}
                        isOpen={modalOpen === index}
                        onClose={() => setModalOpen(null)}
                        contacts={filteredContacts}
                        selectedId={recipient.assignedProcessServerId}
                        onSelect={(id) => updateRecipient(index, 'assignedProcessServerId', id)}
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
