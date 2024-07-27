'use client';

import { Alert } from "@/components/ui/alert";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Alert className="max-w-md bg-blue-100 border-blue-500 text-blue-700">
          <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
          <p>We&apos;re working hard to bring you something amazing. Stay tuned!</p>
        </Alert>
    </div>
  );
}
