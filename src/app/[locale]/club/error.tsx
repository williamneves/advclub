'use client' // Error boundaries must be Client Components

import { Button } from '@mantine/core'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl">Something went wrong!</h2>
      <p className="mb-8 text-lg">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
