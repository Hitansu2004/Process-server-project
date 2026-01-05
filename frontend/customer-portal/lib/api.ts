const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = {
    async login(email: string, password: string, tenantId?: string) {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, tenantId }),
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

    async uploadOrderDocument(orderId: string, file: File, token: string, onProgress?: (progress: number) => void) {
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append('file', file)

            const xhr = new XMLHttpRequest()
            xhr.open('POST', `${API_URL}/api/orders/${orderId}/document`)
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded / event.total) * 100)
                    onProgress(progress)
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText))
                } else {
                    reject(new Error(xhr.statusText || 'Failed to upload document'))
                }
            }

            xhr.onerror = () => reject(new Error('Network error'))

            xhr.send(formData)
        })
    },

    async getProcessServerOrders(processServerId: string, token: string) {
        const res = await fetch(`${API_URL}/api/orders/process-server/${processServerId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error('Failed to fetch orders')
        return res.json()
    },

    async getAvailableOrders(token: string) {
        const res = await fetch(`${API_URL}/api/orders/available`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error('Failed to fetch available orders')
        return res.json()
    },

    async getCustomerOrders(customerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/customer/${customerId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) throw new Error('Failed to fetch orders')
        return response.json()
    },

    // Requirement 8: Order Management & Editing APIs
    async getOrderCounts(customerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/counts?customerId=${customerId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) throw new Error('Failed to fetch order counts')
        return response.json()
    },

    async checkOrderEditability(orderId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/${orderId}/edit-status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) throw new Error('Failed to check order editability')
        return response.json()
    },

    async updateOrder(orderId: string, updateData: any, token: string, userId: string) {
        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId
            },
            body: JSON.stringify(updateData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to update order')
        }
        return response.json()
    },

    async cancelOrder(orderId: string, cancellationData: any, token: string, userId: string) {
        const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId
            },
            body: JSON.stringify(cancellationData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to cancel order')
        }
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

    async inviteProcessServer(email: string, inviterName: string, invitedByUserId: string, tenantId: string, token: string) {
        const response = await fetch(`${API_URL}/api/invitations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                invitedEmail: email,
                invitedByUserId,
                tenantId,
                role: 'PROCESS_SERVER'
            }),
        })
        if (!response.ok) {
            const error = await response.text()
            throw new Error(error || 'Failed to send invitation')
        }
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
        const res = await fetch(`${API_URL}/api/process-servers/${processServerId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch profile')
        return res.json()
    },

    async getCustomerProfile(userId: string, token: string) {
        const response = await fetch(`${API_URL}/api/customers/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch customer profile')
        return response.json()
    },

    submitRating: async (data: any, token: string) => {
        const res = await fetch(`${API_URL}/api/process-servers/ratings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to submit rating')
        return res.json()
    },

    async getProcessServerDetails(processServerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/process-servers/details/${processServerId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch process server details')
        return response.json()
    },

    async setDefaultProcessServer(customerId: string, processServerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/customers/${customerId}/default-process-server`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ processServerId }),
        })
        if (!response.ok) throw new Error('Failed to set default process server')
        return response.json()
    },

    async getDefaultProcessServer(customerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/customers/${customerId}/default-process-server`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to get default process server')
        return response.json()
    },

    async getGlobalProcessServers(token: string) {
        const response = await fetch(`${API_URL}/api/process-servers/global`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch global process servers')
        return response.json()
    },

    async toggleGlobalVisibility(tenantUserRoleId: string, isGlobal: boolean, token: string) {
        const response = await fetch(`${API_URL}/api/process-servers/${tenantUserRoleId}/toggle-global?isGlobal=${isGlobal}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to toggle global visibility')
        return response.json()
    },

    // Requirement 10: Geography APIs  
    async getStates() {
        const response = await fetch(`${API_URL}/api/geography/states`)
        if (!response.ok) throw new Error('Failed to fetch states')
        return response.json()
    },

    async getCitiesByState(stateId: number) {
        const response = await fetch(`${API_URL}/api/geography/states/${stateId}/cities`)
        if (!response.ok) throw new Error('Failed to fetch cities')
        return response.json()
    },

    async getCityById(cityId: number) {
        const response = await fetch(`${API_URL}/api/geography/cities/${cityId}`)
        if (!response.ok) throw new Error('Failed to fetch city')
        return response.json()
    },

    async searchCities(name: string) {
        const response = await fetch(`${API_URL}/api/geography/cities/search?name=${encodeURIComponent(name)}`)
        if (!response.ok) throw new Error('Failed to search cities')
        return response.json()
    },

    // Requirement 9: Message/Chat APIs
    async sendMessage(orderId: string, messageText: string, token: string, userId: string, userRole: string) {
        const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId,
                'userRole': userRole
            },
            body: JSON.stringify({ orderId, messageText })
        })
        if (!response.ok) throw new Error('Failed to send message')
        return response.json()
    },

    async getOrderMessages(orderId: string, token: string) {
        const response = await fetch(`${API_URL}/api/messages/order/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch messages')
        return response.json()
    },

    async markMessageAsRead(messageId: string, token: string) {
        const response = await fetch(`${API_URL}/api/messages/${messageId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to mark message as read')
    },

    async getUnreadCount(orderId: string, userId: string, token: string) {
        const response = await fetch(`${API_URL}/api/messages/order/${orderId}/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'userId': userId
            }
        })
        if (!response.ok) throw new Error('Failed to get unread count')
        return response.json()
    },

    async addChatParticipant(orderId: string, userId: string, userRole: string, token: string, addedBy: string) {
        const response = await fetch(`${API_URL}/api/messages/participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': addedBy
            },
            body: JSON.stringify({ orderId, userId, userRole })
        })
        if (!response.ok) throw new Error('Failed to add participant')
        return response.json()
    },

    async removeChatParticipant(participantId: string, token: string) {
        const response = await fetch(`${API_URL}/api/messages/participants/${participantId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to remove participant')
    },

    async getChatParticipants(orderId: string, token: string) {
        const response = await fetch(`${API_URL}/api/messages/participants/order/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch participants')
        return response.json()
    },
}
