'use client'

import { useState, useEffect } from 'react'
import { Search, Star, Phone, MapPin, Award, Check, X, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface ProcessServer {
    id: string
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
    status: string
}

export default function ProcessServerModal({
    isOpen,
    onClose,
    processServers,
    selectedId,
    onSelect,
}: {
    isOpen: boolean
    onClose: () => void
    processServers: ProcessServer[]
    selectedId: string
    onSelect: (id: string) => void
}) {
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

    // Filter and Sort Logic
    const filteredServers = processServers.filter(ps => {
        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const nameMatch = `${ps.firstName} ${ps.lastName}`.toLowerCase().includes(query)
            const emailMatch = ps.email?.toLowerCase().includes(query)
            const phoneMatch = ps.phoneNumber?.toLowerCase().includes(query)

            let zipMatch = false
            if (ps.operatingZipCodes) {
                try {
                    const cleanedZipCodes = ps.operatingZipCodes.replace(/\\/g, '')
                    const zipCodes = JSON.parse(cleanedZipCodes)
                    if (Array.isArray(zipCodes)) {
                        zipMatch = zipCodes.some((zip: any) => String(zip).includes(query))
                    }
                } catch (e) {
                    zipMatch = ps.operatingZipCodes.includes(query)
                }
            }

            if (!nameMatch && !emailMatch && !phoneMatch && !zipMatch) return false
        }

        // Filters
        if (minRating > 0 && (ps.currentRating || 0) < minRating) return false
        if (minOrders > 0 && (ps.totalOrdersAssigned || 0) < minOrders) return false

        return true
    }).sort((a, b) => {
        switch (sortFilter) {
            case 'highest-rated':
                return (b.currentRating || 0) - (a.currentRating || 0)
            case 'highest-success':
                const rateA = a.totalOrdersAssigned > 0 ? (a.successfulDeliveries / a.totalOrdersAssigned) : 0
                const rateB = b.totalOrdersAssigned > 0 ? (b.successfulDeliveries / b.totalOrdersAssigned) : 0
                return rateB - rateA
            case 'most-orders':
                return (b.totalOrdersAssigned || 0) - (a.totalOrdersAssigned || 0)
            case 'most-worked':
                return (b.successfulDeliveries || 0) - (a.successfulDeliveries || 0)
            default:
                return 0
        }
    })

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
                                <p className="text-sm text-gray-600 mt-1">{filteredServers.length} available servers</p>
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
                                        placeholder="Search..."
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
                                {filteredServers.map((ps, idx) => {
                                    const isSelected = selectedId === ps.id
                                    const displayName = `${ps.firstName} ${ps.lastName}`
                                    const successRate = ps.totalOrdersAssigned > 0
                                        ? (ps.successfulDeliveries / ps.totalOrdersAssigned) * 100
                                        : 0

                                    return (
                                        <motion.button
                                            key={ps.id}
                                            type="button"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => {
                                                onSelect(ps.id)
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
                                                        {ps.profilePhotoUrl ? (
                                                            <img
                                                                src={ps.profilePhotoUrl}
                                                                alt={displayName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none'
                                                                    if (e.currentTarget.parentElement) {
                                                                        e.currentTarget.parentElement.textContent = displayName.split(' ').map(n => n[0]).join('')
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            displayName.split(' ').map(n => n[0]).join('')
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate flex items-center gap-2">
                                                        {displayName}
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ps.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                                            }`}>
                                                            {ps.status}
                                                        </span>
                                                    </h3>

                                                    <div className="flex items-center gap-4 text-sm mb-2">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-semibold text-gray-900">{Number(ps.currentRating || 0).toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-green-600 font-semibold">{successRate.toFixed(0)}%</span>
                                                            <span className="text-gray-500">Success</span>
                                                        </div>
                                                    </div>

                                                    {/* Contact Details */}
                                                    <div className="space-y-1 mb-2">
                                                        {ps.email && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                                <span className="truncate">{ps.email}</span>
                                                            </div>
                                                        )}
                                                        {ps.phoneNumber && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                                <span>{ps.phoneNumber}</span>
                                                            </div>
                                                        )}
                                                        {ps.operatingZipCodes && (
                                                            <div className="flex items-start gap-2 text-xs text-gray-600">
                                                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1 line-clamp-1">
                                                                    {(() => {
                                                                        try {
                                                                            const cleanedZipCodes = ps.operatingZipCodes.replace(/\\/g, '')
                                                                            const zipCodes = JSON.parse(cleanedZipCodes)
                                                                            if (Array.isArray(zipCodes)) {
                                                                                return zipCodes.join(', ')
                                                                            }
                                                                        } catch (e) {
                                                                            return ps.operatingZipCodes
                                                                        }
                                                                        return ps.operatingZipCodes
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Award className="w-3 h-3" />
                                                            <span>{ps.totalOrdersAssigned || 0} orders</span>
                                                        </div>
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
