"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrophyIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  BoltIcon,
  Loader2,
  Wallet
} from "lucide-react"
import {
  SparklesIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { questService } from "@/lib/services/quest-service"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showSimulation, setShowSimulation] = useState(false)
  const [simulationState, setSimulationState] = useState<any>({
    selectedPool: null,
    liquidityAdded: false,
    stxAmount: 10,
    sbtcAmount: 0.001,
    positionRefreshed: false,
    selectedProtocol: null,
    swapExecuted: false,
    stakingStarted: false,
    rewardsTracked: false
  })
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [questStartTime, setQuestStartTime] = useState<Date | null>(null)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadQuest()
    loadProgressFromStorage()
  }, [questId])

  const loadProgressFromStorage = () => {
    try {
      const savedProgress = localStorage.getItem(`quest-progress-${questId}`)
      if (savedProgress) {
        const data = JSON.parse(savedProgress)
        setCompletedSteps(data.completedSteps || [])
        setProgress(data.progress || 0)
        
        // Load timer data
        if (data.startTime) {
          setQuestStartTime(new Date(data.startTime))
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const saveProgressToStorage = (steps: number[], progressPercent: number) => {
    try {
      localStorage.setItem(`quest-progress-${questId}`, JSON.stringify({
        completedSteps: steps,
        progress: progressPercent,
        lastUpdated: new Date().toISOString(),
        startTime: questStartTime?.toISOString()
      }))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  // Timer effect - runs countdown
  useEffect(() => {
    if (!quest || !questStartTime || progress >= 100 || isTimedOut) return

    // Calculate time limit based on difficulty (in minutes)
    const timeLimitMinutes = quest.difficulty * 15 // 15min, 30min, 45min, 60min
    const timeLimitMs = timeLimitMinutes * 60 * 1000

    const interval = setInterval(() => {
      const elapsed = Date.now() - questStartTime.getTime()
      const remaining = Math.max(0, timeLimitMs - elapsed)
      
      setTimeRemaining(remaining)

      if (remaining === 0 && !isTimedOut) {
        setIsTimedOut(true)
        clearInterval(interval)
        toast({
          title: "Time's Up! ⏰",
          description: "Quest time limit reached. You can still complete it, but no time bonus!",
          variant: "destructive"
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [quest, questStartTime, progress, isTimedOut])

  // Start timer when quest is first opened
  useEffect(() => {
    if (quest && !questStartTime && progress < 100) {
      const startTime = new Date()
      setQuestStartTime(startTime)
      
      // Save start time
      const savedProgress = localStorage.getItem(`quest-progress-${questId}`)
      if (savedProgress) {
        const data = JSON.parse(savedProgress)
        data.startTime = startTime.toISOString()
        localStorage.setItem(`quest-progress-${questId}`, JSON.stringify(data))
      }
    }
  }, [quest, questStartTime, progress])

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const loadQuest = async () => {
    try {
      setLoading(true)
      
      // Try to get quest directly by ID first (faster)
      try {
        const questData = await questService.getQuestById(questId)
        setQuest(questData)
        return
      } catch (directError) {
        console.log('Direct quest fetch failed, falling back to list:', directError)
      }
      
      // Fallback: Get quest data from the public endpoint
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
            title: "Compare Yield Protocols",
            description: "Analyze APY rates across different DeFi lending and farming protocols",
            action: "Compare Protocols",
            completed: false
          },
          {
            id: 2,
            title: "Calculate Compound Returns",
            description: "Learn to calculate compound interest and projected earnings over time",
            action: "Calculate Returns",
            completed: false
          },
          {
            id: 3,
            title: "Evaluate Risk Factors",
            description: "Assess smart contract risks, impermanent loss, and protocol security",
            action: "Assess Risks",
            completed: false
          },
          {
            id: 4,
            title: "Deploy Yield Strategy",
            description: "Execute your optimized yield farming strategy across protocols",
            action: "Deploy Strategy",
            completed: false
          }
        ]
      case 'swap-sensei':
        return [
          {
            id: 1,
            title: "Understand DEX Mechanics",
            description: "Learn how automated market makers (AMMs) work and price tokens",
            action: "Learn AMMs",
            completed: false
          },
          {
            id: 2,
            title: "Execute Token Swap",
            description: "Swap 10 STX for sBTC on a decentralized exchange",
            action: "Swap Tokens",
            completed: false
          },
          {
            id: 3,
            title: "Optimize Slippage",
            description: "Adjust slippage tolerance to get the best swap rate",
            action: "Set Slippage",
            completed: false
          },
          {
            id: 4,
            title: "Complete Quest",
            description: "Successfully executed a swap with minimal price impact",
            action: "Complete Quest",
            completed: false
          }
        ]
      case 'staking-warrior':
        return [
          {
            id: 1,
            title: "Learn Stacking Basics",
            description: "Understand how STX stacking works and Bitcoin rewards",
            action: "Learn Stacking",
            completed: false
          },
          {
            id: 2,
            title: "Choose Pool or Solo",
            description: "Decide between solo stacking or joining a stacking pool",
            action: "Choose Method",
            completed: false
          },
          {
            id: 3,
            title: "Lock Your STX",
            description: "Commit your STX tokens for a stacking cycle (2 weeks)",
            action: "Lock Tokens",
            completed: false
          },
          {
            id: 4,
            title: "Track Rewards",
            description: "Monitor your Bitcoin rewards and stacking performance",
            action: "Track Rewards",
            completed: false
          }
        ]
      case 'arbitrage-master':
        return [
          {
            id: 1,
            title: "Identify Price Gaps",
            description: "Scan multiple DEXs to find profitable price differences",
            action: "Scan Markets",
            completed: false
          },
          {
            id: 2,
            title: "Calculate Profit Margins",
            description: "Account for gas fees and slippage in your arbitrage calculation",
            action: "Calculate Profit",
            completed: false
          },
          {
            id: 3,
            title: "Execute Multi-Step Trade",
            description: "Buy low on one DEX and sell high on another",
            action: "Execute Trade",
            completed: false
          },
          {
            id: 4,
            title: "Complete Quest",
            description: "Successfully completed an arbitrage trade with profit",
            action: "Complete Quest",
            completed: false
          }
        ]
      case 'lending-legend':
        return [
          {
            id: 1,
            title: "Supply Collateral",
            description: "Deposit STX as collateral in a lending protocol",
            action: "Supply Collateral",
            completed: false
          },
          {
            id: 2,
            title: "Borrow Against Collateral",
            description: "Borrow sBTC against your STX collateral at safe ratio",
            action: "Borrow Assets",
            completed: false
          },
          {
            id: 3,
            title: "Monitor Health Factor",
            description: "Track your collateral ratio to avoid liquidation",
            action: "Check Health",
            completed: false
          },
          {
            id: 4,
            title: "Repay and Withdraw",
            description: "Repay your loan and withdraw your collateral safely",
            action: "Close Position",
            completed: false
          }
        ]
      case 'nft-trader':
        return [
          {
            id: 1,
            title: "Browse NFT Collections",
            description: "Explore Bitcoin Ordinals and Stacks NFT marketplaces",
            action: "Browse NFTs",
            completed: false
          },
          {
            id: 2,
            title: "Analyze Floor Prices",
            description: "Research collection floor prices and trading volume",
            action: "Analyze Prices",
            completed: false
          },
          {
            id: 3,
            title: "Make an Offer",
            description: "Place a bid on an NFT below floor price",
            action: "Make Offer",
            completed: false
          },
          {
            id: 4,
            title: "List for Sale",
            description: "List your NFT for sale at a profitable price",
            action: "List NFT",
            completed: false
          }
        ]
      case 'lightning-master':
        return [
          {
            id: 1,
            title: "Open Payment Channel",
            description: "Create a Lightning Network payment channel with initial funding",
            action: "Open Channel",
            completed: false
          },
          {
            id: 2,
            title: "Send Instant Payment",
            description: "Execute a near-instant, low-fee Lightning payment",
            action: "Send Payment",
            completed: false
          },
          {
            id: 3,
            title: "Route Through Network",
            description: "Understand multi-hop routing and channel liquidity",
            action: "Learn Routing",
            completed: false
          },
          {
            id: 4,
            title: "Close Channel",
            description: "Safely close your channel and settle on-chain",
            action: "Close Channel",
            completed: false
          }
        ]
      case 'flash-loan-ninja':
        return [
          {
            id: 1,
            title: "Understand Flash Loans",
            description: "Learn how uncollateralized loans work in a single transaction",
            action: "Learn Concept",
            completed: false
          },
          {
            id: 2,
            title: "Design Strategy",
            description: "Plan a multi-protocol arbitrage using flash loan capital",
            action: "Design Strategy",
            completed: false
          },
          {
            id: 3,
            title: "Execute Flash Loan",
            description: "Borrow, trade, and repay all in one atomic transaction",
            action: "Execute Loan",
            completed: false
          },
          {
            id: 4,
            title: "Complete Quest",
            description: "Successfully profited from a flash loan strategy",
            action: "Complete Quest",
            completed: false
          }
        ]
      case 'defi-ninja':
        return [
          {
            id: 1,
            title: "Read Smart Contracts",
            description: "Learn to read and understand DeFi smart contract code",
            action: "Read Contracts",
            completed: false
          },
          {
            id: 2,
            title: "Optimize Gas Usage",
            description: "Execute transactions with minimal gas fees using batch operations",
            action: "Optimize Gas",
            completed: false
          },
          {
            id: 3,
            title: "Advanced Trading",
            description: "Implement limit orders and stop-loss strategies",
            action: "Advanced Trade",
            completed: false
          },
          {
            id: 4,
            title: "Complete Quest",
            description: "Mastered advanced DeFi protocol interactions",
            action: "Complete Quest",
            completed: false
          }
        ]
      case 'portfolio-optimizer':
        return [
          {
            id: 1,
            title: "Assess Current Holdings",
            description: "Analyze your current DeFi portfolio allocation",
            action: "Assess Portfolio",
            completed: false
          },
          {
            id: 2,
            title: "Diversify Assets",
            description: "Spread investments across different protocols and risk levels",
            action: "Diversify",
            completed: false
          },
          {
            id: 3,
            title: "Rebalance Portfolio",
            description: "Adjust allocations to maintain target risk/reward ratio",
            action: "Rebalance",
            completed: false
          },
          {
            id: 4,
            title: "Track Performance",
            description: "Monitor portfolio metrics and adjust strategy as needed",
            action: "Track Metrics",
            completed: false
          }
        ]
      case 'dao-governor':
        return [
          {
            id: 1,
            title: "Acquire Governance Tokens",
            description: "Obtain governance tokens to participate in DAO decisions",
            action: "Get Tokens",
            completed: false
          },
          {
            id: 2,
            title: "Review Proposals",
            description: "Read and analyze active governance proposals",
            action: "Review Proposals",
            completed: false
          },
          {
            id: 3,
            title: "Cast Your Vote",
            description: "Vote on a proposal that aligns with your interests",
            action: "Vote",
            completed: false
          },
          {
            id: 4,
            title: "Create Proposal",
            description: "Draft and submit your own governance proposal",
            action: "Create Proposal",
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
    setSelectedAnswer(null)
    setShowSimulation(false)
    setSimulationState({
      selectedPool: null,
      liquidityAdded: false,
      stxAmount: 10,
      sbtcAmount: 0.001,
      positionRefreshed: false,
      selectedProtocol: null,
      swapExecuted: false,
      stakingStarted: false,
      rewardsTracked: false
    })
    setShowTrainingModal(true)
  }

  const handleAnswerSelect = (answer: string, correctAnswer: string) => {
    setSelectedAnswer(answer)
    if (answer === correctAnswer) {
      toast({
        title: "Correct! ✅",
        description: "Great job! You can now complete this step.",
      })
    } else {
      toast({
        title: "Not quite right",
        description: "Try again or review the material above.",
        variant: "destructive",
      })
    }
  }

  const completeTrainingStep = async (stepId: number) => {
    setIsSubmittingAction(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Mark step as completed
      const newCompletedSteps = [...completedSteps, stepId]
      setCompletedSteps(newCompletedSteps)
      setShowTrainingModal(false)
      
      // Calculate progress
      const steps = getQuestSteps(quest!)
      const newProgress = Math.min(newCompletedSteps.length / steps.length * 100, 100)
      setProgress(newProgress)
      
      // Save progress to localStorage
      saveProgressToStorage(newCompletedSteps, newProgress)
      
      if (newProgress >= 100) {
        setShowRewardModal(true)
        
        // Calculate XP with time bonus
        let totalXP = quest!.reward_json.xp
        let bonusXP = 0
        
        if (!isTimedOut && timeRemaining !== null && timeRemaining > 0) {
          // Time bonus: 10-50% based on time remaining
          const timeLimitMinutes = quest!.difficulty * 15
          const timeLimitMs = timeLimitMinutes * 60 * 1000
          const percentRemaining = (timeRemaining / timeLimitMs) * 100
          
          if (percentRemaining > 75) {
            bonusXP = Math.floor(quest!.reward_json.xp * 0.5) // 50% bonus
          } else if (percentRemaining > 50) {
            bonusXP = Math.floor(quest!.reward_json.xp * 0.3) // 30% bonus
          } else if (percentRemaining > 25) {
            bonusXP = Math.floor(quest!.reward_json.xp * 0.2) // 20% bonus
          } else {
            bonusXP = Math.floor(quest!.reward_json.xp * 0.1) // 10% bonus
          }
          
          totalXP += bonusXP
        }
        
        // Save total XP to localStorage
        const currentXP = parseInt(localStorage.getItem('total-xp') || '0')
        localStorage.setItem('total-xp', (currentXP + totalXP).toString())
        
        // Trigger confetti celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        
        // Additional confetti burst
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          })
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          })
        }, 250)
        
        toast({
          title: "Quest Completed! 🎉",
          description: bonusXP > 0 
            ? `Congratulations! You've earned ${quest!.reward_json.xp} XP + ${bonusXP} time bonus = ${totalXP} XP!`
            : `Congratulations! You've earned ${quest!.reward_json.xp} XP.`,
        })
      } else {
        toast({
          title: "Step Completed! ✅",
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
              <Progress value={progressPercent} className="h-3 transition-all duration-500 ease-out" />
              
              {/* Timer Display */}
              {timeRemaining !== null && progress < 100 && (
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  isTimedOut 
                    ? 'bg-red-50 border-red-200' 
                    : timeRemaining < 5 * 60 * 1000 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <ClockIcon className={`w-4 h-4 ${
                      isTimedOut 
                        ? 'text-red-600' 
                        : timeRemaining < 5 * 60 * 1000 
                          ? 'text-orange-600' 
                          : 'text-blue-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isTimedOut 
                        ? 'text-red-600' 
                        : timeRemaining < 5 * 60 * 1000 
                          ? 'text-orange-600' 
                          : 'text-blue-600'
                    }`}>
                      {isTimedOut ? 'Time Expired' : 'Time Remaining'}
                    </span>
                  </div>
                  <span className={`text-lg font-mono font-bold ${
                    isTimedOut 
                      ? 'text-red-600' 
                      : timeRemaining < 5 * 60 * 1000 
                        ? 'text-orange-600' 
                        : 'text-blue-600'
                  }`}>
                    {isTimedOut ? '0:00' : formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">Reward: +{quest.reward_json.xp} XP{!isTimedOut && timeRemaining !== null && ' + Time Bonus'}</span>
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
          
          {selectedStep && quest && (
            <div className="space-y-6">
              {/* Quest-Specific Learning Content */}
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-primary mb-2">📚 Learning Module: {selectedStep.title}</h3>
                  
                  {/* Dynamic learning content based on quest and step */}
                  {quest.slug === 'liquidity-kata' && selectedStep.id === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>What is a Liquidity Pool?</strong><br/>
                        A liquidity pool is a smart contract that holds two tokens (like STX and sBTC) to enable decentralized trading. When you provide liquidity, you deposit both tokens in equal value.
                      </p>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-medium mb-1">💡 Key Concept:</p>
                        <p className="text-xs">Liquidity providers earn fees from every trade that uses their pool, but they're exposed to impermanent loss if token prices diverge.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'liquidity-kata' && selectedStep.id === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Adding Liquidity:</strong><br/>
                        You must deposit both tokens in the correct ratio. The pool automatically calculates the ratio based on current prices. You'll receive LP tokens representing your share.
                      </p>
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs font-medium mb-1">⚠️ Important:</p>
                        <p className="text-xs">Always check the price ratio before adding liquidity to avoid unfavorable entry points.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'yield-sprint' && selectedStep.id === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Comparing Yield Opportunities:</strong><br/>
                        Different DeFi protocols offer different APY rates. Higher yields often come with higher risks like smart contract vulnerabilities or impermanent loss.
                      </p>
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium mb-1">📊 Analysis Tips:</p>
                        <p className="text-xs">Look at TVL (Total Value Locked), protocol age, audit reports, and historical performance before choosing.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'yield-sprint' && selectedStep.id === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Compound Interest Calculation:</strong><br/>
                        APY (Annual Percentage Yield) includes compound interest. If you reinvest earnings, your returns grow exponentially over time.
                      </p>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-medium mb-1">🧮 Formula:</p>
                        <p className="text-xs font-mono">Final = Principal × (1 + rate/n)^(n×time)</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'swap-sensei' && selectedStep.id === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>How AMMs Work:</strong><br/>
                        Automated Market Makers use a constant product formula (x × y = k) to price tokens. When you buy token A, you add token B to the pool, changing the ratio and price.
                      </p>
                      <div className="p-3 bg-purple-50 rounded border border-purple-200">
                        <p className="text-xs font-medium mb-1">🔄 Price Discovery:</p>
                        <p className="text-xs">Prices adjust automatically based on supply and demand in the pool.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'swap-sensei' && selectedStep.id === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Executing a Swap:</strong><br/>
                        When swapping, you specify the input amount and the DEX calculates the output based on the pool's current ratio and liquidity depth.
                      </p>
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium mb-1">💰 Trading Fees:</p>
                        <p className="text-xs">Most DEXs charge 0.3% fee per swap, which goes to liquidity providers.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'staking-warrior' && selectedStep.id === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>STX Stacking Basics:</strong><br/>
                        Stacking is Stacks' consensus mechanism where you lock STX tokens to earn Bitcoin rewards. It's like proof-of-stake but you earn BTC instead of more STX.
                      </p>
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <p className="text-xs font-medium mb-1">₿ Bitcoin Rewards:</p>
                        <p className="text-xs">Rewards come from Bitcoin miners who pay to mine Stacks blocks.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'staking-warrior' && selectedStep.id === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Solo vs Pool Stacking:</strong><br/>
                        Solo stacking requires a minimum of ~100,000 STX. Pool stacking lets you participate with any amount by joining other stackers.
                      </p>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-medium mb-1">🏊 Pool Benefits:</p>
                        <p className="text-xs">Lower barrier to entry, but pools may charge a small fee (typically 5-10%).</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3 Content */}
                  {quest.slug === 'liquidity-kata' && selectedStep.id === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Monitoring Your Position:</strong><br/>
                        Track your liquidity position's performance including fees earned, impermanent loss, and total value. Your position value changes as token prices fluctuate.
                      </p>
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <p className="text-xs font-medium mb-1">📊 Key Metrics:</p>
                        <p className="text-xs">Watch your pool share percentage, fees accumulated, and IL (Impermanent Loss) to understand profitability.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'yield-sprint' && selectedStep.id === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Risk Assessment:</strong><br/>
                        Evaluate smart contract risks, protocol security audits, team reputation, and historical exploits. Higher APY often means higher risk.
                      </p>
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-medium mb-1">⚠️ Risk Factors:</p>
                        <p className="text-xs">Check for audits, TVL stability, time-locks, and whether the protocol has insurance coverage.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'swap-sensei' && selectedStep.id === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Slippage Optimization:</strong><br/>
                        Slippage is the difference between expected and actual price. Set slippage tolerance to protect against unfavorable price movements during your swap.
                      </p>
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs font-medium mb-1">⚡ Pro Tip:</p>
                        <p className="text-xs">Use 0.5% slippage for stable pairs, 1-2% for volatile pairs. Higher slippage = faster execution but worse price.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'staking-warrior' && selectedStep.id === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Locking Your STX:</strong><br/>
                        Once you commit to stacking, your STX is locked for the entire cycle (approximately 2 weeks). You cannot withdraw or trade during this period.
                      </p>
                      <div className="p-3 bg-purple-50 rounded border border-purple-200">
                        <p className="text-xs font-medium mb-1">🔒 Lock Period:</p>
                        <p className="text-xs">Plan ahead! Your tokens are illiquid during stacking. Choose cycle length based on your needs.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4 Content */}
                  {quest.slug === 'liquidity-kata' && selectedStep.id === 4 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Quest Completion:</strong><br/>
                        You've learned the fundamentals of liquidity provision! You now understand how to add liquidity, monitor positions, and manage impermanent loss risk.
                      </p>
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium mb-1">🎓 Skills Mastered:</p>
                        <p className="text-xs">Pool mechanics, LP tokens, fee earnings, impermanent loss calculation, and position monitoring.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'yield-sprint' && selectedStep.id === 4 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Deploy Your Strategy:</strong><br/>
                        Now that you've analyzed protocols and calculated returns, it's time to deploy your capital to the optimal yield farming opportunity.
                      </p>
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium mb-1">🚀 Deployment Checklist:</p>
                        <p className="text-xs">Verify contract address, approve token spending, deposit funds, and set up auto-compounding if available.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'swap-sensei' && selectedStep.id === 4 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Quest Complete:</strong><br/>
                        Congratulations! You've mastered token swapping on DEXs. You can now execute swaps efficiently with optimal slippage settings.
                      </p>
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium mb-1">✅ Skills Acquired:</p>
                        <p className="text-xs">AMM understanding, swap execution, slippage management, and price impact analysis.</p>
                      </div>
                    </div>
                  )}
                  
                  {quest.slug === 'staking-warrior' && selectedStep.id === 4 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Track Your Rewards:</strong><br/>
                        Monitor your Bitcoin rewards as they accumulate each cycle. Rewards are distributed based on your share of the total stacked STX.
                      </p>
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium mb-1">💰 Reward Tracking:</p>
                        <p className="text-xs">Check your BTC address for incoming rewards. Rewards typically arrive at the end of each cycle.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Default content for steps without specific content */}
                  {!((quest.slug === 'liquidity-kata' && [1,2,3,4].includes(selectedStep.id)) ||
                      (quest.slug === 'yield-sprint' && [1,2,3,4].includes(selectedStep.id)) ||
                      (quest.slug === 'swap-sensei' && [1,2,3,4].includes(selectedStep.id)) ||
                      (quest.slug === 'staking-warrior' && [1,2,3,4].includes(selectedStep.id))) && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {selectedStep.description}
                      </p>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-medium mb-1">📖 Learning Objective:</p>
                        <p className="text-xs">Complete this step to master {quest.title} concepts and earn XP.</p>
                      </div>
                    </div>
                  )}
                  
                  {!showSimulation ? (
                    <div className="p-4 bg-white rounded border">
                      <h4 className="font-medium mb-3">Interactive Simulation</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Practice {quest.title} concepts in a safe, simulated environment with no real funds at risk.
                      </p>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => setShowSimulation(true)}
                      >
                        <BoltIcon className="w-4 h-4 mr-2" />
                        Start Simulation
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">🎮 {quest.title} Simulation</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowSimulation(false)}
                        >
                          Close Simulation
                        </Button>
                      </div>
                      
                      {/* Quest-specific simulation content */}
                      {quest.slug === 'liquidity-kata' && selectedStep.id === 1 && (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm font-medium mb-2">🔍 Browse Available Pools</p>
                            <div className="space-y-2">
                              <div 
                                className={`p-2 rounded border cursor-pointer transition-all ${
                                  simulationState.selectedPool === 'STX/sBTC' 
                                    ? 'bg-green-100 border-green-400' 
                                    : 'bg-white hover:bg-blue-50'
                                }`}
                                onClick={() => {
                                  setSimulationState({...simulationState, selectedPool: 'STX/sBTC'})
                                  toast({
                                    title: "Pool Selected! 🎯",
                                    description: "STX/sBTC pool selected. Ready to add liquidity.",
                                  })
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium">STX/sBTC</span>
                                  <span className="text-xs text-green-600">12.5% APY</span>
                                </div>
                                <div className="text-xs text-muted-foreground">TVL: $1.2M</div>
                                {simulationState.selectedPool === 'STX/sBTC' && (
                                  <div className="text-xs text-green-600 mt-1">✓ Selected</div>
                                )}
                              </div>
                              <div 
                                className={`p-2 rounded border cursor-pointer transition-all ${
                                  simulationState.selectedPool === 'STX/USDA' 
                                    ? 'bg-green-100 border-green-400' 
                                    : 'bg-white hover:bg-blue-50'
                                }`}
                                onClick={() => {
                                  setSimulationState({...simulationState, selectedPool: 'STX/USDA'})
                                  toast({
                                    title: "Pool Selected! 🎯",
                                    description: "STX/USDA pool selected. Ready to add liquidity.",
                                  })
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium">STX/USDA</span>
                                  <span className="text-xs text-green-600">8.3% APY</span>
                                </div>
                                <div className="text-xs text-muted-foreground">TVL: $850K</div>
                                {simulationState.selectedPool === 'STX/USDA' && (
                                  <div className="text-xs text-green-600 mt-1">✓ Selected</div>
                                )}
                              </div>
                            </div>
                          </div>
                          {simulationState.selectedPool && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-green-700">
                                ✅ Pool connected! You can now proceed to add liquidity.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {quest.slug === 'liquidity-kata' && selectedStep.id === 2 && (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm font-medium mb-2">Pool: STX/sBTC</p>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div>Current Ratio: 1 STX = 0.0001 sBTC</div>
                              <div>Your Share: {simulationState.liquidityAdded ? '0.12%' : '0%'}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">STX Amount</label>
                              <input 
                                type="number" 
                                value={simulationState.stxAmount} 
                                onChange={(e) => setSimulationState({...simulationState, stxAmount: parseFloat(e.target.value) || 0})}
                                className="w-full p-2 border rounded text-sm mt-1" 
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">sBTC Amount</label>
                              <input 
                                type="number" 
                                value={simulationState.sbtcAmount} 
                                onChange={(e) => setSimulationState({...simulationState, sbtcAmount: parseFloat(e.target.value) || 0})}
                                className="w-full p-2 border rounded text-sm mt-1" 
                              />
                            </div>
                          </div>
                          <div className="p-2 bg-yellow-50 rounded border border-yellow-200 text-xs">
                            You'll receive: ~{(simulationState.stxAmount * 0.01).toFixed(2)} LP tokens
                          </div>
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              setSimulationState({...simulationState, liquidityAdded: true})
                              toast({
                                title: "Liquidity Added! 💰",
                                description: `Successfully added ${simulationState.stxAmount} STX and ${simulationState.sbtcAmount} sBTC to the pool.`,
                              })
                            }}
                          >
                            {simulationState.liquidityAdded ? '✓ Liquidity Added' : 'Add Liquidity (Simulated)'}
                          </Button>
                          {simulationState.liquidityAdded && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-green-700">
                                ✅ Success! You now own 0.12% of the pool and will earn trading fees.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {quest.slug === 'liquidity-kata' && selectedStep.id === 3 && (
                        <div className="space-y-3">
                          <div className={`p-3 rounded border transition-all ${
                            simulationState.positionRefreshed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                          }`}>
                            <p className="text-sm font-medium mb-2">📊 Your Position</p>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span>Pool Share:</span>
                                <span className="font-mono">0.12%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fees Earned (24h):</span>
                                <span className="font-mono text-green-600">
                                  +{simulationState.positionRefreshed ? '0.08' : '0.05'} STX
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Impermanent Loss:</span>
                                <span className="font-mono text-orange-600">
                                  -{simulationState.positionRefreshed ? '0.5' : '0.8'}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Net Profit:</span>
                                <span className="font-mono text-green-600">
                                  +{simulationState.positionRefreshed ? '2.8' : '2.1'}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              setSimulationState({...simulationState, positionRefreshed: true})
                              toast({
                                title: "Position Refreshed! 🔄",
                                description: "Your position data has been updated with the latest metrics.",
                              })
                            }}
                          >
                            {simulationState.positionRefreshed ? '✓ Data Refreshed' : 'Refresh Position Data'}
                          </Button>
                          {simulationState.positionRefreshed && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-green-700">
                                ✅ Position updated! Your fees have increased and IL has decreased.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {quest.slug === 'liquidity-kata' && selectedStep.id === 4 && (
                        <div className="space-y-3">
                          <div className="p-3 bg-purple-50 rounded border border-purple-200">
                            <p className="text-sm font-medium mb-2">🎓 Quest Summary</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Connected to DeFi pool</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Added liquidity successfully</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Monitored position metrics</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Understood impermanent loss</span>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            Claim Quest Rewards
                          </Button>
                        </div>
                      )}
                      
                      {quest.slug === 'yield-sprint' && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div 
                              className={`p-3 rounded border flex justify-between items-center cursor-pointer transition-all ${
                                simulationState.selectedProtocol === 'A' 
                                  ? 'bg-green-100 border-green-400' 
                                  : 'bg-green-50 border-green-200 hover:bg-green-100'
                              }`}
                              onClick={() => {
                                setSimulationState({...simulationState, selectedProtocol: 'A'})
                                toast({
                                  title: "Protocol Selected! 📊",
                                  description: "Protocol A selected - High risk, high reward strategy.",
                                })
                              }}
                            >
                              <div>
                                <p className="font-medium text-sm">Protocol A</p>
                                <p className="text-xs text-muted-foreground">Lending Pool</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">18.5% APY</p>
                                <p className="text-xs text-muted-foreground">High Risk</p>
                                {simulationState.selectedProtocol === 'A' && (
                                  <p className="text-xs text-green-600 mt-1">✓ Selected</p>
                                )}
                              </div>
                            </div>
                            <div 
                              className={`p-3 rounded border flex justify-between items-center cursor-pointer transition-all ${
                                simulationState.selectedProtocol === 'B' 
                                  ? 'bg-blue-100 border-blue-400' 
                                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                setSimulationState({...simulationState, selectedProtocol: 'B'})
                                toast({
                                  title: "Protocol Selected! 📊",
                                  description: "Protocol B selected - Balanced risk/reward.",
                                })
                              }}
                            >
                              <div>
                                <p className="font-medium text-sm">Protocol B</p>
                                <p className="text-xs text-muted-foreground">Staking Pool</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600">12.3% APY</p>
                                <p className="text-xs text-muted-foreground">Medium Risk</p>
                                {simulationState.selectedProtocol === 'B' && (
                                  <p className="text-xs text-blue-600 mt-1">✓ Selected</p>
                                )}
                              </div>
                            </div>
                            <div 
                              className={`p-3 rounded border flex justify-between items-center cursor-pointer transition-all ${
                                simulationState.selectedProtocol === 'C' 
                                  ? 'bg-yellow-100 border-yellow-400' 
                                  : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                              }`}
                              onClick={() => {
                                setSimulationState({...simulationState, selectedProtocol: 'C'})
                                toast({
                                  title: "Protocol Selected! 📊",
                                  description: "Protocol C selected - Safe, conservative approach.",
                                })
                              }}
                            >
                              <div>
                                <p className="font-medium text-sm">Protocol C</p>
                                <p className="text-xs text-muted-foreground">LP Farming</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-yellow-600">8.7% APY</p>
                                <p className="text-xs text-muted-foreground">Low Risk</p>
                                {simulationState.selectedProtocol === 'C' && (
                                  <p className="text-xs text-yellow-600 mt-1">✓ Selected</p>
                                )}
                              </div>
                            </div>
                          </div>
                          {simulationState.selectedProtocol && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-green-700">
                                ✅ Protocol {simulationState.selectedProtocol} selected! Ready to deploy funds.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {quest.slug === 'swap-sensei' && (
                        <div className="space-y-3">
                          <div className={`p-3 rounded border transition-all ${
                            simulationState.swapExecuted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                          }`}>
                            <p className="text-sm font-medium mb-2">
                              {simulationState.swapExecuted ? '✅ Swap Completed' : 'Swap Preview'}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>You Pay:</span>
                                <span className="font-mono">{simulationState.stxAmount} STX</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>You Receive:</span>
                                <span className="font-mono">~{(simulationState.stxAmount * 0.00015).toFixed(4)} sBTC</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Price Impact:</span>
                                <span className="text-orange-600">0.3%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Slippage Tolerance:</span>
                                <span>1.0%</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              setSimulationState({...simulationState, swapExecuted: true})
                              toast({
                                title: "Swap Executed! 🔄",
                                description: `Successfully swapped ${simulationState.stxAmount} STX for ${(simulationState.stxAmount * 0.00015).toFixed(4)} sBTC`,
                              })
                            }}
                          >
                            {simulationState.swapExecuted ? '✓ Swap Complete' : 'Execute Swap (Simulated)'}
                          </Button>
                          {simulationState.swapExecuted && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-green-700">
                                ✅ Swap successful! Tokens have been exchanged at the optimal rate.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {quest.slug === 'staking-warrior' && (
                        <div className="space-y-3">
                          <div className={`p-3 rounded border transition-all ${
                            simulationState.stakingStarted ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'
                          }`}>
                            <p className="text-sm font-medium mb-2">
                              {simulationState.stakingStarted ? '🔒 Stacking Active' : 'Stacking Details'}
                            </p>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span>Your STX:</span>
                                <span className="font-mono">1,000 STX</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lock Period:</span>
                                <span>2 weeks (1 cycle)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Est. BTC Rewards:</span>
                                <span className="font-mono text-green-600">~0.0002 BTC</span>
                              </div>
                              <div className="flex justify-between">
                                <span>APY:</span>
                                <span className="font-bold">~6.5%</span>
                              </div>
                              {simulationState.stakingStarted && (
                                <div className="flex justify-between pt-2 border-t">
                                  <span>Status:</span>
                                  <span className="text-green-600 font-medium">✓ Locked & Earning</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              setSimulationState({...simulationState, stakingStarted: true})
                              toast({
                                title: "Stacking Started! 🔒",
                                description: "1,000 STX locked for 2 weeks. You'll earn BTC rewards!",
                              })
                            }}
                          >
                            {simulationState.stakingStarted ? '✓ Stacking Active' : 'Start Stacking (Simulated)'}
                          </Button>
                          {simulationState.stakingStarted && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-green-700">
                                ✅ Stacking active! Your STX is locked and earning Bitcoin rewards.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Default simulation for other quests */}
                      {!['liquidity-kata', 'yield-sprint', 'swap-sensei', 'staking-warrior'].includes(quest.slug) && (
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm text-muted-foreground mb-3">
                              Interactive simulation for <strong>{quest.title}</strong>
                            </p>
                            <div className="space-y-2">
                              <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-3/4 rounded-full"></div>
                              </div>
                              <p className="text-xs text-center text-muted-foreground">
                                Simulation Progress: 75%
                              </p>
                            </div>
                          </div>
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Complete Simulation
                          </Button>
                        </div>
                      )}
                      
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-green-700">
                          ✅ This is a safe simulation - no real funds are being used
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-700 mb-2">✅ Knowledge Check</h3>
                  
                  {/* Liquidity Kata Questions */}
                  {quest.slug === 'liquidity-kata' && selectedStep.id === 1 && (
                    <>
                      <p className="text-sm text-green-600 mb-3">
                        What is the main risk when providing liquidity to a pool?
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant={selectedAnswer === "A" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("A", "C")}
                        >
                          A) Losing your wallet password
                        </Button>
                        <Button 
                          variant={selectedAnswer === "B" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("B", "C")}
                        >
                          B) High gas fees
                        </Button>
                        <Button 
                          variant={selectedAnswer === "C" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left bg-green-100 hover:bg-green-200"
                          onClick={() => handleAnswerSelect("C", "C")}
                        >
                          C) Impermanent loss from price divergence ✓
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {quest.slug === 'liquidity-kata' && selectedStep.id === 2 && (
                    <>
                      <p className="text-sm text-green-600 mb-3">
                        What do you receive when adding liquidity to a pool?
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant={selectedAnswer === "A" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left bg-green-100 hover:bg-green-200"
                          onClick={() => handleAnswerSelect("A", "A")}
                        >
                          A) LP tokens representing your pool share ✓
                        </Button>
                        <Button 
                          variant={selectedAnswer === "B" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("B", "A")}
                        >
                          B) NFTs
                        </Button>
                        <Button 
                          variant={selectedAnswer === "C" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("C", "A")}
                        >
                          C) Bonus tokens
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {quest.slug === 'yield-sprint' && selectedStep.id === 1 && (
                    <>
                      <p className="text-sm text-green-600 mb-3">
                        What does a higher APY typically indicate?
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant={selectedAnswer === "A" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("A", "B")}
                        >
                          A) Lower risk
                        </Button>
                        <Button 
                          variant={selectedAnswer === "B" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left bg-green-100 hover:bg-green-200"
                          onClick={() => handleAnswerSelect("B", "B")}
                        >
                          B) Higher risk and potential rewards ✓
                        </Button>
                        <Button 
                          variant={selectedAnswer === "C" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("C", "B")}
                        >
                          C) Government backing
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {quest.slug === 'swap-sensei' && selectedStep.id === 1 && (
                    <>
                      <p className="text-sm text-green-600 mb-3">
                        What formula do AMMs use to price tokens?
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant={selectedAnswer === "A" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("A", "C")}
                        >
                          A) Supply and demand
                        </Button>
                        <Button 
                          variant={selectedAnswer === "B" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("B", "C")}
                        >
                          B) Market orders
                        </Button>
                        <Button 
                          variant={selectedAnswer === "C" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left bg-green-100 hover:bg-green-200"
                          onClick={() => handleAnswerSelect("C", "C")}
                        >
                          C) Constant product formula (x × y = k) ✓
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {quest.slug === 'staking-warrior' && selectedStep.id === 1 && (
                    <>
                      <p className="text-sm text-green-600 mb-3">
                        What do you earn when stacking STX tokens?
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant={selectedAnswer === "A" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("A", "B")}
                        >
                          A) More STX tokens
                        </Button>
                        <Button 
                          variant={selectedAnswer === "B" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left bg-green-100 hover:bg-green-200"
                          onClick={() => handleAnswerSelect("B", "B")}
                        >
                          B) Bitcoin (BTC) rewards ✓
                        </Button>
                        <Button 
                          variant={selectedAnswer === "C" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("C", "B")}
                        >
                          C) USD stablecoins
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {/* Default knowledge check for other steps */}
                  {!((quest.slug === 'liquidity-kata' && [1,2].includes(selectedStep.id)) ||
                      (quest.slug === 'yield-sprint' && selectedStep.id === 1) ||
                      (quest.slug === 'swap-sensei' && selectedStep.id === 1) ||
                      (quest.slug === 'staking-warrior' && selectedStep.id === 1)) && (
                    <>
                      <p className="text-sm text-green-600 mb-3">
                        Ready to complete this step?
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant={selectedAnswer === "A" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("A", "B")}
                        >
                          A) I need to review the material
                        </Button>
                        <Button 
                          variant={selectedAnswer === "B" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left bg-green-100 hover:bg-green-200"
                          onClick={() => handleAnswerSelect("B", "B")}
                        >
                          B) Yes, I'm ready to proceed ✓
                        </Button>
                        <Button 
                          variant={selectedAnswer === "C" ? "default" : "outline"}
                          size="sm" 
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect("C", "B")}
                        >
                          C) I need more practice
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {selectedAnswer && (selectedAnswer === "C" || selectedAnswer === "A" || selectedAnswer === "B") && (
                    <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                      <p className="text-sm text-green-700 font-medium">
                        {(quest.slug === 'liquidity-kata' && selectedStep.id === 1 && selectedAnswer === "C") ||
                         (quest.slug === 'liquidity-kata' && selectedStep.id === 2 && selectedAnswer === "A") ||
                         (quest.slug === 'yield-sprint' && selectedStep.id === 1 && selectedAnswer === "B") ||
                         (quest.slug === 'swap-sensei' && selectedStep.id === 1 && selectedAnswer === "C") ||
                         (quest.slug === 'staking-warrior' && selectedStep.id === 1 && selectedAnswer === "B") ||
                         (selectedAnswer === "B" && !((quest.slug === 'liquidity-kata' && [1,2].includes(selectedStep.id)) ||
                          (quest.slug === 'yield-sprint' && selectedStep.id === 1) ||
                          (quest.slug === 'swap-sensei' && selectedStep.id === 1) ||
                          (quest.slug === 'staking-warrior' && selectedStep.id === 1)))
                          ? "✅ Correct! You can now complete this step."
                          : "❌ Not quite. Review the learning module above and try again."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
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
                  disabled={isSubmittingAction || !(
                    (quest.slug === 'liquidity-kata' && selectedStep.id === 1 && selectedAnswer === "C") ||
                    (quest.slug === 'liquidity-kata' && selectedStep.id === 2 && selectedAnswer === "A") ||
                    (quest.slug === 'yield-sprint' && selectedStep.id === 1 && selectedAnswer === "B") ||
                    (quest.slug === 'swap-sensei' && selectedStep.id === 1 && selectedAnswer === "C") ||
                    (quest.slug === 'staking-warrior' && selectedStep.id === 1 && selectedAnswer === "B") ||
                    (selectedAnswer === "B" && !((quest.slug === 'liquidity-kata' && [1,2].includes(selectedStep.id)) ||
                     (quest.slug === 'yield-sprint' && selectedStep.id === 1) ||
                     (quest.slug === 'swap-sensei' && selectedStep.id === 1) ||
                     (quest.slug === 'staking-warrior' && selectedStep.id === 1)))
                  )}
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
