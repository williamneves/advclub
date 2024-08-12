'use client'

import { Button } from '@/components/ui/button'
export default function UserAvatar() {
  return (
    <div className="hidden items-center justify-center gap-4 md:flex">
      <Button
        variant="outline"
        className="h-[32px] px-mtn-md lg:h-[50px] lg:px-mtn-xl"
      >
        Inscrever
      </Button>
      <Button
        variant="outline"
        className="h-[32px] px-mtn-md lg:h-[50px] lg:px-mtn-xl"
      >
        Entrar
      </Button>
    </div>
  )
}
