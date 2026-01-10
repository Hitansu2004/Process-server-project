'use client'

import { motion } from 'framer-motion'
import { FileText, MapPin, Package, Edit2, Eye, Download } from 'lucide-react'

interface ReviewStepProps {
  documentData: any
  recipients: any[]
  onEditStep: (step: number) => void
}

export default function ReviewStep({ 
  documentData, 
  recipients, 
  onEditStep 
}: ReviewStepProps) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleViewFile = () => {
    if (documentData.document) {
      const url = URL.createObjectURL(documentData.document)
      window.open(url, '_blank')
    }
  }

  const handleDownloadFile = () => {
    if (documentData.document) {
      const url = URL.createObjectURL(documentData.document)
      const a = document.createElement('a')
      a.href = url
      a.download = documentData.document.name
      a.click()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Order</h2>
        <p className="text-gray-600">Please review all information before proceeding to payment.</p>
      </div>

      {/* Document Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
          </div>
          <button
            onClick={() => onEditStep(0)}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Case Number:</span>
              <p className="font-medium text-gray-900">{documentData.caseNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">Jurisdiction:</span>
              <p className="font-medium text-gray-900 capitalize">{documentData.jurisdiction}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Document Type:</span>
              <p className="font-medium text-gray-900 capitalize">{documentData.documentType}</p>
            </div>
            <div>
              <span className="text-gray-500">Service Deadline:</span>
              <p className="font-medium text-gray-900">{formatDate(documentData.deadline)}</p>
            </div>
          </div>

          {documentData.document && (
            <div className="pt-3 border-t border-gray-200">
              <span className="text-gray-500">Uploaded Document:</span>
              <div className="mt-2 flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium text-gray-900">{documentData.document.name}</p>
                  <p className="text-xs text-gray-500">
                    {(documentData.document.size / 1024 / 1024).toFixed(2)} MB
                    {documentData.filePageCount > 0 && (
                      <span className="ml-2">
                        • {documentData.filePageCount} {documentData.filePageCount === 1 ? 'page' : 'pages'}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleViewFile}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="View document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Download document"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipients */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Recipients ({recipients.length})
            </h3>
          </div>
          <button
            onClick={() => onEditStep(1)}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <div key={recipient.id} className="bg-gray-50 p-4 rounded text-sm border-l-4 border-blue-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-base">
                    Recipient #{index + 1}: {recipient.firstName} {recipient.lastName}
                  </p>
                  <p className="text-gray-600 mt-2">
                    📍 {recipient.address}<br />
                    <span className="ml-3">{recipient.city}, {String(recipient.state)} {recipient.zipCode}</span>
                  </p>
                  
                  {/* Assignment Details */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {recipient.assignmentType === 'AUTOMATED' ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                          OPEN BIDDING
                        </span>
                        <span className="text-xs text-gray-600">
                          Process servers will submit bids for this service
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                          DIRECT ASSIGNMENT
                        </span>
                        <span className="text-xs text-gray-700 font-medium">
                          → {recipient.processServerName || 'Server not assigned'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {recipient.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic bg-yellow-50 p-2 rounded">
                      📝 Note: {recipient.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Options Per Recipient */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Service Options (Per Recipient)</h3>
          </div>
          <button
            onClick={() => onEditStep(2)}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <div key={recipient.id} className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded-r">
              <h4 className="font-medium text-gray-900 mb-2">
                Recipient #{index + 1}: {recipient.firstName} {recipient.lastName}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Process Service:</span>
                  <span className={recipient.processService ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {recipient.processService ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Certified Mail:</span>
                  <span className={recipient.certifiedMail ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {recipient.certifiedMail ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Rush Service:</span>
                  <span className={recipient.rushService ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {recipient.rushService ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Remote Service:</span>
                  <span className={recipient.remoteService ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {recipient.remoteService ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Each recipient has individual service options. You will see the detailed cost 
          breakdown on the payment page.
        </p>
      </div>
    </motion.div>
  )
}
