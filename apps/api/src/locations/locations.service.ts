import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { QueryLocationDto } from './dto/query-location.dto'
import { Location } from '@prisma/client'

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    return this.prisma.location.create({
      data: createLocationDto,
    })
  }

  async findAll(query?: QueryLocationDto) {
    const page = query?.page || 1
    const limit = query?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}

    // Se houver coordenadas e raio, filtrar por proximidade
    // Nota: Esta é uma implementação simplificada. Para produção,
    // seria melhor usar PostGIS ou similar para consultas geoespaciais
    if (query?.latitude && query?.longitude && query?.radius) {
      const locations = await this.prisma.location.findMany()
      
      const filteredLocations = locations.filter((loc) => {
        const distance = this.calculateDistance(
          query.latitude!,
          query.longitude!,
          loc.latitude,
          loc.longitude
        )
        return distance <= query.radius!
      })

      const total = filteredLocations.length
      const paginatedLocations = filteredLocations.slice(skip, skip + limit)

      return {
        data: paginatedLocations,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: true,
          reports: {
            where: { status: { not: 'ARCHIVED' } },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.location.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        admin: true,
        reports: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: true,
            category: true,
          },
        },
      },
    })

    if (!location) {
      throw new NotFoundException(`Localização com ID ${id} não encontrada`)
    }

    return location
  }

  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    await this.findOne(id)

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    })
  }

  async remove(id: string): Promise<Location> {
    await this.findOne(id)

    return this.prisma.location.delete({
      where: { id },
    })
  }

  // Fórmula Haversine para calcular distância entre duas coordenadas
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180
  }
}
