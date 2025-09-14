"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Sparkles, BarChart3, Settings, Trophy, Zap } from "lucide-react"
import { useUIStore } from "@/lib/stores/ui-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: BarChart3 },
  { name: "Game Quests", href: "/dashboard/quests", icon: Sparkles },
  { name: "AI Sensei", href: "/dashboard/ai-sensei", icon: Zap },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
      aria-expanded={!sidebarCollapsed}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
                className="font-heading font-semibold text-sidebar-foreground"
              >
                Satoshi Sensei
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-2 hover:bg-sidebar-accent text-sidebar-foreground"
        >
          <svg
            className={cn("w-5 h-5 transform transition-transform", sidebarCollapsed ? "" : "rotate-180")}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6 6 L14 10 L6 14 Z" />
          </svg>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 mb-1 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.16 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        {sidebarCollapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-sidebar-primary-foreground">₿</span>
            </div>
          </div>
        ) : (
          <ConnectWalletButton />
        )}
      </div>
    </motion.aside>
  )
}
