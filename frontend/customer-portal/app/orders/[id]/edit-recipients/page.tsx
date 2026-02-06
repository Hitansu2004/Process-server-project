'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import RecipientsStep from '@/components/orders/create/RecipientsStep'

export default function EditRecipients() {
  const router = useRouter()
  const params = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [editability, setEditability] = useState<any>(null)
  const [recipients, setRecipients] = useState<any[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    loadOrderDetails()
  }, [])

  const loadOrderDetails = async () => {
    try {
      const token = sessionStorage.getItem('token')

      const orderData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())

      setOrder(orderData)

      const editabilityData = await api.checkOrderEditability(params.id as string, token!)
      setEditability(editabilityData)

      if (!editabilityData.canEdit) {
        alert('This order cannot be edited: ' + editabilityData.lockReason)
        router.push(`/orders/${params.id}`)
        return
      }

      // Convert recipients to recipients
      if (orderData.recipients && orderData.recipients.length > 0) {
        const recipientsData = orderData.recipients.map((recipient: any) => {
          
          // Split name if firstName/lastName not provided
          let firstName = recipient.firstName || '';
          let lastName = recipient.lastName || '';

          if (!firstName && !lastName && recipient.recipientName) {
            const nameParts = recipient.recipientName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          return {
            id: recipient.id || Date.now().toString(),
            recipientEntityType: recipient.recipientEntityType || 'INDIVIDUAL',
            organizationName: recipient.organizationName || '',
            authorizedAgent: recipient.authorizedAgent || '',
            firstName: firstName,
            lastName: lastName,
            middleName: recipient.middleName || '',
            email: recipient.email || '',
            phone: recipient.phone || '',
            address: recipient.recipientAddress || recipient.address || '',
            city: recipient.city || '',
            state: recipient.state || '',
            stateId: recipient.stateId,
            zipCode: recipient.recipientZipCode || recipient.zipCode || '',
            notes: recipient.specialInstructions || recipient.notes || '',
            assignmentType: recipient.recipientType || 'AUTOMATED',
            processServerId: recipient.assignedProcessServerId,
            processServerName: recipient.processServerName || '',
            processService: recipient.processService || false,
            certifiedMail: recipient.certifiedMail || false,
            rushService: recipient.rushService || false,
            remoteService: recipient.remoteLocation || false,
            status: recipient.status || 'OPEN'
          };
        })
        
        setRecipients(recipientsData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to load order:', error)
      alert('Failed to load order details')
      router.push('/orders')
    }
  }

  const handleSubmit = async () => {
    // Validate each recipient based on entity type
    const invalidRecipient = recipients.find(r => {
      // Check entity-specific name fields
      const hasValidName = r.recipientEntityType === 'ORGANIZATION'
        ? !!(r.organizationName)
        : !!(r.firstName && r.lastName)
      
      // Check required address fields
      const hasAddress = !!(r.address && r.city && r.state && r.zipCode)
      
      // Check service options
      const hasServiceOption = !!(r.processService || r.certifiedMail)
      
      return !hasValidName || !hasAddress || !hasServiceOption
    })

    if (recipients.length === 0 || invalidRecipient) {
      alert('Please complete all recipient information and select at least one service method')
      return
    }

    setSaving(true)

    try {
      const token = sessionStorage.getItem('token')

      const recipientsData = recipients.map(recipient => {
        // Check if this is a new recipient (ID is a timestamp)
        const isNewRecipient = !recipient.id.includes('-') && recipient.id.length > 10
        
        return {
          recipientId: isNewRecipient ? null : recipient.id,
          isNew: isNewRecipient,
          recipientEntityType: recipient.recipientEntityType || 'INDIVIDUAL',
          organizationName: recipient.organizationName || null,
          authorizedAgent: recipient.authorizedAgent || null,
          firstName: recipient.firstName || null,
          lastName: recipient.lastName || null,
          middleName: recipient.middleName || null,
          email: recipient.email || null,
          phone: recipient.phone || null,
          recipientName: recipient.recipientEntityType === 'ORGANIZATION'
            ? (recipient.organizationName || '')
            : `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
          recipientAddress: recipient.address,
          recipientZipCode: recipient.zipCode,
          city: recipient.city,
          state: recipient.state,
          stateId: recipient.stateId,
          specialInstructions: recipient.notes,
          recipientType: recipient.assignmentType || 'AUTOMATED',
          assignedProcessServerId: recipient.processServerId || null,
          // Service options from the recipient
          processService: recipient.processService || false,
          certifiedMail: recipient.certifiedMail || false,
          rushService: recipient.rushService || false,
          remoteLocation: recipient.remoteService || false
        }
      })

      const updatePayload = {
        orderId: params.id, // Required field
        recipientUpdates: recipientsData
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update failed:', errorText)
        throw new Error(`Failed to update: ${response.status}`)
      }

      const result = await response.json()
      console.log('Update successful:', result)

      setShowSuccessModal(true)
      
      // Redirect after showing modal for 2 seconds
      setTimeout(() => {
        router.push(`/orders/${params.id}?t=${Date.now()}`)
      }, 2000)
    } catch (error) {
      console.error('Failed to update recipients:', error)
      alert('Failed to update recipients. Please try again.')
    } finally {
      setSaving(false)
    }
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Order Details</span>
          </motion.button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Edit Recipients
          </h1>
          <p className="text-gray-600">
            Order: <span className="font-semibold">{order?.orderNumber}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
        >
          <RecipientsStep
            data={recipients}
            onChange={setRecipients}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 shadow-md hover:shadow-lg transition-all"
          >
            Cancel
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Success Modal */}
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600 mb-6">
                  Recipients and service options updated successfully!
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
