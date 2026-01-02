"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface UsageRecord {
  id: string
  type: string
  model: string
  prompt: string | null
  image_url: string | null
  credits_used: number
  created_at: string
}

interface PaginationData {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface UsageRecordsClientProps {
  user: any
}

export default function UsageRecordsClient({ user }: UsageRecordsClientProps) {
  const router = useRouter()
  const [records, setRecords] = useState<UsageRecord[]>([])
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
      const response = await fetch(`/api/usage-records?page=${page}&pageSize=${pageSize}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch usage records')
      }

      const data = await response.json()
      setRecords(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch usage records')
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text_to_image':
        return 'Text to Image'
      case 'image_to_image':
        return 'Image to Image'
      default:
        return type
    }
  }

  const getModelLabel = (model: string) => {
    switch (model) {
      case 'nano_banana':
        return 'Nano Banana'
      case 'nano_banana_pro':
        return 'Nano Banana Pro'
      case 'seedream_4':
        return 'SeeDream 4'
      default:
        return model
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
          <h1 className="text-4xl font-bold mb-3">Usage History</h1>
          <p className="text-lg text-muted-foreground">View your historical usage records</p>
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
                Retry
              </Button>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No usage records yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Time</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Model</th>
                      <th className="text-right py-3 px-4 font-semibold">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm">{formatDate(record.created_at)}</td>
                        <td className="py-3 px-4 text-sm">{getTypeLabel(record.type)}</td>
                        <td className="py-3 px-4 text-sm">{getModelLabel(record.model)}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{record.credits_used}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Items per page:</span>
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
                    Page {pagination.page} of {pagination.totalPages}, {pagination.total} total
                  </span>
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
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
