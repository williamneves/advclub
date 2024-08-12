'use client'

// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css'
import '../styles/globals.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/spotlight/styles.css'
import '@mantine/dropzone/styles.css'

import React from 'react'
import type { MantineProviderProps } from '@mantine/core'
import type { ModalsProviderProps } from '@mantine/modals'
import type { NotificationsProps } from '@mantine/notifications'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { defaultTheme } from './theme'

interface ThemeProviderProps {
  children: React.ReactNode
  mantineProviderProps?: Partial<MantineProviderProps>
  notificationsProps?: Partial<NotificationsProps>
  modalsProviderProps?: Partial<ModalsProviderProps>
}

export const BaseThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <MantineProvider theme={defaultTheme}>
      <Notifications position="top-center" limit={6} mt={60} />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  )
}
