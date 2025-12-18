import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface ContactCardProps {
    id: string // Contact Entry ID
    processServerId: string
    nickname: string
    entryType: string
    details: {
        name?: string
        firstName?: string
        lastName?: string
        email?: string
        profilePhotoUrl?: string
        currentRating?: number
        successRate?: number
        totalOrdersAssigned?: number
        successfulDeliveries?: number
        bio?: string
    }
    onRemove: (id: string) => void
    index: number
    isDefault?: boolean
    onSetDefault?: (processServerId: string) => void
}

export default function ContactCard({
    id,
    processServerId,
    nickname,
    entryType,
    details,
    onRemove,
    index,
    isDefault,
    onSetDefault
}: ContactCardProps) {
    const router = useRouter()
    const [imgError, setImgError] = useState(false)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

    // Logic: Use nickname if available.
    // If real name exists (firstName/lastName), use it.
    // Otherwise, fallback to "Process Server {index}" instead of the UUID-based name.
    const hasRealName = details.firstName || details.lastName
    const displayName = nickname || (hasRealName ? details.name : `Process Server ${index}`) || details.email || 'Unknown Server'
    const isGlobal = entryType === 'GLOBAL' || nickname?.toLowerCase().includes('global')

    const getImageUrl = () => {
        if (!details.profilePhotoUrl || imgError) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`
        }
        return `${API_URL}/uploads/${details.profilePhotoUrl}`
    }

    const renderStars = (rating: number = 0) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="text-yellow-400">★</span>)
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} className="text-yellow-400">☆</span>)
            } else {
                stars.push(<span key={i} className="text-gray-300">★</span>)
            }
        }
        return stars
    }

    return (
        <motion.div 
            whileHover={{ scale: 1.01, y: -2 }}
            className={`bg-white/90 backdrop-blur-xl rounded-xl p-4 sm:p-5 border-2 transition-all shadow-md hover:shadow-xl relative overflow-hidden group ${
                isDefault ? 'border-blue-400 bg-gradient-to-r from-blue-50/50 to-purple-50/50' : 'border-gray-200 hover:border-blue-300'
            }`}
        >
            {/* Gradient overlay for default */}
            {isDefault && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
            )}

            <div className="relative z-10 flex items-center gap-4">
                {/* Profile Photo */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ${
                    isDefault ? 'ring-blue-400' : 'ring-gray-200'
                }`}>
                    <img
                        src={getImageUrl()}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{displayName}</h3>
                            <p className="text-xs text-gray-500 font-mono truncate" title={processServerId}>
                                ID: {processServerId.substring(0, 12)}...
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end flex-shrink-0">
                            {isDefault && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-lg flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Default
                                </motion.span>
                            )}
                            {isGlobal ? (
                                <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                    GLOBAL
                                </span>
                            ) : entryType === 'AUTO_ADDED' || entryType === 'AUTO' ? (
                                <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                    AUTO
                                </span>
                            ) : (
                                <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                    MANUAL
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        {/* Rating */}
                        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-2.5 py-1 rounded-lg">
                            <div className="flex text-xs sm:text-sm">{renderStars(details.currentRating)}</div>
                            <span className="text-xs font-bold text-gray-700">
                                {(details.currentRating || 0).toFixed(1)}
                            </span>
                        </div>

                        {/* Success Rate */}
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${
                                (details.successRate || 0) >= 90 ? 'bg-green-500' : 
                                (details.successRate || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm font-semibold text-gray-700">
                                {(details.successRate || 0).toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-500">Success</span>
                        </div>

                        {/* Orders */}
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">
                                {details.totalOrdersAssigned || 0}
                            </span>
                            <span className="text-xs text-gray-500">Orders</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    {!isDefault && onSetDefault && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onSetDefault(processServerId)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                        >
                            Set Default
                        </motion.button>
                    )}
                    {!isGlobal && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onRemove(id)}
                            className="px-4 py-2 rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition-all whitespace-nowrap"
                        >
                            Remove
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
