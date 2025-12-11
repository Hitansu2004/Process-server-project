'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function DriversManagement() {
    const router = useRouter()
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const user = JSON.parse(userData)
        const tenantId = user.roles[0]?.tenantId
        if (tenantId) {
            loadDrivers(tenantId, token, filter)
        }
    }, [router, filter])

    const loadDrivers = async (tenantId: string, token: string, currentFilter: string) => {
        try {
            setLoading(true)
            const data = await api.getTenantProcessServers(tenantId, token, currentFilter)
            setDrivers(data)
        } catch (error) {
            console.error('Failed to load drivers:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">Drivers Management</h1>
                            <p className="text-gray-400 mt-1">Manage delivery personnel</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <select
                            className="glass px-4 py-2 rounded-lg bg-black/50 border border-white/10"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Drivers</option>
                            <option value="GLOBAL">Global Network</option>
                            <option value="MANUAL">My Drivers</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Drivers</h3>
                        <p className="text-3xl font-bold">{drivers.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Average Rating</h3>
                        <p className="text-3xl font-bold text-yellow-400">
                            {drivers.length > 0
                                ? (drivers.reduce((sum, d) => sum + (d.averageRating || 0), 0) / drivers.length).toFixed(1)
                                : '0.0'
                            } ⭐
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Active Deliveries</h3>
                        <p className="text-3xl font-bold text-blue-400">
                            {drivers.reduce((sum, d) => sum + (d.activeDeliveries || 0), 0)}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Completed Jobs</h3>
                        <p className="text-3xl font-bold text-green-400">
                            {drivers.reduce((sum, d) => sum + (d.completedDeliveries || 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Drivers List */}
                <div className="space-y-4">
                    {drivers.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-400">No delivery drivers registered yet</p>
                        </div>
                    ) : (
                        drivers.map((driver) => (
                            <div key={driver.id} className="card hover:bg-white/5 transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="font-semibold text-lg">
                                                {driver.firstName} {driver.lastName}
                                            </h3>
                                            {driver.averageRating && (
                                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-400">
                                                    {driver.averageRating.toFixed(1)} ⭐
                                                </span>
                                            )}
                                            {driver.isRedZone && (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                                                    Red Zone
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400">Contact</p>
                                                <p className="font-medium">{driver.email || driver.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Service Areas</p>
                                                <p className="font-medium">
                                                    {driver.operatingZipCodes
                                                        ? JSON.parse(driver.operatingZipCodes).slice(0, 3).join(', ')
                                                        : 'N/A'
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Active Jobs</p>
                                                <p className="font-semibold text-blue-400">
                                                    {driver.activeDeliveries || 0}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Completed</p>
                                                <p className="font-semibold text-green-400">
                                                    {driver.completedDeliveries || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {driver.totalRatings && (
                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                <p className="text-xs text-gray-400">
                                                    Total ratings: {driver.totalRatings}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
