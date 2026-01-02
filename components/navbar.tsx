import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-2xl">🍌</span>
          <span>BananaEdit</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#showcase" className="hover:text-primary transition-colors">
            Showcase
          </Link>
          <Link href="#testimonials" className="hover:text-primary transition-colors">
            Reviews
          </Link>
          <Link href="#faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" asChild>
            <Link href="/generator">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
