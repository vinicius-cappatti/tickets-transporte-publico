import { PrismaClient, CategoryType, UserRole, ReportStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.comment.deleteMany()
  await prisma.statusHistory.deleteMany()
  await prisma.report.deleteMany()
  await prisma.category.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Dados existentes removidos')

  // Criar usuários
  const pedestrian1 = await prisma.user.create({
    data: {
      email: 'maria.silva@email.com',
      name: 'Maria Silva',
      role: UserRole.PEDESTRIAN,
    },
  })

  const pedestrian2 = await prisma.user.create({
    data: {
      email: 'joao.santos@email.com',
      name: 'João Santos',
      role: UserRole.PEDESTRIAN,
    },
  })

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin.metro@sptrans.com.br',
      name: 'Administrador Metrô',
      role: UserRole.ADMIN,
    },
  })

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin.onibus@sptrans.com.br',
      name: 'Administrador SPTrans',
      role: UserRole.ADMIN,
    },
  })

  console.log('✅ 4 usuários criados')

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Rampa de Acesso',
        type: CategoryType.RAMP,
        description: 'Problemas relacionados a rampas de acesso para cadeirantes e pessoas com mobilidade reduzida',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Piso Tátil',
        type: CategoryType.TACTILE_FLOOR,
        description: 'Problemas com piso tátil para deficientes visuais',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Elevador',
        type: CategoryType.ELEVATOR,
        description: 'Problemas com elevadores e plataformas de acessibilidade',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sinalização',
        type: CategoryType.SIGNAGE,
        description: 'Falta ou problemas em sinalização visual e sonora',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Infraestrutura Geral',
        type: CategoryType.INFRASTRUCTURE,
        description: 'Problemas gerais de infraestrutura que afetam acessibilidade',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Outros',
        type: CategoryType.OTHER,
        description: 'Outros problemas de acessibilidade não categorizados',
      },
    }),
  ])

  console.log('✅ 6 categorias criadas')

  // Criar localizações (pontos de transporte)
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Estação Sé - Metrô',
        address: 'Praça da Sé - Centro, São Paulo - SP',
        latitude: -23.5505,
        longitude: -46.6333,
        type: 'Estação de Metrô',
        description: 'Principal estação de transferência do metrô de São Paulo',
        adminId: admin1.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Estação Luz - Metrô',
        address: 'Praça da Luz - Bom Retiro, São Paulo - SP',
        latitude: -23.5343,
        longitude: -46.6356,
        type: 'Estação de Metrô',
        description: 'Estação com conexão para trem metropolitano',
        adminId: admin1.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Ponto Av. Paulista - Próx. MASP',
        address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
        latitude: -23.5613,
        longitude: -46.6558,
        type: 'Ponto de Ônibus',
        description: 'Ponto de ônibus em frente ao MASP',
        adminId: admin2.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Terminal Pinheiros',
        address: 'R. Capri, 70 - Pinheiros, São Paulo - SP',
        latitude: -23.5617,
        longitude: -46.6901,
        type: 'Terminal de Ônibus',
        description: 'Terminal de ônibus urbano com integração metrô',
        adminId: admin2.id,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Estação República - Metrô',
        address: 'Praça da República - Centro, São Paulo - SP',
        latitude: -23.5432,
        longitude: -46.6421,
        type: 'Estação de Metrô',
        description: 'Estação de metrô no centro de São Paulo',
        adminId: admin1.id,
      },
    }),
  ])

  console.log('✅ 5 localizações criadas')

  // Criar reports
  const report1 = await prisma.report.create({
    data: {
      title: 'Rampa de acesso danificada',
      description: 'A rampa de acesso ao metrô está com buracos e rachaduras, dificultando o acesso de cadeirantes.',
      status: ReportStatus.PENDING,
      authorId: pedestrian1.id,
      locationId: locations[0].id,
      categoryId: categories[0].id,
    },
  })

  const report2 = await prisma.report.create({
    data: {
      title: 'Piso tátil desgastado',
      description: 'O piso tátil da plataforma está muito desgastado e praticamente invisível, comprometendo a orientação de deficientes visuais.',
      status: ReportStatus.IN_ANALYSIS,
      authorId: pedestrian2.id,
      locationId: locations[1].id,
      categoryId: categories[1].id,
    },
  })

  const report3 = await prisma.report.create({
    data: {
      title: 'Elevador fora de serviço',
      description: 'O elevador está fora de serviço há mais de uma semana, forçando pessoas com mobilidade reduzida a usar as escadas.',
      status: ReportStatus.RESOLVED_PROVISIONAL,
      authorId: pedestrian1.id,
      locationId: locations[4].id,
      categoryId: categories[2].id,
    },
  })

  const report4 = await prisma.report.create({
    data: {
      title: 'Falta de sinalização sonora',
      description: 'O ponto de ônibus não possui sinalização sonora para anúncio das linhas.',
      status: ReportStatus.PENDING,
      authorId: pedestrian2.id,
      locationId: locations[2].id,
      categoryId: categories[3].id,
    },
  })

  console.log('✅ 4 reports criados')

  // Criar histórico de status
  await prisma.statusHistory.create({
    data: {
      status: ReportStatus.PENDING,
      comment: 'Report criado',
      reportId: report1.id,
      updatedBy: pedestrian1.id,
    },
  })

  await prisma.statusHistory.create({
    data: {
      status: ReportStatus.PENDING,
      comment: 'Report criado',
      reportId: report2.id,
      updatedBy: pedestrian2.id,
    },
  })

  await prisma.statusHistory.create({
    data: {
      status: ReportStatus.IN_ANALYSIS,
      comment: 'Report em análise pela equipe técnica',
      reportId: report2.id,
      updatedBy: admin1.id,
    },
  })

  await prisma.statusHistory.create({
    data: {
      status: ReportStatus.PENDING,
      comment: 'Report criado',
      reportId: report3.id,
      updatedBy: pedestrian1.id,
    },
  })

  await prisma.statusHistory.create({
    data: {
      status: ReportStatus.RESOLVED_PROVISIONAL,
      comment: 'Elevador foi reparado e testado',
      reportId: report3.id,
      updatedBy: admin1.id,
    },
  })

  console.log('✅ 5 históricos de status criados')

  // Criar comentários
  await prisma.comment.create({
    data: {
      content: 'Essa rampa realmente precisa de reparo urgente!',
      reportId: report1.id,
      authorId: pedestrian2.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Estamos avaliando o orçamento para substituição do piso tátil.',
      reportId: report2.id,
      authorId: admin1.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Obrigado pelo reparo! Vou verificar nos próximos dias.',
      reportId: report3.id,
      authorId: pedestrian1.id,
    },
  })

  console.log('✅ 3 comentários criados')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
