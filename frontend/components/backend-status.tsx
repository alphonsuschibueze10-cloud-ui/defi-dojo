"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { hybridApiClient, BackendStatus } from "@/lib/hybrid-api"

interface BackendStatusProps {
  className?: string
  showDetails?: boolean
}

export function BackendStatusIndicator({ className, showDetails = false }: BackendStatusProps) {
  const [status, setStatus] = useState<BackendStatus>({
    isOnline: false,
    lastChecked: new Date()
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkStatus = async () => {
    setIsRefreshing(true)
    try {
      await hybridApiClient.refreshBackendStatus()
      setStatus(hybridApiClient.getBackendStatus())
    } catch (error) {
      console.error('Failed to check backend status:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Initial check
    checkStatus()
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (status.isOnline) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (status.error) {
      return <XCircle className="w-4 h-4 text-red-500" />
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    if (status.isOnline) {
      return "Backend Online"
    } else if (status.error) {
      return "Backend Offline"
    } else {
      return "Checking..."
    }
  }

  const getStatusColor = () => {
    if (status.isOnline) {
      return "bg-green-500/20 text-green-400 border-green-500/30"
    } else if (status.error) {
      return "bg-red-500/20 text-red-400 border-red-500/30"
    } else {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  if (showDetails) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">Backend Status</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline" className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Checked:</span>
              <span className="text-sm">
                {status.lastChecked.toLocaleTimeString()}
              </span>
            </div>
            
            {status.error && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Error:</span>
                <span className="text-sm text-red-400 truncate max-w-32">
                  {status.error}
                </span>
              </div>
            )}
            
            {!status.isOnline && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  <span>Using offline mode with mock data</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusText()}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={checkStatus}
        disabled={isRefreshing}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}

export default BackendStatusIndicator
