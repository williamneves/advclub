import Link from 'next/link'
import { Baby, Contact, FileStack, LayoutDashboard, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Image from 'next/image'

import LOGO from '@/assets/images/LOGO-BLUE-CROSS.png'
import { Logo } from '@/components/logo'
import { UserButton } from '@clerk/nextjs'
import { NavLinkButton } from './nav-link'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'
import { api } from '@/trpc/server'
import { LanguageSelector } from '@/components/language-selector'
import LanguageChanger from '@/components/lang-changer'

export function Shell({
  children,
  familyCreated,
  locale,
}: {
  children: React.ReactNode
  familyCreated: boolean
  locale: string
}) {
  const t = useTranslations('navigation')

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <Logo />
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavBlock isMobile={false} familyCreated={familyCreated} />
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="container mx-auto flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col pt-0">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex h-14 items-center gap-2 lg:h-[60px]"
                >
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold"
                  >
                    <Image
                      src={LOGO}
                      priority
                      alt="BT Adventurer's Club"
                      className="size-10 lg:size-12"
                    />
                    <span className="text-lg font-bold">
                      BT Adventurer&apos;s
                    </span>
                  </Link>
                </Link>
                <NavBlock isMobile={true} familyCreated={familyCreated} />
              </nav>
            </SheetContent>
          </Sheet>
          {/* <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div> */}
          <div className="ml-auto flex items-center gap-4">
            <LanguageSelector />
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    'h-9 w-9 rounded-md ring-2 ring-primary/50 hover:ring-primary/70 transition-all duration-200 ease-in-out ring-offset-2 ring-offset-background hover:ring-offset-0',
                },
              }}
            />
          </div>
        </header>
        <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavBlock({
  isMobile,
  familyCreated,
}: {
  isMobile?: boolean
  familyCreated?: boolean
}) {
  const t = useTranslations('navigation')

  return (
    <Fragment>
      <NavLinkButton
        href="/club/family"
        icon={<LayoutDashboard className="size-5" />}
      >
        {t('family')}
      </NavLinkButton>
      {familyCreated && (
        <>
          <NavLinkButton
            href="/club/family/parents"
            icon={<Contact className="size-5" />}
          >
            {t('parents')}
          </NavLinkButton>
          <NavLinkButton
            href="/club/family/kids"
            icon={<Baby className="size-5" />}
          >
            {t('kids')}
          </NavLinkButton>
          <NavLinkButton
            href="/club/family/forms"
            icon={<FileStack className="size-5" />}
          >
            {t('forms')}
          </NavLinkButton>
        </>
      )}
    </Fragment>
  )
}
