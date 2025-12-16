const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface Bid {
    id: string
    orderId?: string
    orderNumber?: string
    pickupAddress?: string
    pickupZipCode?: string
    processServerId: string
    bidAmount: number
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
    createdAt: string
    order?: any
}

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

    async placeBid(bidData: any, token: string) {
        const res = await fetch(`${API_URL}/api/bids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(bidData),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to place bid' }))
            throw new Error(error.error || 'Failed to place bid')
        }
        return res.json()
    },

    async getDeliveryPersonOrders(deliveryPersonId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/process-server/${deliveryPersonId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch orders')
        return res.json()
    },

    async recordAttempt(attemptData: any, token: string) {
        const res = await fetch(`${API_URL}/api/orders/attempts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(attemptData),
        })
        if (!res.ok) throw new Error('Failed to record attempt')
        return res.json()
    },

    async getAvailableOrders(token: string) {
        const res = await fetch(`${API_URL}/api/orders/available`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch available orders')
        return res.json()
    },

    async getOrderById(orderId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch order details')
        return res.json()
    },

    async getOrderBids(orderId: string, token: string): Promise<Bid[]> {
        const res = await fetch(`${API_URL}/api/bids/order/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch order bids')
        return res.json()
    },

    async getMyBids(processServerId: string, token: string): Promise<Bid[]> {
        const res = await fetch(`${API_URL}/api/bids/process-server/${processServerId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch my bids')
        return res.json()
    },

    async recordDeliveryAttempt(attemptData: any, token: string) {
        const res = await fetch(`${API_URL}/api/orders/attempts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(attemptData),
        })
        if (!res.ok) throw new Error('Failed to record delivery attempt')
        return res.json()
    },

    async getProcessServerProfile(tenantUserRoleId: string, token: string) {
        const res = await fetch(`${API_URL}/api/process-servers/${tenantUserRoleId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch profile')
        return res.json()
    },

    async registerProcessServer(data: any) {
        const res = await fetch(`${API_URL}/api/auth/register/process-server`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Registration failed' }))
            throw new Error(error.error || 'Registration failed')
        }
        return res.json()
    },

    async getTenants() {
        const res = await fetch(`${API_URL}/api/tenants`)
        if (!res.ok) throw new Error('Failed to fetch tenants')
        return res.json()
    },
}

