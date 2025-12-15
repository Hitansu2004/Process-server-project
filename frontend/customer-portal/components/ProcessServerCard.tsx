import React from 'react'

interface ProcessServerCardProps {
    id: string
    name: string
    profilePhotoUrl?: string
    currentRating: number
    successRate: number
    totalOrdersAssigned?: number
    successfulDeliveries?: number
    isDefault?: boolean
    isSelected?: boolean
    onSelect: () => void
    onSetDefault?: () => void
}

export default function ProcessServerCard({
    id,
    name,
    profilePhotoUrl,
    currentRating,
    successRate,
    totalOrdersAssigned,
    successfulDeliveries,
    isDefault,
    isSelected,
    onSelect,
    onSetDefault
}: ProcessServerCardProps) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const imageUrl = profilePhotoUrl ? `${API_URL}/uploads/${profilePhotoUrl}` : null

    const renderStars = (rating: number) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                )
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <span key={i} className="text-yellow-400 text-xl">☆</span>
                )
            } else {
                stars.push(
                    <span key={i} className="text-gray-600 text-xl">★</span>
                )
            }
        }
        return stars
    }

    return (
        <div
            onClick={onSelect}
            className={`glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer relative border-2 ${isSelected ? 'border-primary bg-primary/10' : 'border-transparent'
                }`}
        >
            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
                {isDefault && (
                    <div className="bg-primary text-white text-xs px-3 py-1 rounded-full font-semibold">
                        ⭐ Default
                    </div>
                )}
                {isSelected && (
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        ✓ Selected
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center text-center">
                {/* Profile Photo */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0 mb-4 ring-4 ring-white/10">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl text-gray-400">👤</div>'
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                            👤
                        </div>
                    )}
                </div>

                {/* Name */}
                <h3 className="font-bold text-xl mb-3">{name}</h3>

                {/* Rating Stars */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                        {renderStars(currentRating)}
                    </div>
                    <span className="text-sm text-gray-300 font-semibold">
                        {currentRating.toFixed(1)}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="w-full grid grid-cols-2 gap-4 mb-4">
                    <div className="glass rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{successRate.toFixed(0)}%</div>
                        <div className="text-xs text-gray-400 mt-1">Success Rate</div>
                    </div>
                    <div className="glass rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-400">
                            {totalOrdersAssigned || 0}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Total Orders</div>
                    </div>
                </div>

                {/* Success Rate Progress Bar */}
                <div className="w-full mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Deliveries</span>
                        <span className="font-semibold text-green-400">
                            {successfulDeliveries || 0} / {totalOrdersAssigned || 0}
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(successRate, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Set as Default Button */}
            {!isDefault && onSetDefault && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onSetDefault()
                    }}
                    className="mt-2 w-full py-2.5 glass rounded-lg text-sm hover:bg-primary/20 transition font-semibold"
                >
                    ⭐ Set as Default
                </button>
            )}
        </div>
    )
}
