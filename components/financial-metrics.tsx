"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, CreditCard, Shield } from "lucide-react"
import type { FinancialMetrics } from "@/lib/financial-analysis"

interface FinancialMetricsProps {
  metrics: FinancialMetrics
}

export function FinancialMetricsDisplay({ metrics }: FinancialMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-primary"
    if (value >= thresholds.warning) return "text-yellow-600"
    return "text-destructive"
  }

  const getProgressColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "bg-primary"
    if (value >= thresholds.warning) return "bg-yellow-500"
    return "bg-destructive"
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Net Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          {metrics.netIncome >= 0 ? (
            <TrendingUp className="h-4 w-4 text-primary" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.netIncome)}</div>
          <p className="text-xs text-muted-foreground">Last 3 months</p>
          <div className="mt-2 text-xs">
            <span className="text-muted-foreground">Income: </span>
            <span className="font-medium">{formatCurrency(metrics.totalIncome)}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Expenses: </span>
            <span className="font-medium">{formatCurrency(metrics.totalExpenses)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.savingsRate, { good: 20, warning: 10 })}`}>
            {metrics.savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Target: 20%+</p>
          <div className="mt-3">
            <Progress value={Math.min(metrics.savingsRate, 100)} className="h-2" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {metrics.savingsRate >= 20
              ? "Excellent!"
              : metrics.savingsRate >= 10
                ? "Good progress"
                : "Needs improvement"}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Fund */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getMetricColor(metrics.emergencyFundMonths, { good: 6, warning: 3 })}`}>
            {metrics.emergencyFundMonths.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">Months of expenses</p>
          <div className="mt-3">
            <Progress value={Math.min((metrics.emergencyFundMonths / 6) * 100, 100)} className="h-2" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Target: 3-6 months</div>
        </CardContent>
      </Card>

      {/* Debt-to-Income Ratio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Debt-to-Income</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${getMetricColor(40 - metrics.debtToIncomeRatio, { good: 20, warning: 0 })}`}
          >
            {metrics.debtToIncomeRatio.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Of monthly income</p>
          <div className="mt-3">
            <Progress value={Math.min(metrics.debtToIncomeRatio, 100)} className="h-2" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Target: Under 20%</div>
        </CardContent>
      </Card>

      {/* Monthly Cash Flow */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.netIncome >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(metrics.netIncome / 3)}
          </div>
          <p className="text-xs text-muted-foreground">Average per month</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Income:</span>
              <span className="font-medium">{formatCurrency(metrics.totalIncome / 3)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Expenses:</span>
              <span className="font-medium">{formatCurrency(metrics.totalExpenses / 3)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {(() => {
            // Calculate a simple financial health score
            let score = 0
            if (metrics.savingsRate >= 20) score += 25
            else if (metrics.savingsRate >= 10) score += 15
            else if (metrics.savingsRate >= 5) score += 10

            if (metrics.emergencyFundMonths >= 6) score += 25
            else if (metrics.emergencyFundMonths >= 3) score += 15
            else if (metrics.emergencyFundMonths >= 1) score += 10

            if (metrics.debtToIncomeRatio <= 20) score += 25
            else if (metrics.debtToIncomeRatio <= 40) score += 15
            else if (metrics.debtToIncomeRatio <= 60) score += 10

            if (metrics.netIncome > 0) score += 25
            else if (metrics.netIncome > -1000) score += 10

            const healthColor = score >= 80 ? "text-primary" : score >= 60 ? "text-yellow-600" : "text-destructive"

            const healthLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work"

            return (
              <>
                <div className={`text-2xl font-bold ${healthColor}`}>{score}/100</div>
                <p className="text-xs text-muted-foreground">{healthLabel}</p>
                <div className="mt-3">
                  <Progress value={score} className="h-2" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Based on key financial metrics</div>
              </>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
