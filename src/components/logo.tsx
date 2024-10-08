import Link from 'next/link'
import Image from 'next/image'
import LOGO from '@/assets/images/LOGO-BLUE-CROSS.png'
import { cn } from '@/lib/utils'
import { Anchor, Text } from '@mantine/core'

export function Logo({ withBorder = true }: { withBorder?: boolean }) {
  return (
    <div
      className={cn('flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6', {
        'border-b': withBorder,
      })}
    >
      <Image
        src={LOGO}
        priority
        alt="Brazilian Pioneers Kids Club"
        className="size-12 lg:size-14"
      />
      <Text component="span" fz={'xl'} fw={'bold'} className="no-underline">
        BPKids.club
      </Text>
    </div>
  )
}
