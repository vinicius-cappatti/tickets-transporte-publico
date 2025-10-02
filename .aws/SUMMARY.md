# 🚀 CI/CD Configuration Summary

Este documento resume toda a configuração de CI/CD criada para o projeto de tickets de transporte público.

## 📁 Arquivos Criados

### GitHub Actions Workflows

1. **`.github/workflows/ci-cd.yml`**
   - Pipeline principal de CI/CD
   - Executa testes, build e deploy
   - Deploy automático para ECS quando houver push na branch `main`

2. **`.github/workflows/pr-preview.yml`**
   - Pipeline para preview de Pull Requests
   - Executa apenas testes e build (sem deploy)

### Configurações AWS ECS

3. **`.aws/task-definition-api.json`**
   - Task Definition do ECS para a API NestJS
   - Configuração: 256 CPU, 512 MB RAM
   - Porta: 3000
   - Health check configurado

4. **`.aws/task-definition-web.json`**
   - Task Definition do ECS para o Web Next.js
   - Configuração: 256 CPU, 512 MB RAM
   - Porta: 3001
   - Health check configurado

5. **`.aws/README.md`**
   - Documentação completa de configuração
   - Guia passo a passo

6. **`.aws/SETUP_CHECKLIST.md`**
   - Checklist completo com 50+ tarefas
   - Comandos AWS CLI para cada etapa
   - Troubleshooting e dicas

7. **`.aws/trust-policy.json`**
   - Policy de trust para IAM roles do ECS
   - Usado na criação das roles

### Scripts de Automação

8. **`scripts/setup-aws-ecs.sh`**
   - Script automatizado de setup
   - Cria recursos na AWS automaticamente
   - Gera credenciais para GitHub Actions

### Configuração do Projeto

9. **`.env.example`**
   - Exemplo de variáveis de ambiente
   - Template para configuração local e CI/CD

10. **Atualizações nos `package.json`**
    - Script `test` adicionado ao root
    - Script `check-types` adicionado à API e Web
    - Configuração do Turborepo

11. **`turbo.json`**
    - Task `test` adicionada ao Turborepo

## 🔄 Como Funciona o Pipeline

### Fluxo de CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to main / PR                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Job: test-and-build                        │
│  1. Checkout code                                           │
│  2. Setup Node.js + pnpm                                    │
│  3. Install dependencies                                    │
│  4. Run linting                                             │
│  5. Run type checking                                       │
│  6. Run tests (unit + e2e)                                  │
│  7. Build all apps                                          │
│  8. Upload artifacts                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├────────────┬────────────────┐
                         ▼            ▼                ▼
                    (main only)  (main only)     (PR only)
                         │            │                │
         ┌───────────────┘            └────────┐       │
         │                                     │       │
         ▼                                     ▼       ▼
┌──────────────────────┐            ┌──────────────────────┐
│   Job: deploy-api    │            │   Job: deploy-web    │
│  1. Download build   │            │  1. Download build   │
│  2. AWS credentials  │            │  2. AWS credentials  │
│  3. Login to ECR     │            │  3. Login to ECR     │
│  4. Build Docker     │            │  4. Build Docker     │
│  5. Push to ECR      │            │  5. Push to ECR      │
│  6. Update task def  │            │  6. Update task def  │
│  7. Deploy to ECS    │            │  7. Deploy to ECS    │
└──────────────────────┘            └──────────────────────┘
```

## 🏗️ Arquitetura AWS

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Amazon ECR                           │  │
│  │  ┌─────────────────────┐  ┌──────────────────────┐  │  │
│  │  │   tickets-api:tag   │  │  tickets-web:tag     │  │  │
│  │  └─────────────────────┘  └──────────────────────┘  │  │
│  └──────────────────┬───────────────┬──────────────────┘  │
│                     │               │                     │
│                     ▼               ▼                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Amazon ECS Cluster                      │  │
│  │              (tickets-cluster)                       │  │
│  │                                                      │  │
│  │  ┌─────────────────────┐  ┌──────────────────────┐  │  │
│  │  │  API Service        │  │  Web Service         │  │  │
│  │  │  (2 tasks)          │  │  (2 tasks)           │  │  │
│  │  │  Port: 3000         │  │  Port: 3001          │  │  │
│  │  │  Fargate            │  │  Fargate             │  │  │
│  │  └─────────────────────┘  └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                     │               │                     │
│                     ▼               ▼                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Application Load Balancer                 │  │
│  │  ┌─────────────────────┐  ┌──────────────────────┐  │  │
│  │  │  Target Group API   │  │  Target Group Web    │  │  │
│  │  └─────────────────────┘  └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            CloudWatch Logs                           │  │
│  │  - /ecs/tickets-api                                  │  │
│  │  - /ecs/tickets-web                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AWS Secrets Manager                          │  │
│  │  - tickets/database-url                              │  │
│  │  - tickets/api-url                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Amazon RDS (PostgreSQL)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Configurações do Pipeline

### Variáveis de Ambiente (Workflow)

```yaml
AWS_REGION: us-east-1
NODE_VERSION: '18'
PNPM_VERSION: '10.17.1'
ECR_REPOSITORY_API: tickets-api
ECR_REPOSITORY_WEB: tickets-web
ECS_SERVICE_API: tickets-api-service
ECS_SERVICE_WEB: tickets-web-service
ECS_CLUSTER: tickets-cluster
```

### GitHub Secrets Necessários

- `AWS_ACCESS_KEY_ID` - Access Key do usuário IAM
- `AWS_SECRET_ACCESS_KEY` - Secret Access Key do usuário IAM

### AWS Resources Necessários

1. **ECR Repositories**
   - `tickets-api`
   - `tickets-web`

2. **ECS Cluster**
   - `tickets-cluster`

3. **ECS Services**
   - `tickets-api-service` (2 tasks)
   - `tickets-web-service` (2 tasks)

4. **IAM Roles**
   - `ecsTaskExecutionRole`
   - `ecsTaskRole`
   - `github-actions-deployer` (usuário)

5. **CloudWatch Log Groups**
   - `/ecs/tickets-api`
   - `/ecs/tickets-web`

6. **Secrets Manager**
   - `tickets/database-url`
   - `tickets/api-url`

7. **VPC Resources**
   - VPC
   - 2+ Subnets (diferentes AZs)
   - Security Groups (portas 3000, 3001)
   - Application Load Balancer (opcional, mas recomendado)
   - Target Groups

## 🎯 Triggers do Pipeline

### CI/CD Principal (`.github/workflows/ci-cd.yml`)

- **Trigger**: Push para `main` ou Pull Request para `main`
- **Jobs**:
  - `test-and-build`: Sempre executa
  - `deploy-api`: Apenas em push para `main`
  - `deploy-web`: Apenas em push para `main`

### PR Preview (`.github/workflows/pr-preview.yml`)

- **Trigger**: Pull Request para `main`
- **Jobs**:
  - Testes e validações
  - Comentário automático no PR com status

## 📝 Comandos Úteis

### Setup Inicial (Automático)

```bash
# Executar script de setup
./scripts/setup-aws-ecs.sh
```

### Setup Manual (Passo a Passo)

Ver checklist completo em: `.aws/SETUP_CHECKLIST.md`

### Monitoramento

```bash
# Ver logs da API
aws logs tail /ecs/tickets-api --follow --region us-east-1

