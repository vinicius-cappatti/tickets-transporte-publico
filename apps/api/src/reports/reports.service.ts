import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Report, ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    // Validar se autor existe
    const author = await this.prisma.user.findUnique({
      where: { id: createReportDto.authorId },
    });
    if (!author) {
      throw new NotFoundException('Autor não encontrado');
    }

    // Validar se localização existe
    const location = await this.prisma.location.findUnique({
      where: { id: createReportDto.locationId },
    });
    if (!location) {
      throw new NotFoundException('Localização não encontrada');
    }

    // Validar se categoria existe
    const category = await this.prisma.category.findUnique({
      where: { id: createReportDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Criar report com histórico inicial
    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        statusHistory: {
          create: {
            status: ReportStatus.PENDING,
            comment: 'Report criado',
            updatedBy: createReportDto.authorId,
          },
        },
      },
      include: {
        author: true,
        location: true,
        category: true,
        statusHistory: true,
      },
    });

    return report;
  }

  async findAll(query?: QueryReportDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.locationId) {
      where.locationId = query.locationId;
    }

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.authorId) {
      where.authorId = query.authorId;
    }

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          location: true,
          category: true,
          statusHistory: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        author: true,
        location: true,
        category: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report com ID ${id} não encontrado`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    await this.findOne(id);

    return this.prisma.report.update({
      where: { id },
      data: updateReportDto,
      include: {
        author: true,
        location: true,
        category: true,
      },
    });
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Report> {
    const report = await this.findOne(id);

    // Validar se quem está atualizando existe
    const user = await this.prisma.user.findUnique({
      where: { id: updateStatusDto.updatedBy },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar transição de status
    this.validateStatusTransition(report.status, updateStatusDto.status);

    // Atualizar status e criar histórico
    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        statusHistory: {
          create: {
            status: updateStatusDto.status,
            comment: updateStatusDto.comment,
            updatedBy: updateStatusDto.updatedBy,
          },
        },
      },
      include: {
        author: true,
        location: true,
        category: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
          },
        },
      },
    });

    return updatedReport;
  }

  async addComment(id: string, createCommentDto: CreateCommentDto) {
    await this.findOne(id);

    const author = await this.prisma.user.findUnique({
      where: { id: createCommentDto.authorId },
    });
    if (!author) {
      throw new NotFoundException('Autor não encontrado');
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        reportId: id,
        authorId: createCommentDto.authorId,
      },
      include: {
        author: true,
      },
    });
  }

  async remove(id: string): Promise<Report> {
    await this.findOne(id);

    return this.prisma.report.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [
      total,
      pending,
      inAnalysis,
      resolvedProvisional,
      resolvedConfirmed,
      archived,
    ] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      this.prisma.report.count({ where: { status: ReportStatus.IN_ANALYSIS } }),
      this.prisma.report.count({
        where: { status: ReportStatus.RESOLVED_PROVISIONAL },
      }),
      this.prisma.report.count({
        where: { status: ReportStatus.RESOLVED_CONFIRMED },
      }),
      this.prisma.report.count({ where: { status: ReportStatus.ARCHIVED } }),
    ]);

    const byCategory = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    const resolutionRate =
      total > 0 ? ((resolvedConfirmed / total) * 100).toFixed(2) : '0.00';

    return {
      total,
      byStatus: {
        pending,
        inAnalysis,
        resolvedProvisional,
        resolvedConfirmed,
        archived,
      },
      byCategory: byCategory.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.reports,
      })),
      resolutionRate: `${resolutionRate}%`,
    };
  }

  private validateStatusTransition(
    currentStatus: ReportStatus,
    newStatus: ReportStatus,
  ) {
    const validTransitions: Record<ReportStatus, ReportStatus[]> = {
      [ReportStatus.PENDING]: [ReportStatus.IN_ANALYSIS, ReportStatus.ARCHIVED],
      [ReportStatus.IN_ANALYSIS]: [
        ReportStatus.PENDING,
        ReportStatus.RESOLVED_PROVISIONAL,
        ReportStatus.ARCHIVED,
      ],
      [ReportStatus.RESOLVED_PROVISIONAL]: [
        ReportStatus.IN_ANALYSIS,
        ReportStatus.RESOLVED_CONFIRMED,
      ],
      [ReportStatus.RESOLVED_CONFIRMED]: [ReportStatus.ARCHIVED],
      [ReportStatus.ARCHIVED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${currentStatus} -> ${newStatus}`,
      );
    }
  }
}
