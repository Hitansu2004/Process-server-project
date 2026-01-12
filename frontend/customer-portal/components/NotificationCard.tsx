import React from 'react'
import { motion } from 'framer-motion'

interface NotificationCardProps {
    title: string
    message: string
    type?: 'success' | 'error' | 'info'
}

export default function NotificationCard({ title, message, type = 'success' }: NotificationCardProps) {
    const icons = {
        success: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        info: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }

    const styles = {
        success: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            icon: 'text-white',
            text: 'text-white'
        },
        error: {
            bg: 'bg-gradient-to-r from-red-500 to-red-600',
            icon: 'text-white',
            text: 'text-white'
        },
        info: {
            bg: 'bg-gradient-to-r from-blue-500 to-purple-600',
            icon: 'text-white',
            text: 'text-white'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl shadow-lg backdrop-blur-xl p-4 flex items-center gap-4 ${styles[type].bg} max-w-md`}
        >
            <div className={`flex-shrink-0 ${styles[type].icon}`}>
                {icons[type]}
            </div>
            <div className="flex-1">
                <h4 className={`font-bold ${styles[type].text}`}>{title}</h4>
                <p className={`text-sm opacity-90 ${styles[type].text}`}>
                    {message}
                </p>
            </div>
        </motion.div>
    )
}
