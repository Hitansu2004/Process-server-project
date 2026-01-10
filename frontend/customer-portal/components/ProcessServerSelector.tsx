import { useState, useEffect } from 'react'
import { Search, Star, Phone, MapPin, Award, X, Check, Mail } from 'lucide-react'
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

interface ProcessServerSelectorProps {
    isOpen: boolean
    onClose: () => void
    contacts: ContactEntry[]
    selectedId: string
    onSelect: (id: string) => void
    defaultServerId: string | null
}

export default function ProcessServerSelector({
    isOpen,
    onClose,
    contacts,
    selectedId,
    onSelect,
    defaultServerId
}: ProcessServerSelectorProps) {
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortFilter, setSortFilter] = useState('default')
    const [minRating, setMinRating] = useState(0)
    const [minOrders, setMinOrders] = useState(0)

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

    // Filter and sort logic
    const filterAndSortContacts = (contacts: ContactEntry[]) => {
        let filtered = contacts.filter(contact => true)

        if (searchQuery) {
            filtered = filtered.filter(contact => {
                const server = contact.processServerDetails
                const nicknameMatch = contact.nickname?.toLowerCase().includes(searchQuery.toLowerCase())

                if (server) {
                    const nameMatch = `${server.firstName} ${server.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                    const emailMatch = server.email.toLowerCase().includes(searchQuery.toLowerCase())
                    const phoneMatch = server.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())

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
                const idMatch = contact.processServerId?.toLowerCase().includes(searchQuery.toLowerCase())
                return nicknameMatch || idMatch
            })
        }

        if (minRating > 0) {
            filtered = filtered.filter(contact =>
                contact.processServerDetails && contact.processServerDetails.currentRating >= minRating
            )
        }

        if (minOrders > 0) {
            filtered = filtered.filter(contact =>
                contact.processServerDetails && contact.processServerDetails.totalOrdersAssigned >= minOrders
            )
        }

        filtered.sort((a, b) => {
            const detailsA = a.processServerDetails
            const detailsB = b.processServerDetails

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

    const filteredContacts = filterAndSortContacts(contacts)

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Select Process Server</h2>
                                <p className="text-sm text-gray-600 mt-1">{contacts.length} available servers</p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="px-4 pt-4 pb-2 border-b border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                    <option value={0}>All Ratings</option>
                                    <option value={4}>4+ Stars</option>
                                    <option value={4.5}>4.5+ Stars</option>
                                </select>
                                <select value={minOrders} onChange={(e) => setMinOrders(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                    <option value={0}>All Orders</option>
                                    <option value={5}>5+ Orders</option>
                                    <option value={10}>10+ Orders</option>
                                </select>
                                <select value={sortFilter} onChange={(e) => setSortFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                    <option value="default">Sort: Default</option>
                                    <option value="highest-rated">Sort: Highest Rated</option>
                                    <option value="highest-success">Sort: Success Rate</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {filteredContacts.map((contact, idx) => {
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
                                    const isSelected = selectedId === contact.processServerId
                                    const isDefault = contact.processServerId === defaultServerId

                                    return (
                                        <motion.button
                                            key={contact.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => {
                                                onSelect(contact.processServerId)
                                                onClose()
                                            }}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-md">
                                                        {details.profilePhotoUrl ? (
                                                            <img src={`http://localhost:8080/api/process-servers/profile-photo/${details.profilePhotoUrl}`} alt={details.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            (contact.nickname || details.name).split(' ').map((n: string) => n[0]).join('')
                                                        )}
                                                    </div>
                                                    {isSelected && <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"><Check className="w-4 h-4 text-white" /></div>}
                                                    {isDefault && !isSelected && <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white"><Star className="w-3 h-3 text-white fill-white" /></div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{contact.nickname || details.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm mb-2">
                                                        <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="font-semibold text-gray-900">{Number(details.currentRating).toFixed(1)}</span></div>
                                                        <div className="flex items-center gap-1"><span className="text-green-600 font-semibold">{details.successRate?.toFixed(0)}%</span><span className="text-gray-500">Success</span></div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1"><Award className="w-3 h-3" /><span>{details.totalOrdersAssigned || 0} orders</span></div>
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
