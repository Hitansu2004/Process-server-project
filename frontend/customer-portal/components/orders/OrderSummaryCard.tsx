import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

interface OrderSummaryCardProps {
    order: any
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                    <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
            </div>

            <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Case Number</p>
                    <p className="font-medium text-gray-900">{order.caseNumber}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Recipients</p>
                    <p className="font-medium text-gray-900">{order.recipients?.length || 0} recipient(s)</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-medium text-gray-900">{order.status}</p>
                </div>

                {order.recipients && order.recipients.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Services Selected:</p>
                        {order.recipients.map((recipient: any, index: number) => (
                            <div key={recipient.id} className="mb-3 pl-3 border-l-2 border-gray-300">
                                <p className="text-sm font-medium text-gray-800 mb-1">
                                    Recipient {index + 1}: {recipient.firstName} {recipient.lastName}
                                </p>
                                <div className="text-xs text-gray-600 space-y-0.5">
                                    {recipient.processService && <p>• Process Service</p>}
                                    {recipient.certifiedMail && <p>• Certified Mail</p>}
                                    {recipient.rushService && <p>• Rush Service</p>}
                                    {recipient.remoteService && <p>• Remote Service</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
