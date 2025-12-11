const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
export const api = {
    async login(email: string, password: string) {
        const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        if (!res.ok) throw new Error('Login failed')
        return res.json()
    },
    async getTenants(token: string) {
        const res = await fetch(`${API_URL}/api/tenants`, { headers: { 'Authorization': `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch tenants')
        return res.json()
    },
    async getTenant(id: string, token: string) {
        const res = await fetch(`${API_URL}/api/tenants/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch tenant')
        return res.json()
    },
    async updateTenantSettings(id: string, settings: any, token: string) {
        const res = await fetch(`${API_URL}/api/tenants/${id}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(settings)
        })
        if (!res.ok) throw new Error('Failed to update settings')
        return res.json()
    },
    async updateTenant(id: string, data: any, token: string) {
        const res = await fetch(`${API_URL}/api/tenants/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to update tenant')
        return res.json()
    },
    async getPlatformRevenue(token: string) {
        const res = await fetch(`${API_URL}/api/orders/revenue`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch platform revenue')
        return res.json()
    },

    async registerUser(userData: any) {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        if (!res.ok) throw new Error('Failed to register user')
        return res.json()
    },

    async createProcessServerProfile(profileData: any, token: string) {
        const res = await fetch(`${API_URL}/api/process-servers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        })
        if (!res.ok) throw new Error('Failed to create profile')
        return res.json()
    },

    async getAllProcessServers(token: string) {
        const res = await fetch(`${API_URL}/api/process-servers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch process servers')
        return res.json()
    }
}
