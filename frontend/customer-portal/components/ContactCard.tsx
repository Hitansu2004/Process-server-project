import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

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
                stars.push(<span key={i} className="text-gray-600">★</span>)
            }
        }
        return stars
    }

    return (
        <div className={`glass rounded-xl p-6 hover:bg-white/5 transition-all relative group border-2 ${isDefault ? 'border-primary bg-primary/5' : 'border-transparent'}`}>
            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
                {isDefault && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg shadow-primary/20">
                        ⭐ Default
                    </span>
                )}
                {isGlobal ? (
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full font-semibold">
                        GLOBAL
                    </span>
                ) : entryType === 'AUTO_ADDED' ? (
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full font-semibold">
                        AUTO
                    </span>
                ) : (
                    <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full font-semibold">
                        MANUAL
                    </span>
                )}
            </div>

            <div className="flex flex-col items-center text-center">
                {/* Profile Photo */}
                <div className={`w-20 h-20 rounded-full overflow-hidden bg-gray-800 mb-4 ring-2 ${isDefault ? 'ring-primary' : 'ring-white/10'}`}>
                    <img
                        src={getImageUrl()}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                </div>

                {/* Name & ID */}
                <h3 className="font-bold text-lg mb-1">{displayName}</h3>
                <p className="text-xs text-gray-500 mb-3 font-mono" title={processServerId}>
                    ID: {processServerId.substring(0, 8)}...
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4 bg-black/20 px-3 py-1 rounded-full">
                    <div className="flex text-sm">{renderStars(details.currentRating)}</div>
                    <span className="text-xs font-bold ml-1 text-gray-300">
                        {(details.currentRating || 0).toFixed(1)}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-lg font-bold text-green-400">
                            {(details.successRate || 0).toFixed(0)}%
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Success</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-lg font-bold text-blue-400">
                            {details.totalOrdersAssigned || 0}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Orders</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col gap-2 mt-auto">
                    {!isDefault && onSetDefault && (
                        <button
                            type="button"
                            onClick={() => onSetDefault(processServerId)}
                            className="w-full py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition"
                        >
                            Set as Default
                        </button>
                    )}
                    {!isGlobal && (
                        <button
                            onClick={() => onRemove(id)}
                            className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition"
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
