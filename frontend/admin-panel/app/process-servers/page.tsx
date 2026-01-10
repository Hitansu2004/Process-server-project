'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function DriversManagement() {
    const router = useRouter()
    const [drivers, setDrivers] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [allBids, setAllBids] = useState<any[]>([])
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
            loadData(tenantId, token, filter)
        }
    }, [router, filter])

    const loadData = async (tenantId: string, token: string, currentFilter: string) => {
        try {
            setLoading(true)
            // Fetch drivers and orders in parallel
            const [driversData, ordersData] = await Promise.all([
                api.getTenantProcessServers(tenantId, token, currentFilter),
                api.getTenantOrders(tenantId, token)
            ])

            // Fetch bids only for orders in BIDDING status to avoid overwhelming the browser
            const biddingOrders = ordersData.filter((order: any) => order.status === 'BIDDING')
            const bidsPromises = biddingOrders.map(async (order: any) => {
                try {
                    const bids = await api.getOrderBids(order.id, token)
                    return bids
                } catch (error) {
                    console.error(`Failed to fetch bids for order ${order.id}:`, error)
                    return []
                }
            })
            const bidsArrays = await Promise.all(bidsPromises)
            const allBidsFlat = bidsArrays.flat()

            console.log('Total orders:', ordersData.length)
            console.log('Bidding orders:', biddingOrders.length)
            console.log('Total bids fetched:', allBidsFlat.length)
            console.log('Pending bids:', allBidsFlat.filter((b: any) => b.status === 'PENDING').length)

            setDrivers(driversData)
            setOrders(ordersData)
            setAllBids(allBidsFlat)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateServerStats = (server: any) => {
        // Find orders where this server is assigned to any Recipient
        const assignedOrders = orders.filter(order =>
            order.recipients?.some((d: any) => d.assignedProcessServerId === server.id)
        )

        // Count pending bids for this server
        const pendingBids = allBids.filter((bid: any) =>
            bid.processServerId === server.id && bid.status === 'PENDING'
        )

        // Count by order status
        const assigned = assignedOrders.filter(o => o.status === 'ASSIGNED').length
        const active = assignedOrders.filter(o => o.status === 'IN_PROGRESS').length
        const completed = assignedOrders.filter(o => o.status === 'COMPLETED').length

        // Log for first server only to avoid spam
        if (server.id === drivers[0]?.id) {
            console.log(`Stats for ${server.firstName} ${server.lastName}:`, {
                totalBids: allBids.length,
                pendingBidsForThisServer: pendingBids.length,
                assigned, active, completed
            })
        }

        return {
            bidding: pendingBids.length,
            assigned,
            active,
            completed,
            totalEarnings: assignedOrders.reduce((sum, o) => sum + (o.processServerPayout || 0), 0)
        }
    }

    // Calculate overall statistics
    const overallStats = drivers.reduce((acc, driver) => {
        const stats = calculateServerStats(driver)
        return {
            bidding: acc.bidding + stats.bidding,
            assigned: acc.assigned + stats.assigned,
            active: acc.active + stats.active,
            completed: acc.completed + stats.completed,
            totalRevenue: acc.totalRevenue + stats.totalEarnings
        }
    }, { bidding: 0, assigned: 0, active: 0, completed: 0, totalRevenue: 0 })

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
                            <h1 className="text-3xl font-bold">Process Servers Management</h1>
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
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Drivers</h3>
                        <p className="text-3xl font-bold">{drivers.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-400">
                            ${overallStats.totalRevenue.toFixed(2)}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Bidding Jobs</h3>
                        <p className="text-3xl font-bold text-yellow-400">
                            {overallStats.bidding}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Assigned Jobs</h3>
                        <p className="text-3xl font-bold text-purple-400">
                            {overallStats.assigned}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Active Jobs</h3>
                        <p className="text-3xl font-bold text-blue-400">
                            {overallStats.active}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm mb-2">Completed Jobs</h3>
                        <p className="text-3xl font-bold text-green-400">
                            {overallStats.completed}
                        </p>
                    </div>
                </div>

                {/* Drivers List */}
                <div className="space-y-4">
                    {drivers.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-400">No process servers registered yet</p>
                        </div>
                    ) : (
                        drivers.map((driver) => {
                            const stats = calculateServerStats(driver)
                            const totalJobs = stats.bidding + stats.assigned + stats.active + stats.completed

                            return (
                                <div key={driver.id} className="card hover:bg-white/5 transition">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="font-semibold text-lg">
                                                    {driver.firstName} {driver.lastName}
                                                </h3>
                                                {driver.currentRating > 0 && (
                                                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-400">
                                                        {driver.currentRating.toFixed(1)} ⭐
                                                    </span>
                                                )}
                                                {driver.isRedZone && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                                                        Red Zone
                                                    </span>
                                                )}
                                                {totalJobs > 0 && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                                                        {totalJobs} Total Jobs
                                                    </span>
                                                )}
                                            </div>

                                            {/* Server Details */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3 pb-3 border-b border-white/10">
                                                <div>
                                                    <p className="text-gray-400">Server ID</p>
                                                    <p className="font-medium text-xs break-all">
                                                        {driver.id || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Email</p>
                                                    <p className="font-medium text-xs break-all">
                                                        {driver.email || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Phone</p>
                                                    <p className="font-medium">
                                                        {driver.phoneNumber || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Job Statistics and Details */}
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
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
                                                    <p className="text-gray-400">Total Earnings</p>
                                                    <p className="font-semibold text-green-400">
                                                        ${stats.totalEarnings.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Bidding</p>
                                                    <p className="font-semibold text-yellow-400">
                                                        {stats.bidding}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Assigned</p>
                                                    <p className="font-semibold text-purple-400">
                                                        {stats.assigned}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Active</p>
                                                    <p className="font-semibold text-blue-400">
                                                        {stats.active}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Completed</p>
                                                    <p className="font-semibold text-green-400">
                                                        {stats.completed}
                                                    </p>
                                                </div>
                                            </div>

                                            {(driver.totalRatings > 0 || driver.successfulDeliveries > 0) && (
                                                <div className="mt-3 pt-3 border-t border-gray-700 flex gap-4 text-xs text-gray-400">
                                                    {driver.totalRatings > 0 && (
                                                        <p>Total ratings: {driver.totalRatings}</p>
                                                    )}
                                                    {driver.successfulDeliveries > 0 && (
                                                        <p>Successful deliveries: {driver.successfulDeliveries}</p>
                                                    )}
                                                    {driver.totalOrdersAssigned > 0 && (
                                                        <p>Success rate: {((driver.successfulDeliveries / driver.totalOrdersAssigned) * 100).toFixed(1)}%</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
