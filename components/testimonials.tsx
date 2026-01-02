import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "Content Creator",
    text: "BananaEdit is literally the fastest editor I've ever used. The background removal is like magic. Pure banana bliss!",
    avatar: "/smiling-man-portrait.png",
  },
  {
    name: "Sarah Chen",
    role: "Shopify Store Owner",
    text: "I used to spend hours in Photoshop. Now I just drop my product shots into BananaEdit and they're ready for my store in seconds.",
    avatar: "/professional-woman-portrait.png",
  },
  {
    name: "Marcus Thorne",
    role: "Photography Enthusiast",
    text: "The interface is so clean. No clutter, just the tools you need. It's the only editor that doesn't make me want to pull my hair out.",
    avatar: "/cool-guy-with-glasses.jpg",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by Creators</h2>
          <p className="text-muted-foreground">Join thousands of people who've made the switch to the yellow side.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-card p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={t.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{t.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <p className="text-muted-foreground italic leading-relaxed">"{t.text}"</p>
              <div className="mt-6 flex gap-1 text-primary">{"★".repeat(5)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
