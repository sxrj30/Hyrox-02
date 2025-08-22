// Financial Analysis Engine - Core calculations and insights

export interface FinancialMetrics {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRate: number
  debtToIncomeRatio: number
  emergencyFundMonths: number
  monthlyBudgetVariance: number
}

export interface SpendingByCategory {
  [category: string]: {
    amount: number
    percentage: number
    transactions: number
  }
}

export interface FinancialInsight {
  type: "positive" | "warning" | "critical"
  title: string
  description: string
  recommendation: string
  priority: "low" | "medium" | "high"
}

// Transaction categories for automatic categorization
export const TRANSACTION_CATEGORIES = {
  Housing: ["rent", "mortgage", "utilities", "insurance", "property tax", "maintenance"],
  Transportation: ["gas", "car payment", "insurance", "maintenance", "uber", "lyft", "taxi", "public transport"],
  Food: ["grocery", "restaurant", "fast food", "coffee", "dining", "takeout"],
  Healthcare: ["doctor", "pharmacy", "hospital", "dental", "vision", "medical"],
  Entertainment: ["movie", "streaming", "games", "concert", "sports", "hobby"],
  Shopping: ["clothing", "electronics", "home goods", "personal care", "gifts"],
  Education: ["tuition", "books", "courses", "training", "certification"],
  Savings: ["savings account", "investment", "401k", "ira", "emergency fund"],
  Debt: ["credit card", "loan payment", "student loan", "personal loan"],
  Income: ["salary", "bonus", "freelance", "investment income", "rental income"],
  Other: [],
}

export function categorizeTransaction(description: string): string {
  const lowerDesc = description.toLowerCase()

  for (const [category, keywords] of Object.entries(TRANSACTION_CATEGORIES)) {
    if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
      return category
    }
  }

  return "Other"
}

export function calculateFinancialMetrics(
  transactions: Array<{
    amount: number
    transaction_type: "income" | "expense" | "transfer"
    transaction_date: string
  }>,
  emergencyFundBalance = 0,
): FinancialMetrics {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())

  // Filter transactions from last 3 months
  const recentTransactions = transactions.filter((t) => new Date(t.transaction_date) >= threeMonthsAgo)

  const totalIncome = recentTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalExpenses = recentTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netIncome = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

  // Estimate monthly expenses for emergency fund calculation
  const monthlyExpenses = totalExpenses / 3
  const emergencyFundMonths = monthlyExpenses > 0 ? emergencyFundBalance / monthlyExpenses : 0

  // Calculate debt payments (simplified - would need more data in real app)
  const debtPayments = recentTransactions
    .filter((t) => t.transaction_type === "expense")
    .filter((t) => categorizeTransaction(t.description || "") === "Debt")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const monthlyIncome = totalIncome / 3
  const debtToIncomeRatio = monthlyIncome > 0 ? (debtPayments / 3 / monthlyIncome) * 100 : 0

  return {
    totalIncome,
    totalExpenses,
    netIncome,
    savingsRate,
    debtToIncomeRatio,
    emergencyFundMonths,
    monthlyBudgetVariance: 0, // Would calculate against budget if available
  }
}

export function analyzeSpendingByCategory(
  transactions: Array<{
    amount: number
    description: string
    transaction_type: "income" | "expense" | "transfer"
    transaction_date: string
  }>,
): SpendingByCategory {
  const now = new Date()
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  const expenseTransactions = transactions.filter(
    (t) => t.transaction_type === "expense" && new Date(t.transaction_date) >= oneMonthAgo,
  )

  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const categorySpending: SpendingByCategory = {}

  expenseTransactions.forEach((transaction) => {
    const category = categorizeTransaction(transaction.description)
    const amount = Math.abs(transaction.amount)

    if (!categorySpending[category]) {
      categorySpending[category] = {
        amount: 0,
        percentage: 0,
        transactions: 0,
      }
    }

    categorySpending[category].amount += amount
    categorySpending[category].transactions += 1
  })

  // Calculate percentages
  Object.keys(categorySpending).forEach((category) => {
    categorySpending[category].percentage =
      totalExpenses > 0 ? (categorySpending[category].amount / totalExpenses) * 100 : 0
  })

  return categorySpending
}

