'use client'

import { useState } from 'react'

export default function TestCustomerAPI() {
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testAPI = async () => {
        setLoading(true)
        const token = sessionStorage.getItem('token')
        const user = JSON.parse(sessionStorage.getItem('user') || '{}')

        // ID Mapping
        const userIdToProfileId: { [key: string]: string } = {
            '650e8400-e29b-41d4-a716-446655440004': '850e8400-e29b-41d4-a716-446655440001',
            '650e8400-e29b-41d4-a716-446655440005': '850e8400-e29b-41d4-a716-446655440002',
        }

        const customerId = userIdToProfileId[user.userId] || user.userId

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/customer/${customerId}`

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const data = await response.json()

            setResults({
                url,
                userId: user.userId,
                mappedCustomerId: customerId,
                orderCount: data.length,
                orders: data,
                success: true
            })
        } catch (error: any) {
            setResults({
                url,
                userId: user.userId,
                error: error.message,
                success: false
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Customer API Test</h1>

                <button
                    onClick={testAPI}
                    disabled={loading}
                    className="btn-primary mb-6"
                >
                    {loading ? 'Testing...' : 'Test API Call'}
                </button>

                {results && (
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Results:</h2>
                        <pre className="bg-black/50 p-4 rounded overflow-auto text-xs">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
