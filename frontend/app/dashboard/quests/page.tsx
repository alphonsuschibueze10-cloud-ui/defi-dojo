"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Trophy, Play, CheckCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { questService } from "@/lib/services/quest-service"
import { Quest, UserQuest } from "@/lib/api"

// Quest interface is now imported from the API

export default function QuestsPage() {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [quests, setQuests] = useState<Quest[]>([])
  const [userQuests, setUserQuests] = useState<UserQuest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadQuests()
  }, [])

  const loadQuests = async () => {
    try {
      setLoading(true)
      const [availableQuests, userQuestData] = await Promise.all([
        questService.getAvailableQuests(),
        questService.getUserQuests()
      ])
      setQuests(availableQuests)
      setUserQuests(userQuestData)
    } catch (error) {
      console.error('Failed to load quests:', error)
      toast({
        title: "Failed to Load Quests",
        description: "Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuest = async (quest: Quest) => {
    setIsStarting(true)
    try {
      const userQuest = await questService.startQuest(quest.id)
      setUserQuests(prev => [...prev, userQuest])
      toast({
        title: "Quest Started!",
        description: `You've begun the "${quest.title}" quest. Good luck, Sensei!`,
      })
      setSelectedQuest(null)
    } catch (error) {
      console.error('Failed to start quest:', error)
      toast({
        title: "Failed to Start Quest",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "text-secondary border-secondary/30 bg-secondary/10"
      case 2:
        return "text-primary border-primary/30 bg-primary/10"
      case 3:
        return "text-accent border-accent/30 bg-accent/10"
      case 4:
        return "text-red-500 border-red-500/30 bg-red-500/10"
      default:
        return "text-muted-foreground border-muted-foreground/30 bg-muted-foreground/10"
    }
  }

  const getStatusIcon = (status: "available" | "in-progress" | "completed") => {
    switch (status) {
      case "available":
        return <Play className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Game Quests</h1>
            <p className="text-muted-foreground mt-1">Complete challenges to earn XP and master DeFi skills</p>
          </div>
          <Link href="/dashboard/leaderboard">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-heading font-bold text-secondary">1</p>
                </div>
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-heading font-bold text-primary">1</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-heading font-bold text-accent">2</p>
                </div>
                <Play className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-heading font-bold text-foreground">750</p>
                </div>
                <Sparkles className="w-8 h-8 text-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quest Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading quests...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quests.map((quest, index) => {
            const questStatus = questService.getQuestStatus(quest, userQuests)
            const questProgress = questService.getQuestProgress(quest, userQuests)
            
            return (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-heading text-foreground mb-2">{quest.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{quest.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">{getStatusIcon(questStatus)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getDifficultyColor(quest.difficulty)}>
                    {questService.getDifficultyLabel(quest.difficulty)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {questService.getQuestCategory(quest)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {questService.getEstimatedTime(quest.difficulty)}
                  </Badge>
                </div>

                {questStatus === "in-progress" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{questProgress}%</span>
                    </div>
                    <Progress value={questProgress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">+{quest.reward_json.xp} XP</span>
                  </div>

                  {questStatus === "available" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => setSelectedQuest(quest)}
                        >
                          Start Quest
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-primary font-heading">Start Quest</DialogTitle>
                          <DialogDescription>
                            Begin your DeFi training journey with this quest. Complete the challenges to earn XP and level up your skills.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedQuest && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg">{selectedQuest.title}</h3>
                              <p className="text-muted-foreground">{selectedQuest.description}</p>
                            </div>

                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Reward</span>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4 text-primary" />
                                  <span className="font-semibold text-primary">+{selectedQuest.reward_json.xp} XP</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Estimated Time</span>
                                <span className="text-sm">{questService.getEstimatedTime(selectedQuest.difficulty)}</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleStartQuest(selectedQuest)}
                              disabled={isStarting}
                              className="w-full bg-primary hover:bg-primary/90"
                            >
                              {isStarting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Starting...
                                </>
                              ) : (
                                "Begin Quest"
                              )}
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}

                  {questStatus === "in-progress" && (
                    <Link href={`/dashboard/quests/${quest.id}`}>
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                        Continue
                      </Button>
                    </Link>
                  )}

                  {questStatus === "completed" && (
                    <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">
                      Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
