export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

// Mock user storage (in a real app, this would be in a database)
const users: User[] = [
  { id: 1, name: "Maria Silva", email: "maria.silva@email.com", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "João Santos", email: "joao.santos@email.com", created_at: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Ana Costa", email: "ana.costa@email.com", created_at: "2024-01-01T00:00:00Z" },
]

let currentUser: User | null = null

export function getCurrentUser(): User | null {
  return currentUser
}

export function isAuthenticated(): boolean {
  return currentUser !== null
}

export async function signIn(email: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user exists
    let user = users.find((u) => u.email === email)

    if (!user) {
      // Create new user
      user = {
        id: users.length + 1,
        name,
        email,
        created_at: new Date().toISOString(),
      }
      users.push(user)
    }

    currentUser = user

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user))
    }

    return { success: true, user }
  } catch (error) {
    return { success: false, error: "Erro ao fazer login" }
  }
}

export function signOut(): void {
  currentUser = null
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
  }
}

export function initializeAuth(): void {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try {
        currentUser = JSON.parse(stored)
      } catch (error) {
        localStorage.removeItem("currentUser")
      }
    }
  }
}
