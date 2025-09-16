const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://defi-dojo.onrender.com'

export interface Quest {
  id: string
  slug: string
  title: string
  description: string
  difficulty: number
  reward_json: {
    xp: number
    badge: string
    badge_id: number
  }
  game_rules?: any
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface UserQuest {
  id: string
  user_id: string
  quest_id: string
  status: "in-progress" | "completed"
  progress: number
  started_at: string
  completed_at?: string
  quest: Quest
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    address: string
    created_at: string
  }
}

export interface NonceResponse {
  nonce: string
  message: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Auth endpoints
  async getNonce(address: string): Promise<NonceResponse> {
    return this.request<NonceResponse>('/api/v1/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address }),
    })
  }

  async verifySignature(address: string, signature: string, nonce: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ address, signature, nonce }),
    })
  }

  // Quest endpoints
  async getQuests(): Promise<Quest[]> {
    return this.request<Quest[]>('/api/v1/quests/')
  }

  async getPublicQuests(): Promise<Quest[]> {
    return this.request<Quest[]>('/api/v1/quests/public')
  }

  async getQuest(id: string): Promise<Quest> {
    return this.request<Quest>(`/api/v1/quests/${id}`)
  }

  async startQuest(questId: string): Promise<UserQuest> {
    return this.request<UserQuest>(`/api/v1/quests/${questId}/start`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async getUserQuests(): Promise<UserQuest[]> {
    return this.request<UserQuest[]>('/api/v1/quests/user')
  }

  async updateQuestProgress(userQuestId: string, progress: number): Promise<UserQuest> {
    return this.request<UserQuest>(`/api/v1/quests/${userQuestId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    })
  }

  async completeQuest(userQuestId: string): Promise<UserQuest> {
    return this.request<UserQuest>(`/api/v1/quests/${userQuestId}/complete`, {
      method: 'POST',
    })
  }

  // Leaderboard endpoints
  async getLeaderboard(limit?: number): Promise<any> {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(`/api/v1/leaderboard/${params}`)
  }

  async getUserLeaderboardPosition(userId: string): Promise<any> {
    return this.request(`/api/v1/leaderboard/user/${userId}`)
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health')
  }
}

export const apiClient = new ApiClient()
