'use client'

import React, { Fragment } from "react"
import { NavLinkButton } from "./nav-link"
import { LayoutDashboard, Contact, Baby, FileStack } from "lucide-react"
import { useTranslations } from "next-intl"
import { api } from "@/trpc/react"

export function NavBlock({
  isMobile,
}: {
  isMobile?: boolean
}) {
  const t = useTranslations('navigation')
  const family = api.club.families.getLoggedInFamily.useQuery(undefined, {
  retry: 0,
  })
  const familyCreated = !family.isLoading && !!family.data
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