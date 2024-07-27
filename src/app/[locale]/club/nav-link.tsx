'use client'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Fragment } from 'react'
import { LucideIcon } from 'lucide-react'

export function NavLinkButton({
  href,
  disabled,
  children,
  links,
  icon,
  subItem = false,
}: {
  href: string
  links?: React.ReactNode
  disabled?: boolean
  children: React.ReactNode
  icon: React.ReactNode
  subItem?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname.endsWith(href) || pathname === href || pathname.match(new RegExp(`^/(en|pt-BR)?${href}$`))

  return (
    <Fragment>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ',
          disabled && 'cursor-not-allowed opacity-50',
          isActive && 'text-foreground bg-muted hover:bg-muted/80 hover:text-primary/80',
          subItem && 'ml-2'
        )}
      >
        {icon}
        <span className="text-md">{children}</span>
      </Link>
      {links}
    </Fragment>
  )
}
