'use client'

import { motion } from 'framer-motion'
import { CreditCard, DollarSign, CheckCircle } from 'lucide-react'

interface Recipient {
  id: string
  firstName: string
  lastName: string
  assignmentType: 'AUTOMATED' | 'GUIDED'
  processServerName?: string
  processService: boolean
  certifiedMail: boolean
  rushService: boolean
  remoteService: boolean
  quotedPrice?: number
  negotiatedPrice?: number
  priceStatus?: 'QUOTED' | 'NEGOTIATING' | 'ACCEPTED'
}

interface PaymentStepProps {
  documentData: any
  recipients: Recipient[]
}

export default function PaymentStep({ 
  documentData, 
  recipients
}: PaymentStepProps) {
  
  // Calculate costs per recipient
  const calculateRecipientCosts = () => {
    return recipients.map((recipient, index) => {
      let recipientCost = 0
      let baseServicePending = false
      
      // For AUTOMATED (open bidding), base delivery price is pending (will come from bid)
      // But we still charge for all the service options selected
      if (recipient.assignmentType === 'AUTOMATED') {
        baseServicePending = true
        // Charge for selected service options (these are add-ons to the base delivery price)
        if (recipient.processService) {
          recipientCost += 75
        }
        if (recipient.certifiedMail) {
          recipientCost += 25
        }
      } else {
        // For GUIDED (direct assignment)
        // Check if there's a quoted/negotiated price
        if (recipient.quotedPrice || recipient.negotiatedPrice) {
          // Use negotiated price if available, otherwise quoted price
          recipientCost = recipient.negotiatedPrice || recipient.quotedPrice || 0
        } else {
          // No custom price - use standard rates for selected services
          if (recipient.processService) {
            recipientCost += 75
          }
          if (recipient.certifiedMail) {
            recipientCost += 25
          }
        }
      }
      
      // Always add urgent/additional service options
      if (recipient.rushService) {
        recipientCost += 50
      }
      if (recipient.remoteService) {
        recipientCost += 40
      }
      
      return {
        recipient,
        index,
        cost: recipientCost,
        baseServicePending
      }
    })
  }
  
  // Calculate costs
  const calculateCosts = () => {
    const recipientCosts = calculateRecipientCosts()
    
    // Sum all costs (including urgent services for pending base services)
    let baseServiceCost = 0
    recipientCosts.forEach(rc => {
      baseServiceCost += rc.cost
    })
    
    // No additional fees at order level now - all per recipient
    let additionalFees = 0
    
    const subtotal = baseServiceCost + additionalFees
    const processingFee = subtotal * 0.03 // 3% processing fee
    const total = subtotal + processingFee
    
    const pendingCount = recipientCosts.filter(rc => rc.baseServicePending).length
    
    return {
      recipientCosts,
      baseServiceCost,
      additionalFees,
      processingFee,
      subtotal,
      total,
      pendingCount
    }
  }
  
  const costs = calculateCosts()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Summary</h2>
        <p className="text-gray-600">Review the cost breakdown for your service order.</p>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
        </div>
        
        <div className="space-y-3">
          {/* Per-Recipient Breakdown */}
          <div className="pb-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Service Costs by Recipient</h4>
            
            {costs.recipientCosts.map((rc, idx) => {
              const recipient = rc.recipient
              const isAutomated = recipient.assignmentType === 'AUTOMATED'
              const hasCustomPrice = Boolean(recipient.negotiatedPrice || recipient.quotedPrice)

              return (
                <div key={idx} className="mb-3 pl-2 border-l-2 border-gray-200">
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    Recipient {rc.index + 1}: {recipient.firstName} {recipient.lastName}
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="ml-2">
                      Assignment: {isAutomated ? 'Automated (Open Bid Pool)' : `Direct (${recipient.processServerName || 'Process Server'})`}
                      {recipient.quotedPrice && (
                        <span className="ml-2 text-blue-600 font-medium">
                          (Quoted: ${recipient.quotedPrice.toFixed(2)})
                        </span>
                      )}
                      {recipient.negotiatedPrice && (
                        <span className="ml-2 text-green-600 font-medium">
                          (Negotiated: ${recipient.negotiatedPrice.toFixed(2)})
                        </span>
                      )}
                      {rc.baseServicePending && !hasCustomPrice && !isAutomated && (
                        <span className="ml-2 text-orange-600 font-medium">(Awaiting quote)</span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-1 mt-1">
                    {/* Show base price summary if pending */}
                    {rc.baseServicePending && (
                      <div className="flex justify-between text-sm py-0.5 bg-orange-50 -mx-2 px-2 py-1 rounded mb-1">
                        <span className="text-orange-600 ml-2 font-medium">
                          Base Delivery Price: Pending
                          <span className="text-gray-500 text-xs ml-1">
                            (will be added when bid is accepted)
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Base service pricing */}
                    {hasCustomPrice ? (
                      <div className="flex justify-between text-sm py-0.5">
                        <span className="text-gray-600 ml-2">
                          • Service Fee (as quoted by process server)
                        </span>
                        <span className="text-gray-900 font-medium">
                          ${(recipient.negotiatedPrice || recipient.quotedPrice)?.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Show base services - prices shown but not charged if pending */}
                        {recipient.processService && (
                          <div className="flex justify-between text-sm py-0.5">
                            <span className="text-gray-600 ml-2">
                              • Process Service
                            </span>
                            <span className="text-gray-900 font-medium">
                              $75.00
                            </span>
                          </div>
                        )}
                        {recipient.certifiedMail && (
                          <div className="flex justify-between text-sm py-0.5">
                            <span className="text-gray-600 ml-2">
                              • Certified Mail
                            </span>
                            <span className="text-gray-900 font-medium">
                              $25.00
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Add-ons billed upfront even if base price pending */}
                    {recipient.rushService && (
                      <div className="flex justify-between text-sm py-0.5">
                        <span className="text-gray-600 ml-2">• Rush Service</span>
                        <span className="text-gray-900 font-medium">$50.00</span>
                      </div>
                    )}
                    {recipient.remoteService && (
                      <div className="flex justify-between text-sm py-0.5">
                        <span className="text-gray-600 ml-2">• Remote Service</span>
                        <span className="text-gray-900 font-medium">$40.00</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm py-1 font-medium border-t border-gray-100 mt-1 pt-1">
                      <span className="text-gray-700 ml-2">
                        Recipient Total
                        {rc.baseServicePending && (
                          <span className="text-xs font-normal text-orange-600 ml-1">(+ pending delivery fee from bid)</span>
                        )}
                      </span>
                      <span className="text-gray-900">${rc.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-sm py-2">
            <span className="text-gray-700 font-medium">
              Current Subtotal
              {costs.pendingCount > 0 && (
                <span className="text-orange-600 text-xs ml-1">
                  (base price pending for {costs.pendingCount} recipient{costs.pendingCount > 1 ? 's' : ''})
                </span>
              )}
            </span>
            <span className="text-gray-900 font-medium">${costs.subtotal.toFixed(2)}</span>
          </div>

          {/* Processing Fee */}
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-600">Processing Fee (3%)</span>
            <span className="text-gray-900 font-medium">${costs.processingFee.toFixed(2)}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between text-lg font-bold py-3 border-t-2 border-gray-300">
            <span className="text-gray-900">
              Amount Due Now {costs.pendingCount > 0 && <span className="text-sm font-normal text-gray-600">(+ pending amounts)</span>}
            </span>
            <span className="text-blue-600">${costs.total.toFixed(2)}</span>
          </div>
          
          {costs.pendingCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm">
              <p className="text-orange-800 font-medium">⚠️ Note about Open Bid Recipients</p>
              <p className="text-orange-700 mt-1">
                {costs.pendingCount} {costs.pendingCount === 1 ? 'recipient is' : 'recipients are'} assigned via open bidding. 
                Their service costs will be determined when you accept a bid from process servers. 
                You will be notified when bids are received.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Case Number: {documentData.caseNumber}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>{recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'} to be served</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>
              {documentData.filePageCount > 0 
                ? `${documentData.filePageCount} page document uploaded` 
                : 'Document uploaded'}
            </span>
          </div>
          {recipients.some(r => r.rushService) && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 font-medium">
                Rush service selected for {recipients.filter(r => r.rushService).length} {recipients.filter(r => r.rushService).length === 1 ? 'recipient' : 'recipients'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method (Placeholder) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Payment Integration Coming Soon</strong>
          </p>
          <p className="text-sm text-blue-700 mt-2">
            For now, clicking "Submit Order" will create your order as a draft. 
            You will be contacted with payment instructions to complete the order.
          </p>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Terms & Conditions</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Payment is due before service is attempted</p>
          <p>• Refunds are available for unsuccessful service attempts per our policy</p>
          <p>• Rush service does not guarantee successful service within the timeframe</p>
          <p>• Additional fees may apply for special circumstances</p>
        </div>
        <label className="flex items-start space-x-3 mt-4">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I agree to the terms and conditions and authorize the charge for this service order
          </span>
        </label>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-900">Ready to Submit</h4>
          <p className="text-sm text-green-700 mt-1">
            Your order is ready to be submitted. Click the "Submit Order" button below to proceed.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