export function generateFinancialInsights(
  metrics: FinancialMetrics,
  spendingByCategory: SpendingByCategory,
  userProfile: {
    annual_income: number
    risk_tolerance: string
    financial_goals: string[]
  },
): FinancialInsight[] {
  const insights: FinancialInsight[] = []

  // Savings rate insights
  if (metrics.savingsRate < 10) {
    insights.push({
      type: "critical",
      title: "Low Savings Rate",
      description: `Your current savings rate is ${metrics.savingsRate.toFixed(1)}%, which is below the recommended 20%.`,
      recommendation:
        "Consider reducing discretionary spending and automating your savings to reach at least 20% savings rate.",
      priority: "high",
    })
  } else if (metrics.savingsRate < 20) {
    insights.push({
      type: "warning",
      title: "Moderate Savings Rate",
      description: `Your savings rate of ${metrics.savingsRate.toFixed(1)}% is good, but could be improved.`,
      recommendation: "Try to increase your savings rate to 20% or higher for better financial security.",
      priority: "medium",
    })
  } else {
    insights.push({
      type: "positive",
      title: "Excellent Savings Rate",
      description: `Your savings rate of ${metrics.savingsRate.toFixed(1)}% is excellent!`,
      recommendation: "Keep up the great work! Consider investing your excess savings for long-term growth.",
      priority: "low",
    })
  }

  // Emergency fund insights
  if (metrics.emergencyFundMonths < 3) {
    insights.push({
      type: "critical",
      title: "Insufficient Emergency Fund",
      description: `Your emergency fund covers only ${metrics.emergencyFundMonths.toFixed(1)} months of expenses.`,
      recommendation: "Build your emergency fund to cover 3-6 months of expenses before focusing on other investments.",
      priority: "high",
    })
  } else if (metrics.emergencyFundMonths < 6) {
    insights.push({
      type: "warning",
      title: "Emergency Fund Needs Growth",
      description: `Your emergency fund covers ${metrics.emergencyFundMonths.toFixed(1)} months of expenses.`,
      recommendation: "Consider building your emergency fund to 6 months of expenses for better security.",
      priority: "medium",
    })
  }

  // Debt-to-income insights
  if (metrics.debtToIncomeRatio > 40) {
    insights.push({
      type: "critical",
      title: "High Debt-to-Income Ratio",
      description: `Your debt-to-income ratio of ${metrics.debtToIncomeRatio.toFixed(1)}% is concerning.`,
      recommendation: "Focus on debt reduction strategies like the debt avalanche or snowball method.",
      priority: "high",
    })
  } else if (metrics.debtToIncomeRatio > 20) {
    insights.push({
      type: "warning",
      title: "Moderate Debt Load",
      description: `Your debt-to-income ratio of ${metrics.debtToIncomeRatio.toFixed(1)}% could be improved.`,
      recommendation: "Consider accelerating debt payments to reduce your debt burden.",
      priority: "medium",
    })
  }

  // Spending category insights
  const housingSpending = spendingByCategory["Housing"]
  if (housingSpending && housingSpending.percentage > 30) {
    insights.push({
      type: "warning",
      title: "High Housing Costs",
      description: `Housing costs represent ${housingSpending.percentage.toFixed(1)}% of your spending.`,
      recommendation: "Consider ways to reduce housing costs or increase income, as the recommended limit is 30%.",
      priority: "medium",
    })
  }

  const foodSpending = spendingByCategory["Food"]
  if (foodSpending && foodSpending.percentage > 15) {
    insights.push({
      type: "warning",
      title: "High Food Spending",
      description: `Food expenses represent ${foodSpending.percentage.toFixed(1)}% of your spending.`,
      recommendation: "Consider meal planning and cooking at home more often to reduce food costs.",
      priority: "low",
    })
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

export function calculateInvestmentRecommendations(
  userProfile: {
    annual_income: number
    risk_tolerance: "conservative" | "moderate" | "aggressive"
    financial_goals: string[]
  },
  availableToInvest: number,
): {
  stocks: number
  bonds: number
  cash: number
  description: string
} {
  let stockAllocation = 60
  let bondAllocation = 30
  let cashAllocation = 10

  // Adjust based on risk tolerance
  switch (userProfile.risk_tolerance) {
    case "conservative":
      stockAllocation = 30
      bondAllocation = 60
      cashAllocation = 10
      break
    case "moderate":
      stockAllocation = 60
      bondAllocation = 30
      cashAllocation = 10
      break
    case "aggressive":
      stockAllocation = 80
      bondAllocation = 15
      cashAllocation = 5
      break
  }

  const description = `Based on your ${userProfile.risk_tolerance} risk tolerance, we recommend a portfolio allocation of ${stockAllocation}% stocks, ${bondAllocation}% bonds, and ${cashAllocation}% cash equivalents.`

  return {
    stocks: stockAllocation,
    bonds: bondAllocation,
    cash: cashAllocation,
    description,
  }
}
