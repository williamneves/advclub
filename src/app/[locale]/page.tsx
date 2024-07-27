'use client'

import { Alert } from '@/components/ui/alert'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Alert className="max-w-md border-blue-500 bg-blue-100 text-blue-700">
        <h2 className="mb-2 text-lg font-semibold">Coming Soon</h2>
        <p>
          We&apos;re working hard to bring you something amazing. Stay tuned!
        </p>
      </Alert>
    </div>
  )
}
