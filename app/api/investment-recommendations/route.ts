import { createClient } from "@/lib/supabase/server"
import { generateInvestmentRecommendation, type InvestmentProfile } from "@/lib/investment-planning"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Calculate age and time horizon
    const birthDate = new Date(profile.date_of_birth)
    const currentAge = new Date().getFullYear() - birthDate.getFullYear()
    const retirementAge = 65 // Default retirement age
    const timeHorizon = Math.max(retirementAge - currentAge, 1)

    // Get available investment amount (simplified calculation)
    const { data: accounts } = await supabase
      .from("financial_accounts")
      .select("current_balance, account_type")
      .eq("user_id", user.id)

    const savingsBalance =
      accounts
        ?.filter((acc) => acc.account_type === "savings")
        .reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0

    const availableToInvest = Math.max(savingsBalance * 0.8, 1000) // 80% of savings, minimum $1000

    const investmentProfile: InvestmentProfile = {
      riskTolerance: profile.risk_tolerance || "moderate",
      timeHorizon,
      investmentGoals: profile.financial_goals || [],
      currentAge,
      retirementAge,
      availableToInvest,
    }

    const recommendation = generateInvestmentRecommendation(investmentProfile)

    return NextResponse.json({
      recommendation,
      profile: investmentProfile,
    })
  } catch (error) {
    console.error("Investment recommendations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
