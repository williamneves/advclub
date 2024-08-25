import { DatePickerInput, DatePicker } from '@mantine/dates'
import { GeistSans } from 'geist/font/sans'

import {
  Button,
  createTheme,
  DEFAULT_THEME,
  Input,
  TextInput,
  mergeMantineTheme,
  Notification,
  rem,
  PasswordInput,
  InputWrapper,
} from '@mantine/core'

let defaultTheme = createTheme({
  fontFamily: GeistSans.style.fontFamily,
  cursorType: 'pointer',
  primaryColor: 'indigo',
  defaultRadius: 'md',
  spacing: {
    xs: '0.75rem',
    sm: '0.925rem',
    md: '1.35rem',
    lg: '1.8rem',
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
        root: 'border-solid border border-mtn-default-border shadow-sm min-h-[60px]',
      },
    }),
    // Input: Input.extend({
    //   defaultProps: {
    //     size: 'md',
    //   },
    // }),
    // InputWrapper: InputWrapper.extend({
    //   defaultProps: {
    //     size: 'md',
    //   },
    // }),
    // TextInput: TextInput.extend({
    //   defaultProps: {
    //     size: 'md',
    //   },
    // }),
    // PasswordInput: PasswordInput.extend({
    //   defaultProps: {
    //     size: 'md',
    //   },
    // }),
    // DatePicker: DatePicker.extend({
    //   defaultProps: {
    //     size: 'md',
    //   },
    // }),
    // DatePickerInput: DatePickerInput.extend({
    //   defaultProps: {
    //     size: 'md',
    //   },
    // }),
  },
})

defaultTheme = mergeMantineTheme(DEFAULT_THEME, defaultTheme)

export { defaultTheme }
