"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

export function Showcase() {
  const t = useTranslations()

  const CASE_STUDIES = [
    {
      title: t('showcase.case1.title'),
      description: t('showcase.case1.description'),
      image: "/scenic-mountain-landscape-photography.jpg",
    },
    {
      title: t('showcase.case2.title'),
      description: t('showcase.case2.description'),
      image: "/minimalist-product-photography-shoes.jpg",
    },
    {
      title: t('showcase.case3.title'),
      description: t('showcase.case3.description'),
      image: "/stylish-portrait-photography.jpg",
    },
  ]
  return (
    <section id="showcase" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('showcase.title')}</h2>
          <p className="text-muted-foreground">{t('showcase.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {CASE_STUDIES.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-semibold">{t('showcase.viewCaseStudy')}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
