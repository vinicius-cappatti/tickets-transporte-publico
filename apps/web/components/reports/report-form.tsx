"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createReport, type ProblemCategory } from "@/lib/reports"
import type { Location } from "@/lib/locations"
import type { User } from "@/lib/auth"

interface ReportFormProps {
  user: User
  location: Location
  category: ProblemCategory
  onSuccess: (reportId: number) => void
  className?: string
}

export function ReportForm({ user, location, category, onSuccess, className }: ReportFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a descrição do problema.",
        variant: "destructive",
      })
      return
    }

    if (title.length < 10) {
      toast({
        title: "Título muito curto",
        description: "O título deve ter pelo menos 10 caracteres.",
        variant: "destructive",
      })
      return
    }

    if (description.length < 20) {
      toast({
        title: "Descrição muito curta",
        description: "A descrição deve ter pelo menos 20 caracteres para ser útil.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createReport({
        user_id: user.id,
        location_id: location.id,
        problem_category_id: category.id,
        title: title.trim(),
        description: description.trim(),
      })

      if (result.success && result.report) {
        toast({
          title: "Reporte enviado com sucesso!",
          description: "Seu reporte foi registrado e será analisado em breve.",
        })
        onSuccess(result.report.id)
      } else {
        toast({
          title: "Erro ao enviar reporte",
          description: result.error || "Ocorreu um erro inesperado.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar reporte",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Descrever o Problema
        </CardTitle>
        <CardDescription>Forneça detalhes sobre o problema de acessibilidade para ajudar na resolução</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="report-title">
              Título do Problema <span className="text-destructive">*</span>
            </Label>
            <Input
              id="report-title"
              type="text"
              placeholder="Ex: Rampa de acesso danificada na entrada principal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
              aria-describedby="title-description title-counter"
            />
            <div className="flex justify-between items-center">
              <p id="title-description" className="text-sm text-muted-foreground">
                Seja específico e claro sobre o problema
              </p>
              <p id="title-counter" className="text-xs text-muted-foreground">
                {title.length}/255
              </p>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="report-description">
              Descrição Detalhada <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="report-description"
              placeholder="Descreva o problema em detalhes: localização exata, como afeta a acessibilidade, há quanto tempo existe, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={2000}
              required
              aria-describedby="description-description description-counter"
            />
            <div className="flex justify-between items-center">
              <p id="description-description" className="text-sm text-muted-foreground">
                Inclua detalhes como localização exata, gravidade e impacto na acessibilidade
              </p>
              <p id="description-counter" className="text-xs text-muted-foreground">
                {description.length}/2000
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dicas para um bom reporte:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Seja específico sobre a localização do problema</li>
                <li>• Explique como o problema afeta pessoas com deficiência</li>
                <li>• Mencione se é um problema recorrente ou pontual</li>
                <li>• Inclua informações sobre horários se relevante</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Character Count Warnings */}
          {title.length > 0 && title.length < 10 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>O título deve ter pelo menos 10 caracteres para ser descritivo.</AlertDescription>
            </Alert>
          )}

          {description.length > 0 && description.length < 20 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A descrição deve ter pelo menos 20 caracteres para fornecer detalhes úteis.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              size="lg"
              className="min-w-32"
            >
              {isSubmitting ? "Enviando..." : "Enviar Reporte"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
