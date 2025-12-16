'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import ContactCard from '@/components/ContactCard'

interface ContactEntry {
    id: string
    processServerId: string
    nickname: string
    entryType: string
    processServerDetails?: any
}

export default function Contacts() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [contacts, setContacts] = useState<ContactEntry[]>([])
    const [defaultProcessServerId, setDefaultProcessServerId] = useState<string | null>(null)
    const [customerProfileId, setCustomerProfileId] = useState<string | null>(null)
    const [newContact, setNewContact] = useState({
        processServerId: '',
        nickname: '',
    })

    const fetchContacts = async () => {
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.userId

            if (token && userId) {
                // Fetch customer profile to get the real ID and default server
                try {
                    const profile = await api.getCustomerProfile(userId, token)
                    setCustomerProfileId(profile.id)
                    setDefaultProcessServerId(profile.defaultProcessServerId)
                } catch (error) {
                    console.error('Failed to fetch customer profile:', error)
                }

                const data = await api.getContactList(userId, token)

                // Enrich contacts with detailed process server info
                const enrichedContacts = await Promise.all(
                    data.map(async (contact: ContactEntry) => {
                        try {
                            // Use getProcessServerDetails for full stats and info
                            const details = await api.getProcessServerDetails(contact.processServerId, token)
                            return {
                                ...contact,
                                processServerDetails: details
                            }
                        } catch (error) {
                            console.error(`Failed to fetch details for ${contact.processServerId}:`, error)
                            return contact
                        }
                    })
                )

                setContacts(enrichedContacts)
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error)
        }
    }

    useEffect(() => {
        fetchContacts()
    }, [])

    const handleSetDefault = async (processServerId: string) => {
        try {
            const token = sessionStorage.getItem('token')
            if (token && customerProfileId) {
                await api.setDefaultProcessServer(customerProfileId, processServerId, token)
                setDefaultProcessServerId(processServerId)
                alert('Default process server updated!')
            }
        } catch (error) {
            console.error('Failed to set default:', error)
            alert('Failed to set default process server.')
        }
    }

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.userId

            await api.addContact({
                ownerUserId: userId,
                processServerId: newContact.processServerId,
                nickname: newContact.nickname,
                type: 'MANUAL'
            }, token!)

            setNewContact({ processServerId: '', nickname: '' })
            fetchContacts()
            alert('Process server added successfully!')
        } catch (error) {
            console.error('Failed to add contact:', error)
            alert('Failed to add contact. Please check the ID and try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveContact = async (id: string) => {
        if (!confirm('Are you sure you want to remove this process server from your contacts?')) return
        try {
            const token = sessionStorage.getItem('token')
            await api.removeContact(id, token!)
            fetchContacts()
        } catch (error) {
            console.error('Failed to remove contact:', error)
            alert('Failed to remove contact')
        }
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">My Contact List</h1>
                            <p className="text-gray-400 mt-1">Manage your preferred process servers</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Add Contact */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-6">
                            <h2 className="text-xl font-bold mb-4">Add Process Server</h2>
                            <p className="text-sm text-gray-400 mb-6">
                                Add a process server by their unique ID to easily assign them to future orders.
                            </p>
                            <form onSubmit={handleAddContact} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Process Server ID</label>
                                    <input
                                        type="text"
                                        value={newContact.processServerId}
                                        onChange={(e) => setNewContact({ ...newContact, processServerId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                        placeholder="UUID"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Nickname (Optional)</label>
                                    <input
                                        type="text"
                                        value={newContact.nickname}
                                        onChange={(e) => setNewContact({ ...newContact, nickname: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        placeholder="My Favorite Server"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-3"
                                >
                                    {loading ? 'Adding...' : 'Add to Contacts'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Main Content - Contact Grid */}
                    <div className="lg:col-span-3">
                        {contacts.length === 0 ? (
                            <div className="text-center py-12 glass rounded-xl">
                                <p className="text-gray-400 text-lg">No contacts found.</p>
                                <p className="text-sm text-gray-500 mt-2">Add a process server to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {contacts.map((contact, index) => (
                                    <ContactCard
                                        key={contact.id}
                                        id={contact.id}
                                        processServerId={contact.processServerId}
                                        nickname={contact.nickname}
                                        entryType={contact.entryType}
                                        details={contact.processServerDetails || {}}
                                        onRemove={handleRemoveContact}
                                        index={index + 1}
                                        isDefault={defaultProcessServerId === contact.processServerId}
                                        onSetDefault={handleSetDefault}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
