'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import DocumentStep from '@/components/orders/create/DocumentStep'

export default function EditDocument() {
  const router = useRouter()
  const params = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<any>(null)

  const [documentData, setDocumentData] = useState({
    caseNumber: '',
    jurisdiction: '',
    documentType: '',
    deadline: '',
    document: null as File | null,
    existingDocumentName: undefined as string | undefined,
    existingDocumentUrl: undefined as string | undefined,
    filePageCount: 0
  })

  useEffect(() => {
    loadOrderDetails()
  }, [])

  const loadOrderDetails = async () => {
    try {
      const token = sessionStorage.getItem('token')

      // Check editability
      const editabilityData = await api.checkOrderEditability(params.id as string, token!)
      if (!editabilityData.canEdit) {
        alert('This order cannot be edited: ' + editabilityData.lockReason)
        router.push(`/orders/${params.id}`)
        return
      }

      // Fetch order details
      const orderData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())

      setOrder(orderData)

      // Populate form with existing data
      setDocumentData({
        caseNumber: orderData.caseNumber || '',
        jurisdiction: orderData.jurisdiction || '',
        documentType: orderData.documentType || '',
        deadline: orderData.deadline ? new Date(orderData.deadline).toISOString().slice(0, 16) : '',
        document: null,
        existingDocumentName: orderData.documentUrl ? orderData.documentUrl.split('/').pop() : undefined,
        existingDocumentUrl: orderData.documentUrl ? `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/document` : undefined,
        filePageCount: orderData.pageCount || 0
      })

      setLoading(false)
    } catch (error) {
      console.error('Failed to load order:', error)
      alert('Failed to load order details')
      router.push('/orders')
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!documentData.caseNumber || !documentData.jurisdiction ||
      !documentData.documentType || !documentData.deadline) {
      alert('Please complete all required fields')
      return
    }

    setSaving(true)

    try {
      const token = sessionStorage.getItem('token')

      // Update order metadata
      const updatePayload = {
        orderId: params.id,
        caseNumber: documentData.caseNumber,
        jurisdiction: documentData.jurisdiction,
        documentType: documentData.documentType.toUpperCase(),
        deadline: new Date(documentData.deadline).toISOString()
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
        throw new Error('Failed to update order')
      }

      // If new document was uploaded, update it separately
      if (documentData.document) {
        const formData = new FormData()
        formData.append('file', documentData.document)

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/document`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload document')
        }
      }

      alert('Document details updated successfully!')
      router.push(`/orders/${params.id}`)
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order. Please try again.')
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Document Details</h1>
          <p className="text-gray-600 mt-2">Order: {order?.orderNumber}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
        >
          <DocumentStep
            data={documentData}
            onChange={setDocumentData}
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
