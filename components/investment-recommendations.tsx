"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { TrendingUp, Target, AlertCircle } from "lucide-react"
import type { InvestmentRecommendation } from "@/lib/investment-planning"

interface InvestmentRecommendationsProps {
  recommendation: InvestmentRecommendation
  profile: {
    riskTolerance: string
    timeHorizon: number
    currentAge: number
    availableToInvest: number
  }
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function InvestmentRecommendations({ recommendation, profile }: InvestmentRecommendationsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const allocationData = [
    {
      name: "Stocks",
      value: recommendation.allocation.stocks,
      amount: (profile.availableToInvest * recommendation.allocation.stocks) / 100,
    },
    {
      name: "Bonds",
      value: recommendation.allocation.bonds,
      amount: (profile.availableToInvest * recommendation.allocation.bonds) / 100,
    },
    {
      name: "Real Estate",
      value: recommendation.allocation.realEstate,
      amount: (profile.availableToInvest * recommendation.allocation.realEstate) / 100,
    },
    {
      name: "Commodities",
      value: recommendation.allocation.commodities,
      amount: (profile.availableToInvest * recommendation.allocation.commodities) / 100,
    },
    {
      name: "Cash",
      value: recommendation.allocation.cash,
      amount: (profile.availableToInvest * recommendation.allocation.cash) / 100,
    },
  ].filter((item) => item.value > 0)

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "bg-primary/10 text-primary"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Investment Recommendation
              </CardTitle>
              <CardDescription>{recommendation.description}</CardDescription>
            </div>
            <Badge className={getRiskColor(recommendation.riskLevel)}>{recommendation.riskLevel} Risk</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{(recommendation.expectedReturn * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Expected Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{profile.timeHorizon}</div>
              <div className="text-sm text-muted-foreground">Years to Goal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{formatCurrency(profile.availableToInvest)}</div>
              <div className="text-sm text-muted-foreground">Available to Invest</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{profile.currentAge}</div>
              <div className="text-sm text-muted-foreground">Current Age</div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Why This Allocation?</h4>
            <ul className="space-y-1">
              {recommendation.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Allocation</CardTitle>
            <CardDescription>How to distribute your investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value}% (${formatCurrency(props.payload.amount)})`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation Breakdown</CardTitle>
            <CardDescription>Detailed investment amounts by asset class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocationData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.amount)}</div>
                    <div className="text-xs text-muted-foreground">{item.value}%</div>
                  </div>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center font-medium">
                <span>Total Investment</span>
                <span>{formatCurrency(profile.availableToInvest)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Next Steps
          </CardTitle>
          <CardDescription>How to implement this investment strategy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Immediate Actions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Open investment accounts if needed
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Start with low-cost index funds
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Set up automatic monthly contributions
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Ongoing Management</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Review and rebalance quarterly
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Adjust allocation as you age
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  Monitor performance monthly
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex-1">Start Investing</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Warning */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Investment Risk Disclosure</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                All investments carry risk and may lose value. Past performance does not guarantee future results. This
                recommendation is for educational purposes only and should not be considered personalized financial
                advice. Please consult with a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
