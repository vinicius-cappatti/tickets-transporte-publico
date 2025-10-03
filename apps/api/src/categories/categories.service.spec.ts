import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from './categories.service'
import { PrismaService } from '../prisma.service'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { CategoryType } from '@prisma/client'

describe('CategoriesService', () => {
  let service: CategoriesService
  let prisma: PrismaService

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockCategory = {
    id: '1',
    name: 'Rampa de Acesso',
    type: CategoryType.RAMP,
    description: 'Problemas com rampas',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto = {
        name: 'Rampa de Acesso',
        type: CategoryType.RAMP,
        description: 'Problemas com rampas',
      }

      mockPrismaService.category.findUnique.mockResolvedValue(null)
      mockPrismaService.category.create.mockResolvedValue(mockCategory)

      const result = await service.create(createCategoryDto)

      expect(result).toEqual(mockCategory)
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      })
    })

    it('should throw ConflictException if category name already exists', async () => {
      const createCategoryDto = {
        name: 'Rampa de Acesso',
        type: CategoryType.RAMP,
      }

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory)

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException
      )
    })
  })

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [mockCategory]
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories)

      const result = await service.findAll()

      expect(result).toEqual(mockCategories)
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      })
    })
  })

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory)

      const result = await service.findOne('1')

      expect(result).toEqual(mockCategory)
    })

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null)

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto = { description: 'Updated description' }
      const updatedCategory = { ...mockCategory, ...updateCategoryDto }

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory)
      mockPrismaService.category.update.mockResolvedValue(updatedCategory)

      const result = await service.update('1', updateCategoryDto)

      expect(result).toEqual(updatedCategory)
    })
  })

  describe('remove', () => {
    it('should delete a category', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory)
      mockPrismaService.category.delete.mockResolvedValue(mockCategory)

      const result = await service.remove('1')

      expect(result).toEqual(mockCategory)
    })
  })
})
