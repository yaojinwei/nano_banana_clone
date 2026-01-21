"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      router.replace("/pricing")
    } else {
      setLoading(false)
    }
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-16">
      <div className="container mx-auto max-w-md px-4 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your credits have been added to your account.
          </p>
        </div>
        <div className="space-y-4">
          <a href="/generator" className="block w-full">
            <button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg">
              Start Creating
            </button>
          </a>
          <a href="/wallet" className="block">
            <button className="w-full h-12 border border-input bg-background hover:bg-accent hover:text-accent-foreground font-semibold rounded-lg">
              View Wallet
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
