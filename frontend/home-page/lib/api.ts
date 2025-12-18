const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = {
    getTenants: async (token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}/tenant-service/api/tenants`, {
            headers,
        })
        if (!response.ok) throw new Error('Failed to fetch tenants')
        return response.json()
    },
    
    getTenant: async (tenantId: string, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}/tenant-service/api/tenants/${tenantId}`, {
            headers,
        })
        if (!response.ok) throw new Error('Failed to fetch tenant details')
        return response.json()
    },
}
