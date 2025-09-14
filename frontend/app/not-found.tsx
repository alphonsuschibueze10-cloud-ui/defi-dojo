"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SparklesIcon } from "@heroicons/react/24/outline"
import { useAuthStore } from "../lib/stores/auth-store"

export default function NotFound() {
  const router = useRouter()
  const { isAuthed } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(isAuthed ? "/dashboard" : "/")
    }, 5000)

    return () => clearTimeout(timer)
  }, [isAuthed, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dojo-grid">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <SparklesIcon className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-3xl font-heading font-bold text-primary mb-4">404 - Path Not Found</h1>
        <p className="text-lg text-muted-foreground mb-2">You have wandered off the blockchain path.</p>
        <p className="text-sm text-muted-foreground mb-8">
          Redirecting you {isAuthed ? "to your dashboard" : "home"} in 5 seconds...
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push("/")} variant="outline">
            Return Home
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="bg-primary hover:bg-primary/90">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
