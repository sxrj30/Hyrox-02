"use client"

import { useEffect, useState } from "react"
import { SpendingAnalysis } from "@/components/spending-analysis"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Filter, Download } from "lucide-react"

export default function SpendingPage() {
  const [spendingData, setSpendingData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysisResponse, transactionsResponse] = await Promise.all([
          fetch("/api/financial-analysis"),
          fetch("/api/transactions?limit=20"),
        ])

        const analysis = await analysisResponse.json()
        const transactionData = await transactionsResponse.json()

        setSpendingData(analysis.spendingByCategory)
        setTransactions(transactionData.transactions)
      } catch (error) {
        console.error("Failed to fetch spending data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Spending Analysis</h1>
          <p className="text-muted-foreground">Track and categorize your expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {spendingData && <SpendingAnalysis spendingByCategory={spendingData} />}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {transaction.category?.charAt(0) || transaction.description?.charAt(0) || "T"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(transaction.transaction_date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category || "Other"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
