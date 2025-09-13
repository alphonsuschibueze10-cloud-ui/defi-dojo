"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Zap, Sparkles, Clock, Loader2, Send, Expand } from "lucide-react"

interface AIHint {
  id: string
  shortHint: string
  fullResponse: string
  prompt: string
  timestamp: Date
  questId?: string
}

const mockHints: AIHint[] = [
  {
    id: "1",
    shortHint: "Consider DCA strategy during low volatility periods for optimal entry points.",
    fullResponse:
      "Dollar-cost averaging (DCA) is particularly effective during periods of low volatility because it allows you to accumulate positions at relatively stable prices. When Bitcoin's volatility decreases, it often indicates market consolidation, which can be an ideal time to build your position gradually. This strategy helps reduce the impact of short-term price fluctuations and can lead to better average entry prices over time.",
    prompt: "What's the best strategy for entering Bitcoin positions right now?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "2",
    shortHint: "Lightning Network liquidity pools offer 8-12% APY with lower impermanent loss risk.",
    fullResponse:
      "Lightning Network liquidity pools present an attractive opportunity for yield generation with several advantages over traditional DeFi pools. The APY typically ranges from 8-12% depending on the pool and market conditions. The risk of impermanent loss is generally lower because Lightning pools often involve Bitcoin-denominated assets, reducing exposure to volatile altcoin pairs. Additionally, you're contributing to Bitcoin's scaling solution while earning yield.",
    prompt: "How can I earn yield on my Bitcoin holdings safely?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
]

export default function AISenseiPage() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hints, setHints] = useState<AIHint[]>(mockHints)
  const [selectedHint, setSelectedHint] = useState<AIHint | null>(null)
  const [cooldownTime, setCooldownTime] = useState(0)
  const { toast } = useToast()

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || cooldownTime > 0) return

    setIsLoading(true)
    try {
      // Mock AI response generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newHint: AIHint = {
        id: Date.now().toString(),
        shortHint: "AI is analyzing your request and will provide insights shortly...",
        fullResponse: `Based on your question "${message}", here's a detailed analysis of the current market conditions and recommended strategies. This is a mock response that would normally come from the AI backend.`,
        prompt: message,
        timestamp: new Date(),
      }

      setHints([newHint, ...hints])
      setMessage("")

      // Start cooldown (30 seconds for demo)
      setCooldownTime(30)
      const interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      toast({
        title: "AI Sensei Responded",
        description: "Your hint has been generated successfully!",
      })
    } catch (error) {
      toast({
        title: "Failed to Get Hint",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-accent">AI Sensei</h1>
            <p className="text-muted-foreground">Your personal DeFi coach and market analyst</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-accent font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Ask the Sensei
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about DeFi strategies, market analysis, or trading tips..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading || cooldownTime > 0}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading || cooldownTime > 0}
                className="bg-accent hover:bg-accent/90"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {cooldownTime > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Cooldown: {cooldownTime}s remaining</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("What's the best DeFi strategy for beginners?")}
                disabled={isLoading || cooldownTime > 0}
              >
                Beginner Strategy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("How do I analyze Bitcoin market trends?")}
                disabled={isLoading || cooldownTime > 0}
              >
                Market Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("What are the risks of yield farming?")}
                disabled={isLoading || cooldownTime > 0}
              >
                Risk Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hints History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary font-heading">Recent Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hints.map((hint, index) => (
              <motion.div
                key={hint.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-4 bg-muted/20 rounded-lg border border-muted/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">{hint.shortHint}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatTimeAgo(hint.timestamp)}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => setSelectedHint(hint)}
                          >
                            <Expand className="w-3 h-3 mr-1" />
                            Explain More
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-accent font-heading">AI Sensei Insight</DialogTitle>
                          </DialogHeader>
                          {selectedHint && (
                            <div className="space-y-4">
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Your Question:</p>
                                <p className="text-sm">{selectedHint.prompt}</p>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Full Response:</p>
                                <p className="text-sm leading-relaxed">{selectedHint.fullResponse}</p>
                              </div>

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Generated: {selectedHint.timestamp.toLocaleString()}</span>
                                <Button variant="outline" size="sm">
                                  Download JSON
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {hints.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No insights yet. Ask the AI Sensei your first question!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
