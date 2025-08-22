import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import {
  calculateFinancialMetrics,
  analyzeSpendingByCategory,
  generateFinancialInsights,
} from "@/lib/financial-analysis"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { messages, conversationId } = await request.json()
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile and financial data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Get recent transactions for context
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("transaction_date", sixMonthsAgo.toISOString().split("T")[0])
      .order("transaction_date", { ascending: false })
      .limit(100)

    // Get investments
    const { data: investments } = await supabase.from("investments").select("*").eq("user_id", user.id)

    // Get financial goals
    const { data: goals } = await supabase.from("financial_goals").select("*").eq("user_id", user.id)

    // Calculate current financial metrics
    const metrics = calculateFinancialMetrics(transactions || [])
    const spendingByCategory = analyzeSpendingByCategory(transactions || [])
    const insights = generateFinancialInsights(metrics, spendingByCategory, {
      annual_income: profile?.annual_income || 0,
      risk_tolerance: profile?.risk_tolerance || "moderate",
      financial_goals: profile?.financial_goals || [],
    })

    // Create financial context for AI
    const financialContext = `
User Financial Profile:
- Name: ${profile?.first_name || "User"}
- Age: ${profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : "Unknown"}
- Annual Income: $${profile?.annual_income?.toLocaleString() || "Not provided"}
- Risk Tolerance: ${profile?.risk_tolerance || "Not specified"}
- Financial Goals: ${profile?.financial_goals?.join(", ") || "None set"}

Current Financial Metrics (Last 3 months):
- Total Income: $${metrics.totalIncome.toLocaleString()}
- Total Expenses: $${metrics.totalExpenses.toLocaleString()}
- Net Income: $${metrics.netIncome.toLocaleString()}
- Savings Rate: ${metrics.savingsRate.toFixed(1)}%
- Debt-to-Income Ratio: ${metrics.debtToIncomeRatio.toFixed(1)}%
- Emergency Fund: ${metrics.emergencyFundMonths.toFixed(1)} months of expenses

Top Spending Categories:
${Object.entries(spendingByCategory)
  .slice(0, 5)
  .map(([category, data]) => `- ${category}: $${data.amount.toFixed(2)} (${data.percentage.toFixed(1)}%)`)
  .join("\n")}

Investment Portfolio:
- Total Investments: ${investments?.length || 0}
- Investment Value: $${investments?.reduce((sum, inv) => sum + inv.shares * inv.current_price, 0).toLocaleString() || "0"}

Financial Goals:
${goals?.map((goal) => `- ${goal.goal_name}: $${goal.current_amount.toLocaleString()} / $${goal.target_amount.toLocaleString()}`).join("\n") || "No goals set"}

Key Financial Insights:
${insights
  .slice(0, 3)
  .map((insight) => `- ${insight.title}: ${insight.description}`)
  .join("\n")}
`

    const systemPrompt = `You are an expert AI Financial Coach helping users make better financial decisions. You have access to the user's complete financial profile and should provide personalized, actionable advice.

Key Guidelines:
1. Always base your advice on the user's actual financial data provided in the context
2. Be encouraging and supportive while being honest about financial realities
3. Provide specific, actionable recommendations
4. Explain financial concepts in simple terms
5. Reference the user's specific numbers when giving advice
6. Suggest concrete next steps
7. Be conversational and friendly, but professional
8. If asked about investments, consider their risk tolerance and time horizon
9. Always emphasize the importance of emergency funds and debt reduction when relevant
10. Celebrate their financial wins and progress

Current Financial Context:
${financialContext}

Remember to:
- Use the user's actual financial data in your responses
- Provide personalized advice based on their situation
- Be specific with dollar amounts and percentages from their data
- Suggest realistic and achievable next steps
- Explain the reasoning behind your recommendations`

    // Generate AI response
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Save conversation if conversationId provided
    if (conversationId) {
      // Save user message
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: messages[messages.length - 1].content,
      })

      // Save AI response
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: text,
      })
    }

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
