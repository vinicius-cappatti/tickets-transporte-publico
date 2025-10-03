import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReportStatus, UserRole, CategoryType } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    location: {
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      create: jest.fn(),
    },
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.PEDESTRIAN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLocation = {
    id: '1',
    name: 'Estação Teste',
    address: 'Rua Teste',
    latitude: -23.5505,
    longitude: -46.6333,
    type: 'Estação de Metrô',
    description: 'Descrição teste',
    adminId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory = {
    id: '1',
    name: 'Rampa de Acesso',
    type: CategoryType.RAMP,
    description: 'Teste',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReport = {
    id: '1',
    title: 'Problema teste',
    description: 'Descrição do problema',
    status: ReportStatus.PENDING,
    imageUrl: null,
    authorId: '1',
    locationId: '1',
    categoryId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new report with status history', async () => {
      const createReportDto = {
        title: 'Problema teste',
        description: 'Descrição do problema',
        authorId: '1',
        locationId: '1',
        categoryId: '1',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.report.create.mockResolvedValue({
        ...mockReport,
        author: mockUser,
        location: mockLocation,
        category: mockCategory,
        statusHistory: [],
      });

      const result = await service.create(createReportDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.report.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author not found', async () => {
      const createReportDto = {
        title: 'Problema teste',
        description: 'Descrição do problema',
        authorId: '999',
        locationId: '1',
        categoryId: '1',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createReportDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if location not found', async () => {
      const createReportDto = {
        title: 'Problema teste',
        description: 'Descrição do problema',
        authorId: '1',
        locationId: '999',
        categoryId: '1',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.create(createReportDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated reports', async () => {
      const mockReports = [mockReport];
      mockPrismaService.report.findMany.mockResolvedValue(mockReports);
      mockPrismaService.report.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toEqual(mockReports);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter reports by status', async () => {
      const query = { status: ReportStatus.PENDING };
      mockPrismaService.report.findMany.mockResolvedValue([mockReport]);
      mockPrismaService.report.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ReportStatus.PENDING },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a report by id', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue({
        ...mockReport,
        author: mockUser,
        location: mockLocation,
        category: mockCategory,
        statusHistory: [],
        comments: [],
      });

      const result = await service.findOne('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if report not found', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update report status and create history', async () => {
      const updateStatusDto = {
        status: ReportStatus.IN_ANALYSIS,
        updatedBy: '1',
        comment: 'Em análise',
      };

      mockPrismaService.report.findUnique.mockResolvedValue({
        ...mockReport,
        author: mockUser,
        location: mockLocation,
        category: mockCategory,
        statusHistory: [],
        comments: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.report.update.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.IN_ANALYSIS,
      });

      const result = await service.updateStatus('1', updateStatusDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.report.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const updateStatusDto = {
        status: ReportStatus.RESOLVED_CONFIRMED,
        updatedBy: '1',
      };

      mockPrismaService.report.findUnique.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.PENDING,
        author: mockUser,
        location: mockLocation,
        category: mockCategory,
        statusHistory: [],
        comments: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.updateStatus('1', updateStatusDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addComment', () => {
    it('should add a comment to a report', async () => {
      const createCommentDto = {
        content: 'Test comment',
        authorId: '1',
      };

      const mockComment = {
        id: '1',
        content: 'Test comment',
        reportId: '1',
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
      };

      mockPrismaService.report.findUnique.mockResolvedValue({
        ...mockReport,
        author: mockUser,
        location: mockLocation,
        category: mockCategory,
        statusHistory: [],
        comments: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.addComment('1', createCommentDto);

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.comment.create).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should return report statistics', async () => {
      mockPrismaService.report.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(2) // in_analysis
        .mockResolvedValueOnce(1) // resolved_provisional
        .mockResolvedValueOnce(3) // resolved_confirmed
        .mockResolvedValueOnce(1); // archived

      mockPrismaService.category.findMany.mockResolvedValue([
        { ...mockCategory, _count: { reports: 5 } },
      ]);

      const result = await service.getStatistics();

      expect(result).toHaveProperty('total', 10);
      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('byCategory');
      expect(result).toHaveProperty('resolutionRate');
    });
  });

  describe('remove', () => {
    it('should delete a report', async () => {
      mockPrismaService.report.findUnique.mockResolvedValue({
        ...mockReport,
        author: mockUser,
        location: mockLocation,
        category: mockCategory,
        statusHistory: [],
        comments: [],
      });
      mockPrismaService.report.delete.mockResolvedValue(mockReport);

      const result = await service.remove('1');

      expect(result).toEqual(mockReport);
      expect(mockPrismaService.report.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
