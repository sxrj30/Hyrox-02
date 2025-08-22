"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FinancialMetricsDisplay } from "@/components/financial-metrics"
import { FinancialInsights } from "@/components/financial-insights"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, DollarSign, Target, MessageCircle, Plus, ArrowRight, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { FinancialMetrics, FinancialInsight, SpendingByCategory } from "@/lib/financial-analysis"
import type { InvestmentRecommendation, PortfolioPerformance } from "@/lib/investment-planning"

interface DashboardContentProps {
  user: any
  profile: any
}

interface DashboardData {
  metrics: FinancialMetrics
  insights: FinancialInsight[]
  spendingByCategory: SpendingByCategory
  investments: any[]
  portfolioPerformance: PortfolioPerformance
  recommendation: InvestmentRecommendation
  transactionCount: number
}

// Mock data for charts
const mockCashFlowData = [
  { month: "Jan", income: 5000, expenses: 3500, savings: 1500 },
  { month: "Feb", income: 5200, expenses: 3800, savings: 1400 },
  { month: "Mar", income: 5000, expenses: 3200, savings: 1800 },
  { month: "Apr", income: 5500, expenses: 3600, savings: 1900 },
  { month: "May", income: 5300, expenses: 3400, savings: 1900 },
  { month: "Jun", income: 5400, expenses: 3700, savings: 1700 },
]

const mockNetWorthData = [
  { month: "Jan", netWorth: 45000 },
  { month: "Feb", netWorth: 46400 },
  { month: "Mar", netWorth: 48200 },
  { month: "Apr", netWorth: 50100 },
  { month: "May", netWorth: 52000 },
  { month: "Jun", netWorth: 53700 },
]

export function DashboardContent({ user, profile }: DashboardContentProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Fetch financial analysis
        const analysisResponse = await fetch("/api/financial-analysis")
        const analysisData = await analysisResponse.json()

        // Fetch portfolio data
        const portfolioResponse = await fetch("/api/portfolio")
        const portfolioData = await portfolioResponse.json()

        // Fetch investment recommendations
        const recommendationsResponse = await fetch("/api/investment-recommendations")
        const recommendationsData = await recommendationsResponse.json()

        setDashboardData({
          metrics: analysisData.metrics,
          insights: analysisData.insights,
          spendingByCategory: analysisData.spendingByCategory,
          transactionCount: analysisData.transactionCount,
          investments: portfolioData.investments,
          portfolioPerformance: portfolioData.performance,
          recommendation: recommendationsData.recommendation,
        })
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error("Dashboard data error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Unable to Load Dashboard</h3>
              <p className="text-muted-foreground mb-4">{error || "Something went wrong"}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { metrics, insights, spendingByCategory, investments, portfolioPerformance, recommendation } = dashboardData

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile.first_name || "there"}!</h1>
          <p className="text-muted-foreground">
            Here's your financial overview for{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Last updated: Today
          </Badge>
          <Link href="/dashboard/chat">
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask AI Coach
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(portfolioPerformance.totalValue + metrics.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.netIncome / 3)}</div>
            <p className="text-xs text-primary">Savings rate: {metrics.savingsRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioPerformance.totalValue)}</div>
            <p className={`text-xs ${portfolioPerformance.totalGain >= 0 ? "text-primary" : "text-destructive"}`}>
              {portfolioPerformance.totalGain >= 0 ? "+" : ""}
              {formatCurrency(portfolioPerformance.totalGain)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/5</div>
            <p className="text-xs text-muted-foreground">Goals on track</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>Monthly income, expenses, and savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockCashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  <Line type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Net Worth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Growth</CardTitle>
            <CardDescription>Your financial progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockNetWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics */}
      <FinancialMetricsDisplay metrics={metrics} />

      {/* Insights and Spending Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialInsights insights={insights.slice(0, 3)} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest financial transactions</CardDescription>
            </div>
            <Link href="/dashboard/spending">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(spendingByCategory)
                .slice(0, 4)
                .map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(data.amount)}</div>
                      <div className="text-xs text-muted-foreground">{data.transactions} transactions</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your finances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <Plus className="w-6 h-6" />
              <span>Add Transaction</span>
            </Button>
            <Link href="/dashboard/investments">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full bg-transparent">
                <TrendingUp className="w-6 h-6" />
                <span>View Investments</span>
              </Button>
            </Link>
            <Link href="/dashboard/goals">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full bg-transparent">
                <Target className="w-6 h-6" />
                <span>Update Goals</span>
              </Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full bg-transparent">
                <MessageCircle className="w-6 h-6" />
                <span>Ask AI Coach</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
