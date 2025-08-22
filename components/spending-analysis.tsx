"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { SpendingByCategory } from "@/lib/financial-analysis"

interface SpendingAnalysisProps {
  spendingByCategory: SpendingByCategory
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(160, 60%, 45%)",
  "hsl(160, 60%, 35%)",
  "hsl(160, 60%, 55%)",
]

export function SpendingAnalysis({ spendingByCategory }: SpendingAnalysisProps) {
  const categories = Object.entries(spendingByCategory).sort(([, a], [, b]) => b.amount - a.amount)

  const chartData = categories.map(([name, data]) => ({
    name,
    value: data.amount,
    percentage: data.percentage,
  }))

  const totalSpending = categories.reduce((sum, [, data]) => sum + data.amount, 0)

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Analysis</CardTitle>
          <CardDescription>Breakdown of your expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No spending data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Distribution</CardTitle>
          <CardDescription>Visual breakdown of your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Detailed spending by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map(([category, data], index) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium">{category}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">${data.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{data.transactions} transactions</div>
                </div>
              </div>
              <Progress value={data.percentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {data.percentage.toFixed(1)}% of total spending
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center font-medium">
              <span>Total Spending</span>
              <span>${totalSpending.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
