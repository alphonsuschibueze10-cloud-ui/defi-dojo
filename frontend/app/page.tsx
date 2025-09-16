"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Trophy, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Shield, 
  Target,
  Users,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-6 bg-secondary/20 text-secondary border-secondary/30">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered DeFi Training
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary mb-6">
              DeFi Dojo
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Sharpen Your DeFi Skills. Earn XP. Master Bitcoin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/dashboard">
                  Enter Dojo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://defi-dojo.onrender.com/docs" target="_blank" rel="noopener noreferrer">
                  View API Docs
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Master DeFi Like a Samurai
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Train with AI-powered quests, track your progress, and climb the leaderboard
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">AI Quests</h3>
                  <p className="text-muted-foreground">
                    Complete skill-building challenges designed by AI to master DeFi protocols
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-secondary mb-2">Earn XP</h3>
                  <p className="text-muted-foreground">
                    Gain experience points and level up your DeFi skills with each completed quest
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-accent mb-2">Track Portfolio</h3>
                  <p className="text-muted-foreground">
                    Monitor your Bitcoin and Stacks holdings with real-time portfolio tracking
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">Leaderboard</h3>
                  <p className="text-muted-foreground">
                    Compete with other DeFi warriors and climb the global leaderboard
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-heading font-bold text-primary mb-4">
                    System Status
                  </h2>
                  <p className="text-muted-foreground">
                    All systems operational and ready for training
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-semibold text-secondary mb-1">Frontend</h3>
                    <p className="text-sm text-muted-foreground">Deployed on Vercel</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-semibold text-secondary mb-1">Backend</h3>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href="https://defi-dojo.onrender.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline"
                      >
                        defi-dojo.onrender.com
                      </a>
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-semibold text-secondary mb-1">API</h3>
                    <p className="text-sm text-muted-foreground">Connected & Working</p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30 px-4 py-2">
                    🚀 Ready for DeFi Training
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the DeFi Dojo and start your path to becoming a Bitcoin DeFi master
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/dashboard">
                Enter the Dojo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}