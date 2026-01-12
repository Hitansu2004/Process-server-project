'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Globe, Mail, UserPlus, Star, Phone, MapPin, TrendingUp, Award, ArrowLeft, Search, Filter, SlidersHorizontal, X, Check } from 'lucide-react'

interface ProcessServer {
    id: string
    tenantUserRoleId: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    profilePhotoUrl: string
    currentRating: number
    totalOrdersAssigned: number
    successfulDeliveries: number
    operatingZipCodes: string
    isGlobal: boolean
}

interface ContactEntry {
    id: string
    processServerId: string
    nickname: string
    entryType: string
    activationStatus?: string
    processServerDetails?: ProcessServer | null
}

export default function Contacts() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal')
    const [personalContacts, setPersonalContacts] = useState<ContactEntry[]>([])
    const [globalServers, setGlobalServers] = useState<ProcessServer[]>([])
    const [loading, setLoading] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteLoading, setInviteLoading] = useState(false)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [ratingFilter, setRatingFilter] = useState<number>(0)
    const [minOrders, setMinOrders] = useState<number>(0)
    const [sortBy, setSortBy] = useState<'name' | 'rating' | 'orders'>('rating')

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    })

    useEffect(() => {
        // Always fetch personal contacts to keep track of what's already added
        fetchPersonalContacts()

        if (activeTab === 'personal') {
            // Personal contacts already fetched above
        } else {
            fetchGlobalServers()
        }
    }, [activeTab])

    const fetchPersonalContacts = async () => {
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.userId

            if (token && userId) {
                const data = await api.getContactList(userId, token)

                // Enrich contacts with detailed process server info
                const enrichedContacts = await Promise.all(
                    data.map(async (contact: ContactEntry) => {
                        // Skip fetching details for NOT_ACTIVATED contacts (they don't have a profile yet)
                        if (contact.activationStatus === 'NOT_ACTIVATED') {
                            return {
                                ...contact,
                                processServerDetails: null
                            }
                        }

                        try {
                            const details = await api.getProcessServerDetails(contact.processServerId, token)
                            return {
                                ...contact,
                                processServerDetails: details
                            }
                        } catch (error) {
                            console.error(`Failed to fetch details for ${contact.processServerId}:`, error)
                            return contact
                        }
                    })
                )

                setPersonalContacts(enrichedContacts)
            }
        } catch (error) {
            console.error('Failed to fetch personal contacts:', error)
            showToast('Failed to load personal contacts', 'error')
        } finally {
            setLoading(false)
        }
    }

    const fetchGlobalServers = async () => {
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            if (token) {
                const data = await api.getGlobalProcessServers(token)
                setGlobalServers(data)
            }
        } catch (error) {
            console.error('Failed to fetch global servers:', error)
            showToast('Failed to load global process servers', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToPersonal = async (server: ProcessServer) => {
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.userId

            if (token && userId) {
                await api.addContact({
                    ownerUserId: userId,
                    processServerId: server.id,
                    nickname: `${server.firstName} ${server.lastName}`,
                    type: 'MANUAL'
                }, token)

                showToast(`${server.firstName} ${server.lastName} added to your contacts! ✨`, 'success')
                // Refresh personal contacts to show the newly added server
                await fetchPersonalContacts()
            }
        } catch (error: any) {
            console.error('Failed to add contact:', error)
            showToast(error.message || 'Failed to add to contacts', 'error')
        }
    }

    const handleRemoveContact = async (entryId: string) => {
        try {
            const token = sessionStorage.getItem('token')
            if (token) {
                await api.removeContact(entryId, token)
                showToast('Contact removed successfully', 'info')
                fetchPersonalContacts()
            }
        } catch (error) {
            console.error('Failed to remove contact:', error)
            showToast('Failed to remove contact', 'error')
        }
    }

    const handleInviteProcessServer = async (e: React.FormEvent) => {
        e.preventDefault()
        setInviteLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const inviterName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
            const userId = user.userId
            const tenantId = user.tenantId || 'tenant-1' // Use tenant from user or default

            await api.inviteProcessServer(inviteEmail, inviterName, userId, tenantId, token!)

            setInviteEmail('')
            showToast(`Invitation sent to ${inviteEmail} successfully! 📧`, 'success')

            // Refresh personal contacts to show the newly invited user
            await fetchPersonalContacts()
        } catch (error: any) {
            console.error('Failed to send invitation:', error)
            showToast(error.message || 'Failed to send invitation', 'error')
        } finally {
            setInviteLoading(false)
        }
    }

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, visible: true })
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
    }

    const isInPersonalContacts = (serverId: string) => {
        return personalContacts.some(contact => contact.processServerId === serverId)
    }

    const getContactEntryId = (serverId: string): string | null => {
        const contact = personalContacts.find(c => c.processServerId === serverId)
        return contact ? contact.id : null
    }

    // Filter and sort function
    const filterAndSortServers = (servers: ProcessServer[]) => {
        let filtered = [...servers]

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(server => {
                const nameMatch = `${server.firstName} ${server.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                const emailMatch = server.email.toLowerCase().includes(searchQuery.toLowerCase())

                // Check zip codes
                let zipMatch = false
                if (server.operatingZipCodes) {
                    try {
                        // Remove escape characters and parse
                        const cleanedZipCodes = server.operatingZipCodes.replace(/\\/g, '')
                        const zipCodes = JSON.parse(cleanedZipCodes)
                        if (Array.isArray(zipCodes)) {
                            zipMatch = zipCodes.some((zip: any) => {
                                const zipStr = String(zip)
                                const match = zipStr.includes(searchQuery)
                                console.log(`Checking ${server.firstName}: zip=${zipStr}, search=${searchQuery}, match=${match}`)
                                return match
                            })
                        }
                    } catch (e) {
                        console.log(`Parse error for ${server.firstName}:`, e)
                        // If parsing fails, try direct string match
                        zipMatch = server.operatingZipCodes.includes(searchQuery)
                    }
                }
                console.log(`${server.firstName} ${server.lastName}: nameMatch=${nameMatch}, emailMatch=${emailMatch}, zipMatch=${zipMatch}`)

                return nameMatch || emailMatch || zipMatch
            })
        }

        // Apply rating filter
        if (ratingFilter > 0) {
            filtered = filtered.filter(server => (server.currentRating || 0) >= ratingFilter)
        }

        // Apply minimum orders filter
        if (minOrders > 0) {
            filtered = filtered.filter(server => (server.totalOrdersAssigned || 0) >= minOrders)
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                case 'rating':
                    return (b.currentRating || 0) - (a.currentRating || 0)
                case 'orders':
                    return (b.totalOrdersAssigned || 0) - (a.totalOrdersAssigned || 0)
                default:
                    return 0
            }
        })

        return filtered
    }

    const filteredGlobalServers = filterAndSortServers(globalServers)
    let filteredPersonalContacts = personalContacts.filter(contact => {
        // Always show NOT_ACTIVATED contacts
        if (contact.activationStatus === 'NOT_ACTIVATED') {
            if (!searchQuery) return true
            return contact.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.processServerId.toLowerCase().includes(searchQuery.toLowerCase())
        }

        if (!contact.processServerDetails) return false
        if (!searchQuery) return true

        const server = contact.processServerDetails
        const nameMatch = `${server.firstName} ${server.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        const emailMatch = server.email.toLowerCase().includes(searchQuery.toLowerCase())

        // Check zip codes
        let zipMatch = false
        if (server.operatingZipCodes) {
            try {
                // Remove escape characters and parse
                const cleanedZipCodes = server.operatingZipCodes.replace(/\\/g, '')
                const zipCodes = JSON.parse(cleanedZipCodes)
                if (Array.isArray(zipCodes)) {
                    zipMatch = zipCodes.some((zip: any) => {
                        const zipStr = String(zip)
                        return zipStr.includes(searchQuery)
                    })
                }
            } catch (e) {
                // If parsing fails, try direct string match
                zipMatch = server.operatingZipCodes.includes(searchQuery)
            }
        }

        return nameMatch || emailMatch || zipMatch
    })

    // Apply rating filter to personal contacts
    if (ratingFilter > 0) {
        filteredPersonalContacts = filteredPersonalContacts.filter(contact =>
            contact.processServerDetails && (contact.processServerDetails.currentRating || 0) >= ratingFilter
        )
    }

    // Apply minimum orders filter to personal contacts
    if (minOrders > 0) {
        filteredPersonalContacts = filteredPersonalContacts.filter(contact =>
            contact.processServerDetails && (contact.processServerDetails.totalOrdersAssigned || 0) >= minOrders
        )
    }

    // Apply sorting to personal contacts
    filteredPersonalContacts.sort((a, b) => {
        const detailsA = a.processServerDetails
        const detailsB = b.processServerDetails

        // Handle missing details (put them at the bottom or treat as 0)
        if (!detailsA && !detailsB) return 0
        if (!detailsA) return 1
        if (!detailsB) return -1

        switch (sortBy) {
            case 'name':
                return `${detailsA.firstName} ${detailsA.lastName}`.localeCompare(`${detailsB.firstName} ${detailsB.lastName}`)
            case 'rating':
                return (detailsB.currentRating || 0) - (detailsA.currentRating || 0)
            case 'orders':
                return (detailsB.totalOrdersAssigned || 0) - (detailsA.totalOrdersAssigned || 0)
            default:
                return 0
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
                            toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                                'bg-blue-500/90 border-blue-400 text-white'
                            }`}>
                            <p className="font-medium">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </motion.button>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Process Server Directory
                            </h1>
                            <p className="text-gray-500 mt-2">Manage your contacts and discover global process servers</p>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-4 mb-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${activeTab === 'personal'
                                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                                : 'bg-white/90 text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            My Personal Contacts
                            {personalContacts.length > 0 && (
                                <span className={`px-2 py-1 rounded-full text-xs ${activeTab === 'personal' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {personalContacts.length}
                                </span>
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('global')}
                            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${activeTab === 'global'
                                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                                : 'bg-white/90 text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Globe className="w-5 h-5" />
                            Global Directory
                            {globalServers.length > 0 && (
                                <span className={`px-2 py-1 rounded-full text-xs ${activeTab === 'global' ? 'bg-white/20' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {globalServers.length}
                                </span>
                            )}
                        </motion.button>
                    </div>

                    {/* Search and Inline Filters */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or zip..."
                                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(Number(e.target.value))}
                                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={0}>All Ratings</option>
                                <option value={4}>4+ Stars</option>
                                <option value={4.5}>4.5+ Stars</option>
                                <option value={4.8}>4.8+ Stars</option>
                            </select>
                            <select
                                value={minOrders}
                                onChange={(e) => setMinOrders(Number(e.target.value))}
                                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={0}>Any Experience</option>
                                <option value={5}>5+ Orders</option>
                                <option value={10}>10+ Orders</option>
                                <option value={20}>20+ Orders</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'orders')}
                                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="rating">Sort: Highest Rating</option>
                                <option value="orders">Sort: Most Orders</option>
                                <option value="name">Sort: Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Invite */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg sticky top-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Invite Server
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Invite someone to join as a process server. They'll receive an email with registration instructions.
                            </p>
                            <form onSubmit={handleInviteProcessServer} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="server@example.com"
                                        required
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={inviteLoading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {inviteLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Send Invitation
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center py-20"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-gray-600">Loading...</p>
                                    </div>
                                </motion.div>
                            ) : activeTab === 'personal' ? (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {personalContacts.length === 0 ? (
                                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200">
                                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Personal Contacts Yet</h3>
                                            <p className="text-gray-500">
                                                Add process servers from the Global Directory or invite new ones
                                            </p>
                                        </div>
                                    ) : filteredPersonalContacts.length === 0 ? (
                                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200">
                                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Contacts Match Your Search</h3>
                                            <p className="text-gray-500">
                                                Try adjusting your search query
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredPersonalContacts.map((contact, index) => {
                                                const server = contact.processServerDetails
                                                const isNotActivated = contact.activationStatus === 'NOT_ACTIVATED'

                                                // Handle NOT_ACTIVATED contacts (invited but not registered yet)
                                                if (isNotActivated) {
                                                    return (
                                                        <motion.div
                                                            key={contact.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.02 }}
                                                            className="bg-amber-50/90 backdrop-blur-xl rounded-lg p-4 border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {/* Avatar */}
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold">
                                                                        <UserPlus className="w-8 h-8" />
                                                                    </div>
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <h3 className="font-semibold text-gray-800 text-base truncate">
                                                                            {(contact.nickname && contact.nickname !== 'null null')
                                                                                ? contact.nickname
                                                                                : contact.processServerId.split('@')[0]}
                                                                        </h3>
                                                                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-xs font-medium">
                                                                            Pending
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                        <div className="flex items-center gap-1">
                                                                            <Mail className="w-4 h-4" />
                                                                            <span className="truncate">{contact.processServerId}</span>
                                                                        </div>
                                                                        <span className="text-amber-600 text-xs">
                                                                            Invitation sent - awaiting registration
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Action */}
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleRemoveContact(contact.id)}
                                                                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-medium flex-shrink-0"
                                                                >
                                                                    Remove
                                                                </motion.button>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                }

                                                if (!server) return null

                                                return (
                                                    <motion.div
                                                        key={contact.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.02 }}
                                                        className="bg-white/90 backdrop-blur-xl rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {/* Avatar */}
                                                            <div className="relative flex-shrink-0">
                                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                                                                    {server.profilePhotoUrl ? (
                                                                        <img
                                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/profile-photo/${server.profilePhotoUrl}`}
                                                                            alt={server.firstName}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = 'none'
                                                                                e.currentTarget.parentElement!.textContent = `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                    )}
                                                                </div>
                                                                {server.isGlobal && (
                                                                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border border-white flex items-center justify-center">
                                                                        <Globe className="w-2.5 h-2.5 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <h3 className="font-semibold text-gray-800 text-base truncate">
                                                                        {server.firstName} {server.lastName}
                                                                    </h3>
                                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            {server.currentRating?.toFixed(1) || '0.0'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <Phone className="w-4 h-4" />
                                                                        <span className="truncate">{server.phoneNumber || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span className="truncate">
                                                                            {server.operatingZipCodes ? JSON.parse(server.operatingZipCodes).slice(0, 2).join(', ') : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Award className="w-4 h-4" />
                                                                        <span>{server.totalOrdersAssigned || 0} orders</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleRemoveContact(contact.id)}
                                                                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-medium flex-shrink-0"
                                                            >
                                                                Remove
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })
                                            }
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="global"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {globalServers.length === 0 ? (
                                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200">
                                            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Global Servers Available</h3>
                                            <p className="text-gray-500">
                                                Process servers can make themselves visible globally
                                            </p>
                                        </div>
                                    ) : filteredGlobalServers.length === 0 ? (
                                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200">
                                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Servers Match Your Filters</h3>
                                            <p className="text-gray-500">
                                                Try adjusting your search or filter criteria
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-2 text-xs text-gray-600 bg-white/90 backdrop-blur-xl rounded-lg px-3 py-2 border border-gray-200">
                                                Showing {filteredGlobalServers.length} of {globalServers.length} process servers
                                            </div>
                                            <div className="space-y-2">
                                                {filteredGlobalServers.map((server, index) => {
                                                    const alreadyAdded = isInPersonalContacts(server.id)

                                                    return (
                                                        <motion.div
                                                            key={server.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.02 }}
                                                            className="bg-white/90 backdrop-blur-xl rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {/* Avatar */}
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                                                                        {server.profilePhotoUrl ? (
                                                                            <img
                                                                                src={`http://localhost:8080/api/process-servers/profile-photo/${server.profilePhotoUrl}`}
                                                                                alt={server.firstName}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.style.display = 'none'
                                                                                    e.currentTarget.parentElement!.textContent = `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                        )}
                                                                    </div>
                                                                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border border-white flex items-center justify-center">
                                                                        <Globe className="w-2.5 h-2.5 text-white" />
                                                                    </div>
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <h3 className="font-semibold text-gray-800 text-base truncate">
                                                                            {server.firstName} {server.lastName}
                                                                        </h3>
                                                                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex-shrink-0">
                                                                            GLOBAL
                                                                        </span>
                                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                            <span className="text-sm font-medium text-gray-700">
                                                                                {server.currentRating?.toFixed(1) || '0.0'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                        <div className="flex items-center gap-1">
                                                                            <Phone className="w-4 h-4" />
                                                                            <span className="truncate">{server.phoneNumber || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <MapPin className="w-4 h-4" />
                                                                            <span className="truncate">
                                                                                {server.operatingZipCodes ? JSON.parse(server.operatingZipCodes).slice(0, 2).join(', ') : 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Award className="w-4 h-4" />
                                                                            <span>{server.totalOrdersAssigned || 0} orders</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Action */}
                                                                {alreadyAdded ? (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => {
                                                                            const entryId = getContactEntryId(server.id)
                                                                            if (entryId) {
                                                                                handleRemoveContact(entryId)
                                                                            }
                                                                        }}
                                                                        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-medium flex-shrink-0"
                                                                    >
                                                                        Remove
                                                                    </motion.button>
                                                                ) : (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleAddToPersonal(server)}
                                                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg transition-all text-sm font-medium flex items-center gap-1 flex-shrink-0"
                                                                    >
                                                                        <UserPlus className="w-4 h-4" />
                                                                        Add
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })
                                                }
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
