'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Package, Zap, MapPin, Mail, AlertTriangle, Loader } from 'lucide-react'

interface ServiceOptions {
  processService: boolean
  certifiedMail: boolean
  rushService: boolean
  remoteLocation: boolean
}

interface RecipientServiceData {
  id: string
  recipientName: string
  recipientAddress: string
  city: string
  state: string
  recipientZipCode: string
  serviceOptions: ServiceOptions
}

export default function EditServiceOptions() {
  const router = useRouter()
  const params = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [recipients, setRecipients] = useState<RecipientServiceData[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadOrderDetails()
  }, [])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('token')

      // Fetch order details
      const orderData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())

      // Check if order can be edited
      const editabilityData = await api.checkOrderEditability(params.id as string, token!)

      if (!editabilityData.canEdit) {
        alert('This order cannot be edited: ' + editabilityData.lockReason)
        router.push(`/orders/${params.id}`)
        return
      }

      setOrder(orderData)

      // Map recipients to service data
      if (orderData.recipients && orderData.recipients.length > 0) {
        const recipientServiceData: RecipientServiceData[] = orderData.recipients.map((r: any) => ({
          id: r.id,
          recipientName: r.recipientName || '',
          recipientAddress: r.recipientAddress || '',
          city: r.city || '',
          state: r.state || '',
          recipientZipCode: r.recipientZipCode || '',
          serviceOptions: {
            processService: r.processService || false,
            certifiedMail: r.certifiedMail || false,
            rushService: r.rushService || false,
            remoteLocation: r.remoteLocation || false
          }
        }))
        setRecipients(recipientServiceData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to load order:', error)
      alert('Failed to load order details')
      router.push('/orders')
    }
  }

  const toggleServiceOption = (recipientId: string, option: keyof ServiceOptions) => {
    setRecipients(prevRecipients => {
      return prevRecipients.map(recipient => {
        if (recipient.id !== recipientId) return recipient

        const currentValue = recipient.serviceOptions[option]
        const newServiceOptions = { ...recipient.serviceOptions }

        // Simply toggle the selected option - allow multiple selections
        newServiceOptions[option] = !currentValue

        return {
          ...recipient,
          serviceOptions: newServiceOptions
        }
      })
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    // Validate that each recipient has at least one service method
    const invalidRecipient = recipients.find(r =>
      !r.serviceOptions.processService && !r.serviceOptions.certifiedMail
    )

    if (invalidRecipient) {
      alert(`Please select at least one service method for ${invalidRecipient.recipientName}`)
      return
    }

    setSaving(true)

    try {
      const token = sessionStorage.getItem('token')

      // Prepare update payload
      const recipientUpdates = recipients.map(r => ({
        recipientId: r.id,
        recipientName: r.recipientName,
        recipientAddress: r.recipientAddress,
        recipientZipCode: r.recipientZipCode,
        city: r.city,
        state: r.state,
        processService: r.serviceOptions.processService,
        certifiedMail: r.serviceOptions.certifiedMail,
        rushService: r.serviceOptions.rushService,
        remoteLocation: r.serviceOptions.remoteLocation,
        serviceType: r.serviceOptions.processService ? 'PROCESS_SERVICE' : 'CERTIFIED_MAIL'
      }))

      const updatePayload = {
        recipientUpdates
      }

      console.log('Updating order with payload:', updatePayload)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: params.id,
          ...updatePayload
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Update failed: ${errorText}`)
      }

      alert('Service options updated successfully!')
      router.push(`/orders/${params.id}`)
    } catch (error) {
      console.error('Failed to update service options:', error)
      alert('Failed to update service options. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const calculatePrice = (serviceOptions: ServiceOptions): number => {
    let total = 0
    // Add fees for each selected service
    if (serviceOptions.processService) total += 75
    if (serviceOptions.certifiedMail) total += 25
    if (serviceOptions.rushService) total += 50
    if (serviceOptions.remoteLocation) total += 40
    return total
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/orders/${params.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Order Details</span>
          </motion.button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Edit Service Options
          </h1>
          <p className="text-gray-600">
            Order: <span className="font-semibold">{order?.orderNumber}</span>
          </p>
          {hasChanges && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-orange-600 text-sm mt-2 font-medium"
            >
              ⚠️ You have unsaved changes
            </motion.p>
          )}
        </motion.div>

        {/* Recipients */}
        <div className="space-y-6 mb-8">
          {recipients.map((recipient, index) => (
            <motion.div
              key={recipient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              {/* Recipient Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Recipient {index + 1}
                  </h3>
                  <p className="text-lg text-gray-600 mt-1">{recipient.recipientName}</p>
                  <p className="text-sm text-gray-500 mt-1">{recipient.recipientAddress}</p>
                  <p className="text-sm text-gray-500">
                    {recipient.city}, {recipient.state} {recipient.recipientZipCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${calculatePrice(recipient.serviceOptions)}.00
                  </p>
                </div>
              </div>

              {/* Service Options */}
              <div className="space-y-3">
                {/* Process Service */}
                <ServiceOptionCard
                  icon={<Package className="w-5 h-5" />}
                  title="Process Service"
                  description="Personal delivery by a professional process server"
                  price="$75.00"
                  checked={recipient.serviceOptions.processService}
                  onChange={() => toggleServiceOption(recipient.id, 'processService')}
                  color="blue"
                />

                {/* Certified Mail */}
                <ServiceOptionCard
                  icon={<Mail className="w-5 h-5" />}
                  title="Certified Mail"
                  description="Delivery via USPS certified mail with signature confirmation"
                  price="$25.00"
                  checked={recipient.serviceOptions.certifiedMail}
                  onChange={() => toggleServiceOption(recipient.id, 'certifiedMail')}
                  color="purple"
                />

                {/* Rush Service */}
                <ServiceOptionCard
                  icon={<Zap className="w-5 h-5" />}
                  title="Rush Service"
                  description="Priority processing and expedited delivery (within 24-48 hours)"
                  price="+$50.00"
                  checked={recipient.serviceOptions.rushService}
                  onChange={() => toggleServiceOption(recipient.id, 'rushService')}
                  color="orange"
                />

                {/* Remote Location */}
                <ServiceOptionCard
                  icon={<MapPin className="w-5 h-5" />}
                  title="Remote Location"
                  description="Service in remote or hard-to-reach locations"
                  price="+$40.00"
                  checked={recipient.serviceOptions.remoteLocation}
                  onChange={() => toggleServiceOption(recipient.id, 'remoteLocation')}
                  color="green"
                />
              </div>

              {/* Validation Warning */}
              {!recipient.serviceOptions.processService && !recipient.serviceOptions.certifiedMail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Service Method Required</p>
                    <p className="text-xs text-red-700 mt-1">
                      Please select at least one service method. You can select Process Service, Certified Mail, or both.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg sticky bottom-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/orders/${params.id}`)}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all shadow-md hover:shadow-lg"
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5"
        >
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Service Information
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• You can select <strong>both Process Service and Certified Mail</strong> for comprehensive delivery</li>
            <li>• Process service provides the highest success rate for service completion</li>
            <li>• Certified mail may take 3-5 business days for delivery</li>
            <li>• Rush service is recommended for deadlines within 72 hours</li>
            <li>• Remote service applies to locations outside standard service areas</li>
            <li>• <strong>Each recipient can have different service options</strong> based on their needs</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

interface ServiceOptionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  price: string
  checked: boolean
  onChange: () => void
  color: 'blue' | 'purple' | 'orange' | 'green'
}

function ServiceOptionCard({
  icon,
  title,
  description,
  price,
  checked,
  onChange,
  color
}: ServiceOptionCardProps) {
  const colorClasses = {
    blue: {
      border: checked ? 'border-blue-500' : 'border-gray-300',
      bg: checked ? 'bg-blue-50' : 'bg-white',
      icon: checked ? 'text-blue-600' : 'text-gray-400',
      checkbox: 'text-blue-600 focus:ring-blue-500'
    },
    purple: {
      border: checked ? 'border-purple-500' : 'border-gray-300',
      bg: checked ? 'bg-purple-50' : 'bg-white',
      icon: checked ? 'text-purple-600' : 'text-gray-400',
      checkbox: 'text-purple-600 focus:ring-purple-500'
    },
    orange: {
      border: checked ? 'border-orange-500' : 'border-gray-300',
      bg: checked ? 'bg-orange-50' : 'bg-white',
      icon: checked ? 'text-orange-600' : 'text-gray-400',
      checkbox: 'text-orange-600 focus:ring-orange-500'
    },
    green: {
      border: checked ? 'border-green-500' : 'border-gray-300',
      bg: checked ? 'bg-green-50' : 'bg-white',
      icon: checked ? 'text-green-600' : 'text-gray-400',
      checkbox: 'text-green-600 focus:ring-green-500'
    }
  }

  const classes = colorClasses[color]

  return (
    <motion.label
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`block border-2 ${classes.border} ${classes.bg} rounded-xl p-4 cursor-pointer transition-all`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={`mt-1 h-5 w-5 rounded ${classes.checkbox} cursor-pointer`}
        />
        <div className={`flex-shrink-0 mt-0.5 ${classes.icon}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-semibold ${checked ? 'text-gray-900' : 'text-gray-700'}`}>
              {title}
            </h4>
            <span className={`text-sm font-bold ${checked ? classes.icon : 'text-gray-600'}`}>
              {price}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </motion.label>
  )
}
