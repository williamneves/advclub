'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { GiBrazilFlag, GiUsaFlag } from "react-icons/gi"
import { Group, Menu, ThemeIcon } from '@mantine/core'
import Image from 'next/image'
import BRAZIL from '@/assets/images/brazil_flag.png'
import USA from '@/assets/images/usa_flag.png'
import { cn } from '@/lib/utils'
const languages = [
  { code: 'en', name: 'English', flag: USA },
  { code: 'pt-BR', name: 'Português', flag: BRAZIL },
] as const

export function LanguageSelector() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (value: string) => {
    router.push(pathname, { locale: value })
  }

  const flag = languages.find((lang) => lang.code === locale)?.flag ?? USA

  return (
    <Menu position="bottom-end" withArrow withinPortal shadow="md">
      <Menu.Target>
        <div
          className={cn(
            'group size-9 cursor-pointer overflow-hidden rounded-md ring-2 ring-offset-2 ring-offset-background transition-all duration-300 ease-in-out hover:ring-offset-0',
            {
              'ring-red-700/80': locale === 'en',
              'ring-green-600/80': locale === 'pt-BR',
            },
          )}
        >
          <Image
            src={flag}
            alt="flag"
            className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-110"
          />
        </div>
      </Menu.Target>
      <Menu.Dropdown>
        {languages.map((lang) => (
          <Menu.Item key={lang.code} onClick={() => handleChange(lang.code)}>
            <Group align="center" gap={'8'}>
              <div
                className={cn(
                  'size-6 cursor-pointer overflow-hidden rounded-md ring-2 ring-offset-2 ring-offset-background',
                  {
                    'ring-red-500': lang.code === 'en',
                    'ring-green-500': lang.code === 'pt-BR',
                  },
                )}
              >
                <Image
                  src={lang.flag}
                  alt="flag"
                  className="h-full w-full object-cover transition-all duration-300 ease-in-out hover:scale-110"
                />
              </div>
              {lang.name}
            </Group>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )

  // return (
  //   <DropdownMenu>
  //     <DropdownMenuTrigger asChild>
  //       <Button
  //         variant="outline"
  //         className="mx-2 size-10 rounded-lg px-3 py-0 text-xl"
  //       >
  //         {languages.find((lang) => lang.code === locale)?.flag ?? '🌐'}
  //       </Button>
  //     </DropdownMenuTrigger>
  //     <DropdownMenuContent className="w-56">
  //       <DropdownMenuLabel>Select Language</DropdownMenuLabel>
  //       <DropdownMenuSeparator />
  //       <DropdownMenuRadioGroup value={locale} onValueChange={handleChange}>
  //         {languages.map((lang) => (
  //           <DropdownMenuRadioItem key={lang.code} value={lang.code}>
  //             <div className="flex w-full items-center justify-between">
  //               <div className="flex items-center space-x-2">
  //                 <span className="text-2xl">{lang.flag}</span>
  //                 <span>{lang.name}</span>
  //               </div>
  //               {locale === lang.code ? (
  //                 <Check className="h-4 w-4 text-primary" />
  //               ) : (
  //                 <X className="h-4 w-4 text-muted-foreground" />
  //               )}
  //             </div>
  //           </DropdownMenuRadioItem>
  //         ))}
  //       </DropdownMenuRadioGroup>
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // )
}
