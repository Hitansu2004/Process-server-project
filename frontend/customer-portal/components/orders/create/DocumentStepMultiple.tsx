'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, X, Eye, Download, Plus, Info } from 'lucide-react'
import { api } from '@/lib/api'
import DocumentCard from './DocumentCard'

interface Document {
  id: string
  file: File | null
  uploadedUrl?: string
  originalFileName?: string
  fileSize?: number
  pageCount?: number
  documentType?: string
}

interface DocumentStepProps {
  data: {
    caseNumber: string
    jurisdiction: string
    documentType: string
    deadline: string
    documents: Document[] // Changed from single document to array
    existingDocumentName?: string
    existingDocumentUrl?: string
    filePageCount: number
  }
  onChange: (data: any) => void
  draftId?: string // For immediate document upload to draft
}

export default function DocumentStepMultiple({ data, onChange, draftId }: DocumentStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [countingPages, setCountingPages] = useState(false)
  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(new Set())

  // Log when data prop changes
  console.log('📝 DocumentStepMultiple received data:', data)

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const countPDFPages = async (file: File): Promise<number> => {
    if (!file.type.includes('pdf')) {
      return 0
    }

    setCountingPages(true)
    try {
      const token = sessionStorage.getItem('token')
      if (!token) return 0

      const result = await api.countDocumentPages(file, token)
      return result.pageCount || 0
    } catch (error) {
      console.error('Error counting pages:', error)
      return 0
    } finally {
      setCountingPages(false)
    }
  }

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files)
    const newDocuments: Document[] = []

    for (const file of fileArray) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 50MB limit. Please choose a smaller file.`)
        continue
      }

      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const pageCount = await countPDFPages(file)
      
      const newDoc: Document = {
        id: docId,
        file: file,
        fileSize: file.size,
        pageCount: pageCount,
        documentType: data.documentType
      }
      
      newDocuments.push(newDoc)
    }

    if (newDocuments.length > 0) {
      const updatedDocuments = [...(data.documents || []), ...newDocuments]
      onChange({
        ...data,
        documents: updatedDocuments
      })

      // Upload after state is updated
      if (draftId) {
        newDocuments.forEach(doc => uploadDocumentToDraft(doc))
      }
    }
  }

  const uploadDocumentToDraft = async (document: Document) => {
    if (!document.file || !draftId) return

    setUploadingDocuments(prev => {
      const next = new Set(prev)
      next.add(document.id)
      return next
    })

    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.error('No auth token found')
        setUploadingDocuments(prev => {
          const next = new Set(prev)
          next.delete(document.id)
          return next
        })
        return
      }

      console.log(`🚀 Uploading document ${document.file.name} to draft ${draftId}`)

      const result = await api.uploadDraftDocument(
        draftId,
        document.file,
        token,
        document.documentType,
        (progress) => {
          console.log(`Upload progress: ${progress}%`)
        }
      ) as any

      console.log('✅ Document uploaded to draft:', result)

      // Update document with uploaded URL and metadata using callback to ensure latest state
      onChange((currentData: any) => ({
        ...currentData,
        documents: currentData.documents.map((doc: Document) => 
          doc.id === document.id 
            ? { 
                ...doc, 
                uploadedUrl: result.document?.url || result.url,
                originalFileName: result.document?.filename || result.filename,
                fileSize: result.document?.fileSize || result.fileSize || doc.fileSize,
                pageCount: doc.pageCount // Keep existing page count
              }
            : doc
        )
      }))

    } catch (error) {
      console.error('Failed to upload document to draft:', error)
      alert(`Failed to upload ${document.file.name}. Please try again.`)
    } finally {
      setUploadingDocuments(prev => {
        const next = new Set(prev)
        next.delete(document.id)
        return next
      })
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
  }

  const handleRemoveDocument = (docId: string) => {
    const updatedDocuments = data.documents.filter(doc => doc.id !== docId)
    onChange({
      ...data,
      documents: updatedDocuments
    })
  }

  const handleViewDocument = (document: Document) => {
    if (document.file) {
      const url = URL.createObjectURL(document.file)
      window.open(url, '_blank')
    } else if (document.uploadedUrl) {
      window.open(document.uploadedUrl, '_blank')
    }
  }

  const handleDownloadDocument = async (document: Document) => {
    if (document.file) {
      const url = URL.createObjectURL(document.file)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.file.name
      a.click()
    } else if (document.uploadedUrl) {
      try {
        const token = sessionStorage.getItem('token')
        // Assuming the uploadedUrl contains document ID
        // You'd need to adjust this based on your actual implementation
        alert('Download from server not yet implemented for existing documents')
      } catch (error) {
        console.error('Error downloading document:', error)
        alert('Failed to download document. Please try again.')
      }
    }
  }

  const getTotalPageCount = () => {
    return data.documents.reduce((total, doc) => total + (doc.pageCount || 0), 0)
  }

  const getTotalFileSize = () => {
    const totalBytes = data.documents.reduce((total, doc) => {
      if (doc.file) return total + doc.file.size
      if (doc.fileSize) return total + doc.fileSize
      return total
    }, 0)
    return (totalBytes / 1024 / 1024).toFixed(2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Details</h2>
        <p className="text-gray-600">Provide information about the case and upload the documents to be served.</p>
      </div>

      {/* Case Number */}
      <div>
        <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Case Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="caseNumber"
          value={data.caseNumber}
          onChange={(e) => handleChange('caseNumber', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., CV-2024-1234"
          required
        />
      </div>

      {/* Jurisdiction */}
      <div>
        <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
          Jurisdiction <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="jurisdiction"
          value={data.jurisdiction}
          onChange={(e) => handleChange('jurisdiction', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Superior Court of California, County of Los Angeles"
          required
        />
      </div>

      {/* Document Type */}
      <div>
        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
          Document Type <span className="text-red-500">*</span>
        </label>
        <select
          id="documentType"
          value={data.documentType}
          onChange={(e) => handleChange('documentType', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select document type</option>
          <option value="SUMMONS">Summons</option>
          <option value="COMPLAINT">Complaint</option>
          <option value="SUBPOENA">Subpoena</option>
          <option value="NOTICE">Notice</option>
          <option value="ORDER">Court Order</option>
          <option value="PETITION">Petition</option>
          <option value="MOTION">Motion</option>
          <option value="WARRANT">Warrant</option>
          <option value="WRIT">Writ</option>
          <option value="GARNISHMENT">Garnishment</option>
          <option value="EVICTION_NOTICE">Eviction Notice</option>
          <option value="RESTRAINING_ORDER">Restraining Order</option>
          <option value="DIVORCE_PAPERS">Divorce Papers</option>
          <option value="CHILD_CUSTODY">Child Custody Papers</option>
          <option value="PROBATE_DOCUMENTS">Probate Documents</option>
          <option value="BANKRUPTCY">Bankruptcy Filing</option>
          <option value="CEASE_DESIST">Cease and Desist</option>
          <option value="DEMAND_LETTER">Demand Letter</option>
          <option value="CONTRACT">Contract</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
          Service Deadline <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="deadline"
          value={data.deadline.split('T')[0]}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => handleChange('deadline', e.target.value + 'T00:00:00')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Documents Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Documents <span className="text-red-500">*</span>
        </label>

        {/* Info Banner */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Multiple Documents Supported</p>
              <p className="text-xs mt-1">
                You can upload multiple documents (up to 50MB each). All documents will be associated with this order.
              </p>
            </div>
          </div>
        </div>

        {/* Document List */}
        {data.documents && data.documents.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Documents ({data.documents.length})
              </h3>
              <div className="text-sm text-gray-600">
                {getTotalPageCount() > 0 && (
                  <span className="mr-3">📄 {getTotalPageCount()} pages</span>
                )}
                <span>{getTotalFileSize()} MB total</span>
              </div>
            </div>

            {data.documents.map((document, index) => (
              <DocumentCard
                key={document.id}
                document={document}
                index={index}
                onView={() => handleViewDocument(document)}
                onDownload={() => handleDownloadDocument(document)}
                onDelete={() => handleRemoveDocument(document.id)}
                isUploaded={!!document.uploadedUrl}
                isUploading={uploadingDocuments.has(document.id)}
              />
            ))}
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your documents here, or
          </p>
          <label className="inline-block">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              Browse Files
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
              multiple
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, DOC, DOCX (Max 50MB per file)
          </p>
        </div>

        {countingPages && (
          <div className="mt-2 text-sm text-blue-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Counting pages...
          </div>
        )}
      </div>
    </motion.div>
  )
}
