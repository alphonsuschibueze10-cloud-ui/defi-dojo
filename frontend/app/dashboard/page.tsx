"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Sparkles, Zap, Trophy, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Welcome back, Sensei</h1>
            <p className="text-muted-foreground mt-1">Ready to master more DeFi skills today?</p>
          </div>
          <Badge variant="secondary" className="bg-slate-800 text-white border-slate-700 px-4 py-2">
            Level 12 Samurai
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-heading font-bold text-primary">1,250</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quests Completed</p>
                  <p className="text-2xl font-heading font-bold text-foreground">8</p>
                </div>
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-heading font-bold text-accent">$2,450</p>
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
                  <p className="text-2xl font-heading font-bold text-foreground">#42</p>
                </div>
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-primary font-heading">Portfolio Overview</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/portfolio">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">₿</span>
                    </div>
                    <div>
                      <p className="font-medium">Bitcoin (BTC)</p>
                      <p className="text-sm text-muted-foreground">0.05 BTC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$2,150</p>
                    <p className="text-sm text-secondary">+5.2%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-secondary-foreground">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Stacks (STX)</p>
                      <p className="text-sm text-muted-foreground">150 STX</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$300</p>
                    <p className="text-sm text-accent">-2.1%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quest Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-secondary font-heading">Active Quest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Lightning Liquidity Master</h3>
                  <p className="text-sm text-muted-foreground">Provide liquidity to a Lightning pool</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    +200 XP
                  </Badge>
                  <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" asChild>
                    <Link href="/dashboard/quests">Continue</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent font-heading">
              <Zap className="w-5 h-5" />
              AI Sensei Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-900 rounded-lg border border-red-800">
                <h4 className="font-semibold text-white mb-2">Market Opportunity</h4>
                <p className="text-sm text-red-100">
                  Bitcoin volatility is decreasing. Consider DCA strategies for the next 7 days.
                </p>
              </div>
              <div className="p-4 bg-teal-900 rounded-lg border border-teal-800">
                <h4 className="font-semibold text-white mb-2">Quest Recommendation</h4>
                <p className="text-sm text-teal-100">
                  Your liquidity providing skills are strong. Try the "Yield Farming Ninja" quest next.
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/ai-sensei">
                  Chat with Sensei
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
