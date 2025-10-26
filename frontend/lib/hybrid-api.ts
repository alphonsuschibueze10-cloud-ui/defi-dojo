import { Quest, UserQuest, AuthResponse, NonceResponse } from './api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://defi-dojo.onrender.com'

// Mock data for offline functionality
const ALL_QUESTS: Quest[] = [
  {
    id: "liquidity-kata",
    slug: "liquidity-kata",
    title: "Liquidity Kata",
    description: "Master the art of providing liquidity to DeFi pools. Learn about AMM mechanics, impermanent loss, and yield optimization strategies.",
    difficulty: 1,
    reward_json: {
      xp: 100,
      badge: "Liquidity Provider",
      badge_id: 1
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "yield-sprint",
    slug: "yield-sprint",
    title: "Yield Sprint",
    description: "Optimize your yield farming strategies across multiple protocols. Learn about compound interest, risk management, and portfolio diversification.",
    difficulty: 2,
    reward_json: {
      xp: 200,
      badge: "Yield Farmer",
      badge_id: 2
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "swap-sensei",
    slug: "swap-sensei",
    title: "Swap Sensei",
    description: "Master the art of token swapping on decentralized exchanges. Learn about slippage, price impact, and optimal swap routes.",
    difficulty: 1,
    reward_json: {
      xp: 100,
      badge: "Swap Master",
      badge_id: 5
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "staking-warrior",
    slug: "staking-warrior",
    title: "Staking Warrior",
    description: "Learn to stake your STX tokens and earn rewards. Understand delegation, lock periods, and stacking cycles on the Stacks blockchain.",
    difficulty: 1,
    reward_json: {
      xp: 150,
      badge: "Staking Pro",
      badge_id: 6
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "arbitrage-master",
    slug: "arbitrage-master",
    title: "Arbitrage Master",
    description: "Discover and execute profitable arbitrage opportunities across different DEXs. Learn to spot price differences and execute multi-step trades.",
    difficulty: 3,
    reward_json: {
      xp: 300,
      badge: "Arbitrage Expert",
      badge_id: 7
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "lending-legend",
    slug: "lending-legend",
    title: "Lending Legend",
    description: "Master DeFi lending and borrowing protocols. Learn about collateral ratios, liquidation risks, and interest rate models.",
    difficulty: 2,
    reward_json: {
      xp: 250,
      badge: "Lending Master",
      badge_id: 8
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "nft-trader",
    slug: "nft-trader",
    title: "NFT Trader",
    description: "Learn to trade NFTs on Bitcoin and Stacks. Understand floor prices, rarity traits, and marketplace dynamics.",
    difficulty: 2,
    reward_json: {
      xp: 200,
      badge: "NFT Collector",
      badge_id: 9
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "lightning-master",
    slug: "lightning-master",
    title: "Lightning Master",
    description: "Master Bitcoin Lightning Network operations. Learn about payment channels, routing, and micro-transactions.",
    difficulty: 3,
    reward_json: {
      xp: 350,
      badge: "Lightning Warrior",
      badge_id: 3
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "flash-loan-ninja",
    slug: "flash-loan-ninja",
    title: "Flash Loan Ninja",
    description: "Learn advanced DeFi strategies using flash loans. Execute complex multi-protocol transactions without upfront capital.",
    difficulty: 4,
    reward_json: {
      xp: 500,
      badge: "Flash Loan Expert",
      badge_id: 10
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "defi-ninja",
    slug: "defi-ninja",
    title: "DeFi Ninja",
    description: "Become a DeFi protocol expert. Learn about smart contract interactions, gas optimization, and advanced trading strategies.",
    difficulty: 4,
    reward_json: {
      xp: 600,
      badge: "DeFi Ninja",
      badge_id: 4
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "portfolio-optimizer",
    slug: "portfolio-optimizer",
    title: "Portfolio Optimizer",
    description: "Learn to build and rebalance a diversified DeFi portfolio. Master risk management and asset allocation strategies.",
    difficulty: 3,
    reward_json: {
      xp: 300,
      badge: "Portfolio Manager",
      badge_id: 11
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "dao-governor",
    slug: "dao-governor",
    title: "DAO Governor",
    description: "Participate in decentralized governance. Learn to create proposals, vote on decisions, and shape protocol development.",
    difficulty: 2,
    reward_json: {
      xp: 250,
      badge: "DAO Participant",
      badge_id: 12
    },
    active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  }
]

// Public quests (show all quests)
const MOCK_QUESTS: Quest[] = ALL_QUESTS

const MOCK_USER_QUESTS: UserQuest[] = [
  {
    id: "user-quest-1",
    user_id: "user-123",
    quest_id: "liquidity-kata",
    status: "in-progress",
    progress: 75,
    started_at: "2024-01-20T09:00:00Z",
    quest: MOCK_QUESTS[0]
  },
  {
    id: "user-quest-2",
    user_id: "user-123",
    quest_id: "yield-sprint",
    status: "completed",
    progress: 100,
    started_at: "2024-01-18T14:30:00Z",
    completed_at: "2024-01-19T16:45:00Z",
    quest: MOCK_QUESTS[1]
  }
]

const MOCK_LEADERBOARD = [
  { rank: 1, user_id: "user-456", username: "BitcoinSamurai", xp: 2500, level: 15 },
  { rank: 2, user_id: "user-789", username: "DeFiMaster", xp: 2200, level: 14 },
  { rank: 3, user_id: "user-123", username: "LightningWarrior", xp: 1800, level: 12 },
  { rank: 4, user_id: "user-321", username: "YieldFarmer", xp: 1500, level: 11 },
  { rank: 5, user_id: "user-654", username: "LiquidityProvider", xp: 1200, level: 10 }
]

export interface BackendStatus {
  isOnline: boolean
  lastChecked: Date
  error?: string
}

class HybridApiClient {
  private baseUrl: string
  private token: string | null = null
  private backendStatus: BackendStatus = {
    isOnline: false,
    lastChecked: new Date()
  }

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.checkBackendStatus()
  }

  setToken(token: string | null) {
    this.token = token
  }

  getBackendStatus(): BackendStatus {
    return this.backendStatus
  }

  private async checkBackendStatus(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (response.ok) {
        this.backendStatus = {
          isOnline: true,
          lastChecked: new Date()
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      this.backendStatus = {
        isOnline: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async requestWithFallback<T>(
    endpoint: string,
    mockData: T,
    options: RequestInit = {}
  ): Promise<T> {
    // If we know backend is offline, return mock data immediately
    if (!this.backendStatus.isOnline) {
      console.log(`Backend offline, using mock data for ${endpoint}`)
      return mockData
    }

    try {
      const url = `${this.baseUrl}${endpoint}`
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Update backend status on successful request
      this.backendStatus = {
        isOnline: true,
        lastChecked: new Date()
      }

      return data
    } catch (error) {
      console.warn(`API request failed for ${endpoint}, using mock data:`, error)
      
      // Update backend status on error
      this.backendStatus = {
        isOnline: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      return mockData
    }
  }

  // Auth endpoints (no fallback for auth)
  async getNonce(address: string): Promise<NonceResponse> {
    if (!this.backendStatus.isOnline) {
      throw new Error('Backend is offline. Authentication requires a live connection.')
    }
    
    return this.requestWithFallback<NonceResponse>('/api/v1/auth/nonce', {
      nonce: 'mock-nonce',
      message: 'Mock authentication message'
    }, {
      method: 'POST',
      body: JSON.stringify({ address }),
    })
  }

  async verifySignature(address: string, signature: string, nonce: string): Promise<AuthResponse> {
    if (!this.backendStatus.isOnline) {
      throw new Error('Backend is offline. Authentication requires a live connection.')
    }
    
    return this.requestWithFallback<AuthResponse>('/api/v1/auth/verify', {
      access_token: 'mock-token',
      token_type: 'bearer',
      user: {
        id: 'mock-user-id',
        address: address,
        created_at: new Date().toISOString()
      }
    }, {
      method: 'POST',
      body: JSON.stringify({ address, signature, nonce }),
    })
  }

  // Quest endpoints with fallback
  async getQuests(): Promise<Quest[]> {
    return this.requestWithFallback<Quest[]>('/api/v1/quests/', MOCK_QUESTS)
  }

  async getPublicQuests(): Promise<Quest[]> {
    return this.requestWithFallback<Quest[]>('/api/v1/quests/public', MOCK_QUESTS)
  }

  async getQuest(id: string): Promise<Quest> {
    const mockQuest = ALL_QUESTS.find(q => q.id === id)
    if (!mockQuest) {
      throw new Error(`Quest with id ${id} not found`)
    }
    
    return this.requestWithFallback<Quest>(`/api/v1/quests/${id}`, mockQuest)
  }

  async startQuest(questId: string): Promise<UserQuest> {
    const quest = ALL_QUESTS.find(q => q.id === questId)
    if (!quest) {
      throw new Error(`Quest with id ${questId} not found`)
    }

    const mockUserQuest: UserQuest = {
      id: `user-quest-${Date.now()}`,
      user_id: 'mock-user-id',
      quest_id: questId,
      status: 'in-progress',
      progress: 0,
      started_at: new Date().toISOString(),
      quest
    }

    return this.requestWithFallback<UserQuest>(`/api/v1/quests/${questId}/start`, mockUserQuest, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async getUserQuests(): Promise<UserQuest[]> {
    return this.requestWithFallback<UserQuest[]>('/api/v1/quests/user', MOCK_USER_QUESTS)
  }

  async updateQuestProgress(userQuestId: string, progress: number): Promise<UserQuest> {
    const mockUserQuest = MOCK_USER_QUESTS.find(uq => uq.id === userQuestId)
    if (!mockUserQuest) {
      throw new Error(`User quest with id ${userQuestId} not found`)
    }

    const updatedQuest = { ...mockUserQuest, progress }

    return this.requestWithFallback<UserQuest>(`/api/v1/quests/${userQuestId}/progress`, updatedQuest, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    })
  }

  async completeQuest(userQuestId: string): Promise<UserQuest> {
    const mockUserQuest = MOCK_USER_QUESTS.find(uq => uq.id === userQuestId)
    if (!mockUserQuest) {
      throw new Error(`User quest with id ${userQuestId} not found`)
    }

    const completedQuest = { 
      ...mockUserQuest, 
      status: 'completed' as const,
      progress: 100,
      completed_at: new Date().toISOString()
    }

    return this.requestWithFallback<UserQuest>(`/api/v1/quests/${userQuestId}/complete`, completedQuest, {
      method: 'POST',
    })
  }

  // Leaderboard endpoints with fallback
  async getLeaderboard(limit?: number): Promise<any> {
    const limitedData = limit ? MOCK_LEADERBOARD.slice(0, limit) : MOCK_LEADERBOARD
    const params = limit ? `?limit=${limit}` : ''
    return this.requestWithFallback(`/api/v1/leaderboard/${params}`, limitedData)
  }

  async getUserLeaderboardPosition(userId: string): Promise<any> {
    const userPosition = MOCK_LEADERBOARD.find(entry => entry.user_id === userId)
    const mockPosition = userPosition || { rank: 999, user_id: userId, username: 'New Player', xp: 0, level: 1 }
    
    return this.requestWithFallback(`/api/v1/leaderboard/user/${userId}`, mockPosition)
  }

  // AI Hint endpoints
  async requestAIHint(userQuestId: string, context: any): Promise<{ ai_run_id: string; status: string }> {
    const mockResponse = {
      ai_run_id: `mock-${Date.now()}`,
      status: 'queued'
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          user_quest_id: userQuestId,
          context: context
        }),
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.warn('AI hint request failed, using mock:', error)
      return mockResponse
    }
  }

  async getAIHint(aiRunId: string): Promise<{ ai_run_id: string; status: string; hint?: string; risk?: string; param?: any }> {
    const mockResponse = {
      ai_run_id: aiRunId,
      status: 'completed',
      hint: 'This is a simulated AI response. Connect to the backend to get real AI-powered insights about DeFi strategies and market analysis.'
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/hint/${aiRunId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.warn('AI hint fetch failed, using mock:', error)
      return mockResponse
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        const data = await response.json()
        this.backendStatus = {
          isOnline: true,
          lastChecked: new Date()
        }
        return data
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      this.backendStatus = {
        isOnline: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      return { status: 'offline' }
    }
  }

  // Force refresh backend status
  async refreshBackendStatus(): Promise<void> {
    await this.checkBackendStatus()
  }
}

export const hybridApiClient = new HybridApiClient()
