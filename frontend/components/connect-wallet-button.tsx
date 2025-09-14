"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuthStore } from "../lib/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wallet, CheckCircle } from "lucide-react"

// Mock Hiro wallet interface for demo purposes
interface MockWallet {
  getAddress: () => Promise<string>
  signMessage: (message: string) => Promise<string>
  isConnected: () => boolean
}

// Mock wallet implementation
const mockWallet: MockWallet = {
  getAddress: async () => {
    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
  },
  signMessage: async (message: string) => {
    // Simulate signing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return `signed_${message}_${Date.now()}`
  },
  isConnected: () => false,
}

// Mock API calls
const mockAPI = {
  getNonce: async (address: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { nonce: `nonce_${address}_${Date.now()}` }
  },
  verifySignature: async (address: string, signature: string, nonce: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { token: `jwt_token_${Date.now()}`, success: true }
  },
}

export function ConnectWalletButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { address, isAuthed, setAuth, clearAuth } = useAuthStore()
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Step 1: Get wallet address
      toast({
        title: "Connecting Wallet",
        description: "Please approve the connection in your wallet...",
      })

      const walletAddress = await mockWallet.getAddress()

      // Step 2: Get nonce from backend
      toast({
        title: "Getting Nonce",
        description: "Requesting authentication challenge...",
      })

      const { nonce } = await mockAPI.getNonce(walletAddress)

      // Step 3: Sign nonce with wallet
      toast({
        title: "Sign Message",
        description: "Please sign the authentication message in your wallet...",
      })

      const signature = await mockWallet.signMessage(nonce)

      // Step 4: Verify signature with backend
      toast({
        title: "Verifying Signature",
        description: "Authenticating your wallet...",
      })

      const { token, success } = await mockAPI.verifySignature(walletAddress, signature, nonce)

      if (success) {
        setAuth(walletAddress, token)
        setIsOpen(false)
        toast({
          title: "Wallet Connected!",
          description: `Successfully connected ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`,
        })
      } else {
        throw new Error("Authentication failed")
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    clearAuth()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  if (isAuthed && address) {
    return (
      <Dialog>
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
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Hiro Wallet</p>
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
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Connect your Stacks wallet to start your DeFi journey in the dojo. We'll need you to sign a message to
            verify ownership.
          </p>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Hiro Wallet</p>
                <p className="text-sm text-muted-foreground">Recommended for Stacks ecosystem</p>
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
                Connect Hiro Wallet
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
