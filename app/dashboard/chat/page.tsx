"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Send, Plus, Bot, User, Sparkles, TrendingUp, DollarSign, Target } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  lastMessage: Message | null
  messageCount: number
}

const SUGGESTED_QUESTIONS = [
  "How can I improve my savings rate?",
  "What should I do with my emergency fund?",
  "Is my spending on track this month?",
  "Should I invest more in stocks or bonds?",
  "How can I reduce my debt faster?",
  "What are some ways to increase my income?",
]

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations")
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const createNewConversation = async () => {
    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      })
      const data = await response.json()
      const newConversation = { ...data.conversation, lastMessage: null, messageCount: 0 }
      setConversations([newConversation, ...conversations])
      setCurrentConversation(newConversation.id)
      setMessages([])
    } catch (error) {
      console.error("Failed to create conversation:", error)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId: currentConversation,
        }),
      })

      const data = await response.json()

      if (data.message) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: data.message,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    if (!currentConversation) {
      createNewConversation().then(() => {
        sendMessage(question)
      })
    } else {
      sendMessage(question)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversations Sidebar */}
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button size="sm" onClick={createNewConversation}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-4 space-y-2">
                {isLoadingConversations ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">No conversations yet</p>
                    <Button size="sm" className="mt-2" onClick={createNewConversation}>
                      Start Chatting
                    </Button>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentConversation === conversation.id ? "bg-primary/10 border-primary/20" : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        setCurrentConversation(conversation.id)
                        fetchMessages(conversation.id)
                      }}
                    >
                      <div className="font-medium text-sm truncate">{conversation.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{conversation.messageCount} messages</div>
                      {conversation.lastMessage && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {conversation.lastMessage.content.substring(0, 50)}...
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Financial Coach
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by AI
                </Badge>
              </CardTitle>
              <CardDescription>Get personalized financial advice based on your data</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {!currentConversation ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Welcome to your AI Financial Coach!</h3>
                  <p className="text-muted-foreground max-w-md">
                    I'm here to help you make better financial decisions based on your personal financial data. Ask me
                    anything about your finances!
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Try asking me:</p>
                  <div className="grid gap-2 max-w-md">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start h-auto p-3 bg-transparent"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <div className="flex items-center gap-2">
                          {index < 2 && <TrendingUp className="w-4 h-4 text-primary" />}
                          {index >= 2 && index < 4 && <DollarSign className="w-4 h-4 text-primary" />}
                          {index >= 4 && <Target className="w-4 h-4 text-primary" />}
                          <span className="text-sm">{question}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="w-4 h-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">{formatTime(message.created_at)}</div>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="w-4 h-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me about your finances..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (!currentConversation) {
                      createNewConversation().then(() => {
                        sendMessage(inputMessage)
                      })
                    } else {
                      sendMessage(inputMessage)
                    }
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (!currentConversation) {
                    createNewConversation().then(() => {
                      sendMessage(inputMessage)
                    })
                  } else {
                    sendMessage(inputMessage)
                  }
                }}
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
