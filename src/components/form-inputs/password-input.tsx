'use client'

import type { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import type { InputHTMLAttributes } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { PasswordInput as PasswordInputComponent } from '../password-input'
import { type InputProps } from '../ui/input'

interface TextInputProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  name: Path<TFieldValues>
  label: string
  description?: string
  inputProps?: InputProps
}

export function PasswordInput<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  inputProps,
}: TextInputProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <PasswordInputComponent {...field} {...inputProps} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
