'use client'

import { useEffect, useRef } from 'react'

interface GoogleSignInButtonProps {
    onSuccess: (credential: string) => void
    onError?: () => void
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export default function GoogleSignInButton({ onSuccess, onError, text = 'signin_with' }: GoogleSignInButtonProps) {
    const googleButtonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Load Google Sign-In script
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.body.appendChild(script)

        script.onload = () => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
                    callback: handleCredentialResponse,
                })

                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        theme: 'outline',
                        size: 'large',
                        text: text,
                        width: 350,
                        logo_alignment: 'left',
                    }
                )
            }
        }

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handleCredentialResponse = (response: any) => {
        if (response.credential) {
            onSuccess(response.credential)
        } else if (onError) {
            onError()
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div ref={googleButtonRef} className="google-signin-button"></div>
        </div>
    )
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        google: any
    }
}
