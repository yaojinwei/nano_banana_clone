"use client"

import { useRouter, usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { localeNames, locales, type Locale } from "@/i18n/config"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLocaleChange = (newLocale: string) => {
    // Build the path without locale prefix
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      segments.shift()
    }
    const basePath = segments.length > 0 ? `/${segments.join("/")}` : '/'

    // Build new path with locale prefix - always include the locale in the URL
    const newPath = `/${newLocale}${basePath}`

    // Set the next-intl locale cookie to the new locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`

    // Force page reload with new locale
    window.location.replace(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="w-4 h-4" />
          <span className="hidden md:inline">{localeNames[locale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(localeNames).map(([key, name]) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => handleLocaleChange(key)}
            disabled={key === locale}
            className={key === locale ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          >
            {name}
            {key === locale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
