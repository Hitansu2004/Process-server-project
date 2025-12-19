'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Globe, Mail, UserPlus, Star, Phone, MapPin, TrendingUp, Award, ArrowLeft } from 'lucide-react'

interface ProcessServer {
    id: string
    tenantUserRoleId: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    profilePhotoUrl: string
    currentRating: number
    totalOrdersAssigned: number
    successfulDeliveries: number
    operatingZipCodes: string
    isGlobal: boolean
}

interface ContactEntry {
    id: string
    processServerId: string
    nickname: string
    entryType: string
    processServerDetails?: ProcessServer
}

export default function Contacts() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal')
    const [personalContacts, setPersonalContacts] = useState<ContactEntry[]>([])
    const [globalServers, setGlobalServers] = useState<ProcessServer[]>([])
    const [loading, setLoading] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteLoading, setInviteLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    })

    useEffect(() => {
        // Always fetch personal contacts to keep track of what's already added
        fetchPersonalContacts()
        
        if (activeTab === 'personal') {
            // Personal contacts already fetched above
        } else {
            fetchGlobalServers()
        }
    }, [activeTab])

    const fetchPersonalContacts = async () => {
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.userId

            if (token && userId) {
                const data = await api.getContactList(userId, token)

                // Enrich contacts with detailed process server info
                const enrichedContacts = await Promise.all(
                    data.map(async (contact: ContactEntry) => {
                        try {
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

                setPersonalContacts(enrichedContacts)
            }
        } catch (error) {
            console.error('Failed to fetch personal contacts:', error)
            showToast('Failed to load personal contacts', 'error')
        } finally {
            setLoading(false)
        }
    }

    const fetchGlobalServers = async () => {
        setLoading(true)
        try {
            const token = sessionStorage.getItem('token')
            if (token) {
                const data = await api.getGlobalProcessServers(token)
                setGlobalServers(data)
            }
        } catch (error) {
            console.error('Failed to fetch global servers:', error)
            showToast('Failed to load global process servers', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToPersonal = async (server: ProcessServer) => {
        try {
            const token = sessionStorage.getItem('token')
            const user = JSON.parse(sessionStorage.getItem('user') || '{}')
            const userId = user.userId

            if (token && userId) {
                await api.addContact({
                    ownerUserId: userId,
                    processServerId: server.id,
                    nickname: `${server.firstName} ${server.lastName}`,
                    type: 'MANUAL'
                }, token)

                showToast(`${server.firstName} ${server.lastName} added to your contacts! ✨`, 'success')
                // Refresh personal contacts to show the newly added server
                await fetchPersonalContacts()
            }
        } catch (error: any) {
            console.error('Failed to add contact:', error)
            showToast(error.message || 'Failed to add to contacts', 'error')
        }
    }

    const handleRemoveContact = async (entryId: string) => {
        try {
            const token = sessionStorage.getItem('token')
            if (token) {
                await api.removeContact(entryId, token)
                showToast('Contact removed successfully', 'info')
                fetchPersonalContacts()
            }
        } catch (error) {
            console.error('Failed to remove contact:', error)
            showToast('Failed to remove contact', 'error')
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
            showToast(`Invitation sent to ${inviteEmail} successfully! 📧`, 'success')
        } catch (error: any) {
            console.error('Failed to send invitation:', error)
            showToast(error.message || 'Failed to send invitation', 'error')
        } finally {
            setInviteLoading(false)
        }
    }

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, visible: true })
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
    }

    const isInPersonalContacts = (serverId: string) => {
        return personalContacts.some(contact => contact.processServerId === serverId)
    }

    const getContactEntryId = (serverId: string): string | null => {
        const contact = personalContacts.find(c => c.processServerId === serverId)
        return contact ? contact.id : null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
                            toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
                            toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                            'bg-blue-500/90 border-blue-400 text-white'
                        }`}>
                            <p className="font-medium">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </motion.button>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Process Server Directory
                            </h1>
                            <p className="text-gray-500 mt-2">Manage your contacts and discover global process servers</p>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                                activeTab === 'personal'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/90 text-gray-600 border border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            My Personal Contacts
                            {personalContacts.length > 0 && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    activeTab === 'personal' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {personalContacts.length}
                                </span>
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('global')}
                            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                                activeTab === 'global'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/90 text-gray-600 border border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <Globe className="w-5 h-5" />
                            Global Directory
                            {globalServers.length > 0 && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    activeTab === 'global' ? 'bg-white/20' : 'bg-green-100 text-green-600'
                                }`}>
                                    {globalServers.length}
                                </span>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Invite */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg sticky top-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Invite Server
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Invite someone to join as a process server. They'll receive an email with registration instructions.
                            </p>
                            <form onSubmit={handleInviteProcessServer} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="server@example.com"
                                        required
                                    />
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
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Send Invitation
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center py-20"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-gray-600">Loading...</p>
                                    </div>
                                </motion.div>
                            ) : activeTab === 'personal' ? (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {personalContacts.length === 0 ? (
                                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200">
                                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Personal Contacts Yet</h3>
                                            <p className="text-gray-500">
                                                Add process servers from the Global Directory or invite new ones
                                            </p>
                                        </div>
                                    ) : (
                                        personalContacts.map((contact, index) => {
                                            const server = contact.processServerDetails
                                            if (!server) return null

                                            return (
                                                <motion.div
                                                    key={contact.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    <div className="flex items-start gap-6">
                                                        <div className="relative">
                                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                                                {server.profilePhotoUrl ? (
                                                                    <img 
                                                                        src={`http://localhost:8080/api/process-servers/profile-photo/${server.profilePhotoUrl}`} 
                                                                        alt={server.firstName} 
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none'
                                                                            e.currentTarget.parentElement!.textContent = `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                )}
                                                            </div>
                                                            {server.isGlobal && (
                                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                    <Globe className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h3 className="text-xl font-bold text-gray-800">
                                                                        {server.firstName} {server.lastName}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                            <span className="text-sm font-semibold text-gray-700">
                                                                                {server.currentRating?.toFixed(1) || '0.0'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-gray-300">•</span>
                                                                        <span className="text-sm text-gray-600">
                                                                            {server.totalOrdersAssigned || 0} orders
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleRemoveContact(contact.id)}
                                                                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-medium"
                                                                >
                                                                    Remove
                                                                </motion.button>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Mail className="w-4 h-4" />
                                                                    {server.email}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Phone className="w-4 h-4" />
                                                                    {server.phoneNumber || 'N/A'}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <MapPin className="w-4 h-4" />
                                                                    {server.operatingZipCodes ? JSON.parse(server.operatingZipCodes).slice(0, 3).join(', ') : 'N/A'}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <TrendingUp className="w-4 h-4" />
                                                                    {server.successfulDeliveries || 0} successful
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="global"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {globalServers.length === 0 ? (
                                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200">
                                            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Global Servers Available</h3>
                                            <p className="text-gray-500">
                                                Process servers can make themselves visible globally
                                            </p>
                                        </div>
                                    ) : (
                                        globalServers.map((server, index) => {
                                            const alreadyAdded = isInPersonalContacts(server.id)

                                            return (
                                                <motion.div
                                                    key={server.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    <div className="flex items-start gap-6">
                                                        <div className="relative">
                                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                                                {server.profilePhotoUrl ? (
                                                                    <img 
                                                                        src={`http://localhost:8080/api/process-servers/profile-photo/${server.profilePhotoUrl}`} 
                                                                        alt={server.firstName} 
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none'
                                                                            e.currentTarget.parentElement!.textContent = `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    `${server.firstName?.[0]}${server.lastName?.[0]}`
                                                                )}
                                                            </div>
                                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                <Globe className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="text-xl font-bold text-gray-800">
                                                                            {server.firstName} {server.lastName}
                                                                        </h3>
                                                                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                                            GLOBAL
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                            <span className="text-sm font-semibold text-gray-700">
                                                                                {server.currentRating?.toFixed(1) || '0.0'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-gray-300">•</span>
                                                                        <span className="text-sm text-gray-600">
                                                                            {server.totalOrdersAssigned || 0} orders
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {alreadyAdded ? (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => {
                                                                            const entryId = getContactEntryId(server.id)
                                                                            if (entryId) {
                                                                                handleRemoveContact(entryId)
                                                                            }
                                                                        }}
                                                                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-medium"
                                                                    >
                                                                        Remove from Contacts
                                                                    </motion.button>
                                                                ) : (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleAddToPersonal(server)}
                                                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                                                                    >
                                                                        <UserPlus className="w-4 h-4" />
                                                                        Add to Contacts
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Mail className="w-4 h-4" />
                                                                    {server.email}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Phone className="w-4 h-4" />
                                                                    {server.phoneNumber || 'N/A'}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <MapPin className="w-4 h-4" />
                                                                    {server.operatingZipCodes ? JSON.parse(server.operatingZipCodes).slice(0, 3).join(', ') : 'N/A'}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <TrendingUp className="w-4 h-4" />
                                                                    {server.successfulDeliveries || 0} successful
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
