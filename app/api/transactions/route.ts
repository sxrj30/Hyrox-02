import { createClient } from "@/lib/supabase/server"
import { categorizeTransaction } from "@/lib/financial-analysis"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const category = searchParams.get("category")

    const query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== "all") {
      // Filter by category would require a category column or client-side filtering
      // For now, we'll return all and let client filter
    }

    const { data: transactions, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    // Add category to each transaction
    const transactionsWithCategory =
      transactions?.map((transaction) => ({
        ...transaction,
        category: categorizeTransaction(transaction.description || ""),
      })) || []

    return NextResponse.json({ transactions: transactionsWithCategory })
  } catch (error) {
    console.error("Transactions API error:", error)
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
    const { amount, description, transaction_type, transaction_date, account_id } = body

    // Validate required fields
    if (!amount || !description || !transaction_type || !transaction_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Auto-categorize the transaction
    const category = categorizeTransaction(description)

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: Number.parseFloat(amount),
        description,
        category,
        transaction_type,
        transaction_date,
        account_id: account_id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
