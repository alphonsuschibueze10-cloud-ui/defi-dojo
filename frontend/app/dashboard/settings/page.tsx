"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-heading font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your dojo preferences and account settings</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary font-heading">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">SS</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="SatoshiSensei42" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="sensei@dojo.btc" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Bitcoin maximalist and DeFi enthusiast" />
              </div>

              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-secondary font-heading">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <Badge variant="secondary">12 Samurai</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="font-semibold">1,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quests Completed</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="font-semibold">Dec 2024</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Wallet Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-accent font-heading">Wallet Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div>
                <p className="font-semibold">Hiro Wallet</p>
                <p className="text-sm text-muted-foreground">SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7</p>
              </div>
              <Badge variant="outline" className="text-accent border-accent">
                Connected
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Disconnect Wallet</Button>
              <Button variant="outline">Add Another Wallet</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary font-heading">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for quest completions and rewards</p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-hints">AI Hint Cooldown</Label>
                <p className="text-sm text-muted-foreground">Enable cooldown period between AI hint requests</p>
              </div>
              <Switch id="ai-hints" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leaderboard">Public Leaderboard</Label>
                <p className="text-sm text-muted-foreground">Show your progress on the public leaderboard</p>
              </div>
              <Switch id="leaderboard" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
