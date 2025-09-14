"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import {
  SparklesIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  Loader2,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { questService } from "../../../../../frontend/lib/services/quest-service"
import { Quest } from "@/lib/api"

interface QuestStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: string
}

// Mock quest data is now replaced with real API data

export default function QuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questId = params.id as string
  const [quest, setQuest] = useState<Quest | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRequestingHint, setIsRequestingHint] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    loadQuest()
  }, [questId])

  const loadQuest = async () => {
    try {
      setLoading(true)
      const questData = await questService.getQuestById(questId)
      setQuest(questData)
    } catch (error) {
      console.error('Failed to load quest:', error)
      toast({
        title: "Failed to Load Quest",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quest...</p>
        </div>
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold mb-2">Quest Not Found</h2>
          <p className="text-muted-foreground mb-4">The quest you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/quests")} variant="outline">
            Back to Quests
          </Button>
        </div>
      </div>
    )
  }

  const handleRequestHint = async () => {
    setIsRequestingHint(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "AI Hint Generated",
        description: "Check the AI Sensei page for your personalized hint!",
      })
    } catch (error) {
      toast({
        title: "Failed to Generate Hint",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsRequestingHint(false)
    }
  }

  const handleSubmitAction = async () => {
    setIsSubmittingAction(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Simulate progress increase
      const newProgress = Math.min(progress + 25, 100)
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        setShowRewardModal(true)
        toast({
          title: "Quest Completed!",
          description: `Congratulations! You've earned ${quest.reward_json.xp} XP.`,
        })
      } else {
        toast({
          title: "Action Completed!",
          description: `Progress: ${newProgress}%. Keep going!`,
        })
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // For now, we'll use a simple progress calculation
  // In a real implementation, this would come from the user's quest progress
  const progressPercent = progress

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/quests")}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Quests
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">{quest.title}</h1>
            <p className="text-muted-foreground mt-1">{quest.description}</p>
          </div>
          <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">
            {questService.getDifficultyLabel(quest.difficulty)}
          </Badge>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary font-heading flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              Quest Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Quest Progress
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">Reward: +{quest.reward_json.xp} XP</span>
                </div>
                <Button
                  onClick={handleRequestHint}
                  disabled={isRequestingHint}
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                >
                  {isRequestingHint ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BoltIcon className="w-4 h-4 mr-2" />
                      Request AI Hint
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quest Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-secondary font-heading">Quest Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-primary/10 border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full border-2 border-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Complete Quest Action</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {quest.game_rules?.type === 'liquidity-kata' 
                        ? 'Add liquidity to a DeFi pool and monitor your position'
                        : quest.game_rules?.type === 'yield-sprint'
                        ? 'Identify and analyze high-yield farming opportunities'
                        : quest.game_rules?.type === 'arbitrage-master'
                        ? 'Find and execute profitable arbitrage opportunities'
                        : quest.game_rules?.type === 'defi-ninja'
                        ? 'Execute advanced DeFi strategies with flash loans'
                        : 'Complete the quest objectives to earn XP and badges'
                      }
                    </p>
                    <Button
                      onClick={handleSubmitAction}
                      disabled={isSubmittingAction}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmittingAction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Complete Action"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reward Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary font-heading text-center">Quest Completed!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <SparklesIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold mb-2">Congratulations, Sensei!</h3>
              <p className="text-muted-foreground">
                You've successfully completed the {quest.title} quest.
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <span className="text-lg font-heading font-bold text-primary">+{quest.reward_json.xp} XP Earned</span>
              </div>
            </div>
            <Button
              onClick={() => {
                setShowRewardModal(false)
                router.push("/dashboard/quests")
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Continue Training
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
