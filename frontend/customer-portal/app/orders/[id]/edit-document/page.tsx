'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { ArrowLeft, Save, FileText, Download } from 'lucide-react'
import DocumentStepMultiple from '@/components/orders/create/DocumentStepMultiple'

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
    documents: [] as any[], // Changed to array for DocumentStepMultiple
    existingDocumentName: undefined as string | undefined,
    existingDocumentUrl: undefined as string | undefined,
    filePageCount: 0,
    // Initiator fields
    initiatorType: '',
    initiatorFirstName: '',
    initiatorMiddleName: '',
    initiatorLastName: '',
    initiatorAddress: '',
    initiatorCity: '',
    initiatorState: '',
    initiatorZipCode: '',
    initiatorPhone: '',
    hearingDate: '',
    personalServiceDate: ''
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

      console.log('📄 Loading existing documents:', {
        hasDocumentUrl: !!orderData.documentUrl,
        documentUrl: orderData.documentUrl,
        originalFileName: orderData.originalFileName,
        documentsCount: orderData.documents?.length || 0,
        documents: orderData.documents
      })

      // Prepare documents array from existing documents
      const existingDocs = orderData.documents?.map((doc: any) => ({
        id: doc.id || `doc-${Date.now()}-${Math.random()}`,
        file: null,
        uploadedUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/documents/${doc.id}`,
        originalFileName: doc.fileName,
        fileSize: doc.fileSize || 0,
        pageCount: doc.pageCount || 0,
        documentType: doc.documentType || orderData.documentType
      })) || []

      setDocumentData({
        caseNumber: orderData.caseNumber || '',
        jurisdiction: orderData.jurisdiction || '',
        documentType: orderData.documentType || '',
        deadline: orderData.deadline ? new Date(orderData.deadline).toISOString().slice(0, 16) : '',
        documents: existingDocs,
        existingDocumentName: existingDocName,
        existingDocumentUrl: existingDocUrl,
        filePageCount: orderData.pageCount || 0,
        // Load initiator fields
        initiatorType: orderData.initiatorType || '',
        initiatorFirstName: orderData.initiatorFirstName || '',
        initiatorMiddleName: orderData.initiatorMiddleName || '',
        initiatorLastName: orderData.initiatorLastName || '',
        initiatorAddress: orderData.initiatorAddress || '',
        initiatorCity: orderData.initiatorCity || '',
        initiatorState: orderData.initiatorState || '',
        initiatorZipCode: orderData.initiatorZipCode || '',
        initiatorPhone: orderData.initiatorPhone || '',
        hearingDate: orderData.hearingDate ? new Date(orderData.hearingDate).toISOString().slice(0, 16) : '',
        personalServiceDate: orderData.personalServiceDate ? new Date(orderData.personalServiceDate).toISOString().slice(0, 16) : ''
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
        deadline: new Date(documentData.deadline).toISOString(),
        // Include initiator fields
        initiatorType: documentData.initiatorType || null,
        initiatorFirstName: documentData.initiatorFirstName || null,
        initiatorMiddleName: documentData.initiatorMiddleName || null,
        initiatorLastName: documentData.initiatorLastName || null,
        initiatorAddress: documentData.initiatorAddress || null,
        initiatorCity: documentData.initiatorCity || null,
        initiatorState: documentData.initiatorState || null,
        initiatorZipCode: documentData.initiatorZipCode || null,
        initiatorPhone: documentData.initiatorPhone || null,
        hearingDate: documentData.hearingDate ? new Date(documentData.hearingDate).toISOString() : null,
        personalServiceDate: documentData.personalServiceDate ? new Date(documentData.personalServiceDate).toISOString() : null
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

      // If new documents were uploaded, upload them
      const newDocs = documentData.documents.filter((doc: any) => doc.file && !doc.uploadedUrl)
      if (newDocs.length > 0) {
        for (const doc of newDocs) {
          const formData = new FormData()
          formData.append('file', doc.file)

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
          <p className="text-lg text-gray-700">
            Order: <span className="font-bold text-blue-600">{order?.orderNumber || params.id}</span>
          </p>
        </motion.div>

        {/* Main Content Card - Matching Create Order Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Document Details</h2>
                <p className="text-blue-100 text-sm">Case information & documents</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <DocumentStepMultiple
              data={documentData}
              onChange={setDocumentData}
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/orders/${params.id}`)}
            className="px-8 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200"
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
