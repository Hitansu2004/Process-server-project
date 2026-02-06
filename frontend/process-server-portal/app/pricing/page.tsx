'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Plus, Edit2, Trash2, Save, X, MapPin, Package, Zap, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface PricingEntry {
  pricingId: string
  processServerId: string
  zipCode: string
  processServiceFee?: number
  certifiedMailFee?: number
  rushServiceFee?: number
  remoteServiceFee?: number
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function PricingManagement() {
  const router = useRouter()
  const [pricing, setPricing] = useState<PricingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [processServerId, setProcessServerId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    zipCode: 'ALL',
    processServiceFee: '50.00',
    certifiedMailFee: '50.00',
    rushServiceFee: '50.00',
    remoteServiceFee: '50.00'
  })
  const [pricingType, setPricingType] = useState<'default' | 'zipcode'>('default')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Check if user has PROCESS_SERVER role
      const processServerRole = user.roles?.find((role: any) => role.role === 'PROCESS_SERVER')
      if (!processServerRole) {
        setMessage({ type: 'error', text: 'Access denied. Process server account required.' })
        setLoading(false)
        router.push('/login')
        return
      }
      
      // Fetch process server profile to get the actual process server ID
      const tenantUserRoleId = processServerRole.id
      if (!tenantUserRoleId) {
        setMessage({ type: 'error', text: 'Role ID not found. Please log in again.' })
        setLoading(false)
        return
      }

      const profileData = await api.getProcessServerProfile(tenantUserRoleId, token)
      const psId = profileData.id
      
      console.log('=== PROCESS SERVER PROFILE ===')
      console.log('Tenant User Role ID:', tenantUserRoleId)
      console.log('Process Server Profile ID:', psId)
      console.log('Full Profile:', profileData)
      
      if (!psId) {
        setMessage({ type: 'error', text: 'Process server profile not found. Please contact support.' })
        setLoading(false)
        return
      }
      
      setProcessServerId(psId)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/pricing/${psId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('=== PRICING FETCH RESPONSE ===', data)
        // The response has structure: { processServerId, allPricing: [...], hasCustomPricing }
        const pricingList = data.allPricing || (Array.isArray(data) ? data : [data])
        console.log('=== PRICING LIST ===', pricingList)
        setPricing(pricingList)
      } else {
        setPricing([])
      }
    } catch (error) {
      console.error('Failed to load pricing:', error)
      setMessage({ type: 'error', text: 'Failed to load pricing data' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (entry?: PricingEntry) => {
    try {
      // Check if trying to create a new DEFAULT when one already exists
      if (!entry && formData.zipCode === 'ALL') {
        const existingDefault = pricing.find(p => p.zipCode === 'ALL')
        if (existingDefault) {
          const confirmReplace = confirm(
            'A DEFAULT pricing already exists. Creating a new DEFAULT will replace the existing one. Do you want to continue?'
          )
          if (!confirmReplace) {
            return
          }
        }
      }

      // Validate zip code for new entries
      if (!entry && pricingType === 'zipcode' && !formData.zipCode.trim()) {
        setMessage({ type: 'error', text: 'Please enter a zip code' })
        return
      }

      // Validate fees
      const fees = [
        parseFloat(entry ? String(entry.processServiceFee) : formData.processServiceFee),
        parseFloat(entry ? String(entry.certifiedMailFee) : formData.certifiedMailFee),
        parseFloat(entry ? String(entry.rushServiceFee) : formData.rushServiceFee),
        parseFloat(entry ? String(entry.remoteServiceFee) : formData.remoteServiceFee)
      ]

      if (fees.some(fee => isNaN(fee) || fee < 0)) {
        setMessage({ type: 'error', text: 'Please enter valid positive numbers for all fees' })
        return
      }

      const token = localStorage.getItem('token')

      if (!processServerId) {
        setMessage({ type: 'error', text: 'Process server ID not found. Please reload the page.' })
        return
      }

      const data = entry ? {
        processServerId,
        zipCode: entry.zipCode,  // Preserve the original zipCode (ALL or specific zip)
        includedCopies: 0,
        perPagePrintFee: 0,
        processServiceFee: parseFloat(String(entry.processServiceFee)),
        certifiedMailFee: parseFloat(String(entry.certifiedMailFee)),
        rushServiceFee: parseFloat(String(entry.rushServiceFee)),
        remoteServiceFee: parseFloat(String(entry.remoteServiceFee))
      } : {
        processServerId,
        zipCode: formData.zipCode,
        includedCopies: 0,
        perPagePrintFee: 0,
        processServiceFee: parseFloat(formData.processServiceFee) || 0,
        certifiedMailFee: parseFloat(formData.certifiedMailFee) || 0,
        rushServiceFee: parseFloat(formData.rushServiceFee) || 0,
        remoteServiceFee: parseFloat(formData.remoteServiceFee) || 0
      }
      
      console.log('=== FORM DATA VALUES ===')
      console.log('formData.processServiceFee (raw):', formData.processServiceFee, typeof formData.processServiceFee)
      console.log('formData.certifiedMailFee (raw):', formData.certifiedMailFee, typeof formData.certifiedMailFee)
      console.log('formData.rushServiceFee (raw):', formData.rushServiceFee, typeof formData.rushServiceFee)
      console.log('formData.remoteServiceFee (raw):', formData.remoteServiceFee, typeof formData.remoteServiceFee)
      console.log('parseFloat results:', {
        processServiceFee: parseFloat(formData.processServiceFee),
        certifiedMailFee: parseFloat(formData.certifiedMailFee),
        rushServiceFee: parseFloat(formData.rushServiceFee),
        remoteServiceFee: parseFloat(formData.remoteServiceFee)
      })

      const url = entry 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/pricing/${entry.pricingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/pricing`

      console.log('=== PRICING SAVE DEBUG ===')
      console.log('URL:', url)
      console.log('Method:', entry ? 'PUT' : 'POST')
      console.log('Data:', JSON.stringify(data, null, 2))
      console.log('Token:', token ? 'Present' : 'Missing')

      const response = await fetch(url, {
        method: entry ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      console.log('Response Status:', response.status)
      console.log('Response OK:', response.ok)

      if (response.ok) {
        setMessage({ type: 'success', text: entry ? 'Pricing updated successfully' : 'Pricing added successfully' })
        setEditingId(null)
        setShowAddModal(false)
        setFormData({
          zipCode: 'ALL',
          processServiceFee: '50.00',
          certifiedMailFee: '50.00',
          rushServiceFee: '50.00',
          remoteServiceFee: '50.00'
        })
        await loadPricing()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.text()
        console.log('Error Response:', error)
        setMessage({ type: 'error', text: `Failed to save: ${error}` })
      }
    } catch (error) {
      console.error('Failed to save pricing - Exception:', error)
      setMessage({ type: 'error', text: `Failed to save pricing: ${error instanceof Error ? error.message : 'Unknown error'}` })
    }
  }

  const handleDelete = async (pricingId: string, zipCode: string) => {
    if (!confirm(`Are you sure you want to delete pricing for ${zipCode}?`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/pricing/${pricingId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        setMessage({ type: 'success', text: 'Pricing deleted successfully' })
        await loadPricing()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to delete pricing' })
      }
    } catch (error) {
      console.error('Failed to delete pricing:', error)
      setMessage({ type: 'error', text: 'Failed to delete pricing' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading pricing...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
                <p className="text-gray-600">Set your service fees for different locations</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAddModal(true)
                setEditingId(null)
                setPricingType('default')
                setFormData({
                  zipCode: 'ALL',
                  processServiceFee: '50.00',
                  certifiedMailFee: '50.00',
                  rushServiceFee: '50.00',
                  remoteServiceFee: '50.00'
                })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Pricing
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">How Pricing Works:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Default (ALL):</strong> Used for all zip codes unless you specify otherwise</li>
                <li><strong>Zip-Specific:</strong> Override pricing for specific zip codes (e.g., 75022)</li>
                <li><strong>Process Service & Certified Mail:</strong> Usually fixed across all locations</li>
                <li><strong>Rush & Remote:</strong> Can vary by location difficulty</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zip Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Process Service
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Certified Mail
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Rush Service
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Remote Service
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pricing.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <p className="mb-2">No pricing configured yet</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first pricing entry
                      </button>
                    </td>
                  </tr>
                ) : (
                  pricing.map((entry) => (
                    <PricingRow
                      key={entry.pricingId}
                      entry={entry}
                      isEditing={editingId === entry.pricingId}
                      onEdit={() => setEditingId(entry.pricingId)}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Add New Pricing</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Type
                  </label>
                  <select
                    value={pricingType}
                    onChange={(e) => {
                      const type = e.target.value as 'default' | 'zipcode'
                      setPricingType(type)
                      setFormData({ ...formData, zipCode: type === 'default' ? 'ALL' : '' })
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Default (All Zip Codes)</option>
                    <option value="zipcode">Specific Zip Code</option>
                  </select>
                </div>

                {pricingType === 'zipcode' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 75022"
                      maxLength={10}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Process Service</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.processServiceFee}
                      onChange={(e) => setFormData({ ...formData, processServiceFee: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certified Mail</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.certifiedMailFee}
                      onChange={(e) => setFormData({ ...formData, certifiedMailFee: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rush Service</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rushServiceFee}
                      onChange={(e) => setFormData({ ...formData, rushServiceFee: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remote Service</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.remoteServiceFee}
                      onChange={(e) => setFormData({ ...formData, remoteServiceFee: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleSave()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Pricing
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PricingRow({ entry, isEditing, onEdit, onSave, onCancel, onDelete }: {
  entry: PricingEntry
  isEditing: boolean
  onEdit: () => void
  onSave: (entry: PricingEntry) => void
  onCancel: () => void
  onDelete: (id: string, zip: string) => void
}) {
  const [editData, setEditData] = useState(entry)

  useEffect(() => {
    setEditData(entry)
  }, [entry])

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {entry.zipCode === 'ALL' ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">DEFAULT</span>
            ) : (
              <span className="font-medium">{entry.zipCode}</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            step="0.01"
            value={editData.processServiceFee ?? 0}
            onChange={(e) => setEditData({ ...editData, processServiceFee: parseFloat(e.target.value) })}
            className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            step="0.01"
            value={editData.certifiedMailFee ?? 0}
            onChange={(e) => setEditData({ ...editData, certifiedMailFee: parseFloat(e.target.value) })}
            className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            step="0.01"
            value={editData.rushServiceFee ?? 0}
            onChange={(e) => setEditData({ ...editData, rushServiceFee: parseFloat(e.target.value) })}
            className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            step="0.01"
            value={editData.remoteServiceFee ?? 0}
            onChange={(e) => setEditData({ ...editData, remoteServiceFee: parseFloat(e.target.value) })}
            className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(editData)}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 text-gray-600 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {entry.zipCode === 'ALL' ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">DEFAULT</span>
          ) : (
            <span className="font-medium">{entry.zipCode}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
        ${(entry.processServiceFee ?? 0).toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
        ${(entry.certifiedMailFee ?? 0).toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
        ${(entry.rushServiceFee ?? 0).toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
        ${(entry.remoteServiceFee ?? 0).toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:text-blue-700"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {entry.zipCode !== 'ALL' && (
            <button
              onClick={() => onDelete(entry.pricingId, entry.zipCode)}
              className="p-1 text-red-600 hover:text-red-700"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
