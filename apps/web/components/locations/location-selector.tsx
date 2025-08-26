"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Train, Bus } from "lucide-react"
import { getLocationsByType, getLocationTypeName, searchLocations, type Location } from "@/lib/locations"

interface LocationSelectorProps {
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
  className?: string
}

export function LocationSelector({ selectedLocation, onLocationSelect, className }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredLocations = useMemo(() => {
    let results = searchLocations(searchQuery)

    if (activeTab !== "all") {
      const typeId = Number.parseInt(activeTab)
      results = results.filter((location) => location.location_type_id === typeId)
    }

    return results
  }, [searchQuery, activeTab])

  const getLocationIcon = (typeId: number) => {
    switch (typeId) {
      case 1: // Bus stop
        return <Bus className="h-4 w-4" />
      case 2: // Train station
        return <Train className="h-4 w-4" />
      case 3: // Metro station
        return <MapPin className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Selecionar Local
        </CardTitle>
        <CardDescription>
          Escolha o ponto de ônibus ou estação onde você identificou o problema de acessibilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="location-search">Buscar local</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location-search"
              type="text"
              placeholder="Digite o nome do local ou endereço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-describedby="search-description"
            />
          </div>
          <p id="search-description" className="text-sm text-muted-foreground">
            Busque por nome da estação, ponto de ônibus ou endereço
          </p>
        </div>

        {/* Location Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="1" className="flex items-center gap-1">
              <Bus className="h-3 w-3" />
              Ônibus
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center gap-1">
              <Train className="h-3 w-3" />
              Trem
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Metrô
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="mb-4 p-3 bg-accent rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLocationIcon(selectedLocation.location_type_id)}
                    <div>
                      <p className="font-medium">{selectedLocation.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                    </div>
                  </div>
                  <Badge className={getLocationTypeColor(selectedLocation.location_type_id)}>
                    {getLocationTypeName(selectedLocation.location_type_id)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Location List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum local encontrado</p>
                  <p className="text-sm">Tente ajustar sua busca ou filtro</p>
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <Button
                    key={location.id}
                    variant={selectedLocation?.id === location.id ? "default" : "outline"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => onLocationSelect(location)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {getLocationIcon(location.location_type_id)}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{location.name}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getLocationTypeColor(location.location_type_id)}`}
                          >
                            {getLocationTypeName(location.location_type_id)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Location Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{getLocationsByType(1).length}</div>
            <div className="text-xs text-muted-foreground">Pontos de Ônibus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{getLocationsByType(2).length}</div>
            <div className="text-xs text-muted-foreground">Estações de Trem</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{getLocationsByType(3).length}</div>
            <div className="text-xs text-muted-foreground">Estações de Metrô</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