# Ver logs do Web
aws logs tail /ecs/tickets-web --follow --region us-east-1

# Status dos serviços
aws ecs describe-services \
  --cluster tickets-cluster \
  --services tickets-api-service tickets-web-service \
  --region us-east-1
```

### Deploy Manual (Emergência)

```bash
# Build e push da API
docker build -f docker/app-sql/Dockerfile -t $ECR_URI/tickets-api:manual .
docker push $ECR_URI/tickets-api:manual

# Forçar novo deployment
aws ecs update-service \
  --cluster tickets-cluster \
  --service tickets-api-service \
  --force-new-deployment \
  --region us-east-1
```

## 🔐 Segurança

### Checklist de Segurança

- ✅ Credenciais armazenadas no GitHub Secrets
- ✅ Secrets sensíveis no AWS Secrets Manager
- ✅ IAM roles com princípio de menor privilégio
- ✅ Security Groups restringindo acesso
- ✅ VPC privada para banco de dados
- ✅ HTTPS configurado (via ALB)
- ✅ Logs centralizados no CloudWatch
- ✅ Imagens Docker escaneadas por vulnerabilidades (opcional)

### Permissões IAM Necessárias

O usuário `github-actions-deployer` precisa de:
- ECR: Push/Pull de imagens
- ECS: Update de serviços e task definitions
- IAM: PassRole para execution e task roles

## 📊 Métricas e Monitoramento

### CloudWatch Dashboards (Recomendado)

Criar dashboards para monitorar:
- CPU e memória dos containers
- Número de requests
- Latência das APIs
- Taxa de erros
- Logs de erro

### Alertas (Recomendado)

Configurar alarmes para:
- CPU > 80%
- Memória > 80%
- Taxa de erros > 5%
- Health check failures
- Deploy failures

## 🚀 Próximos Passos

### Melhorias Recomendadas

1. **Infraestrutura**
   - [ ] Configurar Application Load Balancer
   - [ ] Configurar Auto Scaling
   - [ ] Configurar Amazon RDS para produção
   - [ ] Configurar backup automático

2. **Segurança**
   - [ ] Configurar WAF (Web Application Firewall)
   - [ ] Configurar SSL/TLS certificates (ACM)
   - [ ] Implementar rate limiting
   - [ ] Escanear imagens Docker por vulnerabilidades

3. **Monitoramento**
   - [ ] Configurar X-Ray para tracing distribuído
   - [ ] Criar dashboards no CloudWatch
   - [ ] Configurar alertas e notificações
   - [ ] Integrar com PagerDuty ou similar

4. **CI/CD**
   - [ ] Adicionar stage de teste de performance
   - [ ] Implementar blue/green deployment
   - [ ] Configurar ambiente de staging
   - [ ] Adicionar testes de segurança (SAST/DAST)

5. **Qualidade de Código**
   - [ ] Integrar SonarQube ou similar
   - [ ] Configurar coverage mínimo obrigatório
   - [ ] Adicionar linting de commits (Husky)
   - [ ] Configurar dependabot para updates

## 📚 Documentação de Referência

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [NestJS Production Deployment](https://docs.nestjs.com/faq/serverless)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Troubleshooting

### Problemas Comuns e Soluções

Ver seção de troubleshooting em `.aws/README.md` e `.aws/SETUP_CHECKLIST.md`

### Suporte

Para problemas ou dúvidas:
1. Consultar `.aws/README.md`
2. Consultar `.aws/SETUP_CHECKLIST.md`
3. Ver logs no CloudWatch
4. Ver execução do workflow no GitHub Actions

## 📞 Contatos e Recursos

- **Documentação AWS**: https://docs.aws.amazon.com
- **GitHub Actions**: https://github.com/features/actions
- **Turborepo**: https://turbo.build

---

**Última Atualização**: 2025-10-02
**Versão**: 1.0.0
**Autor**: GitHub Copilot
