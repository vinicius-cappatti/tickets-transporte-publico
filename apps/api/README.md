# API - Plataforma de Acessibilidade Urbana

API REST desenvolvida com NestJS e Prisma para o sistema de mapeamento colaborativo de barreiras de acessibilidade urbana.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js para aplicações escaláveis
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **TypeScript** - Superset JavaScript com tipagem estática
- **Jest** - Framework de testes
- **Class Validator** - Validação de DTOs

## 📋 Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- pnpm (ou npm/yarn)

## 🔧 Instalação

1. Instale as dependências:
```bash
pnpm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/accessibility_db?schema=public"
PORT=3000
```

3. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev --name init
```

4. Popule o banco com dados iniciais:
```bash
npx prisma db seed
```

## 🏃 Executando a aplicação

```bash
# Desenvolvimento
pnpm run dev

# Produção
pnpm run build
pnpm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 🧪 Testes

```bash
# Testes unitários
pnpm run test

# Testes E2E
pnpm run test:e2e

# Cobertura de testes
pnpm run test:cov
```

## 📚 Documentação da API

### Endpoints Principais

#### Users (Usuários)
- `POST /users` - Criar novo usuário
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

#### Categories (Categorias)
- `POST /categories` - Criar nova categoria
- `GET /categories` - Listar todas as categorias
- `GET /categories/:id` - Buscar categoria por ID
- `PATCH /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Deletar categoria

#### Locations (Localizações)
- `POST /locations` - Criar nova localização
- `GET /locations` - Listar localizações (com paginação e filtros)
- `GET /locations/:id` - Buscar localização por ID
- `PATCH /locations/:id` - Atualizar localização
- `DELETE /locations/:id` - Deletar localização

#### Reports (Reportes)
- `POST /reports` - Criar novo reporte
- `GET /reports` - Listar reportes (com paginação e filtros)
- `GET /reports/statistics` - Obter estatísticas dos reportes
- `GET /reports/:id` - Buscar reporte por ID
- `PATCH /reports/:id` - Atualizar reporte
- `PATCH /reports/:id/status` - Atualizar status do reporte
- `POST /reports/:id/comments` - Adicionar comentário ao reporte
- `DELETE /reports/:id` - Deletar reporte

## 🗃️ Estrutura do Banco de Dados

O schema Prisma define os seguintes modelos:

- **User** - Usuários do sistema (pedestres e administradores)
- **Location** - Pontos de transporte público
- **Category** - Categorias de problemas
- **Report** - Reportes de problemas de acessibilidade
- **StatusHistory** - Histórico de mudanças de status
- **Comment** - Comentários nos reportes

## 🏗️ Arquitetura

Cada módulo segue o padrão:
- **DTOs** - Validação e transferência de dados
- **Service** - Lógica de negócio
- **Controller** - Endpoints da API
- **Module** - Configuração do módulo
- **Spec** - Testes unitários

## 📝 Licença

Projeto desenvolvido como parte da disciplina de Laboratório de Engenharia de Software.
