'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'

export default function OrderDetails() {
    const router = useRouter()
    const params = useParams()
    const [bids, setBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBids()
    }, [])

    const loadBids = async () => {
        try {
            const token = localStorage.getItem('token')
            const data = await api.getOrderBids(params.id as string, token!)
            setBids(data.sort((a: any, b: any) => a.bidAmount - b.bidAmount))
        } catch (error) {
            console.error('Failed to load bids:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm('Accept this bid?')) return

        try {
            const token = localStorage.getItem('token')
            await api.acceptBid(bidId, token!)
            alert('Bid accepted! Process server has been assigned.')
            router.push('/dashboard')
        } catch (error) {
            alert('Failed to accept bid')
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
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold">Order Bids</h1>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Available Bids ({bids.length})</h2>

                    {bids.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No bids yet. Process servers will be notified shortly.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bids.map((bid) => (
                                <div key={bid.id} className="glass rounded-lg p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">Bid Amount</h3>
                                            <p className="text-3xl font-bold text-primary mt-2">
                                                ${bid.bidAmount.toFixed(2)}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bid.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                            bid.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {bid.status}
                                        </span>
                                    </div>

                                    {bid.comment && (
                                        <p className="text-gray-300 mb-4">{bid.comment}</p>
                                    )}

                                    <div className="text-sm text-gray-400">
                                        Placed: {new Date(bid.createdAt).toLocaleString()}
                                    </div>

                                    {bid.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleAcceptBid(bid.id)}
                                            className="btn-primary w-full mt-4"
                                        >
                                            Accept This Bid
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
