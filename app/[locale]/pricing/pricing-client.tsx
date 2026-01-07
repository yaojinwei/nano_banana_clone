"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Zap } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  monthlyCredits: number
  yearlyCredits: number
  features: string[]
  popular?: boolean
}

export default function PricingClient() {
  const t = useTranslations()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const plans: PricingPlan[] = [
    {
      id: "basic",
      name: t("pricing.plans.basic.name"),
      description: t("pricing.plans.basic.description"),
      monthlyPrice: 12,
      yearlyPrice: 144,
      monthlyCredits: 100,
      yearlyCredits: 2400,
      features: [
        t("pricing.plans.basic.features.0"),
        t("pricing.plans.basic.features.1"),
        t("pricing.plans.basic.features.2"),
        t("pricing.plans.basic.features.3"),
        t("pricing.plans.basic.features.4"),
        t("pricing.plans.basic.features.5"),
      ],
    },
    {
      id: "pro",
      name: t("pricing.plans.pro.name"),
      description: t("pricing.plans.pro.description"),
      monthlyPrice: 19.5,
      yearlyPrice: 234,
      monthlyCredits: 400,
      yearlyCredits: 9600,
      features: [
        t("pricing.plans.pro.features.0"),
        t("pricing.plans.pro.features.1"),
        t("pricing.plans.pro.features.2"),
        t("pricing.plans.pro.features.3"),
        t("pricing.plans.pro.features.4"),
        t("pricing.plans.pro.features.5"),
        t("pricing.plans.pro.features.6"),
        t("pricing.plans.pro.features.7"),
        t("pricing.plans.pro.features.8"),
        t("pricing.plans.pro.features.9"),
      ],
      popular: true,
    },
    {
      id: "max",
      name: t("pricing.plans.max.name"),
      description: t("pricing.plans.max.description"),
      monthlyPrice: 80,
      yearlyPrice: 960,
      monthlyCredits: 1800,
      yearlyCredits: 43200,
      features: [
        t("pricing.plans.max.features.0"),
        t("pricing.plans.max.features.1"),
        t("pricing.plans.max.features.2"),
        t("pricing.plans.max.features.3"),
        t("pricing.plans.max.features.4"),
        t("pricing.plans.max.features.5"),
        t("pricing.plans.max.features.6"),
        t("pricing.plans.max.features.7"),
        t("pricing.plans.max.features.8"),
        t("pricing.plans.max.features.9"),
      ],
    },
  ]

  const handlePurchase = async (plan: PricingPlan) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)
    setSelectedPlan(plan.id)

    try {
      const response = await fetch("/api/creem/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          userEmail: user.email,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Checkout API error:', errorData)

        // 提供更详细的错误信息
        if (errorData.error === 'Creem API key not configured') {
          alert('请先配置 Creem API 密钥。查看 CREEM_SETUP_GUIDE.md 了解详细步骤。')
          return
        }
        if (errorData.error === 'Invalid plan or billing cycle') {
          alert('无效的计划或计费周期')
          return
        }
        if (response.status === 500) {
          alert('服务器错误，请检查 Creem API 配置。查看 CREEM_SETUP_GUIDE.md')
          return
        }

        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Checkout error:", error)

      // 用户友好的错误提示
      if (error instanceof Error) {
        alert(`支付失败：${error.message}\n\n请确保已配置 Creem API（查看 CREEM_SETUP_GUIDE.md）`)
      } else {
        alert(t("pricing.checkoutError"))
      }
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const formatPrice = (price: number, cycle: "monthly" | "yearly") => {
    if (cycle === "yearly") {
      return `$${price}`
    }
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">{t("pricing.limitedOffer")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("pricing.title")}</h1>
          <p className="text-xl text-muted-foreground mb-8">{t("pricing.subtitle")}</p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("pricing.monthly")}
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("pricing.yearly")}
              <span className="ml-2 text-xs text-primary">{t("pricing.save50")}</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
            const credits = billingCycle === "monthly" ? plan.monthlyCredits : plan.yearlyCredits
            const priceDisplay = billingCycle === "monthly" ? `/mo` : `/year`

            return (
              <Card
                key={plan.id}
                className={`relative p-8 hover:shadow-lg transition-all ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                      {t("pricing.mostPopular")}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">{formatPrice(price, billingCycle)}</span>
                    <span className="text-muted-foreground">{priceDisplay}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {billingCycle === "yearly" ? (
                      <>
                        {credits} {t("pricing.creditsPerYear")}
                      </>
                    ) : (
                      <>
                        {credits} {t("pricing.creditsPerMonth")}
                      </>
                    )}
                  </p>
                </div>

                <Button
                  className={`w-full h-12 text-base font-semibold mb-8 ${
                    plan.popular ? "bg-primary hover:bg-primary/90" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(plan)}
                  disabled={loading && selectedPlan === plan.id}
                >
                  {loading && selectedPlan === plan.id ? t("pricing.processing") : t("pricing.getStarted")}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{t("pricing.faq.title")}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold mb-2">{t(`pricing.faq.q${i}.question`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`pricing.faq.q${i}.answer`)}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
