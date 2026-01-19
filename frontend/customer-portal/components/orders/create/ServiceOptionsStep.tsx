'use client'

import { motion } from 'framer-motion'
import { Package, Zap, MapPin, AlertTriangle, Mail } from 'lucide-react'

interface Recipient {
  id: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  notes: string
  stateId?: number
  assignmentType: 'AUTOMATED' | 'GUIDED'
  processServerId?: string
  processServerName?: string
  processService: boolean
  certifiedMail: boolean
  rushService: boolean
  remoteService: boolean
}

interface ServiceOptionsStepProps {
  recipients: Recipient[]
  deadline: string
  onChange: (recipients: Recipient[]) => void
}

export default function ServiceOptionsStep({ recipients, deadline, onChange }: ServiceOptionsStepProps) {
  const handleToggle = (recipientId: string, field: string, value: boolean) => {
    const updated = recipients.map(r => {
      if (r.id !== recipientId) return r

      // Simply update the field without enforcing mutual exclusivity
      // Users can now select BOTH processService AND certifiedMail
      const updates: any = { [field]: value }

      return { ...r, ...updates }
    })
    onChange(updated)
  }

  // Calculate if rush service is needed (within 72 hours)
  const isRushNeeded = () => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilDeadline <= 72 && hoursUntilDeadline > 0
  }

  const showRushWarning = isRushNeeded() && recipients.some(r => !r.rushService)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Options</h2>
        <p className="text-gray-600">Select service methods for each recipient individually.</p>
      </div>

      {showRushWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3"
        >
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-900">Rush Service Recommended</h4>
            <p className="text-sm text-orange-700 mt-1">
              Your deadline is within 72 hours. We recommend enabling rush service to ensure timely delivery.
            </p>
          </div>
        </motion.div>
      )}

      {/* Per-Recipient Service Options */}
      <div className="space-y-6">
        {recipients.map((recipient, index) => (
          <div key={recipient.id} className="bg-white border-2 border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recipient #{index + 1}: {recipient.firstName} {recipient.lastName || ''}
              </h3>
            </div>

            <div className="space-y-3">
              {/* Process Service */}
              <ServiceOption
                icon={<Package className="h-5 w-5" />}
                title="Process Service"
                description="Personal delivery by a professional process server"
                checked={recipient.processService}
                onChange={(checked) => handleToggle(recipient.id, 'processService', checked)}
                recommended={!recipient.certifiedMail}
              />

              {/* Certified Mail */}
              <ServiceOption
                icon={<Mail className="h-5 w-5" />}
                title="Certified Mail"
                description="Delivery via USPS certified mail with signature confirmation"
                checked={recipient.certifiedMail}
                onChange={(checked) => handleToggle(recipient.id, 'certifiedMail', checked)}
              />

              {/* Rush Service */}
              <ServiceOption
                icon={<Zap className="h-5 w-5" />}
                title="Rush Service"
                description="Priority processing and expedited delivery (within 24-48 hours)"
                checked={recipient.rushService}
                onChange={(checked) => handleToggle(recipient.id, 'rushService', checked)}
                recommended={isRushNeeded()}
                highlight={isRushNeeded()}
              />

              {/* Remote Service */}
              <ServiceOption
                icon={<MapPin className="h-5 w-5" />}
                title="Remote Service"
                description="Service in remote or hard-to-reach locations"
                checked={recipient.remoteService}
                onChange={(checked) => handleToggle(recipient.id, 'remoteService', checked)}
              />

              {/* Warning if no service method selected */}
              {!recipient.processService && !recipient.certifiedMail && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 mt-3">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    Please select at least one service method (Process Service or Certified Mail).
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Service Information</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>You can select both Process Service AND Certified Mail</strong> for comprehensive delivery</li>
          <li>• Process service provides the highest success rate for service completion</li>
          <li>• Certified mail may take 3-5 business days for delivery</li>
          <li>• Rush service is recommended for deadlines within 72 hours</li>
          <li>• Remote service applies to locations outside standard service areas</li>
          <li>• <strong>Each recipient can have different service options</strong> based on their needs</li>
        </ul>
      </div>
    </motion.div>
  )
}

function ServiceOption({
  icon,
  title,
  description,
  checked,
  onChange,
  recommended = false,
  highlight = false
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  recommended?: boolean
  highlight?: boolean
}) {
  return (
    <label
      className={`block border rounded-lg p-3 cursor-pointer transition-all ${checked
        ? highlight
          ? 'border-orange-500 bg-orange-50'
          : 'border-blue-500 bg-blue-50'
        : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className={`flex-shrink-0 mt-0.5 ${checked ? (highlight ? 'text-orange-600' : 'text-blue-600') : 'text-gray-400'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${checked ? 'text-gray-900' : 'text-gray-700'}`}>
            {title}
            {recommended && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Recommended
              </span>
            )}
          </h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </label>
  )
}
