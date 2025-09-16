import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  address: string | null
  isAuthed: boolean
  jwtToken: string | null
  setAuth: (address: string, token?: string) => void
  clearAuth: () => void
  forceClearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      address: null,
      isAuthed: false,
      jwtToken: null,
      setAuth: (address: string, token?: string) => set({ address, isAuthed: true, jwtToken: token }),
      clearAuth: () => set({ address: null, isAuthed: false, jwtToken: null }),
      forceClearAuth: () => {
        // Clear localStorage and reset state
        localStorage.removeItem("satoshi-sensei-auth")
        set({ address: null, isAuthed: false, jwtToken: null })
      },
    }),
    {
      name: "satoshi-sensei-auth",
      // Add version to handle migration
      version: 1,
      // Add migration to clear old data
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Clear any old persisted data
          return { address: null, isAuthed: false, jwtToken: null }
        }
        return persistedState
      },
      // Force clear any existing auth data
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Always start with unauthenticated state
          state.address = null
          state.isAuthed = false
          state.jwtToken = null
        }
      },
    },
  ),
)
