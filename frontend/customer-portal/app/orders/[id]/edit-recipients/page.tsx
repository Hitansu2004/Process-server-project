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
        const recipientsData = orderData.recipients.map((recipient: any) => ({
          id: recipient.id || Date.now().toString(),
          firstName: recipient.firstName || '',
          lastName: recipient.lastName || '',
          address: recipient.address || recipient.recipientAddress || '',
          city: recipient.city || '',
          state: recipient.state || '',
          zipCode: recipient.zipCode || recipient.recipientZipCode || '',
          notes: recipient.specialInstructions || ''
        }))
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
    if (recipients.length === 0 || !recipients.every(r =>
      r.firstName && r.lastName && r.address && r.city && r.state && r.zipCode
    )) {
      alert('Please complete all recipient information')
      return
    }

    setSaving(true)

    try {
      const token = sessionStorage.getItem('token')

      // Get current service options from first recipient
      const currentRecipient = order.recipients[0]

      const recipientsData = recipients.map(recipient => ({
        recipientId: recipient.id, // Required for update
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        recipientName: `${recipient.firstName} ${recipient.lastName}`.trim(),
        recipientAddress: recipient.address,
        recipientZipCode: recipient.zipCode,
        city: recipient.city,
        state: recipient.state,
        specialInstructions: recipient.notes,
        serviceType: currentRecipient?.serviceType || 'PROCESS_SERVICE',
        rushService: currentRecipient?.rushService || false,
        remoteLocation: currentRecipient?.remoteLocation || false
      }))

      const updatePayload = {
        recipientUpdates: recipientsData
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      alert('Recipients updated successfully!')
      router.push(`/orders/${params.id}`)
    } catch (error) {
      console.error('Failed to update recipients:', error)
      alert('Failed to update recipients. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push(`/orders/${params.id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Order Details</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Recipients</h1>
          <p className="text-gray-600 mt-2">Order ID: {order?.orderNumber}</p>
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
          className="flex justify-between items-center"
        >
          <button
            onClick={() => router.push(`/orders/${params.id}`)}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 shadow-md hover:shadow-lg transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
