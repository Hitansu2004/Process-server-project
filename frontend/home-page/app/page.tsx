'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tenant {
    id: string
    name: string
    domainUrl: string
    isActive: boolean
    subscriptionTier?: string
    businessHours?: string
    createdAt?: string
}

export default function Home() {
    const router = useRouter()
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [selectedTenant, setSelectedTenant] = useState<string>('')
    const [selectedTenantDetails, setSelectedTenantDetails] = useState<Tenant | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingTenantDetails, setLoadingTenantDetails] = useState(false)
    const [showRoleSelection, setShowRoleSelection] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        loadTenants()
    }, [])

    const loadTenants = async () => {
        try {
            const { default: { api } } = await import('@/lib/api')
            const fetchedTenants = await api.getTenants()
            setTenants(fetchedTenants)
            setLoading(false)
        } catch (error) {
            console.error('Failed to load tenants:', error)
            // Fallback to mock data if API fails
            const mockTenants: Tenant[] = [
                { id: 'tenant-1', name: 'Demo Shop', domainUrl: 'http://localhost:3000', isActive: true },
                { id: 'tenant-2', name: 'Legal Services Pro', domainUrl: 'http://localhost:3000', isActive: true }
            ]
            setTenants(mockTenants)
            setLoading(false)
        }
    }

    const handleTenantSelect = async (tenantId: string) => {
        setSelectedTenant(tenantId)
        setLoadingTenantDetails(true)
        
        // Fetch detailed tenant information
        try {
            const { default: { api } } = await import('@/lib/api')
            const tenantDetails = await api.getTenant(tenantId)
            setSelectedTenantDetails(tenantDetails)
        } catch (error) {
            console.error('Failed to load tenant details:', error)
            // Fallback to basic tenant info from the list
            const tenant = tenants.find(t => t.id === tenantId)
            setSelectedTenantDetails(tenant || null)
        } finally {
            setLoadingTenantDetails(false)
            setShowRoleSelection(true)
        }
        
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
                    </div>
                    <p className="text-gray-700 mt-4 font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo/Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-gray-900 font-bold text-lg">ProcessServe</h1>
                                <p className="text-blue-600 text-xs">Platform Portal</p>
                            </div>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-4">
                            {showRoleSelection && (
                                <button
                                    onClick={() => {
                                        setShowRoleSelection(false)
                                        setSelectedTenantDetails(null)
                                    }}
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Switch Organization
                                </button>
                            )}
                            <a
                                href="http://localhost:3003/super-admin"
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all text-white text-sm font-medium shadow-md hover:shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Admin Portal
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
                {!showRoleSelection ? (
                    /* Tenant Selection - Full Width Design */
                    <div className="w-full max-w-6xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Select your organization to continue
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tenants.map((tenant) => (
                                <button
                                    key={tenant.id}
                                    onClick={() => handleTenantSelect(tenant.id)}
                                    disabled={!tenant.isActive}
                                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                                        tenant.isActive
                                            ? 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-400 shadow-lg hover:shadow-2xl hover:scale-105'
                                            : 'bg-gray-50 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="p-8">
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
                                                tenant.isActive 
                                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                                                    : 'bg-gray-400'
                                            }`}>
                                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-2xl text-gray-900 mb-3">
                                                {tenant.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    tenant.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                                }`}></div>
                                                <span className={`text-sm font-medium ${
                                                    tenant.isActive ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                    {tenant.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            {tenant.isActive && (
                                                <div className="mt-4 flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                                                    <span className="text-sm font-medium">Access Portal</span>
                                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Role Selection - Full Width Design */
                    <div className="w-full max-w-6xl">
                        {loadingTenantDetails ? (
                            <div className="text-center py-20">
                                <div className="relative inline-block">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
                                </div>
                                <p className="text-gray-700 mt-6 text-lg">Loading your workspace...</p>
                            </div>
                        ) : (
                            <>
                                {/* Welcome Section */}
                                <div className="text-center mb-12">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 text-lg mb-2">Welcome to</p>
                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                        {selectedTenantDetails?.name || 'Your Organization'}
                                    </h2>
                                    <p className="text-gray-600 text-lg mb-8">
                                        Select your role to continue
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-sm font-medium text-green-700">System Online</span>
                                    </div>
                                </div>

                                {/* Role Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Admin Card */}
                                    <button
                                        onClick={() => handleRoleSelect('admin')}
                                        className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
                                    >
                                        <div className="p-8">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-bold text-2xl text-gray-900 mb-3">Admin</h3>
                                                <p className="text-gray-600 mb-6">
                                                    Manage orders, servers, and settings
                                                </p>
                                                <div className="flex items-center justify-center gap-2 text-purple-600 group-hover:text-purple-700">
                                                    <span className="text-sm font-medium">Access Dashboard</span>
                                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Customer Card */}
                                    <button
                                        onClick={() => handleRoleSelect('customer')}
                                        className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
                                    >
                                        <div className="p-8">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-bold text-2xl text-gray-900 mb-3">Customer</h3>
                                                <p className="text-gray-600 mb-6">
                                                    Create and track your orders
                                                </p>
                                                <div className="flex items-center justify-center gap-2 text-blue-600 group-hover:text-blue-700">
                                                    <span className="text-sm font-medium">Access Portal</span>
                                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Process Server Card */}
                                    <button
                                        onClick={() => handleRoleSelect('server')}
                                        className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 rounded-2xl border-2 border-gray-200 hover:border-green-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
                                    >
                                        <div className="p-8">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-bold text-2xl text-gray-900 mb-3">Process Server</h3>
                                                <p className="text-gray-600 mb-6">
                                                    View and complete deliveries
                                                </p>
                                                <div className="flex items-center justify-center gap-2 text-green-600 group-hover:text-green-700">
                                                    <span className="text-sm font-medium">Access Portal</span>
                                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="py-6 text-center border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                    © {new Date().getFullYear()} ProcessServe Platform. All rights reserved.
                </p>
            </footer>
        </div>
    )
}
