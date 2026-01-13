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

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            const error: any = new Error('Failed to create order')
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: errorData
            }
            throw error
        }

        return response.json()
    },

    async countDocumentPages(file: File, token: string) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_URL}/api/orders/count-pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })
        if (!response.ok) throw new Error('Failed to count pages')
        return response.json()
    },

    async getOrder(orderId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch order')
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

    async updateOrderName(orderId: string, customName: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/${orderId}/custom-name`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ customName })
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to update order name')
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

    // Requirement 8: Independent Recipient Editing
    async updateRecipient(recipientId: string, updateData: any, token: string, userId: string, userRole: string = 'CUSTOMER') {
        const response = await fetch(`${API_URL}/api/orders/recipients/${recipientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId,
                'userRole': userRole
            },
            body: JSON.stringify(updateData)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to update recipient')
        }
    },

    async uploadRecipientDocument(recipientId: string, file: File, token: string, userId: string, userRole: string = 'CUSTOMER') {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_URL}/api/orders/recipients/${recipientId}/document`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'userId': userId,
                'userRole': userRole
            },
            body: formData
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to upload document')
        }
        return response.json()
    },

    async getOrderHistory(orderId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/${orderId}/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) throw new Error('Failed to fetch order history')
        return response.json()
    },

    // Multiple Documents Feature - New Methods
    async uploadMultipleOrderDocuments(orderId: string, files: File[], token: string, documentType?: string, onProgress?: (progress: number) => void) {
        const uploadPromises = files.map((file, index) => {
            return new Promise((resolve, reject) => {
                const formData = new FormData()
                formData.append('file', file)
                if (documentType) {
                    formData.append('documentType', documentType)
                }

                const xhr = new XMLHttpRequest()
                xhr.open('POST', `${API_URL}/api/orders/${orderId}/documents`)
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable && onProgress) {
                        const fileProgress = (event.loaded / event.total) * 100
                        const totalProgress = ((index + fileProgress / 100) / files.length) * 100
                        onProgress(Math.round(totalProgress))
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
        })

        return Promise.all(uploadPromises)
    },

    async getOrderDocuments(orderId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/${orderId}/documents`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) throw new Error('Failed to fetch order documents')
        return response.json()
    },

    async downloadOrderDocument(documentId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/documents/${documentId}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) throw new Error('Failed to download document')
        return response.blob()
    },

    async deleteOrderDocument(documentId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/documents/${documentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to delete document')
        }
        return response.json()
    },

    // Draft Document Upload - Upload documents immediately for draft (before order creation)
    // Documents are stored temporarily and linked to draft, then moved to order when created
    async uploadDraftDocument(draftId: string, file: File, token: string, documentType?: string, onProgress?: (progress: number) => void) {
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append('file', file)
            if (documentType) {
                formData.append('documentType', documentType)
            }

            const xhr = new XMLHttpRequest()
            // Upload to drafts folder with draftId
            xhr.open('POST', `${API_URL}/api/drafts/${draftId}/documents`)
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
                    reject(new Error(xhr.statusText || 'Failed to upload draft document'))
                }
            }

            xhr.onerror = () => reject(new Error('Network error'))

            xhr.send(formData)
        })
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

    async searchProcessServers(query: string, token: string) {
        // Reuse getGlobalProcessServers since we don't have a search endpoint yet
        // Client-side filtering will handle the query
        return this.getGlobalProcessServers(token)
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

    // Draft Management APIs
    async saveDraft(draftData: any, token: string) {
        const response = await fetch(`${API_URL}/api/drafts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(draftData),
        })
        if (!response.ok) throw new Error('Failed to save draft')
        return response.json()
    },

    async updateDraft(draftId: string, draftData: any, token: string) {
        const response = await fetch(`${API_URL}/api/drafts/${draftId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(draftData),
        })
        if (!response.ok) throw new Error('Failed to update draft')
        return response.json()
    },

    async getDraft(draftId: string, token: string) {
        const response = await fetch(`${API_URL}/api/drafts/${draftId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch draft')
        return response.json()
    },

    async getCustomerDrafts(customerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/drafts/customer/${customerId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch drafts')
        return response.json()
    },

    async getLatestDraft(customerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/drafts/customer/${customerId}/latest`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) {
            if (response.status === 404) return null
            throw new Error('Failed to fetch latest draft')
        }
        return response.json()
    },

    async getDraftCount(customerId: string, token: string) {
        const response = await fetch(`${API_URL}/api/drafts/customer/${customerId}/count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to get draft count')
        return response.json()
    },

    async deleteDraft(draftId: string, token: string) {
        const response = await fetch(`${API_URL}/api/drafts/${draftId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to delete draft')
    },

    async convertDraftToOrder(draftId: string, token: string) {
        const response = await fetch(`${API_URL}/api/drafts/${draftId}/convert`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to convert draft to order')
        return response.json()
    },

    // Price Negotiation APIs
    async counterOffer(negotiationId: string, counterOfferAmount: number, notes: string, userId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/negotiations/${negotiationId}/counter-offer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId
            },
            body: JSON.stringify({ counterOfferAmount, notes }),
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to submit counter-offer' }))
            throw new Error(error.error || 'Failed to submit counter-offer')
        }
        return response.json()
    },

    async acceptNegotiation(negotiationId: string, notes: string, userId: string, userRole: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/negotiations/${negotiationId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId,
                'userRole': userRole
            },
            body: JSON.stringify({ notes }),
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to accept negotiation' }))
            throw new Error(error.error || 'Failed to accept negotiation')
        }
        return response.json()
    },

    async rejectNegotiation(negotiationId: string, reason: string, userId: string, userRole: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/negotiations/${negotiationId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'userId': userId,
                'userRole': userRole
            },
            body: JSON.stringify({ reason }),
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to reject negotiation' }))
            throw new Error(error.error || 'Failed to reject negotiation')
        }
        return response.json()
    },

    async getActiveNegotiation(recipientId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/recipients/${recipientId}/negotiations/active`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) return null
        const data = await response.json()
        return data.message ? null : data // Return null if no active negotiation
    },

    async getNegotiationHistory(recipientId: string, token: string) {
        const response = await fetch(`${API_URL}/api/orders/recipients/${recipientId}/negotiations`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!response.ok) return []
        return response.json()
    },
}
