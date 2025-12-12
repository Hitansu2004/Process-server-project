const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
export const api = {
    async login(email: string, password: string) {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        if (!res.ok) throw new Error('Login failed')
        return res.json()
    },

    async getTenantOrders(tenantId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/tenant/${tenantId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch orders')
        return res.json()
    },

    async getTenantProcessServers(tenantId: string, token: string, filter?: string) {
        const url = new URL(`${API_URL}/api/process-servers/tenant/${tenantId}`)
        if (filter) url.searchParams.append('filter', filter)

        const res = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch process servers')
        return res.json()
    },

    async searchContacts(ownerUserId: string, type: string, token: string) {
        const url = new URL(`${API_URL}/api/contact-book/search`)
        url.searchParams.append('ownerUserId', ownerUserId)
        if (type) url.searchParams.append('type', type)

        const res = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to search contacts')
        return res.json()
    },

    async createOrder(orderData: any, token: string) {
        const res = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        })
        if (!res.ok) throw new Error('Failed to create order')
        return res.json()
    },

    async getTenantCustomers(tenantId: string, token: string) {
        const res = await fetch(`${API_URL}/api/customers/tenant/${tenantId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch customers')
        return res.json()
    },

    async getOrderDetails(orderId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch order details')
        return res.json()
    },

    async getTenant(id: string, token: string) {
        const res = await fetch(`${API_URL}/api/tenants/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
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

    async getProcessServerProfile(processServerId: string, token: string) {
        const res = await fetch(`${API_URL}/api/process-servers/${processServerId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch process server profile')
        return res.json()
    },

    async getOrderBids(orderId: string, token: string) {
        const res = await fetch(`${API_URL}/api/bids/order/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch bids')
        return res.json()
    },
}
