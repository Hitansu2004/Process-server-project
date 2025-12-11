'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Settings() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [tenantId, setTenantId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form state
    const [shopName, setShopName] = useState('')
    const [domain, setDomain] = useState('')
    const [businessHours, setBusinessHours] = useState<any>({
        monday: { open: '09:00', close: '18:00', enabled: true },
        tuesday: { open: '09:00', close: '18:00', enabled: true },
        wednesday: { open: '09:00', close: '18:00', enabled: true },
        thursday: { open: '09:00', close: '18:00', enabled: true },
        friday: { open: '09:00', close: '18:00', enabled: true },
        saturday: { open: '09:00', close: '18:00', enabled: true },
        sunday: { open: '09:00', close: '18:00', enabled: true },
    })
    const [minimumOrderPrice, setMinimumOrderPrice] = useState(50)
    const [commissionRate, setCommissionRate] = useState(15)
    const [emailForNewOrders, setEmailForNewOrders] = useState(true)
    const [smsForDelivery, setSmsForDelivery] = useState(true)
    const [weeklyReports, setWeeklyReports] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Load tenant data
        if (parsedUser.roles && parsedUser.roles[0]) {
            const role = parsedUser.roles[0]
            const tid = role.tenantId
            setTenantId(tid)
            loadTenantSettings(tid, token)
        }
    }, [router])

    const loadTenantSettings = async (tid: string, token: string) => {
        try {
            const tenant = await api.getTenant(tid, token)

            // Set tenant basic info from API (not from localStorage cache)
            setShopName(tenant.name || '')
            setDomain(tenant.domainUrl || '')

            // Parse business hours
            if (tenant.businessHours) {
                const hours = JSON.parse(tenant.businessHours)
                setBusinessHours(hours)
            }

            // Parse pricing config
            if (tenant.pricingConfig) {
                const pricing = JSON.parse(tenant.pricingConfig)
                setMinimumOrderPrice(pricing.minimumOrderPrice || 50)
                setCommissionRate(pricing.commissionRate || 15)
            }

            // Parse notification settings
            if (tenant.notificationSettings) {
                const notifications = JSON.parse(tenant.notificationSettings)
                setEmailForNewOrders(notifications.emailForNewOrders ?? true)
                setSmsForDelivery(notifications.smsForDelivery ?? true)
                setWeeklyReports(notifications.weeklyReports ?? false)
            }

            setLoading(false)
        } catch (error) {
            console.error('Failed to load settings:', error)
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!tenantId) return

        setSaving(true)
        setMessage(null)

        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Not authenticated')

            const settings = {
                businessHours: JSON.stringify(businessHours),
                pricingConfig: JSON.stringify({
                    minimumOrderPrice: parseFloat(minimumOrderPrice.toString()),
                    commissionRate: parseInt(commissionRate.toString())
                }),
                notificationSettings: JSON.stringify({
                    emailForNewOrders,
                    smsForDelivery,
                    weeklyReports
                })
            }

            await api.updateTenantSettings(tenantId, settings, token)
            setMessage({ type: 'success', text: '✅ Settings saved successfully!' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Failed to save settings. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    const updateBusinessHours = (day: string, field: 'open' | 'close', value: string) => {
        setBusinessHours((prev: any) => ({
            ...prev,
            [day.toLowerCase()]: {
                ...prev[day.toLowerCase()],
                [field]: value
            }
        }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="glass px-4 py-2 rounded-lg hover:bg-white/10"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Shop Settings</h1>
                        <p className="text-gray-400 mt-1">Configure your shop preferences</p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                        <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>{message.text}</p>
                    </div>
                )}

                {/* Shop Information */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">Shop Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Shop Name</label>
                            <input
                                type="text"
                                value={shopName}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary opacity-50"
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Contact support to change shop name</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Domain</label>
                            <input
                                type="text"
                                value={domain}
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary opacity-50"
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Contact support to change domain</p>
                        </div>
                    </div>
                </div>

                {/* Business Hours */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">Business Hours</h2>
                    <div className="space-y-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <div key={day} className="flex items-center justify-between glass rounded-lg p-3">
                                <span className="font-medium">{day}</span>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="time"
                                        className="px-3 py-1 rounded glass text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={businessHours[day.toLowerCase()]?.open || '09:00'}
                                        onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                                    />
                                    <span>to</span>
                                    <input
                                        type="time"
                                        className="px-3 py-1 rounded glass text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={businessHours[day.toLowerCase()]?.close || '18:00'}
                                        onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Configuration */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">Pricing Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Minimum Order Price ($)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                value={minimumOrderPrice}
                                onChange={(e) => setMinimumOrderPrice(parseFloat(e.target.value) || 0)}
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-primary"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 cursor-pointer"
                                checked={emailForNewOrders}
                                onChange={(e) => setEmailForNewOrders(e.target.checked)}
                            />
                            <span>Email notifications for new orders</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 cursor-pointer"
                                checked={smsForDelivery}
                                onChange={(e) => setSmsForDelivery(e.target.checked)}
                            />
                            <span>SMS alerts for delivery completion</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 cursor-pointer"
                                checked={weeklyReports}
                                onChange={(e) => setWeeklyReports(e.target.checked)}
                            />
                            <span>Weekly performance reports</span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
            </div>
        </div>
    )
}
