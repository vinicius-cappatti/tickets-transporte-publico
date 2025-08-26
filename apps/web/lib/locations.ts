export interface LocationType {
  id: number
  name: string
  description: string
}

export interface Location {
  id: number
  name: string
  address: string
  location_type_id: number
  latitude: number
  longitude: number
  created_at: string
}

// Mock data based on our database schema
export const locationTypes: LocationType[] = [
  { id: 1, name: "Ponto de Ônibus", description: "Paradas de ônibus urbano" },
  { id: 2, name: "Estação de Trem", description: "Estações da CPTM" },
  { id: 3, name: "Estação de Metrô", description: "Estações do Metrô de São Paulo" },
]

export const locations: Location[] = [
  // Bus stops
  {
    id: 1,
    name: "Ponto Av. Paulista - Consolação",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo",
    location_type_id: 1,
    latitude: -23.5613,
    longitude: -46.6565,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Ponto Av. Faria Lima - Brigadeiro",
    address: "Av. Brigadeiro Faria Lima, 2000 - Jardim Paulistano, São Paulo",
    location_type_id: 1,
    latitude: -23.5751,
    longitude: -46.689,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Ponto Rua Augusta - Rua da Consolação",
    address: "Rua Augusta, 500 - Consolação, São Paulo",
    location_type_id: 1,
    latitude: -23.5505,
    longitude: -46.6426,
    created_at: "2024-01-01T00:00:00Z",
  },
  // Metro stations
  {
    id: 4,
    name: "Estação Sé",
    address: "Praça da Sé - Sé, São Paulo",
    location_type_id: 3,
    latitude: -23.5505,
    longitude: -46.6333,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    name: "Estação Paulista",
    address: "Av. Paulista, 1374 - Bela Vista, São Paulo",
    location_type_id: 3,
    latitude: -23.5567,
    longitude: -46.661,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 6,
    name: "Estação Vila Madalena",
    address: "Rua Fradique Coutinho, 1340 - Vila Madalena, São Paulo",
    location_type_id: 3,
    latitude: -23.5464,
    longitude: -46.6909,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 7,
    name: "Estação República",
    address: "Praça da República - República, São Paulo",
    location_type_id: 3,
    latitude: -23.5436,
    longitude: -46.6425,
    created_at: "2024-01-01T00:00:00Z",
  },
  // Train stations (CPTM)
  {
    id: 8,
    name: "Estação Luz",
    address: "Praça da Luz, 1 - Luz, São Paulo",
    location_type_id: 2,
    latitude: -23.5344,
    longitude: -46.6356,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 9,
    name: "Estação Brás",
    address: "Rua do Hipódromo, 1000 - Brás, São Paulo",
    location_type_id: 2,
    latitude: -23.5254,
    longitude: -46.6186,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 10,
    name: "Estação Tatuapé",
    address: "Rua Tuiuti, 2100 - Tatuapé, São Paulo",
    location_type_id: 2,
    latitude: -23.5419,
    longitude: -46.5769,
    created_at: "2024-01-01T00:00:00Z",
  },
]

export function getLocationsByType(typeId: number): Location[] {
  return locations.filter((location) => location.location_type_id === typeId)
}

export function getLocationById(id: number): Location | undefined {
  return locations.find((location) => location.id === id)
}

export function getLocationTypeName(typeId: number): string {
  const type = locationTypes.find((t) => t.id === typeId)
  return type?.name || "Desconhecido"
}

export function searchLocations(query: string): Location[] {
  if (!query.trim()) return locations

  const lowercaseQuery = query.toLowerCase()
  return locations.filter(
    (location) =>
      location.name.toLowerCase().includes(lowercaseQuery) || location.address.toLowerCase().includes(lowercaseQuery),
  )
}
