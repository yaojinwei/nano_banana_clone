"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Wand2, Download, Loader2, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface GeneratorClientProps {
  user: any
}

export default function GeneratorClient({ user }: GeneratorClientProps) {
  const t = useTranslations()
  const [selectedModel, setSelectedModel] = useState("nano-banana")
  const [textToImageModel, setTextToImageModel] = useState("nano-banana")
  const [prompt, setPrompt] = useState("")
  const [textToImagePrompt, setTextToImagePrompt] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTextToImageGenerating, setIsTextToImageGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [imageSize, setImageSize] = useState("1:1")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt || !uploadedImage) {
      setErrorMessage(t('generator.providePromptAndImage'))
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const base64Data = uploadedImage.split(",")[1]

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          imageBase64: "data:image/jpeg;base64," + base64Data,
          model: selectedModel, // Use the selected model from UI
          size: "1:1",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('generator.failedToGenerate'))
      }

      if (data.data && data.data.length > 0) {
        const images = data.data.map((item: any) => item.url)
        setGeneratedImages(images)
      } else {
        throw new Error(t('generator.noImagesGenerated'))
      }
    } catch (error) {
      console.error("Error generating image:", error)
      setErrorMessage(error instanceof Error ? error.message : t('generator.failedToGenerate'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = "generated-image-" + (index + 1) + ".png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Error downloading image:", error)
      window.open(imageUrl, "_blank")
    }
  }

  const handleTextToImageGenerate = async () => {
    if (!textToImagePrompt) {
      setErrorMessage(t('generator.providePrompt'))
      return
    }

    setIsTextToImageGenerating(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textToImagePrompt,
          model: textToImageModel, // Use the selected model from UI
          size: imageSize,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('generator.failedToGenerate'))
      }

      if (data.data && data.data.length > 0) {
        const images = data.data.map((item: any) => item.url)
        setGeneratedImages(images)
      } else {
        throw new Error(t('generator.noImagesGenerated'))
      }
    } catch (error) {
      console.error("Error generating image:", error)
      setErrorMessage(error instanceof Error ? error.message : t('generator.failedToGenerate'))
    } finally {
      setIsTextToImageGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('generator.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('generator.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <Tabs defaultValue="image-edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="image-edit">{t('generator.imageEdit')}</TabsTrigger>
                  <TabsTrigger value="text-to-image">{t('generator.textToImage')}</TabsTrigger>
                </TabsList>

                <TabsContent value="image-edit" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-base font-semibold">
                      {t('generator.promptLabel')}
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder={t('generator.promptPlaceholder')}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-base font-semibold">
                      {t('generator.modelLabel')}
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger id="model">
                        <SelectValue placeholder={t('generator.selectModel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nano-banana">{t('models.nanoBanana')}</SelectItem>
                        <SelectItem value="nano-banana-pro">{t('models.nanoBananaPro')}</SelectItem>
                        <SelectItem value="seedream-4">{t('models.seedream4')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {t('generator.modelDescription')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">{t('generator.imageLabel')}</Label>
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-card"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt={t('generator.uploadedAlt')}
                          className="max-h-48 mx-auto rounded-lg"
                        />
                      ) : (
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium">{t('generator.addImage')}</p>
                          <p className="text-xs text-muted-foreground">{t('generator.maxSize')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt || !uploadedImage}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('generator.generatingButton')}
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        {t('generator.generateNow2Credits')}
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="text-to-image" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-to-image-prompt" className="text-base font-semibold">
                      {t('generator.describeImage')}
                    </Label>
                    <Textarea
                      id="text-to-image-prompt"
                      placeholder={t('generator.textToImagePlaceholder')}
                      value={textToImagePrompt}
                      onChange={(e) => setTextToImagePrompt(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('generator.beDescriptive')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-model" className="text-base font-semibold">
                      {t('generator.modelLabel')}
                    </Label>
                    <Select value={textToImageModel} onValueChange={setTextToImageModel}>
                      <SelectTrigger id="text-model">
                        <SelectValue placeholder={t('generator.selectModel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nano-banana">{t('models.nanoBanana')}</SelectItem>
                        <SelectItem value="nano-banana-pro">{t('models.nanoBananaPro')}</SelectItem>
                        <SelectItem value="seedream-4">{t('models.seedream4')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {t('generator.modelDescription')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-size" className="text-base font-semibold">
                      {t('generator.imageSize')}
                    </Label>
                    <Select value={imageSize} onValueChange={setImageSize}>
                      <SelectTrigger id="image-size">
                        <SelectValue placeholder={t('generator.selectImageSize')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">{t('generator.aspectRatios.1:1')}</SelectItem>
                        <SelectItem value="16:9">{t('generator.aspectRatios.16:9')}</SelectItem>
                        <SelectItem value="9:16">{t('generator.aspectRatios.9:16')}</SelectItem>
                        <SelectItem value="4:3">{t('generator.aspectRatios.4:3')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {t('generator.sizeDescription')}
                    </p>
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                    onClick={handleTextToImageGenerate}
                    disabled={isTextToImageGenerating || !textToImagePrompt}
                  >
                    {isTextToImageGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('generator.generatingButton')}
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        {t('generator.generateImage3Credits')}
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="p-6 bg-secondary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>💡</span> {t('generator.generationTips')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('generator.tip1')}</li>
                <li>• {t('generator.tip2')}</li>
                <li>• {t('generator.tip3')}</li>
              </ul>
            </Card>
          </div>

          <div>
            <Card className="p-6 min-h-[600px]">
              <h2 className="text-xl font-semibold mb-4">{t('generator.outputGallery')}</h2>

              {errorMessage ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3 p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-destructive font-medium">{errorMessage}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setErrorMessage(null)}
                    >
                      {t('generator.dismiss')}
                    </Button>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border">
                      <img src={img} alt={t('generator.generatedAlt') + " " + (idx + 1)} className="w-full h-auto" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(img, idx)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t('usage.download')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wand2 className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('generator.readyForGeneration')}</h3>
                    <p className="text-muted-foreground">{t('generator.enterPrompt')}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
