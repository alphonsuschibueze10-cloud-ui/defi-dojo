"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wallet, CheckCircle } from "lucide-react"

// Declare sats-connect types
declare global {
  interface Window {
    XverseProviders?: any
    LeatherProvider?: any
  }
}

// AddressPurpose enum from sats-connect
enum AddressPurpose {
  Ordinals = 'ordinals',
  Payment = 'payment',
  Stacks = 'stacks'
}

// Import sats-connect dynamically
let satsConnect: any = null
if (typeof window !== 'undefined') {
  import('sats-connect').then(module => {
    satsConnect = module
  }).catch(err => {
    console.error('Failed to load sats-connect:', err)
  })
}

export function ConnectWalletButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false)
  const { address, isAuthed, setAuth, clearAuth } = useAuthStore()
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Wait for sats-connect to load
      if (!satsConnect) {
        const module = await import('sats-connect')
        satsConnect = module
      }

      toast({
        title: "Connecting Wallet",
        description: "Please approve the connection in your wallet...",
      })

      // Request wallet connection using wallet_connect method
      const response: any = await satsConnect.request('wallet_connect', {
        message: 'Connect to DeFi Dojo for DeFi training and quests'
      } as any)

      console.log('Wallet response:', response)

      // Handle error response
      if (response?.status === 'error') {
        const errorMsg = response?.error?.message || 'Unknown error'
        const errorCode = response?.error?.code
        
        const error: any = new Error(errorMsg)
        error.code = errorCode
        throw error
      }

      // Handle success response
      if (response?.status === 'success' && response?.result?.addresses) {
        const addresses = response.result.addresses
        
        // Find Stacks address
        const stacksAddress = addresses.find((addr: any) => 
          addr.purpose === AddressPurpose.Stacks || 
          addr.addressType === 'stacks'
        )

        if (stacksAddress?.address) {
          const walletAddress = stacksAddress.address
          
          // Store wallet connection
          setAuth(walletAddress)
          setIsOpen(false)
          
          toast({
            title: "Wallet Connected!",
            description: `Successfully connected ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`,
          })
          return
        }
      }

      throw new Error('No Stacks addresses found in wallet')
    } catch (error: any) {
      console.error("Wallet connection failed:", error)
      
      let errorTitle = "Connection Failed"
      let errorDescription = "Failed to connect wallet. Please try again."
      
      // Handle specific errors
      if (error.code === -32002) {
        errorTitle = "Connection Cancelled"
        errorDescription = "You cancelled the connection request. Please approve the request in your wallet."
      } else if (error.message?.includes('not installed')) {
        errorTitle = "Wallet Not Found"
        errorDescription = "Please install Xverse or Leather wallet extension."
      } else if (error.message?.includes('network')) {
        errorTitle = "Network Error"
        errorDescription = "Please check your internet connection and try again."
      } else if (error.message) {
        errorDescription = error.message
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    clearAuth()
    setIsDisconnectOpen(false)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  if (isAuthed && address) {
    return (
      <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <CheckCircle className="w-4 h-4 text-secondary" />
            <span className="hidden sm:inline">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="sm:hidden">Connected</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary font-heading">Wallet Connected</DialogTitle>
            <DialogDescription>
              Your wallet is successfully connected. You can now access all features of the DeFi Dojo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Stacks Wallet</p>
                  <p className="text-sm text-muted-foreground font-mono">{address}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleDisconnect} variant="outline" className="w-full bg-transparent">
              Disconnect Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary font-heading">Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect your Stacks wallet to start your DeFi journey in the dojo. We'll need you to sign a message to verify ownership.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">

          <div className="space-y-3">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Xverse Wallet</p>
                  <p className="text-sm text-muted-foreground">Recommended for Bitcoin & Stacks</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Leather Wallet</p>
                  <p className="text-sm text-muted-foreground">Alternative Stacks wallet</p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleConnect} disabled={isConnecting} className="w-full bg-primary hover:bg-primary/90">
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
