"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check } from "lucide-react"
import { themes, type ThemeConfig } from "@/lib/themes"
import { useTranslations } from "next-intl"

export function ThemeSwitcher() {
  const t = useTranslations()
  const [currentTheme, setCurrentTheme] = useState<string>("banana")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage
    const savedTheme = localStorage.getItem("color-theme") || "banana"
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (themeKey: string) => {
    const theme = themes.find(t => t.key === themeKey) || themes[0]
    document.documentElement.setAttribute("data-theme", themeKey)
    localStorage.setItem("color-theme", themeKey)
  }

  const handleThemeChange = (themeKey: string) => {
    setCurrentTheme(themeKey)
    applyTheme(themeKey)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Palette className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" title={t('themes.title')}>
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.key}
            onClick={() => handleThemeChange(theme.key)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div
              className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
              style={{ background: theme.preview }}
            />
            <span className="flex-1">{t(`themes.${theme.key}`)}</span>
            {currentTheme === theme.key && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
