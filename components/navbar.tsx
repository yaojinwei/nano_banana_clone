"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User, LogOut, Wallet, History } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import LanguageSwitcher from "@/components/language-switcher"
import { useTranslations } from "next-intl"

export function Navbar() {
  const t = useTranslations()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const checkConfig = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const configured = supabaseUrl && supabaseUrl !== 'your-supabase-project-url'
      setIsConfigured(!!configured)

      if (!configured) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
      }

      getUser()

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    }

    checkConfig()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    if (!supabase) return

    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleCreateImage = () => {
    if (user) {
      router.push('/generator')
    } else {
      router.push('/login')
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-2xl">🍌</span>
          <span>BananaEdit</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">
            {t('nav.features')}
          </Link>
          <Link href="#showcase" className="hover:text-primary transition-colors">
            {t('nav.pricing')}
          </Link>
          <Link href="#testimonials" className="hover:text-primary transition-colors">
            {t('nav.about')}
          </Link>
          <Link href="#faq" className="hover:text-primary transition-colors">
            {t('nav.faq')}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {mounted && <LanguageSwitcher />}
          <Button
            onClick={handleCreateImage}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {t('nav.createImage')}
          </Button>

          {mounted && !loading && isConfigured && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.name || "User"} />
                    <AvatarFallback>
                      {user.user_metadata.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/wallet" className="flex items-center">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>{t('nav.wallet')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/usage" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    <span>{t('nav.usage')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('common.logOut')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : mounted && !loading && !user ? (
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/login">{t('nav.login')}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
