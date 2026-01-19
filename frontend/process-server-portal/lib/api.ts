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

    // Process server accepts customer's counter-offer
    async acceptCustomerCounter(bidId: string, token: string) {
        const res = await fetch(`${API_URL}/api/bids/${bidId}/accept-counter`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to accept counter-offer' }))
            throw new Error(error.error || 'Failed to accept counter-offer')
        }
        return res.json()
    },

    // Process server rejects and counters back
    async rejectAndCounter(bidId: string, newAmount: number, notes: string, token: string) {
        const res = await fetch(`${API_URL}/api/bids/${bidId}/reject-counter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ newAmount, notes }),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to counter-offer' }))
            throw new Error(error.error || 'Failed to counter-offer')
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

    async sendOtp(email: string) {
        const res = await fetch(`${API_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to send OTP' }))
            throw new Error(error.error || 'Failed to send OTP')
        }
        return res.json()
    },

    async verifyOtp(email: string, otp: string) {
        const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Invalid OTP' }))
            throw new Error(error.error || 'Invalid OTP')
        }
        return res.json()
    },

    async toggleGlobalVisibility(tenantUserRoleId: string, isGlobal: boolean, token: string) {
        const res = await fetch(`${API_URL}/api/process-servers/${tenantUserRoleId}/toggle-global?isGlobal=${isGlobal}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to toggle global visibility')
        return res.json()
    },

    async getUser(userId: string) {
        const res = await fetch(`${API_URL}/api/users/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch user')
        return res.json()
    },

    async getCustomerByTenantUserRoleId(tenantUserRoleId: string) {
        const res = await fetch(`${API_URL}/api/customers/by-role/${tenantUserRoleId}`)
        if (!res.ok) throw new Error('Failed to fetch customer')
        return res.json()
    },

    // Price Negotiation APIs
    async proposePrice(recipientId: string, proposedAmount: number, notes: string, userId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/recipients/${recipientId}/propose-price`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId
            },
            body: JSON.stringify({ proposedAmount, notes }),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to propose price' }))
            throw new Error(error.error || 'Failed to propose price')
        }
        return res.json()
    },

    async acceptNegotiation(negotiationId: string, notes: string, userId: string, userRole: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/negotiations/${negotiationId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId,
                'userRole': userRole
            },
            body: JSON.stringify({ notes }),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to accept negotiation' }))
            throw new Error(error.error || 'Failed to accept negotiation')
        }
        return res.json()
    },

    async rejectNegotiation(negotiationId: string, reason: string, userId: string, userRole: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/negotiations/${negotiationId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId,
                'userRole': userRole
            },
            body: JSON.stringify({ reason }),
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to reject negotiation' }))
            throw new Error(error.error || 'Failed to reject negotiation')
        }
        return res.json()
    },

    async getActiveNegotiation(recipientId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/recipients/${recipientId}/negotiations/active`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.message ? null : data // Return null if no active negotiation
    },

    async getNegotiationHistory(recipientId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/recipients/${recipientId}/negotiations`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) return []
        return res.json()
    },
}
