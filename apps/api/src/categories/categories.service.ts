import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Category } from '@prisma/client'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    })

    if (existingCategory) {
      throw new ConflictException('Categoria já existe')
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    })
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        reports: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`)
    }

    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id)

    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      })

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Categoria já existe')
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    })
  }

  async remove(id: string): Promise<Category> {
    await this.findOne(id)

    return this.prisma.category.delete({
      where: { id },
    })
  }
}
