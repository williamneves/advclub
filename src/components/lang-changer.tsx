'use client'

import { useRouter, usePathname } from '@/navigation'

export default function LanguageChanger({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname, { locale: e.target.value })
  }

  return (
    <select value={locale} onChange={handleChange}>
      <option value="pt-BR">Português</option>
      <option value="en">English</option>
    </select>
  )
}
