"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { getCurrentUser, initializeAuth, type User } from "@/lib/auth"
import { MapPin } from "lucide-react"

interface HeaderProps {
  onLoginClick: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    initializeAuth()
    setUser(getCurrentUser())
  }, [])

  const handleSignOut = () => {
    setUser(null)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-bold">Acessibilidade SP</h1>
            <p className="text-xs text-muted-foreground">Sistema de Reportes</p>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          {user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <Button onClick={onLoginClick} variant="default">
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
