"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { BackendStatusIndicator } from "@/components/backend-status"

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/portfolio": "Portfolio",
  "/dashboard/quests": "Game Quests",
  "/dashboard/ai-sensei": "AI Sensei",
  "/dashboard/leaderboard": "Leaderboard",
  "/dashboard/settings": "Settings",
}

export function DashboardHeader() {
  const pathname = usePathname()
  const currentPage = pageNames[pathname] || "Dashboard"

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Sparkles className="w-5 h-5" />
          <span className="font-heading font-semibold">Home</span>
        </Link>
        <div className="text-muted-foreground">/</div>
        <h1 className="text-xl font-heading font-semibold text-foreground">{currentPage}</h1>
      </div>

      <div className="flex items-center gap-4">
        <BackendStatusIndicator />
        <Badge variant="secondary" className="bg-slate-800 text-white border-slate-700">
          <Sparkles className="w-3 h-3 mr-1" />
          1,250 XP
        </Badge>
        <ConnectWalletButton />
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">SS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
