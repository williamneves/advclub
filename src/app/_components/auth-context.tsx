'use client'

import { createClient } from '@/utils/supabase/client'
import { modals } from '@mantine/modals'
import { type User } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createContext, useContext } from 'react'
import { Alert, Stack, Text } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'

export type AuthContextType = {
  user: User | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => ({}),
})

export function AuthProvider({
  children,
  user,
}: {
  children: React.ReactNode
  user: AuthContextType['user']
}) {
  const t = useTranslations('common')
  const supabase = createClient()
  const router = useRouter()
  const handleLogout = async () => {
    modals.openConfirmModal({
      title: t('logout_modal.title'),
      children: (
        <Stack>
          <Alert color="red">{t('logout_modal.message')}</Alert>
          <Text size="md" fw={500}>{t('logout_modal.confirmation_message')}</Text>
        </Stack>
      ),
      labels: {
        confirm: t('logout_modal.confirm'),
        cancel: t('logout_modal.cancel'),
      },
      
      confirmProps: { color: 'red', rightSection: <IconLogout size={18} stroke={1.5} /> },
      onConfirm: async () => {
        await supabase.auth.signOut()
        router.refresh()
      }
    })
  }
  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
