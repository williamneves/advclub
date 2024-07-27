'use client'

import { Button } from '@/components/ui/button'
export default function UserAvatar() {
  return (
    <div className="hidden items-center justify-center gap-4 md:flex">
      <Button
        variant="outline"
        className="px-mtn-md lg:px-mtn-xl h-[32px] lg:h-[50px]"
      >
        Inscrever
      </Button>
      <Button
        variant="outline"
        className="px-mtn-md lg:px-mtn-xl h-[32px] lg:h-[50px]"
      >
        Entrar
      </Button>
    </div>
  )
}
