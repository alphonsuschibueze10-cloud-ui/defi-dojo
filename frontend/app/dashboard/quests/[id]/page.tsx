"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import {
  SparklesIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { Loader2, Wallet } from "lucide-react"
import { questService } from "@/lib/services/quest-service"
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
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [selectedStep, setSelectedStep] = useState<any>(null)
  const [trainingProgress, setTrainingProgress] = useState<{[key: number]: number}>({})
  const { toast } = useToast()

  useEffect(() => {
    loadQuest()
  }, [questId])

  const loadQuest = async () => {
    try {
      setLoading(true)
      // Get quest data from the public endpoint instead of individual quest endpoint
      const quests = await questService.getAvailableQuests()
      const questData = quests.find(q => q.id === questId)
      
      if (!questData) {
        throw new Error(`Quest ${questId} not found`)
      }
      
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

  // Generate quest steps based on quest type
  const getQuestSteps = (quest: Quest) => {
    const questType = quest.slug || 'default'
    
    switch (questType) {
      case 'liquidity-kata':
        return [
          {
            id: 1,
            title: "Connect to DeFi Pool",
            description: "Connect to the STX/sBTC liquidity pool on a DeFi protocol",
            action: "Connect Pool",
            completed: false
          },
          {
            id: 2,
            title: "Add Liquidity",
            description: "Add 1 STX and 0.001 sBTC to the liquidity pool",
            action: "Add Liquidity",
            completed: false
          },
          {
            id: 3,
            title: "Monitor Position",
            description: "Check your liquidity position and understand impermanent loss",
            action: "Check Position",
            completed: false
          },
          {
            id: 4,
            title: "Complete Quest",
            description: "Successfully provided liquidity and learned about DeFi pools",
            action: "Complete Quest",
            completed: false
          }
        ]
      case 'yield-sprint':
        return [
          {
            id: 1,
            title: "Research Yield Opportunities",
            description: "Analyze different yield farming opportunities in the ecosystem",
            action: "Research",
            completed: false
          },
          {
            id: 2,
            title: "Calculate APY",
            description: "Calculate the Annual Percentage Yield for different strategies",
            action: "Calculate",
            completed: false
          },
          {
            id: 3,
            title: "Assess Risks",
            description: "Evaluate the risks associated with each yield strategy",
            action: "Assess",
            completed: false
          },
          {
            id: 4,
            title: "Complete Quest",
            description: "Successfully identified the best yield farming opportunity",
            action: "Complete Quest",
            completed: false
          }
        ]
      default:
        return [
          {
            id: 1,
            title: "Learn DeFi Concepts",
            description: "Understand the basic concepts of decentralized finance",
            action: "Learn",
            completed: false
          },
          {
            id: 2,
            title: "Practice Trading",
            description: "Practice trading strategies in a simulated environment",
            action: "Practice",
            completed: false
          },
          {
            id: 3,
            title: "Complete Quest",
            description: "Successfully completed the DeFi training quest",
            action: "Complete Quest",
            completed: false
          }
        ]
    }
  }

  const openTrainingModal = (step: any) => {
    setSelectedStep(step)
    setShowTrainingModal(true)
  }

  const completeTrainingStep = async (stepId: number) => {
    setIsSubmittingAction(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Mark step as completed
      setCompletedSteps(prev => [...prev, stepId])
      setShowTrainingModal(false)
      
      // Calculate progress
      const steps = getQuestSteps(quest!)
      const newProgress = Math.min((completedSteps.length + 1) / steps.length * 100, 100)
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        setShowRewardModal(true)
        toast({
          title: "Quest Completed!",
          description: `Congratulations! You've earned ${quest!.reward_json.xp} XP.`,
        })
      } else {
        toast({
          title: "Step Completed!",
          description: `Progress: ${Math.round(newProgress)}%. Keep going!`,
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

      {/* Quest Tutorial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary font-heading flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              How to Play This Quest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This is a <strong>simulated DeFi training quest</strong> designed to teach you real DeFi concepts through interactive gameplay.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <strong>Step-by-Step Learning:</strong> Follow the quest steps to learn DeFi concepts
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <strong>Safe Simulation:</strong> Practice with virtual assets, no real money at risk
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <strong>Earn Rewards:</strong> Complete quests to earn XP and unlock achievements
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
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

      {/* Quest Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-secondary font-heading">How to Play</CardTitle>
            <p className="text-sm text-muted-foreground">
              Follow these steps to complete your quest and learn DeFi concepts
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getQuestSteps(quest).map((step, index) => {
                const isCompleted = completedSteps.includes(step.id)
                const isCurrent = !isCompleted && (completedSteps.length === 0 ? step.id === 1 : step.id === Math.max(...completedSteps) + 1)
                const isDisabled = isCompleted || (completedSteps.length > 0 && step.id > Math.max(...completedSteps) + 1)
                
                return (
                  <div 
                    key={step.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : isCurrent 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-secondary/5 border-secondary/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : isCurrent 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-secondary/30 bg-secondary/10'
                        }`}>
                          {isCompleted ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-semibold">{step.id}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${
                          isCompleted ? 'text-green-700' : isCurrent ? 'text-primary' : 'text-foreground'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {step.description}
                        </p>
                        <Button
                          onClick={() => isCompleted ? null : openTrainingModal(step)}
                          disabled={isDisabled || isSubmittingAction}
                          className={`${
                            isCompleted 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : isCurrent 
                              ? 'bg-primary hover:bg-primary/90' 
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <BoltIcon className="w-4 h-4 mr-2" />
                              {step.action}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Training Modal */}
      <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary font-heading">
              {selectedStep?.title} - Interactive Training
            </DialogTitle>
            <DialogDescription>
              {selectedStep?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStep && (
            <div className="space-y-6">
              {/* Training Content based on step */}
              {selectedStep.id === 1 && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary mb-2">📚 Learning: DeFi Pool Connection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      In DeFi, liquidity pools are smart contracts that hold pairs of tokens. Let's learn how to connect to them.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Step 1: Choose a DeFi Protocol</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                            Uniswap V3
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            SushiSwap
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Step 2: Select Token Pair</h4>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded border">
                            <span className="text-sm font-mono">STX</span>
                          </div>
                          <span className="text-muted-foreground">/</span>
                          <div className="p-2 bg-secondary/10 rounded border">
                            <span className="text-sm font-mono">sBTC</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Step 3: Connect Wallet</h4>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Hiro Wallet
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-700 mb-2">✅ Knowledge Check</h3>
                    <p className="text-sm text-green-600 mb-3">
                      What is the primary purpose of a liquidity pool in DeFi?
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        A) To store tokens securely
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        B) To enable trading between token pairs
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        C) To mine new tokens
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedStep.id === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary mb-2">💰 Interactive: Add Liquidity</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Let's simulate adding liquidity to the STX/sBTC pool. You'll learn about impermanent loss and fees.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded border">
                        <h4 className="font-medium mb-3">Your Assets</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                            <span className="text-sm">STX Balance</span>
                            <span className="font-mono text-sm">10.0 STX</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-secondary/5 rounded">
                            <span className="text-sm">sBTC Balance</span>
                            <span className="font-mono text-sm">0.01 sBTC</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white rounded border">
                        <h4 className="font-medium mb-3">Add Liquidity</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-muted-foreground">STX Amount</label>
                            <div className="flex gap-2 mt-1">
                              <input 
                                type="number" 
                                defaultValue="1.0"
                                className="flex-1 p-2 border rounded text-sm"
                                placeholder="1.0"
                              />
                              <Button variant="outline" size="sm">Max</Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">sBTC Amount</label>
                            <input 
                              type="number" 
                              defaultValue="0.001"
                              className="w-full p-2 border rounded text-sm mt-1"
                              placeholder="0.001"
                            />
                          </div>
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            Add Liquidity
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-700 mb-2">⚠️ Understanding Impermanent Loss</h3>
                    <p className="text-sm text-yellow-600 mb-3">
                      When you add liquidity, you're exposed to impermanent loss if the token prices change. 
                      This is the difference between holding tokens vs providing liquidity.
                    </p>
                    <div className="text-xs text-yellow-600">
                      <strong>Example:</strong> If STX price doubles while sBTC stays the same, 
                      you'll have less STX and more sBTC in your pool position.
                    </div>
                  </div>
                </div>
              )}
              
              {selectedStep.id === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary mb-2">📊 Monitor Your Position</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track your liquidity position performance, fees earned, and impermanent loss.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded border text-center">
                        <div className="text-2xl font-bold text-green-600">+2.4%</div>
                        <div className="text-sm text-muted-foreground">Total Return</div>
                      </div>
                      <div className="p-4 bg-white rounded border text-center">
                        <div className="text-2xl font-bold text-blue-600">0.15 STX</div>
                        <div className="text-sm text-muted-foreground">Fees Earned</div>
                      </div>
                      <div className="p-4 bg-white rounded border text-center">
                        <div className="text-2xl font-bold text-orange-600">-0.8%</div>
                        <div className="text-sm text-muted-foreground">Impermanent Loss</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white rounded border">
                      <h4 className="font-medium mb-3">Position Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Pool Share</span>
                          <span className="font-mono">0.12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>STX in Pool</span>
                          <span className="font-mono">0.98 STX</span>
                        </div>
                        <div className="flex justify-between">
                          <span>sBTC in Pool</span>
                          <span className="font-mono">0.0012 sBTC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>LP Tokens</span>
                          <span className="font-mono">1.24 LP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedStep.id === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-700 mb-2">🎉 Quest Completion</h3>
                    <p className="text-sm text-green-600 mb-4">
                      Congratulations! You've successfully learned about DeFi liquidity provision.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded border">
                        <h4 className="font-medium mb-3">What You Learned</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>✅ How to connect to DeFi protocols</li>
                          <li>✅ How to add liquidity to pools</li>
                          <li>✅ Understanding impermanent loss</li>
                          <li>✅ Monitoring position performance</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-white rounded border">
                        <h4 className="font-medium mb-3">Rewards Earned</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-primary" />
                            <span className="text-sm">+{quest?.reward_json.xp} XP</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Liquidity Provider Badge</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTrainingModal(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => completeTrainingStep(selectedStep.id)}
                  disabled={isSubmittingAction}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmittingAction ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Complete Step
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reward Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary font-heading text-center">Quest Completed!</DialogTitle>
            <DialogDescription className="text-center">
              Congratulations on completing your DeFi training quest! You've earned valuable experience points.
            </DialogDescription>
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
