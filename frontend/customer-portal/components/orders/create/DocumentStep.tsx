'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, X, Eye, Download } from 'lucide-react'
import { api } from '@/lib/api'

interface DocumentStepProps {
  data: {
    caseNumber: string
    jurisdiction: string
    documentType: string
    deadline: string
    document: File | null
    existingDocumentName?: string
    existingDocumentUrl?: string
    filePageCount: number
  }
  onChange: (data: any) => void
}

export default function DocumentStep({ data, onChange }: DocumentStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [countingPages, setCountingPages] = useState(false)

  // Log when data prop changes
  console.log('📝 DocumentStep received data:', data)

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const countPDFPages = async (file: File): Promise<number> => {
    try {
      setCountingPages(true)
      const token = sessionStorage.getItem('token')
      if (!token) {
        console.error('No auth token found')
        return 0
      }

      console.log('🔄 Sending file to backend for page counting:', file.name)
      const result = await api.countDocumentPages(file, token)
      const count = result.pageCount || 0
      console.log('📄 PDF Page Count from backend:', count, 'for file:', file.name)
      return count
    } catch (error) {
      console.error('Error counting pages:', error)
      return 0
    } finally {
      setCountingPages(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    const pageCount = await countPDFPages(file)
    onChange({
      ...data,
      document: file,
      filePageCount: pageCount
    })
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    onChange({
      ...data,
      document: null,
      existingDocumentName: undefined,
      existingDocumentUrl: undefined,
      filePageCount: 0
    })
  }

  const handleViewFile = async () => {
    if (data.document) {
      const url = URL.createObjectURL(data.document)
      window.open(url, '_blank')
    } else if (data.existingDocumentUrl) {
      try {
        const token = sessionStorage.getItem('token')
        const response = await fetch(data.existingDocumentUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) throw new Error('Failed to load document')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
      } catch (error) {
        console.error('Error viewing document:', error)
        alert('Failed to load document. Please try again.')
      }
    }
  }

  const handleDownloadFile = async () => {
    if (data.document) {
      const url = URL.createObjectURL(data.document)
      const a = document.createElement('a')
      a.href = url
      a.download = data.document.name
      a.click()
    } else if (data.existingDocumentUrl) {
      try {
        const token = sessionStorage.getItem('token')
        const response = await fetch(data.existingDocumentUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) throw new Error('Failed to download document')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.existingDocumentName || 'document.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error downloading document:', error)
        alert('Failed to download document. Please try again.')
      }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Details</h2>
        <p className="text-gray-600">Provide information about the case and upload the document to be served.</p>
      </div>

      <div className="space-y-4">
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
            placeholder="e.g., CV-2024-12345"
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

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Document <span className="text-red-500">*</span>
          </label>

          {!data.document && !data.existingDocumentName ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your document here, or
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
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX
              </p>
            </div>
          ) : (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <FileText className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {data.document ? data.document.name : (data.existingDocumentName || 'Document.pdf')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.document 
                        ? `${(data.document.size / 1024 / 1024).toFixed(2)} MB` 
                        : 'Previously uploaded document'}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        type="button"
                        onClick={handleViewFile}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadFile}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                      {countingPages ? (
                        <span className="text-xs text-blue-600 font-medium animate-pulse">
                          🔄 Counting pages...
                        </span>
                      ) : data.filePageCount > 0 ? (
                        <span className="text-xs text-gray-600 font-medium">
                          📄 {data.filePageCount} {data.filePageCount === 1 ? 'page' : 'pages'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-4 text-red-600 hover:text-red-800 flex-shrink-0"
                  title="Remove file and upload new"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {data.existingDocumentName && !data.document && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <label className="inline-block">
                    <span className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                      Replace Document
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
