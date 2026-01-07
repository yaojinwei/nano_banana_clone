"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface RechargeRecord {
  id: string
  amount: number
  credits: number
  payment_method: string | null
  payment_id: string | null
  status: string
  created_at: string
}

interface PaginationData {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface RechargeRecordsClientProps {
  user: any
}

export default function RechargeRecordsClient({ user }: RechargeRecordsClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const [records, setRecords] = useState<RechargeRecord[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async (page: number, pageSize: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recharge-records?page=${page}&pageSize=${pageSize}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch recharge records')
      }

      const data = await response.json()
      setRecords(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recharge records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(1, 10)
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchRecords(newPage, pagination.pageSize)
    }
  }

  const handlePageSizeChange = (newPageSize: string) => {
    fetchRecords(1, parseInt(newPageSize))
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('rechargeRecords.pending')
      case 'completed':
        return t('rechargeRecords.completed')
      case 'failed':
        return t('rechargeRecords.failed')
      case 'cancelled':
        return t('rechargeRecords.cancelled')
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return ''
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/wallet')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('rechargeRecords.backToWallet')}
          </Button>
          <h1 className="text-4xl font-bold mb-3">{t('rechargeRecords.rechargeHistory')}</h1>
          <p className="text-lg text-muted-foreground">{t('wallet.viewHistoricalRecords')}</p>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button
                onClick={() => fetchRecords(pagination.page, pagination.pageSize)}
                variant="outline"
              >
                {t('common.retry')}
              </Button>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('rechargeRecords.noRecords')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">{t('rechargeRecords.time')}</th>
                      <th className="text-left py-3 px-4 font-semibold">{t('rechargeRecords.amount')}</th>
                      <th className="text-left py-3 px-4 font-semibold">{t('rechargeRecords.credits')}</th>
                      <th className="text-left py-3 px-4 font-semibold">{t('rechargeRecords.paymentMethod')}</th>
                      <th className="text-left py-3 px-4 font-semibold">{t('rechargeRecords.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm">{formatDate(record.created_at)}</td>
                        <td className="py-3 px-4 text-sm font-medium">${record.amount}</td>
                        <td className="py-3 px-4 text-sm font-medium">{record.credits}</td>
                        <td className="py-3 px-4 text-sm">{record.payment_method || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('rechargeRecords.itemsPerPage')}</span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t('rechargeRecords.pageOf', {
                      page: pagination.page,
                      totalPages: pagination.totalPages,
                      total: pagination.total
                    })}
                  </span>
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('rechargeRecords.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      {t('rechargeRecords.next')}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
