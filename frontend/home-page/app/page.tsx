'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tenant {
    id: string
    name: string
    domainUrl: string
    isActive: boolean
}

export default function Home() {
    const router = useRouter()
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [selectedTenant, setSelectedTenant] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [showRoleSelection, setShowRoleSelection] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        loadTenants()
    }, [])

    const loadTenants = async () => {
        try {
            // For now, use hardcoded tenants. Later this will fetch from API
            const mockTenants: Tenant[] = [
                { id: 'tenant-1', name: 'Demo Shop', domainUrl: 'http://localhost:3000', isActive: true },
                { id: 'tenant-2', name: 'Legal Services Pro', domainUrl: 'http://localhost:3000', isActive: true }
            ]
            setTenants(mockTenants)
            setLoading(false)
        } catch (error) {
            console.error('Failed to load tenants:', error)
            setLoading(false)
        }
    }

    const handleTenantSelect = (tenantId: string) => {
        setSelectedTenant(tenantId)
        setShowRoleSelection(true)
        // Store selected tenant in localStorage for portals to use (client-side only)
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedTenantId', tenantId)
            const tenant = tenants.find(t => t.id === tenantId)
            if (tenant) {
                localStorage.setItem('selectedTenantName', tenant.name)
            }
        }
    }

    const handleRoleSelect = (role: 'admin' | 'customer' | 'server') => {
        if (!selectedTenant) return

        const routeMap = {
            'admin': 'http://localhost:3002/admin',
            'customer': 'http://localhost:3004/customer',
            'server': 'http://localhost:3001/delivery'
        }

        const route = routeMap[role]
        if (typeof window !== 'undefined') {
            window.location.href = route
        }
    }

    // Prevent hydration mismatch by waiting for client-side mount
    if (!mounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ProcessServe Platform
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Select your organization and portal to continue
                    </p>
                </div>

                {/* Hidden Super Admin Link */}
                <div className="text-center mb-8">
                    <a
                        href="http://localhost:3003/super-admin"
                        className="text-xs text-gray-400 hover:text-blue-500 transition"
                    >
                        Super Admin Access
                    </a>
                </div>

                {!showRoleSelection ? (
                    /* Tenant Selection */
                    <div className="card max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                            Select Your Organization
                        </h2>
                        <div className="space-y-3">
                            {tenants.map((tenant) => (
                                <button
                                    key={tenant.id}
                                    onClick={() => handleTenantSelect(tenant.id)}
                                    disabled={!tenant.isActive}
                                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${tenant.isActive
                                        ? 'bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-md'
                                        : 'bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{tenant.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {tenant.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                        {tenant.isActive && (
                                            <svg
                                                className="w-6 h-6 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Role Selection */
                    <div className="space-y-6">
                        <div className="text-center">
                            <button
                                onClick={() => setShowRoleSelection(false)}
                                className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Change Organization
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Select Your Role
                            </h2>
                            <p className="text-gray-600">
                                {tenants.find(t => t.id === selectedTenant)?.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Admin Card */}
                            <div
                                onClick={() => handleRoleSelect('admin')}
                                className="role-card text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-gray-800">Admin</h3>
                                <p className="text-gray-600 text-sm">
                                    Manage orders, servers, and settings
                                </p>
                            </div>

                            {/* Customer Card */}
                            <div
                                onClick={() => handleRoleSelect('customer')}
                                className="role-card text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-gray-800">Customer</h3>
                                <p className="text-gray-600 text-sm">
                                    Create and track your orders
                                </p>
                            </div>

                            {/* Process Server Card */}
                            <div
                                onClick={() => handleRoleSelect('server')}
                                className="role-card text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-gray-800">
                                    Process Server
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    View and complete deliveries
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-12 text-sm text-gray-500">
                    <p>© 2024 ProcessServe Platform. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}
