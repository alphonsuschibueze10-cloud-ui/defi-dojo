"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Sparkles, Flame, Crown } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  username: string
  xp: number
  level: string
  questsCompleted: number
  avatar?: string
  isCurrentUser?: boolean
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    username: "BitcoinSamurai",
    xp: 5420,
    level: "Master Sensei",
    questsCompleted: 24,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 2,
    username: "DeFiNinja",
    xp: 4890,
    level: "Advanced Warrior",
    questsCompleted: 22,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 3,
    username: "StacksExplorer",
    xp: 4320,
    level: "Advanced Warrior",
    questsCompleted: 19,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 4,
    username: "LightningMaster",
    xp: 3850,
    level: "Skilled Apprentice",
    questsCompleted: 17,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 5,
    username: "YieldFarmer",
    xp: 3420,
    level: "Skilled Apprentice",
    questsCompleted: 15,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  // ... more entries
  {
    rank: 42,
    username: "SatoshiSensei42",
    xp: 1250,
    level: "Novice Samurai",
    questsCompleted: 8,
    avatar: "/placeholder.svg?height=40&width=40",
    isCurrentUser: true,
  },
]

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getLevelColor = (level: string) => {
    if (level.includes("Master")) return "text-accent border-accent/30 bg-accent/10"
    if (level.includes("Advanced")) return "text-primary border-primary/30 bg-primary/10"
    if (level.includes("Skilled")) return "text-secondary border-secondary/30 bg-secondary/10"
    return "text-muted-foreground border-muted/30 bg-muted/10"
  }

  const currentUser = mockLeaderboard.find((entry) => entry.isCurrentUser)
  const topPlayers = mockLeaderboard.filter((entry) => !entry.isCurrentUser).slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Leaderboard</h1>
            <p className="text-muted-foreground">See how you rank among fellow DeFi masters</p>
          </div>
        </div>
      </motion.div>

      {/* Current User Stats */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary font-heading flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(currentUser.rank)}
                    <span className="text-2xl font-heading font-bold">#{currentUser.rank}</span>
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{currentUser.username}</p>
                    <Badge variant="outline" className={getLevelColor(currentUser.level)}>
                      {currentUser.level}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xl font-heading font-bold text-primary">{currentUser.xp} XP</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentUser.questsCompleted} quests completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-accent font-heading flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPlayers.slice(0, 3).map((player, index) => (
                <motion.div
                  key={player.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`p-4 rounded-lg border text-center ${
                    player.rank === 1
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : player.rank === 2
                        ? "bg-gray-400/10 border-gray-400/30"
                        : "bg-amber-600/10 border-amber-600/30"
                  }`}
                >
                  <div className="flex justify-center mb-3">{getRankIcon(player.rank)}</div>
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={player.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {player.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-2">{player.username}</h3>
                  <Badge variant="outline" className={`${getLevelColor(player.level)} mb-2`}>
                    {player.level}
                  </Badge>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">{player.xp} XP</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{player.questsCompleted} quests</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary font-heading">All Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPlayers.slice(3).map((player, index) => (
                <motion.div
                  key={player.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">{getRankIcon(player.rank)}</div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={player.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {player.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{player.username}</p>
                      <Badge variant="outline" className={`${getLevelColor(player.level)} text-xs`}>
                        {player.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">{player.xp} XP</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{player.questsCompleted} quests</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
