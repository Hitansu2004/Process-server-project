'use client'

import { motion } from 'framer-motion'
import { FileText, Eye, Download, Trash2, AlertCircle } from 'lucide-react'

interface Document {
  id: string
  file: File | null
  uploadedUrl?: string
  originalFileName?: string
  fileSize?: number
  pageCount?: number
  documentType?: string
}

interface DocumentCardProps {
  document: Document
  index: number
  onView: () => void
  onDownload: () => void
  onDelete: () => void
  isUploaded: boolean
  isUploading?: boolean
}

export default function DocumentCard({
  document,
  index,
  onView,
  onDownload,
  onDelete,
  isUploaded,
  isUploading = false
}: DocumentCardProps) {

  const getFileSizeDisplay = (bytes?: number) => {
    if (!bytes) {
      if (document.file) {
        return (document.file.size / 1024 / 1024).toFixed(2) + ' MB'
      }
      return 'Unknown size'
    }
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const fileName = document.file?.name || document.originalFileName || `Document ${index + 1}`
  const fileSize = getFileSizeDisplay(document.fileSize)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 transition-all ${
        isUploading
          ? 'border-blue-300 bg-blue-50'
          : isUploaded
          ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileText className={`h-5 w-5 flex-shrink-0 ${
            isUploaded ? 'text-blue-600' : 'text-blue-500'
          }`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {fileName}
              </h3>
              {isUploading ? (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded flex-shrink-0 flex items-center space-x-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                  <span>Uploading...</span>
                </span>
              ) : !isUploaded ? (
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded flex-shrink-0">
                  Pending Upload
                </span>
              ) : (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex-shrink-0">
                  ✓ Uploaded
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-1">
              <p className="text-xs text-gray-600">
                {fileSize}
              </p>
              {document.pageCount && document.pageCount > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <p className="text-xs text-gray-600">
                    📄 {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
                  </p>
                </>
              )}
              {document.documentType && (
                <>
                  <span className="text-gray-400">•</span>
                  <p className="text-xs text-gray-600 capitalize">
                    {document.documentType}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-3">
          <button
            type="button"
            onClick={onView}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="View document"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {isUploaded && (
            <button
              type="button"
              onClick={onDownload}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="Download document"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Warning for large files */}
      {document.file && document.file.size > 40 * 1024 * 1024 && (
        <div className="mt-3 flex items-start space-x-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Large file ({fileSize}). Upload may take longer.
          </p>
        </div>
      )}
    </motion.div>
  )
}
