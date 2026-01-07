"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet, CreditCard, History } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface WalletClientProps {
  user: any
}

export default function WalletClient({ user }: WalletClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/wallet/balance')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch wallet balance')
      }

      const data = await response.json()
      setBalance(data.balance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet balance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  const handleRecharge = () => {
    router.push('/wallet/recharge')
  }

  const handleViewRechargeRecords = () => {
    router.push('/wallet/recharge-records')
  }

  const rechargePackages = [
    { credits: 100, price: 10, bonus: 0 },
    { credits: 500, price: 45, bonus: 50 },
    { credits: 1000, price: 80, bonus: 200 },
    { credits: 5000, price: 350, bonus: 1500 },
  ]

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{t('wallet.myWallet')}</h1>
          <p className="text-lg text-muted-foreground">{t('wallet.viewBalanceRecords')}</p>
        </div>

        {/* Balance Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">{t('wallet.currentBalance')}</p>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : error ? (
                <p className="text-destructive">{t('wallet.failedToLoad')}</p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">{balance}</span>
                  <span className="text-xl text-muted-foreground">{t('wallet.credits')}</span>
                </div>
              )}
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleRecharge}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{t('wallet.recharge')}</h3>
                <p className="text-sm text-muted-foreground">{t('wallet.addCredits')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewRechargeRecords}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <History className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{t('wallet.rechargeHistory')}</h3>
                <p className="text-sm text-muted-foreground">{t('wallet.viewHistoricalRecords')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recharge Packages */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">{t('wallet.rechargePackages')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rechargePackages.map((pkg) => (
              <Card
                key={pkg.credits}
                className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary"
                onClick={handleRecharge}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{pkg.credits}</div>
                  <div className="text-sm text-muted-foreground mb-4">{t('wallet.credits')}</div>
                  <div className="text-2xl font-bold mb-4">${pkg.price}</div>
                  {pkg.bonus > 0 && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Bonus {pkg.bonus} {t('wallet.credits')}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
