"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface RechargeClientProps {
  user: any
}

interface RechargePackage {
  credits: number
  price: number
  bonus: number
}

export default function RechargeClient({ user }: RechargeClientProps) {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null)
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

  const handleRecharge = async () => {
    if (!selectedPackage) return

    setLoading(true)

    try {
      // 模拟充值请求
      // 在实际应用中，这里应该调用支付 API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 创建充值记录
      const response = await fetch('/api/recharge-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPackage.price,
          credits: selectedPackage.credits + selectedPackage.bonus,
          payment_method: 'Alipay',
          payment_id: `PAY${Date.now()}`,
          status: 'completed',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create recharge record')
      }

      // 更新用户余额
      await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits: selectedPackage.credits + selectedPackage.bonus,
        }),
      })

      router.push('/wallet')
    } catch (error) {
      console.error('Recharge error:', error)
      alert('Recharge failed, please try again')
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
            Back to Wallet
          </Button>
          <h1 className="text-4xl font-bold mb-3">Recharge</h1>
          <p className="text-lg text-muted-foreground">Select a recharge package to add Credits to your account</p>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Select Recharge Package</h2>
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
                    <div className="text-sm text-muted-foreground mb-4">Credits</div>
                    <div className="text-3xl font-bold mb-4">${pkg.price}</div>
                    {pkg.bonus > 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                        Bonus {pkg.bonus} Credits
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Base {pkg.credits} Credits
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
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 border-2 border-primary cursor-pointer">
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium">Credit Card</div>
                </div>
              </Card>
              <Card className="p-4 border-2 border-transparent cursor-pointer hover:border-primary/50">
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium">PayPal</div>
                </div>
              </Card>
              <Card className="p-4 border-2 border-transparent cursor-pointer hover:border-primary/50">
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium">Debit Card</div>
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
                  Processing...
                </>
              ) : (
                `Pay $${selectedPackage?.price || 0}`
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            By recharging, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>
    </div>
  )
}
