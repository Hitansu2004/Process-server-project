'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Trash2, X, Search, User, Info, DollarSign, Users, UserCheck, Star, Phone, Mail, Award, Check, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'

interface Recipient {
  id: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  notes: string
  stateId?: number
  assignmentType: 'AUTOMATED' | 'GUIDED'
  processServerId?: string
  processServerName?: string
  // Per-recipient service options
  processService: boolean
  certifiedMail: boolean
  rushService: boolean
  remoteService: boolean
  // Direct assignment pricing
  quotedPrice?: number // Price quoted by process server for direct assignment
  negotiatedPrice?: number // Price after customer negotiation
  priceStatus?: 'QUOTED' | 'NEGOTIATING' | 'ACCEPTED' // Status of pricing
}

interface RecipientsStepProps {
  data: Recipient[]
  onChange: (data: Recipient[]) => void
}

export default function RecipientsStep({ data, onChange }: RecipientsStepProps) {
  const [editingIndex, setEditingIndex] = useState<number>(data.length === 0 ? 0 : -1)
  const [states, setStates] = useState<any[]>([])
  const [processServers, setProcessServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadStates(), loadProcessServers()])
    } finally {
      setLoading(false)
    }
  }

  const loadStates = async () => {
    try {
      const statesData = await api.getStates()
      setStates(statesData)
    } catch (error) {
      console.error('Failed to load states:', error)
    }
  }

  const loadProcessServers = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const user = JSON.parse(sessionStorage.getItem('user') || '{}')
      if (!token || !user.userId) {
        console.warn('❌ No token or userId found')
        return
      }

      console.log('🔄 Fetching contact list for userId:', user.userId)
      const contactsData = await api.getContactList(user.userId, token)
      console.log('📋 Raw contacts data:', contactsData)

      // Filter for active contacts only (API returns 'ACTIVATED' not 'ACTIVE')
      const activeContacts = contactsData.filter((c: any) =>
        c.activationStatus === 'ACTIVATED'
      )

      console.log('✅ Active contacts:', activeContacts.length)

      // Enrich each contact with detailed process server info
      const enrichedServers = await Promise.all(
        activeContacts.map(async (contact: any) => {
          try {
            console.log('🔍 Fetching details for processServerId:', contact.processServerId)
            const details = await api.getProcessServerDetails(contact.processServerId, token)
            console.log('✅ Got details:', details)
            return {
              ...contact,
              processServerDetails: details
            }
          } catch (error) {
            console.error(`❌ Failed to fetch details for ${contact.processServerId}:`, error)
            return contact
          }
        })
      )

      // Filter to only include contacts with valid process server details
      const validServers = enrichedServers.filter((c: any) =>
        c.processServerDetails &&
        c.processServerId
      )

      setProcessServers(validServers)
      console.log('✅ Loaded process servers with details:', validServers.length, validServers)
    } catch (error) {
      console.error('❌ Failed to load process servers:', error)
    }
  }

  const createEmptyRecipient = (): Recipient => ({
    id: Date.now().toString(),
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    assignmentType: 'AUTOMATED', // Default to automated bidding
    // Initialize service options
    processService: false,
    certifiedMail: false,
    rushService: false,
    remoteService: false
  })

  const handleAddRecipient = () => {
    const newRecipient = createEmptyRecipient()
    onChange([...data, newRecipient])
    setEditingIndex(data.length)

    // Scroll to new form
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  const handleUpdateRecipient = (index: number, field: string, value: any) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }

    // If state changed, update state name
    if (field === 'stateId') {
      const state = states.find(s => s.id === value)
      updated[index].state = state?.name || ''
    }

    // If switching from GUIDED to AUTOMATED, clear process server selection
    if (field === 'assignmentType' && value === 'AUTOMATED') {
      updated[index].processServerId = undefined
      updated[index].processServerName = undefined
    }

    // If process server selected, store name for display
    if (field === 'processServerId') {
      const server = processServers.find(ps => ps.processServerId === value)
      if (server?.processServerDetails) {
        const details = server.processServerDetails
        updated[index].processServerName = `${details.firstName} ${details.lastName}`
      }
    }

    onChange(updated)
  }

  const handleRemoveRecipient = (index: number) => {
    if (data.length === 1) {
      // Don't allow removing the last recipient
      return
    }
    const updated = data.filter((_, i) => i !== index)
    onChange(updated)
    if (editingIndex === index) {
      setEditingIndex(-1)
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const handleEditRecipient = (index: number) => {
    setEditingIndex(index)
    // Scroll to form
    setTimeout(() => {
      const element = document.getElementById(`recipient-form-${index}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleSaveRecipient = () => {
    setEditingIndex(-1)
  }

  const isRecipientComplete = (recipient: Recipient) => {
    const hasBasicInfo = recipient.firstName && recipient.lastName &&
      recipient.address && recipient.city &&
      recipient.state && recipient.zipCode

    // If GUIDED, must have process server selected
    if (recipient.assignmentType === 'GUIDED') {
      return hasBasicInfo && recipient.processServerId
    }

    return hasBasicInfo
  }

  // Effect to add initial recipient if list is empty
  useEffect(() => {
    if (!loading && data.length === 0) {
      const newRecipient = createEmptyRecipient()
      onChange([newRecipient])
      setEditingIndex(0)
    }
  }, [loading, data.length]) // Only run when loading finishes or data becomes empty

  // Removed the direct if check that caused the infinite loop

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipients</h2>
          <p className="text-gray-600">Loading recipient information...</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">Loading...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipients</h2>
        <p className="text-gray-600">{data.length === 0 ? 'Enter the details of the person or organization to be served with the document.' : 'Add and manage the individuals or organizations to be served with the document.'}</p>
      </div>

      {/* Assignment Type Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-blue-900 mb-2">Assignment Types Explained:</p>
            <div className="space-y-2 text-blue-800">
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Automated (Open Bidding):</span> Process servers in your network bid on this delivery. You review bids and accept the best offer. No upfront base price—you only pay after accepting a bid.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <UserCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Direct Assignment:</span> Instantly assign to a specific process server from your contacts. Requires selecting a server. Base price applies plus any rush/remote fees.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipients List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">Recipients ({data.length})</h3>
          {data.length > 0 && editingIndex === -1 && (
            <span className="text-sm text-gray-500">
              {data.filter(isRecipientComplete).length} of {data.length} complete
            </span>
          )}
        </div>

        {data.map((recipient, index) => (
          <div key={recipient.id} id={`recipient-${index}`}>
            {editingIndex === index ? (
              <motion.div
                id={`recipient-form-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-2 border-blue-500 rounded-lg p-6 bg-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Editing Recipient #{index + 1}
                  </h4>
                  {data.length > 1 && (
                    <button
                      onClick={() => handleRemoveRecipient(index)}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <RecipientForm
                  recipient={recipient}
                  index={index}
                  onChange={(field, value) => handleUpdateRecipient(index, field, value)}
                  onSave={handleSaveRecipient}
                  onCancel={() => setEditingIndex(-1)}
                  states={states}
                  processServers={processServers}
                  showSaveButton={true}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-3 transition-all ${isRecipientComplete(recipient)
                  ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  : 'border-yellow-300 bg-yellow-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <MapPin className={`h-4 w-4 flex-shrink-0 ${isRecipientComplete(recipient) ? 'text-blue-600' : 'text-yellow-600'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {recipient.firstName && recipient.lastName
                            ? `${recipient.firstName} ${recipient.lastName}`
                            : `Recipient #${index + 1}`}
                        </h3>
                        {!isRecipientComplete(recipient) && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded flex-shrink-0">
                            Incomplete
                          </span>
                        )}
                        {/* Assignment Type Badge */}
                        {recipient.assignmentType === 'AUTOMATED' ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex-shrink-0">
                            Open Bid
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">
                            Direct
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        {recipient.address ? (
                          <p className="text-xs text-gray-600 truncate">
                            {recipient.address}
                            {recipient.city && recipient.state && recipient.zipCode
                              ? `, ${recipient.city}, ${String(recipient.state)} ${recipient.zipCode}`
                              : ''}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No address</p>
                        )}
                      </div>

                      {/* Process Server Name for Direct Assignment */}
                      {recipient.assignmentType === 'GUIDED' && recipient.processServerName && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          → {recipient.processServerName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-1 ml-3 flex-shrink-0">
                    <button
                      onClick={() => handleEditRecipient(index)}
                      className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    {data.length > 1 && (
                      <button
                        onClick={() => handleRemoveRecipient(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove recipient"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Add Another Button */}
      {editingIndex === -1 && (
        <button
          onClick={handleAddRecipient}
          className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Add Another Recipient</span>
        </button>
      )}
    </motion.div>
  )
}

// Recipient Form Component
function RecipientForm({
  recipient,
  index,
  onChange,
  onSave,
  onCancel,
  states,
  processServers,
  showSaveButton
}: {
  recipient: Recipient
  index: number
  onChange: (field: string, value: any) => void
  onSave: () => void
  onCancel?: () => void
  states: any[]
  processServers: any[]
  showSaveButton: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSearchQuery('')
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleStateChange = (stateId: number) => {
    console.log('🔄 State change:', stateId, 'States:', states)
    const selectedState = states.find(s => s.id === stateId)
    console.log('📍 Selected state:', selectedState)
    onChange('stateId', stateId)
  }

  // Get selected process server details
  const selectedServer = processServers.find(c => c.processServerId === recipient.processServerId)
  const selectedDetails = selectedServer?.processServerDetails

  // Filter process servers based on search (name, email, or zip code)
  const filteredServers = processServers.filter(contact => {
    if (!searchQuery) return true
    const details = contact.processServerDetails
    if (!details) return false
    const searchLower = searchQuery.toLowerCase()

    // Parse zip codes if available
    let zipCodes: string[] = []
    if (details.operatingZipCodes) {
      try {
        zipCodes = JSON.parse(details.operatingZipCodes)
      } catch (e) {
        zipCodes = []
      }
    }

    return (
      details.firstName?.toLowerCase().includes(searchLower) ||
      details.lastName?.toLowerCase().includes(searchLower) ||
      details.email?.toLowerCase().includes(searchLower) ||
      zipCodes.some(zip => zip.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={recipient.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={recipient.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={recipient.address}
          onChange={(e) => onChange('address', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          placeholder="123 Main Street, Apt 4B"
          required
        />
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            State <span className="text-red-500">*</span>
          </label>
          <select
            value={recipient.stateId || ''}
            onChange={(e) => handleStateChange(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            required
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={recipient.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Dallas"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={recipient.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="75201"
            maxLength={10}
            required
          />
        </div>
      </div>

      {/* Special Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Special Instructions <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <textarea
          value={recipient.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
          placeholder="Any special instructions for this delivery (gate code, best time to visit, etc.)"
          rows={3}
        />
      </div>

      {/* Assignment Type Selection */}
      <div className="border-t pt-5">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Assignment Type <span className="text-red-500">*</span>
        </label>

        <div className="space-y-3">
          {/* Automated Option */}
          <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${recipient.assignmentType === 'AUTOMATED'
            ? 'border-blue-500 bg-blue-50 shadow-sm'
            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
            }`}>
            <input
              type="radio"
              checked={recipient.assignmentType === 'AUTOMATED'}
              onChange={() => onChange('assignmentType', 'AUTOMATED')}
              className="mt-1 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Automated (Open Bidding)</span>
              </div>
              <p className="text-sm text-gray-600">
                Process servers from your network will bid on this delivery. You'll review all bids and accept the best offer.
              </p>
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-700 font-medium">No upfront base price</span>
                <span className="text-gray-500">• Pay only after accepting a bid</span>
              </div>
            </div>
          </label>

          {/* Guided Option */}
          <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${recipient.assignmentType === 'GUIDED'
            ? 'border-green-500 bg-green-50 shadow-sm'
            : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
            }`}>
            <input
              type="radio"
              checked={recipient.assignmentType === 'GUIDED'}
              onChange={() => onChange('assignmentType', 'GUIDED')}
              className="mt-1 text-green-600"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">Direct Assignment</span>
              </div>
              <p className="text-sm text-gray-600">
                Instantly assign this delivery to a specific process server from your contacts. Faster turnaround for urgent cases.
              </p>
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <DollarSign className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-blue-700 font-medium">Base price + fees apply</span>
                <span className="text-gray-500">• Server must be selected below</span>
              </div>
            </div>
          </label>
        </div>

        {/* Process Server Selection (GUIDED only) */}
        {recipient.assignmentType === 'GUIDED' && (
          <div className="border-t pt-4 mt-4" style={{ minHeight: '180px' }}>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select Process Server <span className="text-red-500">*</span>
            </label>

            {processServers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  No Process Servers Available
                </p>
                <p className="text-xs text-yellow-700">
                  You need to add process servers to your contacts before using Direct Assignment.
                  Go to the Contacts page to invite process servers.
                </p>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left hover:border-green-400 focus:outline-none focus:border-green-500 transition-colors bg-white flex items-center justify-between gap-3"
                >
                  {selectedDetails ? (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-xs overflow-hidden flex-shrink-0">
                        {selectedDetails.profilePhotoUrl ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/profile-photo/${selectedDetails.profilePhotoUrl}`}
                            alt={`${selectedDetails.firstName} ${selectedDetails.lastName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.parentElement!.textContent = `${selectedDetails.firstName?.[0] || ''}${selectedDetails.lastName?.[0] || ''}`
                            }}
                          />
                        ) : (
                          `${selectedDetails.firstName?.[0] || ''}${selectedDetails.lastName?.[0] || ''}`
                        )}
                      </div>

                      {/* Selected Server Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {selectedDetails.firstName} {selectedDetails.lastName}
                          </h4>
                          {selectedDetails.currentRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-medium text-gray-700">
                                {selectedDetails.currentRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
                          <span className="truncate">{selectedDetails.email}</span>
                          <span>{selectedDetails.phoneNumber}</span>
                          {selectedDetails.operatingZipCodes && (
                            <span>{JSON.parse(selectedDetails.operatingZipCodes).slice(0, 2).join(', ')}</span>
                          )}
                          <span>{selectedDetails.totalOrdersAssigned} orders</span>
                        </div>
                      </div>

                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a process server...</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg">
                    {/* Search Box */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name, email, or zip code..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Process Servers List */}
                    <div className="max-h-80 overflow-y-auto p-2">
                      {filteredServers.length > 0 ? (
                        filteredServers.map(contact => {
                          const details = contact.processServerDetails
                          const isSelected = recipient.processServerId === contact.processServerId

                          if (!details) return null

                          return (
                            <button
                              key={contact.id}
                              type="button"
                              onClick={() => {
                                onChange('processServerId', contact.processServerId)
                                setIsDropdownOpen(false)
                                setSearchQuery('')
                              }}
                              className={`w-full p-3 rounded-lg text-left transition-colors ${isSelected
                                ? 'bg-green-50 hover:bg-green-100'
                                : 'hover:bg-gray-50'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-xs overflow-hidden flex-shrink-0">
                                  {details.profilePhotoUrl ? (
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/process-servers/profile-photo/${details.profilePhotoUrl}`}
                                      alt={`${details.firstName} ${details.lastName}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.parentElement!.textContent = `${details.firstName?.[0] || ''}${details.lastName?.[0] || ''}`
                                      }}
                                    />
                                  ) : (
                                    `${details.firstName?.[0] || ''}${details.lastName?.[0] || ''}`
                                  )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                      {details.firstName} {details.lastName}
                                    </h4>
                                    {details.currentRating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium text-gray-700">
                                          {details.currentRating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-0.5">
                                    {details.email && (
                                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{details.email}</span>
                                      </div>
                                    )}
                                    {details.phoneNumber && (
                                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        <span>{details.phoneNumber}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      {details.operatingZipCodes && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">
                                            {JSON.parse(details.operatingZipCodes).slice(0, 2).join(', ')}
                                          </span>
                                        </div>
                                      )}
                                      {details.totalOrdersAssigned !== undefined && (
                                        <div className="flex items-center gap-1">
                                          <Award className="w-3 h-3 flex-shrink-0" />
                                          <span>{details.totalOrdersAssigned} orders</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Selected Checkmark */}
                                {isSelected && (
                                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          {searchQuery ? 'No matching process servers found' : 'No process servers available'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showSaveButton && (
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={onSave}
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Save Recipient
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
