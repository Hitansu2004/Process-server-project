'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { X, Send, UserPlus, UserMinus, MessageCircle } from 'lucide-react'

interface Message {
    id: string
    senderId: string
    senderRole: string
    messageText: string
    createdAt: string
    isRead: boolean
}

interface Participant {
    id: string
    userId: string
    userRole: string
    isActive: boolean
}

interface ChatWindowProps {
    orderId: string
    onClose: () => void
}

export default function ChatWindow({ orderId, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [participants, setParticipants] = useState<Participant[]>([])
    const [showParticipants, setShowParticipants] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') || '' : ''
    const user = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || '{}') : {}
    const userId = user.userId || ''
    const userRole = user.roles?.[0]?.role || 'CUSTOMER'

    // Load messages and participants
    useEffect(() => {
        loadMessages()
        loadParticipants()
        const interval = setInterval(loadMessages, 5000) // Poll every 5 seconds
        return () => clearInterval(interval)
    }, [orderId])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const loadMessages = async () => {
        try {
            const data = await api.getOrderMessages(orderId, token)
            setMessages(data)
        } catch (error) {
            console.error('Failed to load messages:', error)
        }
    }

    const loadParticipants = async () => {
        try {
            const data = await api.getChatParticipants(orderId, token)
            setParticipants(data)
        } catch (error) {
            console.error('Failed to load participants:', error)
        }
    }

    const handleSend = async () => {
        if (!newMessage.trim()) return

        setLoading(true)
        try {
            await api.sendMessage(orderId, newMessage, token, userId, userRole)
            setNewMessage('')
            await loadMessages()
        } catch (error) {
            console.error('Failed to send message:', error)
            alert('Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    const handleAddServer = async () => {
        const serverId = prompt('Enter Process Server ID to add to chat:')
        if (!serverId) return

        try {
            await api.addChatParticipant(orderId, serverId, 'SERVER', token, userId)
            await loadParticipants()
            alert('Server added to chat')
        } catch (error) {
            console.error('Failed to add server:', error)
            alert('Failed to add server')
        }
    }

    const handleRemoveParticipant = async (participant: Participant) => {
        if (!confirm(`Remove ${participant.userRole} from chat?`)) return

        try {
            await api.removeChatParticipant(participant.id, token)
            await loadParticipants()
            alert('Participant removed')
        } catch (error) {
            console.error('Failed to remove participant:', error)
            alert('Failed to remove participant')
        }
    }

    const serverInChat = participants.some(p => p.userRole === 'SERVER' && p.isActive)

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Chat</h2>
                        <p className="text-sm text-gray-500">Order #{orderId}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowParticipants(!showParticipants)}
                            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600 transition-colors"
                        >
                            Participants ({participants.filter(p => p.isActive).length})
                        </button>
                        {!serverInChat && (
                            <button
                                onClick={handleAddServer}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                title="Add Process Server"
                            >
                                <UserPlus size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Participants (if shown) */}
                {showParticipants && (
                    <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">Active Participants:</h3>
                        <div className="space-y-2">
                            {participants.filter(p => p.isActive).map(p => (
                                <div key={p.id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-700">
                                        <span className={`w-2 h-2 rounded-full ${p.userRole === 'CUSTOMER' ? 'bg-blue-500' :
                                            p.userRole === 'ADMIN' ? 'bg-purple-500' : 'bg-green-500'
                                            }`} />
                                        <span className="font-medium">{p.userRole}</span>
                                        <span className="text-gray-400">({p.userId.substring(0, 8)}...)</span>
                                    </span>
                                    {p.userRole === 'SERVER' && (
                                        <button
                                            onClick={() => handleRemoveParticipant(p)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <UserMinus size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageCircle size={48} className="mb-2 opacity-20" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isOwn = msg.senderId === userId
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isOwn
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                        <span className="font-bold">{msg.senderRole}</span>
                                        <span>•</span>
                                        <span>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{msg.messageText}</p>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !newMessage.trim()}
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
