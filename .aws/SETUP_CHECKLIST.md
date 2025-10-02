# Checklist de Configuração CI/CD para AWS ECS

Este documento serve como guia passo a passo para configurar o pipeline de CI/CD para o projeto de tickets de transporte público.

## ✅ Pré-requisitos

### 1. Conta AWS Configurada
- [ ] Conta AWS criada e ativa
- [ ] AWS CLI instalado localmente
- [ ] Credenciais AWS configuradas (`aws configure`)

### 2. Repositório GitHub
- [ ] Repositório criado no GitHub
- [ ] Código commitado na branch `main`
- [ ] Acesso de administrador ao repositório

## 🔧 Configuração AWS

### 3. Amazon ECR (Elastic Container Registry)

Crie os repositórios para as imagens Docker:

```bash
# Criar repositório para a API
aws ecr create-repository \
    --repository-name tickets-api \
    --region us-east-1

# Criar repositório para o Web
aws ecr create-repository \
    --repository-name tickets-web \
    --region us-east-1
```

- [ ] Repositório `tickets-api` criado
- [ ] Repositório `tickets-web` criado
- [ ] Anotado o URI dos repositórios

### 4. Amazon ECS (Elastic Container Service)

#### 4.1. Criar Cluster ECS

```bash
aws ecs create-cluster \
    --cluster-name tickets-cluster \
    --region us-east-1
```

- [ ] Cluster `tickets-cluster` criado

#### 4.2. Criar Task Definitions

As task definitions já estão em `.aws/task-definition-api.json` e `.aws/task-definition-web.json`.

**Editar antes de registrar:**
- [ ] Substituir `YOUR_ACCOUNT_ID` pelo seu Account ID da AWS
- [ ] Substituir `us-east-1` pela sua região (se diferente)
- [ ] Configurar ARNs das roles IAM (ver seção 5)

```bash
# Registrar task definition da API
aws ecs register-task-definition \
    --cli-input-json file://.aws/task-definition-api.json \
    --region us-east-1

# Registrar task definition do Web
aws ecs register-task-definition \
    --cli-input-json file://.aws/task-definition-web.json \
    --region us-east-1
```

- [ ] Task definition `tickets-api` registrada
- [ ] Task definition `tickets-web` registrada

#### 4.3. Criar VPC e Security Groups (se ainda não existir)

```bash
# Listar VPCs disponíveis
aws ec2 describe-vpcs --region us-east-1

# Listar subnets disponíveis
aws ec2 describe-subnets --region us-east-1

# Criar security group para a API
aws ec2 create-security-group \
    --group-name tickets-api-sg \
    --description "Security group for Tickets API" \
    --vpc-id <VPC_ID> \
    --region us-east-1

# Permitir tráfego na porta 3000 (API)
aws ec2 authorize-security-group-ingress \
    --group-id <SECURITY_GROUP_ID> \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0 \
    --region us-east-1

# Criar security group para o Web
aws ec2 create-security-group \
    --group-name tickets-web-sg \
    --description "Security group for Tickets Web" \
    --vpc-id <VPC_ID> \
    --region us-east-1

# Permitir tráfego na porta 3001 (Web)
aws ec2 authorize-security-group-ingress \
    --group-id <SECURITY_GROUP_ID> \
    --protocol tcp \
    --port 3001 \
    --cidr 0.0.0.0/0 \
    --region us-east-1
```

- [ ] VPC identificada (anotar VPC ID)
- [ ] Subnets identificadas (anotar IDs - mínimo 2)
- [ ] Security group para API criado
- [ ] Security group para Web criado

#### 4.4. Criar Services ECS

```bash
# Criar serviço para a API
aws ecs create-service \
    --cluster tickets-cluster \
    --service-name tickets-api-service \
    --task-definition tickets-api \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --region us-east-1

# Criar serviço para o Web
aws ecs create-service \
    --cluster tickets-cluster \
    --service-name tickets-web-service \
    --task-definition tickets-web \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --region us-east-1
```

- [ ] Service `tickets-api-service` criado
- [ ] Service `tickets-web-service` criado

### 5. IAM Roles e Policies

#### 5.1. Task Execution Role

Permite que o ECS baixe imagens do ECR e escreva logs no CloudWatch:

```bash
# Criar role
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://trust-policy.json

# Anexar policy gerenciada
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

Conteúdo do `trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

- [ ] Role `ecsTaskExecutionRole` criada
- [ ] Policy anexada à role

#### 5.2. Task Role (para a aplicação)

```bash
# Criar role
aws iam create-role \
    --role-name ecsTaskRole \
    --assume-role-policy-document file://trust-policy.json
```

- [ ] Role `ecsTaskRole` criada

### 6. CloudWatch Logs

