'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface ContactEntry {
    id: string
    processServerId: string
    nickname: string
    entryType: string
}

export default function Contacts() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [contacts, setContacts] = useState<ContactEntry[]>([])
    const [newContact, setNewContact] = useState({
        processServerId: '',
        nickname: '',
    })

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token')
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            // Mapping logic - use user ID directly (it's the global user ID)
            const userId = user.userId

            if (token && userId) {
                const data = await api.getContactList(userId, token)
                setContacts(data)
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error)
        }
    }

    useEffect(() => {
        fetchContacts()
    }, [])

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            // Use user ID directly (it's the global user ID)
            const userId = user.userId

            await api.addContact({
                ownerUserId: userId,
                processServerId: newContact.processServerId,
                nickname: newContact.nickname,
                type: 'MANUAL'
            }, token!)

            setNewContact({ processServerId: '', nickname: '' })
            fetchContacts()
        } catch (error) {
            console.error('Failed to add contact:', error)
            alert('Failed to add contact. Check ID.')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveContact = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            const token = localStorage.getItem('token')
            await api.removeContact(id, token!)
            fetchContacts()
        } catch (error) {
            console.error('Failed to remove contact:', error)
            alert('Failed to remove contact')
        }
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold">My Contact List</h1>
                </div>

                {/* Add Contact Form */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add Process Server</h2>
                    <form onSubmit={handleAddContact} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Process Server ID</label>
                            <input
                                type="text"
                                value={newContact.processServerId}
                                onChange={(e) => setNewContact({ ...newContact, processServerId: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="UUID"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Nickname (Optional)</label>
                            <input
                                type="text"
                                value={newContact.nickname}
                                onChange={(e) => setNewContact({ ...newContact, nickname: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="My Favorite Server"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary px-6 py-3"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                </div>

                {/* Contact List */}
                <div className="space-y-4">
                    {contacts.map((contact) => {
                        const isGlobal = contact.nickname?.startsWith('Global')
                        // Determine badge type and color
                        let badgeText = contact.entryType
                        let badgeColor = 'bg-green-500/20 text-green-300' // MANUAL default

                        if (isGlobal) {
                            badgeText = 'GLOBAL'
                            badgeColor = 'bg-yellow-500/20 text-yellow-300'
                        } else if (contact.entryType === 'AUTO_ADDED') {
                            badgeColor = 'bg-blue-500/20 text-blue-300'
                        }

                        return (
                            <div key={contact.id} className="glass rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{contact.nickname || 'No Nickname'}</h3>
                                    <p className="text-sm text-gray-400">ID: {contact.processServerId}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
                                            {badgeText}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveContact(contact.id)}
                                    className="text-red-500 hover:text-red-400"
                                >
                                    Remove
                                </button>
                            </div>
                        )
                    })}
                    {contacts.length === 0 && (
                        <p className="text-center text-gray-400 py-8">No contacts found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
