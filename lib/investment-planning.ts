// Investment Planning Engine - Portfolio optimization and recommendations

export interface InvestmentProfile {
  riskTolerance: "conservative" | "moderate" | "aggressive"
  timeHorizon: number // years
  investmentGoals: string[]
  currentAge: number
  retirementAge: number
  availableToInvest: number
}

export interface AssetAllocation {
  stocks: number
  bonds: number
  realEstate: number
  commodities: number
  cash: number
}

export interface InvestmentRecommendation {
  allocation: AssetAllocation
  expectedReturn: number
  riskLevel: string
  description: string
  reasoning: string[]
}

export interface PortfolioPerformance {
  totalValue: number
  totalGain: number
  totalGainPercentage: number
  dayChange: number
  dayChangePercentage: number
  diversificationScore: number
}

export interface InvestmentGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  monthlyContribution: number
  projectedCompletion: Date
  onTrack: boolean
}

// Age-based asset allocation (Rule of 100/110/120)
export function calculateAgeBasedAllocation(age: number, riskTolerance: string): AssetAllocation {
  let stockPercentage: number

  switch (riskTolerance) {
    case "conservative":
      stockPercentage = Math.max(100 - age, 20) // Rule of 100
      break
    case "moderate":
      stockPercentage = Math.max(110 - age, 30) // Rule of 110
      break
    case "aggressive":
      stockPercentage = Math.max(120 - age, 40) // Rule of 120
      break
    default:
      stockPercentage = Math.max(110 - age, 30)
  }

  const bondPercentage = Math.min(100 - stockPercentage, 60)
  const remainingPercentage = 100 - stockPercentage - bondPercentage

  return {
    stocks: stockPercentage,
    bonds: bondPercentage,
    realEstate: Math.min(remainingPercentage * 0.6, 15),
    commodities: Math.min(remainingPercentage * 0.3, 10),
    cash: Math.max(remainingPercentage * 0.1, 5),
  }
}

// Goal-based asset allocation
export function calculateGoalBasedAllocation(
  timeHorizon: number,
  riskTolerance: string,
  goalType: string,
): AssetAllocation {
  let baseAllocation = {
    stocks: 60,
    bonds: 30,
    realEstate: 5,
    commodities: 3,
    cash: 2,
  }

  // Adjust based on time horizon
  if (timeHorizon < 3) {
    // Short term - more conservative
    baseAllocation = {
      stocks: 30,
      bonds: 50,
      realEstate: 5,
      commodities: 5,
      cash: 10,
    }
  } else if (timeHorizon < 10) {
    // Medium term
    baseAllocation = {
      stocks: 50,
      bonds: 35,
      realEstate: 8,
      commodities: 5,
      cash: 2,
    }
  } else {
    // Long term - more aggressive
    baseAllocation = {
      stocks: 70,
      bonds: 20,
      realEstate: 7,
      commodities: 2,
      cash: 1,
    }
  }

  // Adjust based on risk tolerance
  const riskMultiplier = {
    conservative: 0.7,
    moderate: 1.0,
    aggressive: 1.3,
  }[riskTolerance]

  const stockAdjustment = (baseAllocation.stocks - 50) * (riskMultiplier - 1)
  baseAllocation.stocks = Math.max(Math.min(baseAllocation.stocks + stockAdjustment, 90), 10)
  baseAllocation.bonds = Math.max(Math.min(baseAllocation.bonds - stockAdjustment * 0.7, 80), 5)

  // Normalize to 100%
  const total = Object.values(baseAllocation).reduce((sum, val) => sum + val, 0)
  Object.keys(baseAllocation).forEach((key) => {
    baseAllocation[key as keyof AssetAllocation] = (baseAllocation[key as keyof AssetAllocation] / total) * 100
  })

  return baseAllocation
}

export function generateInvestmentRecommendation(profile: InvestmentProfile): InvestmentRecommendation {
  const ageBasedAllocation = calculateAgeBasedAllocation(profile.currentAge, profile.riskTolerance)
  const goalBasedAllocation = calculateGoalBasedAllocation(
    profile.timeHorizon,
    profile.riskTolerance,
    profile.investmentGoals[0] || "general",
  )

  // Blend the two approaches (60% goal-based, 40% age-based)
  const allocation: AssetAllocation = {
    stocks: Math.round(goalBasedAllocation.stocks * 0.6 + ageBasedAllocation.stocks * 0.4),
    bonds: Math.round(goalBasedAllocation.bonds * 0.6 + ageBasedAllocation.bonds * 0.4),
    realEstate: Math.round(goalBasedAllocation.realEstate * 0.6 + ageBasedAllocation.realEstate * 0.4),
    commodities: Math.round(goalBasedAllocation.commodities * 0.6 + ageBasedAllocation.commodities * 0.4),
    cash: Math.round(goalBasedAllocation.cash * 0.6 + ageBasedAllocation.cash * 0.4),
  }

  // Calculate expected return based on historical averages
  const expectedReturn =
    (allocation.stocks * 0.1 +
      allocation.bonds * 0.04 +
      allocation.realEstate * 0.08 +
      allocation.commodities * 0.06 +
      allocation.cash * 0.02) /
    100

  const riskLevel =
    profile.riskTolerance === "aggressive" ? "High" : profile.riskTolerance === "moderate" ? "Medium" : "Low"

  const reasoning = [
    `Based on your ${profile.riskTolerance} risk tolerance and ${profile.timeHorizon}-year time horizon`,
    `Age-appropriate allocation considering you are ${profile.currentAge} years old`,
    `Diversified across multiple asset classes to reduce risk`,
    `Expected annual return of ${(expectedReturn * 100).toFixed(1)}% based on historical averages`,
  ]

  return {
    allocation,
    expectedReturn,
    riskLevel,
    description: `A ${riskLevel.toLowerCase()}-risk portfolio designed for ${profile.timeHorizon}-year investment horizon`,
    reasoning,
  }
}

