'use client'

import { motion } from 'framer-motion'
import { FileText, MapPin, Package, Edit2, Eye, Download, User, Calendar, Clock, Mail, Phone, Zap, Building } from 'lucide-react'

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

      {/* Document Information Card - Matching Dashboard Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Document Information</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEditStep(0)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 font-medium">Document Type</p>
            <p className="text-lg font-semibold text-gray-800 uppercase">{documentData.documentType}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 font-medium">Case Number</p>
            <p className="text-lg font-semibold text-gray-800">{documentData.caseNumber || 'N/A'}</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm text-gray-500 font-medium">Jurisdiction</p>
            <p className="text-lg font-semibold text-gray-800">{documentData.jurisdiction || 'N/A'}</p>
          </div>

          {/* Additional Dates */}
          {(documentData.deadline || documentData.hearingDate || documentData.personalServiceDate) && (
            <div className="md:col-span-2 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documentData.deadline && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Clock className="w-4 h-4" />
                      <span>Service Deadline</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(documentData.deadline)}</p>
                  </div>
                )}
                {documentData.hearingDate && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>Hearing Date</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(documentData.hearingDate)}</p>
                  </div>
                )}
                {documentData.personalServiceDate && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>Personal Service Date</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(documentData.personalServiceDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Initiator Information - Matching Dashboard */}
          {documentData.initiatorType && (
            <div className="md:col-span-2 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 font-medium mb-3">Filed By</p>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">
                      {documentData.initiatorType === 'ATTORNEY' ? '⚖️ Attorney' : '👤 Self-Represented'}
                      {documentData.initiatorFirstName && (
                        <span className="ml-2">
                          {documentData.initiatorFirstName} {documentData.initiatorMiddleName && `${documentData.initiatorMiddleName} `}{documentData.initiatorLastName}
                        </span>
                      )}
                    </p>
                    {(documentData.initiatorAddress || documentData.initiatorPhone || documentData.initiatorEmail) && (
                      <div className="mt-2 space-y-1">
                        {documentData.initiatorAddress && (
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {documentData.initiatorAddress}
                              {documentData.initiatorCity && `, ${documentData.initiatorCity}`}
                              {documentData.initiatorState && `, ${documentData.initiatorState}`}
                              {documentData.initiatorZipCode && ` ${documentData.initiatorZipCode}`}
                            </span>
                          </div>
                        )}
                        {documentData.initiatorPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4" />
                            <span>{documentData.initiatorPhone}</span>
                          </div>
                        )}
                        {documentData.initiatorEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4" />
                            <span>{documentData.initiatorEmail}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Document */}
          {documentData.document && (
            <div className="md:col-span-2 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 font-medium mb-3">Uploaded Document</p>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">{documentData.document.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(documentData.document.size / 1024 / 1024).toFixed(2)} MB
                    {documentData.filePageCount > 0 && (
                      <span className="ml-2">
                        • {documentData.filePageCount} {documentData.filePageCount === 1 ? 'page' : 'pages'}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleViewFile}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title="View document"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownloadFile}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title="Download document"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recipients Card - Matching Dashboard Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl text-white">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Recipients</h2>
            <span className="text-sm text-gray-500 font-medium">
              {recipients.length} location{recipients.length !== 1 ? 's' : ''}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEditStep(1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </motion.button>
        </div>
        
        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <motion.div
              key={recipient.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        Recipient {index + 1}
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">
                        {recipient.recipientEntityType === 'ORGANIZATION' ? (
                          <>
                            {recipient.organizationName || 'Organization'}
                            {recipient.authorizedAgent && (
                              <span className="text-sm text-gray-600 font-normal"> (Agent: {recipient.authorizedAgent})</span>
                            )}
                          </>
                        ) : (
                          <>
                            {recipient.firstName} {recipient.middleName && `${recipient.middleName} `}{recipient.lastName}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="ml-11 space-y-1">
                    <p className="text-sm text-gray-700">{recipient.address}</p>
                    <p className="text-sm text-gray-600">{recipient.city}, {recipient.state} {recipient.zipCode}</p>
                  </div>
                  
                  {/* Contact Information */}
                  {(recipient.email || recipient.phone) && (
                    <div className="ml-11 mt-2 space-y-1">
                      {recipient.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-3 h-3" />
                          <span>{recipient.email}</span>
                        </div>
                      )}
                      {recipient.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-3 h-3" />
                          <span>{recipient.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">
                  {recipient.assignmentType === 'AUTOMATED' ? 'OPEN' : 'ASSIGNED'}
                </span>
              </div>

              {/* Service Options Badges - Colored like Dashboard */}
              <div className="flex flex-wrap gap-2 mb-3">
                {recipient.processService && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    <Package className="w-3 h-3" />
                    Process Service
                  </span>
                )}
                {recipient.certifiedMail && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                    <Mail className="w-3 h-3" />
                    Certified Mail
                  </span>
                )}
                {recipient.rushService && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    <Zap className="w-3 h-3" />
                    Rush Service
                  </span>
                )}
                {recipient.remoteService && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    <Building className="w-3 h-3" />
                    Remote Location
                  </span>
                )}
              </div>

              {/* Assignment Details */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                {recipient.assignmentType === 'AUTOMATED' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      OPEN BIDDING
                    </span>
                    <span className="text-xs text-gray-600">
                      Process servers will submit bids for this service
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                      DIRECT ASSIGNMENT
                    </span>
                    <span className="text-xs text-gray-700 font-medium">
                      → {recipient.processServerName || 'Server assigned'}
                    </span>
                  </div>
                )}
              </div>
              
              {recipient.notes && (
                <p className="text-xs text-gray-600 mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  📝 Note: {recipient.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Information Note */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong className="font-bold">Note:</strong> Each recipient has individual service options. You will see the detailed cost 
          breakdown on the payment page.
        </p>
      </div>
    </motion.div>
  )
}
