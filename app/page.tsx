import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Showcase } from "@/components/showcase"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Showcase />
        <Testimonials />
        <FAQ />

        {/* Final CTA */}
        <section className="py-24 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to start editing?</h2>
            <p className="text-xl text-muted-foreground mb-10">Join 50,000+ creators who edit with a smile.</p>
            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/40" asChild>
              <Link href="/generator">Get Started for Free 🍌</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl">
              <span>🍌</span> BananaEdit
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary">
                Contact Us
              </a>
            </div>
            <div className="text-sm text-muted-foreground">© 2026 BananaEdit. Stay Fresh.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
