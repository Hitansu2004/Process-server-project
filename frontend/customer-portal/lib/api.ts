const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = {
    async login(email: string, password: string) {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        if (!response.ok) throw new Error('Login failed')
        return response.json()
    },

    async register(data: any) {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Registration failed')
        return response.json()
    },

    async createOrder(orderData: any, token: string) {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        })
        if (!response.ok) throw new Error('Failed to create order')
        return response.json()
    },

    async getCustomerOrders(customerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/customer/${customerId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch orders')
        return response.json()
    },

    async getOrderBids(orderId: string, token: string) {
        const response = await fetch(`${API_URL}/api/bids/order/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch bids')
        return response.json()
    },

    async acceptBid(bidId: string, token: string) {
        const response = await fetch(`${API_URL}/api/bids/${bidId}/accept`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to accept bid')
        return response.json()
    },

    async addRating(ratingData: any, token: string) {
        const response = await fetch(`${API_URL}/api/process-servers/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(ratingData),
        })
        if (!response.ok) throw new Error('Failed to add rating')
        return response.json()
    },

    async getContactList(userId: string, token: string) {
        const response = await fetch(`${API_URL}/api/contact-book/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch contact list')
        return response.json()
    },

    async addContact(contactData: any, token: string) {
        const response = await fetch(`${API_URL}/api/contact-book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(contactData),
        })
        if (!response.ok) throw new Error('Failed to add contact')
        return response.json()
    },

    async removeContact(entryId: string, token: string) {
        const response = await fetch(`${API_URL}/api/contact-book/${entryId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to remove contact')
        return response.json()
    },

    async getProcessServerProfile(processServerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/process-servers/${processServerId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch process server profile')
        return response.json()
    },
}
