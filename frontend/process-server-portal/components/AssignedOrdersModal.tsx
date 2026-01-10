'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, MapPin, DollarSign, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AssignedOrder {
    id: string
    orderNumber: string
    customerName: string
    pickupAddress: string
    processServerPayout?: number
    finalAgreedPrice?: number
    status: string
    recipients?: any[]
}

interface AssignedOrdersModalProps {
    isOpen: boolean
    onClose: () => void
    orders: AssignedOrder[]
}

export default function AssignedOrdersModal({ isOpen, onClose, orders }: AssignedOrdersModalProps) {
    const router = useRouter()

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Package className="w-6 h-6" />
                                    New Assignments!
                                </h2>
                                <p className="text-green-100 mt-1">
                                    You have {orders.length} active order{orders.length !== 1 ? 's' : ''} assigned to you.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            <div className="space-y-4">
                                {orders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{order.orderNumber}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                                                        ASSIGNED
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">{order.customerName}</p>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[200px]">{order.pickupAddress}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-1 text-green-600 font-bold text-lg">
                                                    <DollarSign className="w-4 h-4" />
                                                    {order.processServerPayout ||
                                                        order.finalAgreedPrice ||
                                                        (order.recipients?.reduce((sum: number, d: any) => sum + (d.finalAgreedPrice || 0), 0)) ||
                                                        0}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        onClose()
                                                        router.push(`/orders/${order.id}`)
                                                    }}
                                                    className="mt-2 flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700 hover:underline"
                                                >
                                                    View Details <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
