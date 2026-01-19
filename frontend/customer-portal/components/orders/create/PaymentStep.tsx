'use client'

import { motion } from 'framer-motion'
import { CreditCard, CheckCircle } from 'lucide-react'

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
}

interface PaymentStepProps {
  documentData: any
  recipients: Recipient[]
}

export default function PaymentStep({ 
  documentData, 
  recipients
}: PaymentStepProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
        <p className="text-gray-600">Review your service order before submission.</p>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
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

      {/* Recipients Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Recipients</h4>
        <div className="space-y-3">
          {recipients.map((recipient, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-sm font-medium text-gray-800 mb-1">
                Recipient {idx + 1}: {recipient.firstName} {recipient.lastName}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Assignment: {recipient.assignmentType === 'AUTOMATED' ? 'Automated (Open Bid Pool)' : `Direct (${recipient.processServerName || 'Process Server'})`}</div>
                <div>
                  Services: 
                  {recipient.processService && ' Process Service'}
                  {recipient.certifiedMail && ' • Certified Mail'}
                  {recipient.rushService && ' • Rush Service'}
                  {recipient.remoteService && ' • Remote Service'}
                </div>
              </div>
            </div>
          ))}
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
            Clicking "Submit Order" will create your order. 
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