```bash
# Criar log group para a API
aws logs create-log-group \
    --log-group-name /ecs/tickets-api \
    --region us-east-1

# Criar log group para o Web
aws logs create-log-group \
    --log-group-name /ecs/tickets-web \
    --region us-east-1
```

- [ ] Log group `/ecs/tickets-api` criado
- [ ] Log group `/ecs/tickets-web` criado

### 7. AWS Secrets Manager

Armazene secrets sensíveis (como DATABASE_URL):

```bash
# Criar secret para DATABASE_URL
aws secretsmanager create-secret \
    --name tickets/database-url \
    --description "Database URL for Tickets API" \
    --secret-string "postgresql://user:password@host:5432/tickets" \
    --region us-east-1
```

- [ ] Secret `tickets/database-url` criado
- [ ] Outros secrets criados conforme necessário

## 🔐 Configuração GitHub

### 8. GitHub Secrets

No seu repositório GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

- [ ] `AWS_ACCESS_KEY_ID` - Access Key ID do usuário IAM
- [ ] `AWS_SECRET_ACCESS_KEY` - Secret Access Key do usuário IAM
- [ ] `AWS_REGION` - Região AWS (ex: `us-east-1`)
- [ ] `AWS_ACCOUNT_ID` - ID da conta AWS

### 9. GitHub Actions Workflow

Os workflows já estão criados em `.github/workflows/`:

- [ ] `.github/workflows/ci-cd.yml` - Pipeline principal
- [ ] `.github/workflows/pr-preview.yml` - Preview de PRs

**Editar os workflows:**
- [ ] Verificar variáveis de ambiente no arquivo
- [ ] Ajustar nomes de serviços/clusters se necessário

## 🧪 Testes

### 10. Testar Localmente

```bash
# Instalar dependências
pnpm install

# Rodar testes
pnpm test

# Rodar build
pnpm build

# Testar Docker builds localmente
docker build -f docker/app-sql/Dockerfile -t tickets-api:test .
docker build -f docker/web/Dockerfile -t tickets-web:test .
```

- [ ] Testes passando localmente
- [ ] Build funcionando
- [ ] Docker builds funcionando

### 11. Primeiro Deploy

```bash
# Fazer commit e push para main
git add .
git commit -m "Configure CI/CD pipeline"
git push origin main
```

- [ ] Código commitado e enviado
- [ ] GitHub Actions executado com sucesso
- [ ] Imagens pushadas para ECR
- [ ] Deploy realizado no ECS

## 📊 Monitoramento

### 12. Verificar Deploy

```bash
# Verificar status do serviço API
aws ecs describe-services \
    --cluster tickets-cluster \
    --services tickets-api-service \
    --region us-east-1

# Verificar status do serviço Web
aws ecs describe-services \
    --cluster tickets-cluster \
    --services tickets-web-service \
    --region us-east-1

# Ver logs
aws logs tail /ecs/tickets-api --follow --region us-east-1
aws logs tail /ecs/tickets-web --follow --region us-east-1
```

- [ ] Services rodando corretamente
- [ ] Logs disponíveis e sem erros
- [ ] Aplicações acessíveis

## 🎯 Próximos Passos

### 13. Melhorias Opcionais

- [ ] Configurar Application Load Balancer (ALB)
- [ ] Configurar domínio personalizado (Route 53)
- [ ] Configurar HTTPS (ACM)
- [ ] Configurar Auto Scaling
- [ ] Configurar alertas no CloudWatch
- [ ] Configurar backup do banco de dados (RDS Snapshots)
- [ ] Implementar Blue/Green deployment
- [ ] Configurar ambiente de staging

## 📝 Notas Importantes

1. **Custos**: ECS Fargate cobra por vCPU e memória utilizados. Monitore seus custos no AWS Cost Explorer.

2. **Segurança**: 
   - Nunca commite credenciais no código
   - Use secrets do GitHub para credenciais
   - Use AWS Secrets Manager para secrets da aplicação
   - Configure security groups adequadamente

3. **Banco de Dados**: 
   - Configure RDS para produção
   - Use connection pooling
   - Configure backups automáticos

4. **Performance**:
   - Configure health checks adequadamente
   - Ajuste CPU e memória conforme necessário
   - Monitore métricas no CloudWatch

## 🆘 Troubleshooting

### Problemas Comuns

1. **Task não inicia**:
   - Verificar logs no CloudWatch
   - Verificar health check
   - Verificar se a imagem existe no ECR

2. **Deploy falha**:
   - Verificar credenciais AWS
   - Verificar permissões IAM
   - Verificar task definition

3. **Aplicação não responde**:
   - Verificar security groups
   - Verificar configuração de rede
   - Verificar portas expostas

## 🔗 Recursos Úteis

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Docker Documentation](https://docs.docker.com/)

---

**Status da Configuração**: 0/50 tarefas concluídas

Última atualização: 2025-10-02
