# API Java - Spring Boot

Versão da API em **Java com Spring Boot**, migrada da versão original em NestJS.

## 🚀 Quick Start

### Pré-requisitos

- **Java 21+**
- **Maven 3.9+**
- **PostgreSQL 16+**

### Executar localmente

```bash
# 1. Instalar dependências e compilar
mvn clean install

# 2. Configurar variáveis de ambiente
export DATABASE_URL="jdbc:postgresql://localhost:5432/tickets"
export DB_USERNAME="tickets"
export DB_PASSWORD="tickets123"
export PORT="3000"

# 3. Executar aplicação
mvn spring-boot:run
```

### Executar com Docker

```bash
# Build da imagem
docker build -t tickets-api-java .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="jdbc:postgresql://host.docker.internal:5432/tickets" \
  -e DB_USERNAME="tickets" \
  -e DB_PASSWORD="tickets123" \
  tickets-api-java
```

## 📚 Estrutura do Projeto

```
src/main/java/com/tickets/api/
├── TicketsApiApplication.java          # Classe principal
├── config/
│   └── WebConfig.java                  # Configuração CORS
├── controller/
│   ├── AppController.java              # / e /health
│   └── UserController.java             # /users/*
├── dto/
│   ├── common/
│   │   └── PageResponseDto.java
│   ├── report/
│   │   ├── CreateReportDto.java
│   │   └── ReportResponseDto.java
│   └── user/
│       ├── CreateUserDto.java
│       └── UserResponseDto.java
├── exception/
│   ├── ConflictException.java
│   ├── ErrorResponse.java
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
├── model/
│   ├── entity/
│   │   ├── Category.java
│   │   ├── Comment.java
│   │   ├── Location.java
│   │   ├── Report.java
│   │   ├── StatusHistory.java
│   │   └── User.java
│   └── enums/
│       ├── CategoryType.java
│       ├── ReportStatus.java
│       └── UserRole.java
├── repository/
│   ├── CategoryRepository.java
│   ├── CommentRepository.java
│   ├── LocationRepository.java
│   ├── ReportRepository.java
│   ├── StatusHistoryRepository.java
│   └── UserRepository.java
└── service/
    └── UserService.java
```

## 🔄 Comparação: NestJS vs Spring Boot

| Aspecto | NestJS | Spring Boot |
|---------|---------|-------------|
| **Linguagem** | TypeScript | Java |
| **Framework** | NestJS (Node.js) | Spring Boot |
| **ORM** | Prisma | JPA/Hibernate |
| **Injeção de Dependência** | `@Injectable()` | `@Service`, `@Autowired` |
| **Controllers** | `@Controller()` | `@RestController` |
| **Validação** | `class-validator` | `jakarta.validation` |
| **Decorators** | `@Get()`, `@Post()` | `@GetMapping`, `@PostMapping` |
| **Exception Handling** | `@Catch()` | `@ExceptionHandler` |

### Equivalências de Código

#### NestJS (TypeScript)
```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    return user;
  }
}
```

#### Spring Boot (Java)
```java
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponseDto findById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuário não encontrado"));
        
        return mapToDto(user);
    }
}
```

## 🛣️ Rotas da API

### Users
- `POST /users` - Criar usuário
- `GET /users` - Listar todos usuários
- `GET /users/{id}` - Buscar por ID
- `GET /users/email/{email}` - Buscar por email
- `PATCH /users/{id}` - Atualizar usuário
- `DELETE /users/{id}` - Deletar usuário

### Health Check
- `GET /` - Informações da API
- `GET /health` - Status de saúde

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Banco de Dados
DATABASE_URL=jdbc:postgresql://localhost:5432/tickets
DB_USERNAME=tickets
DB_PASSWORD=tickets123

# Aplicação
PORT=3000
```

### application.properties

```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

server.port=${PORT:3000}
```

## 🧪 Testes

```bash
# Executar todos os testes
mvn test

# Executar com cobertura
mvn test jacoco:report
```

## 📦 Build para Produção

```bash
# Build JAR
mvn clean package

# JAR gerado em: target/api-java-1.0.0.jar

# Executar JAR
java -jar target/api-java-1.0.0.jar
```

## 🐳 Docker

### Build da imagem
```bash
docker build -t ghcr.io/vinicius-cappatti/tickets-api-java:latest .
```

### Push para GHCR
```bash
docker push ghcr.io/vinicius-cappatti/tickets-api-java:latest
```

## 📊 Diferenças Principais

### 1. **Tipos Estáticos vs Dinâmicos**
- **Java**: Tipagem estática forte, compilação necessária
- **TypeScript**: Tipagem estática opcional, transpilação para JS

### 2. **ORM**
- **Prisma** (NestJS): Schema próprio, type-safe, migrations automáticas
- **JPA/Hibernate** (Spring): Annotations nas entidades, mais verboso

### 3. **Gestão de Dependências**
- **npm/pnpm** (NestJS): package.json, node_modules
- **Maven** (Spring): pom.xml, repositório local .m2

### 4. **Performance**
- **NestJS**: Single-threaded event loop, excelente para I/O
- **Spring Boot**: Multi-threaded, melhor para CPU-intensive

### 5. **Ecossistema**
- **NestJS**: Moderno, comunidade crescente, flexível
- **Spring Boot**: Maduro, enterprise-ready, padrão de mercado

## ⚡ Vantagens de cada abordagem

### NestJS
- ✅ Desenvolvimento mais rápido
- ✅ Menos verboso
- ✅ Melhor para microservices leves
- ✅ TypeScript nativo

### Spring Boot
- ✅ Mais robusto para aplicações enterprise
- ✅ Melhor para processamento pesado
- ✅ Suporte corporativo extenso
- ✅ Ferramentas maduras de monitoring

## 🤝 Contribuindo

Para adicionar mais módulos (Reports, Categories, Locations), siga o padrão:

1. Criar Entity em `model/entity/`
2. Criar Repository em `repository/`
3. Criar DTOs em `dto/<modulo>/`
4. Criar Service em `service/`
5. Criar Controller em `controller/`

## 📝 Notas de Migração

- ✅ **Entidades JPA** equivalentes ao schema Prisma
- ✅ **Repositories** com métodos automáticos do Spring Data
- ✅ **Services** com mesma lógica de negócio
- ✅ **Controllers** com mesmas rotas HTTP
- ✅ **Exception Handling** global
- ⏳ **Reports, Categories, Locations** - a implementar
- ⏳ **Autenticação JWT** - a implementar
- ⏳ **Testes unitários** - a implementar

## 📞 Contato

Para dúvidas sobre a migração, consulte a documentação original em `/apps/api/`.