export function calculatePortfolioPerformance(
  investments: Array<{
    symbol: string
    shares: number
    purchase_price: number
    current_price: number
  }>,
): PortfolioPerformance {
  let totalValue = 0
  let totalCost = 0
  let dayChange = 0

  investments.forEach((investment) => {
    const currentValue = investment.shares * investment.current_price
    const costBasis = investment.shares * investment.purchase_price
    const previousPrice = investment.current_price * 0.99 // Simulate previous day price

    totalValue += currentValue
    totalCost += costBasis
    dayChange += investment.shares * (investment.current_price - previousPrice)
  })

  const totalGain = totalValue - totalCost
  const totalGainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  const dayChangePercentage = totalValue > 0 ? (dayChange / totalValue) * 100 : 0

  // Calculate diversification score (simplified)
  const uniqueSymbols = new Set(investments.map((inv) => inv.symbol)).size
  const diversificationScore = Math.min((uniqueSymbols / 10) * 100, 100)

  return {
    totalValue,
    totalGain,
    totalGainPercentage,
    dayChange,
    dayChangePercentage,
    diversificationScore,
  }
}

export function calculateMonthlyContributionNeeded(
  currentAmount: number,
  targetAmount: number,
  yearsToGoal: number,
  expectedReturn: number,
): number {
  if (yearsToGoal <= 0) return targetAmount - currentAmount

  const monthlyReturn = expectedReturn / 12
  const totalMonths = yearsToGoal * 12

  // Future value of current amount
  const futureValueCurrent = currentAmount * Math.pow(1 + monthlyReturn, totalMonths)

  // Amount still needed
  const amountNeeded = targetAmount - futureValueCurrent

  if (amountNeeded <= 0) return 0

  // Monthly payment needed (annuity formula)
  const monthlyPayment = amountNeeded / ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn || totalMonths)

  return Math.max(monthlyPayment, 0)
}

export function projectInvestmentGoal(
  currentAmount: number,
  monthlyContribution: number,
  expectedReturn: number,
  targetAmount: number,
): {
  projectedAmount: number
  yearsToTarget: number
  onTrack: boolean
} {
  const monthlyReturn = expectedReturn / 12
  let amount = currentAmount
  let months = 0
  const maxMonths = 50 * 12 // 50 years max

  while (amount < targetAmount && months < maxMonths) {
    amount = amount * (1 + monthlyReturn) + monthlyContribution
    months++
  }

  const yearsToTarget = months / 12
  const projectedAmount = amount
  const onTrack = months < maxMonths

  return {
    projectedAmount,
    yearsToTarget,
    onTrack,
  }
}

// Risk assessment based on portfolio volatility
export function assessPortfolioRisk(allocation: AssetAllocation): {
  riskScore: number
  volatility: number
  riskLevel: string
  recommendations: string[]
} {
  // Historical volatility estimates (standard deviation)
  const volatilities = {
    stocks: 0.16,
    bonds: 0.04,
    realEstate: 0.12,
    commodities: 0.2,
    cash: 0.01,
  }

  // Calculate portfolio volatility (simplified)
  const portfolioVolatility = Math.sqrt(
    Math.pow((allocation.stocks / 100) * volatilities.stocks, 2) +
      Math.pow((allocation.bonds / 100) * volatilities.bonds, 2) +
      Math.pow((allocation.realEstate / 100) * volatilities.realEstate, 2) +
      Math.pow((allocation.commodities / 100) * volatilities.commodities, 2) +
      Math.pow((allocation.cash / 100) * volatilities.cash, 2),
  )

  const riskScore = Math.min(portfolioVolatility * 500, 100) // Scale to 0-100

  let riskLevel: string
  let recommendations: string[] = []

  if (riskScore < 30) {
    riskLevel = "Low"
    recommendations = [
      "Your portfolio has low risk but may have limited growth potential",
      "Consider increasing stock allocation if you have a long time horizon",
    ]
  } else if (riskScore < 60) {
    riskLevel = "Moderate"
    recommendations = [
      "Your portfolio has balanced risk and return potential",
      "Good diversification across asset classes",
      "Review allocation annually and rebalance as needed",
    ]
  } else {
    riskLevel = "High"
    recommendations = [
      "Your portfolio has high growth potential but significant volatility",
      "Ensure you can handle potential short-term losses",
      "Consider reducing risk as you approach your investment goals",
    ]
  }

  return {
    riskScore,
    volatility: portfolioVolatility,
    riskLevel,
    recommendations,
  }
}
