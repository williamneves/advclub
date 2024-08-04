import { GeistSans } from 'geist/font/sans'

import { Button, createTheme, DEFAULT_THEME, mergeMantineTheme, Notification, rem } from '@mantine/core'

let defaultTheme = createTheme({
  fontFamily: GeistSans.style.fontFamily,
  cursorType: 'pointer',
  primaryColor: 'indigo',
  defaultRadius: 'md',
  spacing: {
    xs: '0.65rem',
    sm: '0.875rem',
    md: '1.3rem',
    lg: '1.7rem',
    xl: '2.4rem',
  },
  fontSizes: {
    xs: '0.6rem',
    sm: '0.825rem',
    md: '1.05rem',
    lg: '1.3rem',
    xl: '1.6rem',
  },
  components: {
    Notification: Notification.extend({
      classNames: {
        root: "border-solid border border-mtn-default-border shadow-sm min-h-[60px]"
      }
    })
  },
})

defaultTheme = mergeMantineTheme(DEFAULT_THEME, defaultTheme)

export { defaultTheme }
