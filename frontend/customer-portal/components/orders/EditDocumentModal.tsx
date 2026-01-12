import { useState } from 'react'
import { X, Check, AlertCircle, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'

interface EditDocumentModalProps {
    order: any
    onClose: () => void
    onUpdate: () => void
}

export default function EditDocumentModal({ order, onClose, onUpdate }: EditDocumentModalProps) {
    const [step, setStep] = useState(1) // 1: Edit, 2: Review
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        documentType: order.documentType || 'OTHER',
        otherDocumentType: order.otherDocumentType || '',
        caseNumber: order.caseNumber || '',
        jurisdiction: order.jurisdiction || '',
        deadline: order.deadline ? new Date(order.deadline).toISOString().slice(0, 16) : '',
        specialInstructions: order.specialInstructions || ''
    })

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}')

            await api.updateOrder(order.id, {
                orderId: order.id, // Fix: Include orderId
                ...formData,
                deadline: new Date(formData.deadline).toISOString()
            }, token!, userData.userId)

            onUpdate()
            onClose()
        } catch (error: any) {
            setError(error.message || 'Failed to update order')
        } finally {
            setLoading(false)
        }
    }

    const renderReviewChanges = () => {
        const changes = []
        if (formData.documentType !== order.documentType) changes.push({ label: 'Document Type', old: order.documentType, new: formData.documentType })
        if (formData.caseNumber !== order.caseNumber) changes.push({ label: 'Case Number', old: order.caseNumber, new: formData.caseNumber })
        if (formData.jurisdiction !== order.jurisdiction) changes.push({ label: 'Jurisdiction', old: order.jurisdiction, new: formData.jurisdiction })

        const oldDeadline = order.deadline ? new Date(order.deadline).toLocaleString() : 'None'
        const newDeadline = formData.deadline ? new Date(formData.deadline).toLocaleString() : 'None'
        if (oldDeadline !== newDeadline) changes.push({ label: 'Deadline', old: oldDeadline, new: newDeadline })

        if (formData.specialInstructions !== order.specialInstructions) changes.push({ label: 'Instructions', old: order.specialInstructions || 'None', new: formData.specialInstructions || 'None' })

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
                                <div key={idx} className="flex flex-col text-sm border-b border-blue-100 pb-2 last:border-0">
                                    <span className="text-blue-800 font-medium mb-1">{change.label}</span>
                                    <div className="flex justify-between items-center">
                                        <div className="text-red-400 line-through text-xs max-w-[45%] truncate">{change.old}</div>
                                        <div className="text-gray-400 text-xs">→</div>
                                        <div className="text-green-600 font-bold max-w-[45%] truncate">{change.new}</div>
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
                        {step === 1 ? 'Edit Document Details' : 'Review Changes'}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Document Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Document Type</label>
                                <select
                                    value={formData.documentType}
                                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="CRIMINAL_CASE">Criminal Case</option>
                                    <option value="CIVIL_COMPLAINT">Civil Complaint</option>
                                    <option value="RESTRAINING_ORDER">Restraining Order</option>
                                    <option value="HOUSE_ARREST">House Arrest</option>
                                    <option value="EVICTION_NOTICE">Eviction Notice</option>
                                    <option value="SUBPOENA">Subpoena</option>
                                    <option value="DIVORCE_PAPERS">Divorce Papers</option>
                                    <option value="CHILD_CUSTODY">Child Custody</option>
                                    <option value="SMALL_CLAIMS">Small Claims</option>
                                    <option value="BANKRUPTCY">Bankruptcy</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            {/* Other Document Type */}
                            {formData.documentType === 'OTHER' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Specify Type</label>
                                    <input
                                        type="text"
                                        value={formData.otherDocumentType}
                                        onChange={(e) => setFormData({ ...formData, otherDocumentType: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                            )}

                            {/* Case Number */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Case Number</label>
                                <input
                                    type="text"
                                    value={formData.caseNumber}
                                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Jurisdiction */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Jurisdiction</label>
                                <input
                                    type="text"
                                    value={formData.jurisdiction}
                                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Deadline</label>
                                <input
                                    type="date"
                                    value={formData.deadline?.split('T')[0] || ''}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            {/* Special Instructions */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-gray-700">Special Instructions</label>
                                <textarea
                                    value={formData.specialInstructions}
                                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    renderReviewChanges()
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
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
        </div>
    )
}
