"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { LocationSelector } from "@/components/locations/location-selector"
import { LocationMap } from "@/components/locations/location-map"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getCurrentUser, initializeAuth, type User } from "@/lib/auth"
import type { Location } from "@/lib/locations"

export default function SelectLocationPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (!currentUser) {
      router.push("/")
    }
  }, [router])

  const handleLoginClick = () => {
    setShowLogin(true)
  }

  const handleContinue = () => {
    if (selectedLocation) {
      // Store selected location in localStorage for the next step
      localStorage.setItem("selectedLocation", JSON.stringify(selectedLocation))
      router.push("/report-problem")
    }
  }

  const handleBack = () => {
    router.push("/")
  }

  if (!user) {
    return null // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={handleLoginClick} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Selecionar Local</h1>
              <p className="text-muted-foreground">
                Escolha o ponto de ônibus ou estação onde você identificou o problema
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span>Selecionar Local</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span>Reportar Problema</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span>Confirmação</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Selector */}
          <LocationSelector selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />

          {/* Location Map */}
          <LocationMap location={selectedLocation} />
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleContinue} disabled={!selectedLocation} size="lg" className="min-w-32">
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}
