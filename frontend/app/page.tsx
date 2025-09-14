"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Sparkles, Shield, Zap, Github, Twitter } from "lucide-react"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <section
        className="relative min-h-screen flex items-center justify-center dojo-grid"
        style={{
          backgroundImage: `url('/futuristic-bitcoin-dojo-training-ground-with-neon-.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-6">
          <nav className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold text-primary">Satoshi Sensei</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <ConnectWalletButton />
            </div>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-balance mb-6">
              <span className="text-primary">Sharpen Your DeFi Skills.</span>
              <br />
              <span className="text-secondary">Earn XP.</span>
              <br />
              <span className="text-accent">Master Bitcoin.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              Train in the ultimate Bitcoin dojo where AI meets gaming. Complete quests, earn rewards, and become a DeFi
              master on the Stacks blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="katana-slash relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/dashboard">Enter Dojo</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  View Docs
                </a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Master the Art of DeFi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three pillars of mastery await you in the dojo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-secondary mb-4">AI Trading Sensei</h3>
                  <p className="text-muted-foreground">
                    Get real-time BTC DeFi coaching from our AI-powered sensei. Learn strategies, understand markets,
                    and make informed decisions.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-accent mb-4">Game Quests</h3>
                  <p className="text-muted-foreground">
                    Earn XP and NFTs by completing trading challenges. Level up your skills through gamified learning
                    experiences.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary mb-4">Secure on Stacks</h3>
                  <p className="text-muted-foreground">
                    All contracts are Clarity-powered on the Stacks blockchain. Experience the security of Bitcoin with
                    smart contract capabilities.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold text-primary">Satoshi Sensei</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2024 Satoshi Sensei. Built for the Stacks Vibe Coding Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
