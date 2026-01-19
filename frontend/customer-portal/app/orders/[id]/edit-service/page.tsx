'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditServiceOptions() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Redirect to edit-recipients since service options are now part of recipients editing
    router.replace(`/orders/${params.id}/edit-recipients`)
  }, [params.id, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Redirecting to edit recipients...</p>
      </div>
    </div>
  )
}
