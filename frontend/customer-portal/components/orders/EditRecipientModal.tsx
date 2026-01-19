import { useState, useEffect } from 'react'
import { X, Check, AlertCircle, ChevronRight, User, Search } from 'lucide-react'
import { api } from '@/lib/api'
import ProcessServerSelector from '@/components/ProcessServerSelector'

interface EditRecipientModalProps {
    recipient: any
    order: any
    onClose: () => void
    onUpdate: () => void
}

export default function EditRecipientModal({ recipient, order, onClose, onUpdate }: EditRecipientModalProps) {
    const [step, setStep] = useState(1) // 1: Edit, 2: Review
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        recipientName: recipient.recipientName,
        recipientAddress: recipient.recipientAddress,
        city: recipient.city || recipient.cityName || '',
        stateId: recipient.stateId || '',
        recipientZipCode: recipient.recipientZipCode,
        recipientType: recipient.recipientType || 'AUTOMATED',
        assignedProcessServerId: recipient.assignedProcessServerId || '',
        rushService: recipient.rushService || false,
        remoteLocation: recipient.remoteLocation || false,
        processService: recipient.serviceType === 'PROCESS_SERVICE' || recipient.processService || true,
        certifiedMail: recipient.serviceType === 'CERTIFIED_MAIL' || recipient.certifiedMail || false
    })

    const [states, setStates] = useState<any[]>([])
    const [cities, setCities] = useState<any[]>([])
    const [contacts, setContacts] = useState<any[]>([])
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)
    const [selectedServerName, setSelectedServerName] = useState('')

    useEffect(() => {
        loadStates()
        loadContacts()
        if (recipient.stateId) {
            loadCities(recipient.stateId)
        }
        if (recipient.assignedProcessServerId) {
            loadServerName(recipient.assignedProcessServerId)
        }
    }, [])

    const loadStates = async () => {
        try {
            const data = await api.getStates()
            setStates(data)
        } catch (error) {
            console.error('Failed to load states:', error)
        }
    }

    const loadCities = async (stateId: number) => {
        try {
            const data = await api.getCitiesByState(stateId)
            setCities(data)
        } catch (error) {
            console.error('Failed to load cities:', error)
        }
    }

    const loadContacts = async () => {
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            if (user.userId) {
                const data = await api.getContactList(user.userId, token!)
                // Enrich with details
                const enriched = await Promise.all(data.map(async (c: any) => {
                    try {
                        if (c.activationStatus === 'NOT_ACTIVATED') return c
                        const details = await api.getProcessServerDetails(c.processServerId, token!)
                        return { ...c, processServerDetails: details }
                    } catch (e) {
                        return c
                    }
                }))
                setContacts(enriched)
            }
        } catch (error) {
            console.error('Failed to load contacts:', error)
        }
    }

    const loadServerName = async (serverId: string) => {
        try {
            const token = sessionStorage.getItem('token')
            const details = await api.getProcessServerDetails(serverId, token!)
            setSelectedServerName(`${details.firstName} ${details.lastName}`)
        } catch (error) {
            console.error('Failed to load server name:', error)
        }
    }

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateId = Number(e.target.value)
        setFormData({ ...formData, stateId: stateId })
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}')

            // Determine service type string for backend compatibility
            let serviceType = 'PROCESS_SERVICE'
            if (formData.certifiedMail && !formData.processService) serviceType = 'CERTIFIED_MAIL'

            await api.updateRecipient(recipient.id, {
                ...formData,
                serviceType
            }, token!, userData.userId)

            onUpdate()
            onClose()
        } catch (error: any) {
            setError(error.message || 'Failed to update recipient')
        } finally {
            setSubmitting(false)
        }
    }

    const renderReviewChanges = () => {
        const changes = []
        if (formData.recipientName !== recipient.recipientName) changes.push({ label: 'Recipient Name', old: recipient.recipientName, new: formData.recipientName })
        if (formData.recipientAddress !== recipient.recipientAddress) changes.push({ label: 'Address', old: recipient.recipientAddress, new: formData.recipientAddress })
        if (formData.recipientZipCode !== recipient.recipientZipCode) changes.push({ label: 'ZIP Code', old: recipient.recipientZipCode, new: formData.recipientZipCode })
        if (formData.rushService !== recipient.rushService) changes.push({ label: 'Rush Service', old: recipient.rushService ? 'Yes' : 'No', new: formData.rushService ? 'Yes' : 'No' })
        if (formData.remoteLocation !== recipient.remoteLocation) changes.push({ label: 'Remote Location', old: recipient.remoteLocation ? 'Yes' : 'No', new: formData.remoteLocation ? 'Yes' : 'No' })

        return (
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Summary of Changes
                    </h4>
                    {changes.length === 0 ? (
                        <p className="text-blue-700">No changes detected.</p>
                    ) : (
                        <div className="space-y-3">
                            {changes.map((change, idx) => (
                                <div key={idx} className="flex justify-between text-sm border-b border-blue-100 pb-2 last:border-0">
                                    <span className="text-blue-800 font-medium">{change.label}</span>
                                    <div className="text-right">
                                        <div className="text-red-400 line-through text-xs">{change.old}</div>
                                        <div className="text-green-600 font-bold">{change.new}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto text-gray-900">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h3 className="text-2xl font-bold">
                        {step === 1 ? 'Edit Recipient Details' : 'Review Changes'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <div className="space-y-6">
                        {/* Recipient & Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Recipient Name</label>
                                <input
                                    type="text"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Address</label>
                                <input
                                    type="text"
                                    value={formData.recipientAddress}
                                    onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* City, State, Zip */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">State</label>
                                <select
                                    value={formData.stateId}
                                    onChange={handleStateChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">Select State</option>
                                    {states.map((state: any) => (
                                        <option key={state.id} value={state.id}>{state.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">City</label>
                                <input
                                    type="text"
                                    value={formData.city || ''}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Enter city name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">ZIP Code</label>
                                <input
                                    type="text"
                                    value={formData.recipientZipCode}
                                    onChange={(e) => setFormData({ ...formData, recipientZipCode: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Assignment Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Assignment Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, recipientType: 'AUTOMATED', assignedProcessServerId: '' })}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.recipientType === 'AUTOMATED' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="font-bold text-gray-900">Open Bid (Automated)</div>
                                    <div className="text-xs text-gray-500 mt-1">Best available server</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, recipientType: 'GUIDED' })}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.recipientType === 'GUIDED' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="font-bold text-gray-900">Direct Assignment</div>
                                    <div className="text-xs text-gray-500 mt-1">Select specific server</div>
                                </button>
                            </div>
                        </div>

                        {/* Process Server Selector */}
                        {formData.recipientType === 'GUIDED' && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Selected Process Server</label>
                                <button
                                    type="button"
                                    onClick={() => setIsSelectorOpen(true)}
                                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-gray-600"
                                >
                                    {formData.assignedProcessServerId ? (
                                        <>
                                            <User className="w-5 h-5" />
                                            <span className="font-medium text-gray-900">{selectedServerName || 'Server Selected'}</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Change</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-5 h-5" />
                                            <span>Select Process Server</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Service Types (Checkboxes) */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Order Type (Select one or both)</label>
                            <div className="space-y-3">
                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.processService ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.processService}
                                        onChange={(e) => setFormData({ ...formData, processService: e.target.checked })}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <div className="ml-3">
                                        <div className="font-bold text-gray-900">Process Service</div>
                                        <div className="text-xs text-gray-500">Standard service of process</div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.certifiedMail ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.certifiedMail}
                                        onChange={(e) => setFormData({ ...formData, certifiedMail: e.target.checked })}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <div className="ml-3">
                                        <div className="font-bold text-gray-900">Certified Mail</div>
                                        <div className="text-xs text-gray-500">Delivery via USPS Certified Mail</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.rushService ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="checkbox"
                                    checked={formData.rushService}
                                    onChange={(e) => setFormData({ ...formData, rushService: e.target.checked })}
                                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <div className="ml-3">
                                    <div className="font-bold text-gray-900">Rush Service</div>
                                    <div className="text-xs text-gray-500">Expedited delivery</div>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.remoteLocation ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="checkbox"
                                    checked={formData.remoteLocation}
                                    onChange={(e) => setFormData({ ...formData, remoteLocation: e.target.checked })}
                                    className="w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <div className="ml-3">
                                    <div className="font-bold text-gray-900">Remote Location</div>
                                    <div className="text-xs text-gray-500">Hard to reach area</div>
                                </div>
                            </label>
                        </div>
                    </div>
                ) : (
                    renderReviewChanges()
                )}

                <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                    {step === 2 && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                        >
                            Back to Edit
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => step === 1 ? setStep(2) : handleSubmit()}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                {step === 1 ? (
                                    <>
                                        Review Changes
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Confirm & Save
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <ProcessServerSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                contacts={contacts}
                selectedId={formData.assignedProcessServerId}
                onSelect={(id) => {
                    setFormData({ ...formData, assignedProcessServerId: id })
                    loadServerName(id)
                }}
                defaultServerId={null}
            />
        </div>
    )
}
