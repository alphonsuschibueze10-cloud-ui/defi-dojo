"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, PieChart } from "lucide-react"

interface Asset {
  symbol: string
  name: string
  balance: string
  value: number
  change24h: number
  allocation: number
}

const mockAssets: Asset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: "0.05 BTC",
    value: 2150,
    change24h: 5.2,
    allocation: 65,
  },
  {
    symbol: "STX",
    name: "Stacks",
    balance: "150 STX",
    value: 300,
    change24h: -2.1,
    allocation: 20,
  },
  {
    symbol: "sBTC",
    name: "Synthetic Bitcoin",
    balance: "0.02 sBTC",
    value: 860,
    change24h: 4.8,
    allocation: 15,
  },
]

export default function PortfolioPage() {
  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0)
  const totalChange = mockAssets.reduce((sum, asset) => sum + (asset.value * asset.change24h) / 100, 0)
  const totalChangePercent = (totalChange / totalValue) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-heading font-bold text-primary">Portfolio</h1>
        <p className="text-muted-foreground mt-1">Track your DeFi assets and performance</p>
      </motion.div>

      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary font-heading flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-heading font-bold text-foreground">${totalValue.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  {totalChangePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-secondary" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-accent" />
                  )}
                  <span className={`font-semibold ${totalChangePercent >= 0 ? "text-secondary" : "text-accent"}`}>
                    {totalChangePercent >= 0 ? "+" : ""}
                    {totalChangePercent.toFixed(2)}% (${totalChange.toFixed(2)})
                  </span>
                  <span className="text-muted-foreground text-sm">24h</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                  3 Assets
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Asset Allocation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-secondary font-heading">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAssets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{asset.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.balance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${asset.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{asset.allocation}%</p>
                  </div>
                </div>
                <Progress value={asset.allocation} className="h-2" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Assets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockAssets.map((asset, index) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{asset.symbol[0]}</span>
                    </div>
                    <span className="font-heading">{asset.symbol}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {asset.allocation}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="font-semibold">{asset.balance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="text-xl font-heading font-bold">${asset.value.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-secondary" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-accent" />
                    )}
                    <span
                      className={`text-sm font-semibold ${asset.change24h >= 0 ? "text-secondary" : "text-accent"}`}
                    >
                      {asset.change24h >= 0 ? "+" : ""}
                      {asset.change24h.toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground">24h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
