import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Clock, User, ArrowRight, Activity } from 'lucide-react'

export default function OrderHistory({ orderId, lastUpdated }: { orderId: string, lastUpdated?: string }) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadHistory()
    }, [orderId, lastUpdated])

    const loadHistory = async () => {
        try {
            const token = sessionStorage.getItem('token')
            const data = await api.getOrderHistory(orderId, token!)
            // Sort by date desc
            setHistory(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        } catch (error) {
            console.error('Failed to load history:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>

    return (
        <div className="card bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">Activity Log</h2>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-3">
                {history.map((item: any, index: number) => (
                    <div key={item.id} className="relative flex gap-3 group">
                        {/* Timeline Line */}
                        {index !== history.length - 1 && (
                            <div className="absolute left-[11px] top-7 bottom-[-12px] w-0.5 bg-gray-200" />
                        )}

                        {/* Avatar/Icon */}
                        <div className="flex-shrink-0 relative z-10">
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <User className="w-3 h-3 text-primary" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-gray-900 text-xs">{item.changedByRole || 'System'}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                            </div>

                            <p className="text-gray-600 text-xs mb-2">{item.description}</p>

                            {/* Compact Diff View */}
                            {(item.oldValue || item.newValue) && (
                                <div className="bg-gray-50 rounded border border-gray-200 p-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 truncate font-mono" title={item.oldValue}>
                                                {item.oldValue || <span className="text-gray-400 italic">Empty</span>}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 truncate font-mono" title={item.newValue}>
                                                {item.newValue || <span className="text-gray-400 italic">Empty</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="text-center py-8">
                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">No activity recorded yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
