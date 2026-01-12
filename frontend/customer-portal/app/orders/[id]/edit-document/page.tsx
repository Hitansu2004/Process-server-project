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

      // Populate form with existing data - use original filename if available
      const existingDocName = orderData.originalFileName 
        || (orderData.documentUrl ? orderData.documentUrl.split('/').pop() : undefined)
        || 'Document.pdf'
      
      const existingDocUrl = orderData.documentUrl 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/document` 
        : undefined

      console.log('📄 Loading existing document:', {
        hasDocumentUrl: !!orderData.documentUrl,
        documentUrl: orderData.documentUrl,
        originalFileName: orderData.originalFileName,
        existingDocName,
        existingDocUrl,
        pageCount: orderData.pageCount
      })

      setDocumentData({
        caseNumber: orderData.caseNumber || '',
        jurisdiction: orderData.jurisdiction || '',
        documentType: orderData.documentType || '',
        deadline: orderData.deadline ? new Date(orderData.deadline).toISOString().slice(0, 16) : '',
        document: null,
        existingDocumentName: existingDocName,
        existingDocumentUrl: existingDocUrl,
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
            onClick={() => router.push(`/orders/${params.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Order Details</span>
          </motion.button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Edit Document Details
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
          <DocumentStep
            data={documentData}
            onChange={setDocumentData}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center gap-4"
        >
          <button
            onClick={() => router.push(`/orders/${params.id}`)}
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
      </div>
    </div>
  )
}
