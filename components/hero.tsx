"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon } from "lucide-react"
import { useTranslations } from "next-intl"

export function Hero() {
  const t = useTranslations()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("[v0] File selected:", file.name)
      // Implementation for editor redirect or processing would go here
    }
  }

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-semibold mb-6 animate-bounce">
          <span>🍌</span> {t('hero.badge')}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-balance">
          {t('hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
          {t('hero.subtitle')}
        </p>

        <div
          className={`relative group max-w-2xl mx-auto p-12 rounded-3xl border-4 border-dashed transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted hover:border-primary/50 bg-card shadow-xl"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) console.log("[v0] File dropped:", file.name)
          }}
          onClick={handleUploadClick}
        >
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
          <div className="flex flex-col items-center gap-4 cursor-pointer">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold">{t('hero.uploadTitle')}</h3>
            <p className="text-muted-foreground mb-4">{t('hero.uploadDescription')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="px-8 shadow-lg shadow-primary/20" onClick={handleUploadClick}>
                {t('hero.chooseImage')}
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <ImageIcon className="w-4 h-4" /> {t('hero.trySample')}
              </Button>
            </div>
          </div>

          {/* Decorative banana shapes */}
          <div className="absolute -top-6 -right-6 w-16 h-16 opacity-20 pointer-events-none rotate-12">🍌</div>
          <div className="absolute -bottom-6 -left-6 w-16 h-16 opacity-20 pointer-events-none -rotate-12">🍌</div>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-bold text-lg">NETFLIX</div>
          <div className="flex items-center gap-2 font-bold text-lg">box</div>
          <div className="flex items-center gap-2 font-bold text-lg">ebay</div>
          <div className="flex items-center gap-2 font-bold text-lg">Tripadvisor</div>
        </div>
      </div>
    </section>
  )
}
