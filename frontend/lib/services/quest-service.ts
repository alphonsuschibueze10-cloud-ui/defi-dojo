import { apiClient, Quest, UserQuest } from '../api'
import { useAuthStore } from '../stores/auth-store'

export class QuestService {
  private static instance: QuestService

  static getInstance(): QuestService {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService()
    }
    return QuestService.instance
  }

  private constructor() {
    // Update token when auth store changes
    useAuthStore.subscribe((state) => {
      apiClient.setToken(state.jwtToken)
    })
  }

  async getAvailableQuests(): Promise<Quest[]> {
    try {
      // Always use public endpoint for now since authentication is not fully implemented
      // TODO: Implement proper authentication flow
      const quests = await apiClient.getPublicQuests()
      return quests.filter(quest => quest.active)
    } catch (error) {
      console.error('Failed to fetch quests:', error)
      throw error
    }
  }

  async getQuestById(id: string): Promise<Quest> {
    try {
      return await apiClient.getQuest(id)
    } catch (error) {
      console.error(`Failed to fetch quest ${id}:`, error)
      throw error
    }
  }

  async startQuest(questId: string): Promise<UserQuest> {
    try {
      const authState = useAuthStore.getState()
      
      // Always use guest mode for now since we don't have real authentication
      // TODO: Remove this when real wallet authentication is implemented
      
      // Get quest data from the public endpoint (we already have this data)
      const quests = await this.getAvailableQuests()
      const quest = quests.find(q => q.id === questId)
      
      if (!quest) {
        throw new Error(`Quest ${questId} not found`)
      }
      
      return {
        id: `guest-${questId}-${Date.now()}`,
        user_id: 'guest',
        quest_id: questId,
        status: 'in-progress',
        progress: 0,
        started_at: new Date().toISOString(),
        quest: quest
      }
      
      // Original logic (commented out until real auth is implemented):
      // if (!authState.isAuthed) {
      //   // For guest users, create a mock user quest
      //   const quest = await this.getQuestById(questId)
      //   return {
      //     id: `guest-${questId}-${Date.now()}`,
      //     user_id: 'guest',
      //     quest_id: questId,
      //     status: 'in-progress',
      //     progress: 0,
      //     started_at: new Date().toISOString(),
      //     quest: quest
      //   }
      // }
      // 
      // const userQuest = await apiClient.startQuest(questId)
      // return userQuest
    } catch (error) {
      console.error(`Failed to start quest ${questId}:`, error)
      throw error
    }
  }

  async getUserQuests(): Promise<UserQuest[]> {
    try {
      // Always return empty array for now since authentication is not fully implemented
      // TODO: Implement proper authentication flow
      return []
    } catch (error) {
      console.error('Failed to fetch user quests:', error)
      return []
    }
  }

  async updateQuestProgress(userQuestId: string, progress: number): Promise<UserQuest> {
    try {
      return await apiClient.updateQuestProgress(userQuestId, progress)
    } catch (error) {
      console.error(`Failed to update quest progress for ${userQuestId}:`, error)
      throw error
    }
  }

  async completeQuest(userQuestId: string): Promise<UserQuest> {
    try {
      return await apiClient.completeQuest(userQuestId)
    } catch (error) {
      console.error(`Failed to complete quest ${userQuestId}:`, error)
      throw error
    }
  }

  // Helper method to get quest status for display
  getQuestStatus(quest: Quest, userQuests: UserQuest[]): 'available' | 'in-progress' | 'completed' {
    const userQuest = userQuests.find(uq => uq.quest_id === quest.id)
    
    if (!userQuest) {
      return 'available'
    }
    
    return userQuest.status
  }

  // Helper method to get quest progress
  getQuestProgress(quest: Quest, userQuests: UserQuest[]): number {
    const userQuest = userQuests.find(uq => uq.quest_id === quest.id)
    return userQuest?.progress || 0
  }

  // Helper method to get difficulty label
  getDifficultyLabel(difficulty: number): string {
    switch (difficulty) {
      case 1: return "Beginner"
      case 2: return "Intermediate"
      case 3: return "Advanced"
      case 4: return "Expert"
      default: return "Unknown"
    }
  }

  // Helper method to get category from quest
  getQuestCategory(quest: Quest): string {
    // Extract category from slug or use a default
    const slugParts = quest.slug.split('-')
    return slugParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  }

  // Helper method to get estimated time
  getEstimatedTime(difficulty: number): string {
    switch (difficulty) {
      case 1: return "15 min"
      case 2: return "30 min"
      case 3: return "1 hour"
      case 4: return "2 hours"
      default: return "Unknown"
    }
  }
}

export const questService = QuestService.getInstance()
