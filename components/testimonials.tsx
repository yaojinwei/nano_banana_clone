"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "next-intl"

export function Testimonials() {
  const t = useTranslations()

  const TESTIMONIALS = [
    {
      name: t('testimonials.review1.author'),
      role: t('testimonials.review1.role'),
      text: t('testimonials.review1.content'),
      avatar: "/smiling-man-portrait.png",
    },
    {
      name: t('testimonials.review2.author'),
      role: t('testimonials.review2.role'),
      text: t('testimonials.review2.content'),
      avatar: "/professional-woman-portrait.png",
    },
    {
      name: t('testimonials.review3.author'),
      role: t('testimonials.review3.role'),
      text: t('testimonials.review3.content'),
      avatar: "/cool-guy-with-glasses.jpg",
    },
  ]
  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('testimonials.title')}</h2>
          <p className="text-muted-foreground">{t('testimonials.subtitle')}</p>
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
