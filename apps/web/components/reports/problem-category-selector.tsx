"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accessibility,
  Navigation,
  Calculator as Elevator,
  Eye,
  PenTool as Restroom,
  Train,
  AlertTriangle,
} from "lucide-react"
import { problemCategories, type ProblemCategory } from "@/lib/reports"

interface ProblemCategorySelectorProps {
  selectedCategory: ProblemCategory | null
  onCategorySelect: (category: ProblemCategory) => void
  className?: string
}

export function ProblemCategorySelector({
  selectedCategory,
  onCategorySelect,
  className,
}: ProblemCategorySelectorProps) {
  const getCategoryIcon = (categoryId: number) => {
    switch (categoryId) {
      case 1: // Rampa de Acesso
        return <Accessibility className="h-5 w-5" />
      case 2: // Piso Tátil
        return <Navigation className="h-5 w-5" />
      case 3: // Elevador
        return <Elevator className="h-5 w-5" />
      case 4: // Sinalização
        return <Eye className="h-5 w-5" />
      case 5: // Banheiro Acessível
        return <Restroom className="h-5 w-5" />
      case 6: // Plataforma
        return <Train className="h-5 w-5" />
      case 7: // Outros
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getCategoryColor = (categoryId: number) => {
    switch (categoryId) {
      case 1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case 2:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case 3:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case 4:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case 5:
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      case 6:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      case 7:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Tipo de Problema
        </CardTitle>
        <CardDescription>
          Selecione a categoria que melhor descreve o problema de acessibilidade encontrado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Selected Category Display */}
        {selectedCategory && (
          <div className="mb-4 p-3 bg-accent rounded-lg border">
            <div className="flex items-center gap-3">
              {getCategoryIcon(selectedCategory.id)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{selectedCategory.name}</span>
                  <Badge className={getCategoryColor(selectedCategory.id)}>Selecionado</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {problemCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory?.id === category.id ? "default" : "outline"}
              className="h-auto p-4 justify-start"
              onClick={() => onCategorySelect(category)}
            >
              <div className="flex items-start gap-3 w-full">
                {getCategoryIcon(category.id)}
                <div className="flex-1 text-left">
                  <div className="font-medium mb-1">{category.name}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{category.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Se você não tem certeza sobre a categoria, escolha "Outros" e descreva detalhadamente
            o problema no campo de descrição.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
