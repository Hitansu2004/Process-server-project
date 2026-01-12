import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'

interface OrderSummaryCardProps {
    order: any
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        }).format(amount || 0)
    }

    const calculateTotalPrice = (order: any): number => {
        if (order.recipients && order.recipients.length > 0) {
            const subtotal = order.recipients.reduce((sum: number, recipient: any) => {
                const isAutomatedPending = recipient.recipientType === 'AUTOMATED' &&
                    (recipient.status === 'OPEN' || recipient.status === 'BIDDING')

                const isDirectStandard = recipient.recipientType === 'GUIDED' && !recipient.quotedPrice && !recipient.negotiatedPrice

                if (isAutomatedPending || isDirectStandard) {
                    let recipientTotal = 0
                    if (recipient.processService) recipientTotal += 75
                    if (recipient.certifiedMail) recipientTotal += 25
                    if (recipient.rushService) recipientTotal += 50
                    if (recipient.remoteLocation) recipientTotal += 40
                    return sum + recipientTotal
                } else {
                    return sum + (parseFloat(recipient.finalAgreedPrice) || 0)
                }
            }, 0)

            // Add 3% processing fee
            return subtotal + (subtotal * 0.03)
        }
        return order.customerPaymentAmount || 0
    }

    const totalPrice = calculateTotalPrice(order)

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                    <DollarSign className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Price Summary</h2>
            </div>

            <div className="space-y-4">
                {order.recipients?.map((recipient: any, index: number) => {
                    const isAutomatedPending = recipient.recipientType === 'AUTOMATED' &&
                        (recipient.status === 'OPEN' || recipient.status === 'BIDDING')

                    const isDirectStandard = recipient.recipientType === 'GUIDED' && !recipient.quotedPrice && !recipient.negotiatedPrice

                    if (isAutomatedPending || isDirectStandard) {
                        const processFee = recipient.processService ? 75 : 0
                        const certifiedFee = recipient.certifiedMail ? 25 : 0
                        const rushFee = recipient.rushService ? 50 : 0
                        const remoteFee = recipient.remoteLocation ? 40 : 0
                        const subtotal = processFee + certifiedFee + rushFee + remoteFee

                        return (
                            <div key={recipient.id} className="pb-4 border-b border-gray-200">
                                <p className="font-medium text-gray-700 mb-2">Recipient {index + 1}</p>
                                {isAutomatedPending && (
                                    <div className="flex justify-between text-sm text-yellow-600 mb-1">
                                        <span>Base Service</span>
                                        <span className="font-medium">Pending bids</span>
                                    </div>
                                )}
                                {processFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Process Service</span>
                                        <span>{formatCurrency(processFee)}</span>
                                    </div>
                                )}
                                {certifiedFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Certified Mail</span>
                                        <span>{formatCurrency(certifiedFee)}</span>
                                    </div>
                                )}
                                {rushFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Rush Service</span>
                                        <span>{formatCurrency(rushFee)}</span>
                                    </div>
                                )}
                                {remoteFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Remote Location</span>
                                        <span>{formatCurrency(remoteFee)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600 mt-2 pt-2 border-t">
                                    <span className="font-medium">Confirmed Fees</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                            </div>
                        )
                    } else {
                        // For ASSIGNED recipients, show breakdown
                        const basePrice = recipient.basePrice || 0
                        const rushFee = recipient.rushServiceFee || 0
                        const remoteFee = recipient.remoteLocationFee || 0
                        const total = recipient.finalAgreedPrice || 0

                        return (
                            <div key={recipient.id} className="pb-4 border-b border-gray-200">
                                <p className="font-medium text-gray-700 mb-2">Recipient {index + 1}</p>
                                {basePrice > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Service Fee</span>
                                        <span>{formatCurrency(basePrice)}</span>
                                    </div>
                                )}
                                {rushFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Rush Service</span>
                                        <span>{formatCurrency(rushFee)}</span>
                                    </div>
                                )}
                                {remoteFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Remote Location</span>
                                        <span>{formatCurrency(remoteFee)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                    <span className="font-medium text-gray-700">Subtotal</span>
                                    <span className="font-bold text-gray-800">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        )
                    }
                })}

                <div className="pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Processing Fee (3%)</span>
                        <span>{formatCurrency(totalPrice - (totalPrice / 1.03))}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-gray-800">Total Amount</span>
                        <span className="text-green-600">{formatCurrency(totalPrice)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
