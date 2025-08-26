"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { ProblemCategorySelector } from "@/components/reports/problem-category-selector"
import { ReportForm } from "@/components/reports/report-form"
import { LocationMap } from "@/components/locations/location-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { getCurrentUser, initializeAuth, type User } from "@/lib/auth"
import { getLocationTypeName, type Location } from "@/lib/locations"
import type { ProblemCategory } from "@/lib/reports"

export default function ReportProblemPage() {
  const [user, setUser] = useState<User | null>(null)
  const [location, setLocation] = useState<Location | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [step, setStep] = useState<"category" | "form" | "success">("category")
  const [reportId, setReportId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    const currentUser = getCurrentUser()
    setUser(currentUser)

    // Get selected location from localStorage
    const storedLocation = localStorage.getItem("selectedLocation")
    if (storedLocation) {
      try {
        setLocation(JSON.parse(storedLocation))
      } catch (error) {
        console.error("Error parsing stored location:", error)
        router.push("/select-location")
      }
    } else {
      router.push("/select-location")
    }

    if (!currentUser) {
      router.push("/")
    }
  }, [router])

  const handleLoginClick = () => {
    setShowLogin(true)
  }

  const handleBack = () => {
    if (step === "category") {
      router.push("/select-location")
    } else if (step === "form") {
      setStep("category")
    }
  }

  const handleCategoryNext = () => {
    if (selectedCategory) {
      setStep("form")
    }
  }

  const handleReportSuccess = (id: number) => {
    setReportId(id)
    setStep("success")
  }

  const handleNewReport = () => {
    // Clear stored location and start over
    localStorage.removeItem("selectedLocation")
    router.push("/select-location")
  }

  const handleViewReports = () => {
    router.push("/dashboard")
  }

  if (!user || !location) {
    return null // Will redirect
  }

  const getLocationTypeColor = (typeId: number) => {
    switch (typeId) {
      case 1: // Bus stop
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case 2: // Train station
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case 3: // Metro station
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
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
              <h1 className="text-3xl font-bold">Reportar Problema</h1>
              <p className="text-muted-foreground">
                {step === "category" && "Selecione o tipo de problema encontrado"}
                {step === "form" && "Descreva o problema em detalhes"}
                {step === "success" && "Reporte enviado com sucesso!"}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <span>Local Selecionado</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === "category" || step === "form" || step === "success"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span>Reportar Problema</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === "success" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step === "success" ? "✓" : "3"}
              </div>
              <span>Confirmação</span>
            </div>
          </div>
        </div>

        {/* Selected Location Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Local Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{location.name}</span>
                  <Badge className={getLocationTypeColor(location.location_type_id)}>
                    {getLocationTypeName(location.location_type_id)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{location.address}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/select-location")}>
                Alterar Local
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {step === "category" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProblemCategorySelector selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />

              <div className="mt-6 flex justify-end">
                <Button onClick={handleCategoryNext} disabled={!selectedCategory} size="lg" className="min-w-32">
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <div>
              <LocationMap location={location} />
            </div>
          </div>
        )}

        {step === "form" && selectedCategory && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Selected Category Summary */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedCategory.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setStep("category")} className="ml-auto">
                      Alterar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <ReportForm user={user} location={location} category={selectedCategory} onSuccess={handleReportSuccess} />
            </div>

            <div>
              <LocationMap location={location} />
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Reporte Enviado com Sucesso!</h2>
                <p className="text-muted-foreground mb-6">
                  Seu reporte #{reportId} foi registrado e será analisado pela equipe responsável. Você pode acompanhar
                  o status na área de reportes.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleNewReport} variant="outline">
                    Fazer Novo Reporte
                  </Button>
                  <Button onClick={handleViewReports}>Ver Meus Reportes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
