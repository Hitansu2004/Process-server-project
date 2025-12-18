'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import ContactCard from '@/components/ContactCard'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmModal from '@/components/ConfirmModal'
import Toast from '@/components/Toast'

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
    const [showRemoveModal, setShowRemoveModal] = useState(false)
    const [contactToRemove, setContactToRemove] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    })
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteLoading, setInviteLoading] = useState(false)

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
                setToast({
                    message: 'Default process server updated successfully! ⭐',
                    type: 'success',
                    visible: true
                })
            }
        } catch (error) {
            console.error('Failed to set default:', error)
            setToast({
                message: 'Failed to set default process server. Please try again.',
                type: 'error',
                visible: true
            })
        }
    }

    const handleInviteProcessServer = async (e: React.FormEvent) => {
        e.preventDefault()
        setInviteLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const inviterName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email

            await api.inviteProcessServer(inviteEmail, inviterName, token!)

            setInviteEmail('')
            setToast({
                message: `Invitation sent to ${inviteEmail} successfully! 📧`,
                type: 'success',
                visible: true
            })
        } catch (error: any) {
            console.error('Failed to send invitation:', error)
            setToast({
                message: error.message || 'Failed to send invitation. Please try again.',
                type: 'error',
                visible: true
            })
        } finally {
            setInviteLoading(false)
        }
    }

    const handleRemoveContact = async (id: string) => {
        setContactToRemove(id)
        setShowRemoveModal(true)
    }

    const confirmRemoveContact = async () => {
        if (!contactToRemove) return
        try {
            const token = sessionStorage.getItem('token')
            await api.removeContact(contactToRemove, token!)
            fetchContacts()
            setShowRemoveModal(false)
            setContactToRemove(null)
            setToast({
                message: 'Contact removed successfully',
                type: 'info',
                visible: true
            })
        } catch (error) {
            console.error('Failed to remove contact:', error)
            setToast({
                message: 'Failed to remove contact. Please try again.',
                type: 'error',
                visible: true
            })
        }
    }

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                        >
                            ← Back
                        </motion.button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                My Contact List
                            </h1>
                            <p className="text-gray-500 mt-1">Manage your preferred process servers</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Invite Process Server */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Invite Process Server
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">
                                Invite someone to join our platform as a process server. They'll receive an email with instructions to complete their profile.
                            </p>
                            <form onSubmit={handleInviteProcessServer} className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                                        placeholder="server@example.com"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        We'll send them an invitation to join as a process server
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={inviteLoading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {inviteLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Send Invitation
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Legend */}
                            {contacts.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Types</h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">MANUAL</span>
                                            <span className="text-gray-600">Added by you</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">AUTO</span>
                                            <span className="text-gray-600">Auto-added from orders</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">GLOBAL</span>
                                            <span className="text-gray-600">System-wide available</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Main Content - List View */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {contacts.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 text-lg font-medium">No contacts found.</p>
                                <p className="text-sm text-gray-500 mt-2">Add a process server to get started.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {/* Default Server Section */}
                                {contacts.filter(c => defaultProcessServerId === c.processServerId).length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            Default Process Server
                                        </h3>
                                        <AnimatePresence mode="popLayout">
                                            {contacts
                                                .filter(c => defaultProcessServerId === c.processServerId)
                                                .map((contact, index) => (
                                                    <motion.div
                                                        key={contact.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ContactCard
                                                            id={contact.id}
                                                            processServerId={contact.processServerId}
                                                            nickname={contact.nickname}
                                                            entryType={contact.entryType}
                                                            details={contact.processServerDetails || {}}
                                                            onRemove={handleRemoveContact}
                                                            index={contacts.indexOf(contact) + 1}
                                                            isDefault={true}
                                                            onSetDefault={handleSetDefault}
                                                        />
                                                    </motion.div>
                                                ))}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Other Contacts Section */}
                                {contacts.filter(c => defaultProcessServerId !== c.processServerId).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            All Contacts ({contacts.filter(c => defaultProcessServerId !== c.processServerId).length})
                                        </h3>
                                        <div className="space-y-3">
                                            <AnimatePresence mode="popLayout">
                                                {contacts
                                                    .filter(c => defaultProcessServerId !== c.processServerId)
                                                    .map((contact, index) => (
                                                        <motion.div
                                                            key={contact.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            transition={{ duration: 0.3, delay: index * 0.03 }}
                                                        >
                                                            <ContactCard
                                                                id={contact.id}
                                                                processServerId={contact.processServerId}
                                                                nickname={contact.nickname}
                                                                entryType={contact.entryType}
                                                                details={contact.processServerDetails || {}}
                                                                onRemove={handleRemoveContact}
                                                                index={contacts.indexOf(contact) + 1}
                                                                isDefault={false}
                                                                onSetDefault={handleSetDefault}
                                                            />
                                                        </motion.div>
                                                    ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showRemoveModal}
                onClose={() => {
                    setShowRemoveModal(false)
                    setContactToRemove(null)
                }}
                onConfirm={confirmRemoveContact}
                title="Remove Contact"
                message="Are you sure you want to remove this process server from your contacts?"
                confirmText="Yes, Remove"
                cancelText="Cancel"
            />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
            />
        </div>
    )
}
