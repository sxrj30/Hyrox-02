import { createClient } from "@/lib/supabase/server"
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

    // Get user's conversations with latest message
    const { data: conversations, error } = await supabase
      .from("chat_conversations")
      .select(
        `
        *,
        chat_messages (
          content,
          role,
          created_at
        )
      `,
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }

    // Format conversations with latest message
    const formattedConversations = conversations?.map((conv) => ({
      ...conv,
      lastMessage: conv.chat_messages?.[conv.chat_messages.length - 1] || null,
      messageCount: conv.chat_messages?.length || 0,
    }))

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error("Conversations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json()
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title: title || "New Conversation",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Create conversation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
