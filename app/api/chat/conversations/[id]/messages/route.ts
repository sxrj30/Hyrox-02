import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Verify conversation belongs to user
    const { data: conversation } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get messages for conversation
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", params.id)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Messages API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
