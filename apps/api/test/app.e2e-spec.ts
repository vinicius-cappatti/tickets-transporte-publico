import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { PrismaService } from './../src/prisma.service'
import { UserRole, CategoryType, ReportStatus } from '@prisma/client'

describe('API E2E Tests', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    )

    await app.init()

    prisma = app.get<PrismaService>(PrismaService)

    // Limpar dados antes dos testes
    await prisma.comment.deleteMany()
    await prisma.statusHistory.deleteMany()
    await prisma.report.deleteMany()
    await prisma.category.deleteMany()
    await prisma.location.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  describe('Users Module (e2e)', () => {
    let userId: string

    it('/users (POST) - should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.PEDESTRIAN,
        })
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.email).toBe('test@example.com')
      userId = response.body.id
    })

    it('/users (POST) - should return 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Duplicate User',
          role: UserRole.PEDESTRIAN,
        })
        .expect(409)
    })

    it('/users (GET) - should return all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
    })

    it('/users/:id (GET) - should return a user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)

      expect(response.body.id).toBe(userId)
      expect(response.body.email).toBe('test@example.com')
    })

    it('/users/:id (PATCH) - should update a user', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)

      expect(response.body.name).toBe('Updated Name')
    })
  })

  describe('Categories Module (e2e)', () => {
    let categoryId: string

    it('/categories (POST) - should create a new category', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Rampa de Acesso Teste',
          type: CategoryType.RAMP,
          description: 'Categoria de teste',
        })
        .expect(201)

      expect(response.body).toHaveProperty('id')
      categoryId = response.body.id
    })

    it('/categories (GET) - should return all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('/categories/:id (GET) - should return a category by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200)

      expect(response.body.id).toBe(categoryId)
    })
  })

  describe('Locations Module (e2e)', () => {
    let locationId: string
    let adminId: string

    beforeAll(async () => {
      // Criar um admin para a localização
      const admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
        },
      })
      adminId = admin.id
    })

    it('/locations (POST) - should create a new location', async () => {
      const response = await request(app.getHttpServer())
        .post('/locations')
        .send({
          name: 'Estação Teste',
          address: 'Rua Teste, 123',
          latitude: -23.5505,
          longitude: -46.6333,
          type: 'Estação de Metrô',
          description: 'Estação para testes E2E',
          adminId: adminId,
        })
        .expect(201)

      expect(response.body).toHaveProperty('id')
      locationId = response.body.id
    })

    it('/locations (GET) - should return paginated locations', async () => {
      const response = await request(app.getHttpServer())
        .get('/locations?page=1&limit=10')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('/locations/:id (GET) - should return a location by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/locations/${locationId}`)
        .expect(200)

      expect(response.body.id).toBe(locationId)
    })
  })

  describe('Reports Module (e2e)', () => {
    let reportId: string
    let userId: string
    let locationId: string
    let categoryId: string

    beforeAll(async () => {
      // Criar dados necessários
      const user = await prisma.user.create({
        data: {
          email: 'reporter@example.com',
          name: 'Reporter User',
          role: UserRole.PEDESTRIAN,
        },
      })
      userId = user.id

      const location = await prisma.location.create({
        data: {
          name: 'Localização Report',
          address: 'Endereço Report',
          latitude: -23.5505,
          longitude: -46.6333,
          type: 'Ponto de Ônibus',
        },
      })
      locationId = location.id

      const category = await prisma.category.create({
        data: {
          name: 'Categoria Report',
          type: CategoryType.INFRASTRUCTURE,
        },
      })
      categoryId = category.id
    })

    it('/reports (POST) - should create a new report', async () => {
      const response = await request(app.getHttpServer())
        .post('/reports')
        .send({
          title: 'Problema de teste',
          description: 'Descrição detalhada do problema',
          authorId: userId,
          locationId: locationId,
          categoryId: categoryId,
        })
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.status).toBe(ReportStatus.PENDING)
      reportId = response.body.id
    })

    it('/reports (GET) - should return paginated reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports?page=1&limit=10')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('meta')
    })

    it('/reports (GET) - should filter reports by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports?status=${ReportStatus.PENDING}`)
        .expect(200)

      expect(response.body.data.every((r: any) => r.status === ReportStatus.PENDING)).toBe(true)
    })

    it('/reports/:id (GET) - should return a report by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${reportId}`)
        .expect(200)

      expect(response.body.id).toBe(reportId)
      expect(response.body).toHaveProperty('author')
      expect(response.body).toHaveProperty('location')
      expect(response.body).toHaveProperty('category')
    })

    it('/reports/:id/status (PATCH) - should update report status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reports/${reportId}/status`)
        .send({
          status: ReportStatus.IN_ANALYSIS,
          updatedBy: userId,
          comment: 'Iniciando análise',
        })
        .expect(200)

      expect(response.body.status).toBe(ReportStatus.IN_ANALYSIS)
    })

    it('/reports/:id/comments (POST) - should add a comment to report', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reports/${reportId}/comments`)
        .send({
          content: 'Comentário de teste',
          authorId: userId,
        })
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.content).toBe('Comentário de teste')
    })

    it('/reports/statistics (GET) - should return report statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/statistics')
        .expect(200)

      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('byStatus')
      expect(response.body).toHaveProperty('byCategory')
      expect(response.body).toHaveProperty('resolutionRate')
    })
  })

  describe('Validation Tests (e2e)', () => {
    it('should return 400 for invalid user data', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          name: '',
        })
        .expect(400)
    })

    it('should return 400 for invalid report data', async () => {
      await request(app.getHttpServer())
        .post('/reports')
        .send({
          title: '',
          description: '',
        })
        .expect(400)
    })
  })
})

