"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { FinancialInsight } from "@/lib/financial-analysis"

interface FinancialInsightsProps {
  insights: FinancialInsight[]
}

export function FinancialInsights({ insights }: FinancialInsightsProps) {
  const getInsightIcon = (type: FinancialInsight["type"]) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="w-5 h-5 text-primary" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "critical":
        return <TrendingDown className="w-5 h-5 text-destructive" />
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getInsightColor = (type: FinancialInsight["type"]) => {
    switch (type) {
      case "positive":
        return "bg-primary/10 border-primary/20"
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
      case "critical":
        return "bg-destructive/10 border-destructive/20"
      default:
        return "bg-muted border-border"
    }
  }

  const getPriorityBadge = (priority: FinancialInsight["priority"]) => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    } as const

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Financial Insights
          </CardTitle>
          <CardDescription>Personalized recommendations based on your financial data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Add some transactions to get personalized financial insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Financial Insights
        </CardTitle>
        <CardDescription>Personalized recommendations based on your financial data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <Alert key={index} className={getInsightColor(insight.type)}>
            <div className="flex items-start gap-3">
              {getInsightIcon(insight.type)}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{insight.title}</h4>
                  {getPriorityBadge(insight.priority)}
                </div>
                <AlertDescription className="text-sm">{insight.description}</AlertDescription>
                <div className="bg-background/50 rounded-md p-3 mt-2">
                  <p className="text-sm font-medium text-foreground mb-1">Recommendation:</p>
                  <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}
