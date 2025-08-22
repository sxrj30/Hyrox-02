import { createClient } from "@/lib/supabase/server"
import { calculatePortfolioPerformance } from "@/lib/investment-planning"
import { type NextRequest, NextResponse } from "next/server"

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

    // Get user investments
    const { data: investments, error: investmentsError } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (investmentsError) {
      return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 })
    }

    // Calculate portfolio performance
    const performance = calculatePortfolioPerformance(investments || [])

    // Group investments by type for allocation analysis
    const allocationByType = (investments || []).reduce(
      (acc, investment) => {
        const type = investment.investment_type || "other"
        const value = investment.shares * (investment.current_price || investment.purchase_price)
        acc[type] = (acc[type] || 0) + value
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      investments: investments || [],
      performance,
      allocationByType,
      totalInvestments: investments?.length || 0,
    })
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { symbol, name, shares, purchase_price, investment_type, purchase_date } = body

    // Validate required fields
    if (!symbol || !name || !shares || !purchase_price || !investment_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For demo purposes, set current_price same as purchase_price
    // In a real app, you'd fetch current prices from a financial API
    const current_price = purchase_price

    const { data: investment, error } = await supabase
      .from("investments")
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        name,
        shares: Number.parseFloat(shares),
        purchase_price: Number.parseFloat(purchase_price),
        current_price,
        investment_type,
        purchase_date: purchase_date || new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to add investment" }, { status: 500 })
    }

    return NextResponse.json({ investment })
  } catch (error) {
    console.error("Add investment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
