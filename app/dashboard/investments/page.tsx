"use client"

import { useEffect, useState } from "react"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { InvestmentRecommendations } from "@/components/investment-recommendations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Target } from "lucide-react"

export default function InvestmentsPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [recommendationData, setRecommendationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioResponse, recommendationResponse] = await Promise.all([
          fetch("/api/portfolio"),
          fetch("/api/investment-recommendations"),
        ])

        const portfolio = await portfolioResponse.json()
        const recommendations = await recommendationResponse.json()

        setPortfolioData(portfolio)
        setRecommendationData(recommendations)
      } catch (error) {
        console.error("Failed to fetch investment data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investments</h1>
        <p className="text-muted-foreground">Manage your portfolio and get personalized investment advice</p>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          {portfolioData && (
            <PortfolioOverview
              investments={portfolioData.investments}
              performance={portfolioData.performance}
              allocationByType={portfolioData.allocationByType}
            />
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {recommendationData && (
            <InvestmentRecommendations
              recommendation={recommendationData.recommendation}
              profile={recommendationData.profile}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
