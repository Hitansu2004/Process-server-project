'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export default function ClearDraftsPage() {
    const [status, setStatus] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const handleClearDrafts = async () => {
        if (!confirm('Are you sure you want to delete ALL drafts? This cannot be undone!')) {
            return
        }

        setLoading(true)
        setStatus('Deleting...')

        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const customerId = user.roles?.[0]?.id || user.userId

            if (!token || !customerId) {
                setStatus('Error: Not logged in')
                setLoading(false)
                return
            }

            await api.deleteAllDrafts(customerId, token)
            setStatus('✅ All drafts deleted successfully!')
        } catch (error: any) {
            setStatus(`❌ Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                    Clear All Drafts
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    This will permanently delete all your order drafts.
                </p>

                <button
                    onClick={handleClearDrafts}
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Deleting...' : 'Delete All Drafts'}
                </button>

                {status && (
                    <div className={`mt-4 p-4 rounded-lg ${
                        status.startsWith('✅') 
                            ? 'bg-green-50 text-green-700' 
                            : status.startsWith('❌')
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                    }`}>
                        {status}
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}
