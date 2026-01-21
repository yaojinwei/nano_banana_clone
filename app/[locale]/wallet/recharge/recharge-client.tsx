"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface RechargeClientProps {
  user: any
  locale: string
}

interface RechargePackage {
  credits: number
  price: number
  bonus: number
}

export default function RechargeClient({ user, locale }: RechargeClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card')
  const [loading, setLoading] = useState(false)

  const rechargePackages: RechargePackage[] = [
    { credits: 100, price: 10, bonus: 0 },
    { credits: 500, price: 45, bonus: 50 },
    { credits: 1000, price: 80, bonus: 200 },
    { credits: 5000, price: 350, bonus: 1500 },
  ]

  const handleSelectPackage = (pkg: RechargePackage) => {
    setSelectedPackage(pkg)
  }

  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method)
  }

  const handleRecharge = async () => {
    if (!selectedPackage || !user) return

    setLoading(true)

    try {
      // 调用 Creem 支付 API 创建 checkout session
      const response = await fetch('/api/creem/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: `credits_${selectedPackage.credits}`,
          billingCycle: 'onetime',
          userEmail: user.email,
          userId: user.id,
          amount: selectedPackage.price,
          credits: selectedPackage.credits, // 发送基础积分，不是总计积分
          locale: locale, // 添加语言参数
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
        if (errorData.error === 'Invalid credit package') {
          alert('无效的积分套餐')
          return
        }
        if (response.status === 500) {
          alert('服务器错误，请检查 Creem API 配置。查看 CREEM_SETUP_GUIDE.md')
          return
        }

        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()

      // 跳转到 Creem 支付页面
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Recharge error:', error)

      // 用户友好的错误提示
      if (error instanceof Error) {
        alert(`支付失败：${error.message}\n\n请确保已配置 Creem API（查看 CREEM_SETUP_GUIDE.md）`)
      } else {
        alert(t('recharge.checkoutError') || 'Failed to create checkout session. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/wallet')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('recharge.backToWallet')}
          </Button>
          <h1 className="text-4xl font-bold mb-3">{t('recharge.recharge')}</h1>
          <p className="text-lg text-muted-foreground">{t('recharge.selectPackage')}</p>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">{t('recharge.selectRechargePackage')}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {rechargePackages.map((pkg) => {
              const totalCredits = pkg.credits + pkg.bonus
              const isSelected = selectedPackage?.credits === pkg.credits

              return (
                <Card
                  key={pkg.credits}
                  className={`p-6 cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-transparent hover:border-primary/50 hover:shadow-md'
                  }`}
                  onClick={() => handleSelectPackage(pkg)}
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{totalCredits}</div>
                    <div className="text-sm text-muted-foreground mb-4">{t('wallet.credits')}</div>
                    <div className="text-3xl font-bold mb-4">${pkg.price}</div>
                    {pkg.bonus > 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                        Bonus {pkg.bonus} {t('wallet.credits')}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Base {pkg.credits} {t('wallet.credits')}
                    </div>
                    {isSelected && (
                      <div className="mt-4 flex items-center justify-center text-primary">
                        <Check className="w-5 h-5 mr-1" />
                        Selected
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('recharge.paymentMethod')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card
                className={`p-4 border-2 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'credit_card'
                    ? 'border-primary shadow-lg'
                    : 'border-transparent hover:border-primary/50'
                }`}
                onClick={() => handleSelectPaymentMethod('credit_card')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium">{t('recharge.creditCard')}</div>
                  {selectedPaymentMethod === 'credit_card' && (
                    <div className="mt-2 flex items-center justify-center text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Card>
              <Card
                className={`p-4 border-2 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'paypal'
                    ? 'border-primary shadow-lg'
                    : 'border-transparent hover:border-primary/50'
                }`}
                onClick={() => handleSelectPaymentMethod('paypal')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium">{t('recharge.payPal')}</div>
                  {selectedPaymentMethod === 'paypal' && (
                    <div className="mt-2 flex items-center justify-center text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Card>
              <Card
                className={`p-4 border-2 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'debit_card'
                    ? 'border-primary shadow-lg'
                    : 'border-transparent hover:border-primary/50'
                }`}
                onClick={() => handleSelectPaymentMethod('debit_card')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium">{t('recharge.debitCard')}</div>
                  {selectedPaymentMethod === 'debit_card' && (
                    <div className="mt-2 flex items-center justify-center text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              className="flex-1 h-12 text-lg font-semibold"
              onClick={handleRecharge}
              disabled={!selectedPackage || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('recharge.processing')}
                </>
              ) : (
                `Pay $${selectedPackage?.price || 0}`
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            {t('recharge.agreeTerms')}
          </p>
        </Card>
      </div>
    </div>
  )
}
