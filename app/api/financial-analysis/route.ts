import { createClient } from "@/lib/supabase/server"
import {
  calculateFinancialMetrics,
  analyzeSpendingByCategory,
  generateFinancialInsights,
} from "@/lib/financial-analysis"
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

    // Get user transactions (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("transaction_date", sixMonthsAgo.toISOString().split("T")[0])
      .order("transaction_date", { ascending: false })

    if (transactionsError) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    // Get savings account balance (simplified - would be more complex in real app)
    const { data: savingsAccounts } = await supabase
      .from("financial_accounts")
      .select("current_balance")
      .eq("user_id", user.id)
      .eq("account_type", "savings")

    const emergencyFundBalance = savingsAccounts?.reduce((sum, account) => sum + (account.current_balance || 0), 0) || 0

    // Calculate financial metrics
    const metrics = calculateFinancialMetrics(transactions || [], emergencyFundBalance)

    // Analyze spending by category
    const spendingByCategory = analyzeSpendingByCategory(transactions || [])

    // Generate insights
    const insights = generateFinancialInsights(metrics, spendingByCategory, {
      annual_income: profile.annual_income || 0,
      risk_tolerance: profile.risk_tolerance || "moderate",
      financial_goals: profile.financial_goals || [],
    })

    return NextResponse.json({
      metrics,
      spendingByCategory,
      insights,
      transactionCount: transactions?.length || 0,
    })
  } catch (error) {
    console.error("Financial analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
