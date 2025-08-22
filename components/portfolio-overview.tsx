"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Plus, BarChart3, PieChart } from "lucide-react"
import type { PortfolioPerformance } from "@/lib/investment-planning"

interface Investment {
  id: string
  symbol: string
  name: string
  shares: number
  purchase_price: number
  current_price: number
  investment_type: string
  purchase_date: string
}

interface PortfolioOverviewProps {
  investments: Investment[]
  performance: PortfolioPerformance
  allocationByType: Record<string, number>
}

export function PortfolioOverview({ investments, performance, allocationByType }: PortfolioOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? "+" : ""
    return `${sign}${percentage.toFixed(2)}%`
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? "text-primary" : "text-destructive"
  }

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-primary" />
    ) : (
      <TrendingDown className="w-4 h-4 text-destructive" />
    )
  }

  const allocationEntries = Object.entries(allocationByType).sort(([, a], [, b]) => b - a)

  if (investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Your Portfolio
          </CardTitle>
          <CardDescription>Track your investments and portfolio performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Start Building Your Portfolio</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your first investment to begin tracking your portfolio performance and get personalized insights.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performance.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {investments.length} investment{investments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {getPerformanceIcon(performance.totalGain)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(performance.totalGain)}`}>
              {formatCurrency(performance.totalGain)}
            </div>
            <p className={`text-xs ${getPerformanceColor(performance.totalGainPercentage)}`}>
              {formatPercentage(performance.totalGainPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day Change</CardTitle>
            {getPerformanceIcon(performance.dayChange)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(performance.dayChange)}`}>
              {formatCurrency(performance.dayChange)}
            </div>
            <p className={`text-xs ${getPerformanceColor(performance.dayChangePercentage)}`}>
              {formatPercentage(performance.dayChangePercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.diversificationScore.toFixed(0)}/100</div>
            <Progress value={performance.diversificationScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Your portfolio distribution by investment type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allocationEntries.map(([type, value]) => {
            const percentage = (value / performance.totalValue) * 100
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{type.replace("_", " ")}</span>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(value)}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Individual Holdings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Individual investments in your portfolio</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment) => {
              const currentValue = investment.shares * investment.current_price
              const costBasis = investment.shares * investment.purchase_price
              const gain = currentValue - costBasis
              const gainPercentage = (gain / costBasis) * 100

              return (
                <div
                  key={investment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{investment.symbol}</div>
                      <div className="text-sm text-muted-foreground">{investment.name}</div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {investment.investment_type.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(currentValue)}</div>
                    <div className={`text-sm ${getPerformanceColor(gain)}`}>
                      {formatCurrency(gain)} ({formatPercentage(gainPercentage)})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {investment.shares} shares @ {formatCurrency(investment.current_price)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
