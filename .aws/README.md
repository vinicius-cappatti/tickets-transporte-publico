# CI/CD Setup - GitHub Actions + Amazon ECS

Este documento descreve como configurar o pipeline de CI/CD para deploy automático das aplicações no Amazon ECS.

## 📋 Pré-requisitos

- Conta AWS com permissões adequadas
- AWS CLI instalado e configurado
- Docker instalado localmente (para testes)
- Repositório GitHub configurado

## 🚀 Configuração Inicial

### 1. Criar Repositórios ECR

Crie dois repositórios no Amazon ECR para armazenar as imagens Docker:

```bash
# Repositório para API
aws ecr create-repository \
  --repository-name tickets-api \
  --region us-east-1

# Repositório para Web
aws ecr create-repository \
  --repository-name tickets-web \
  --region us-east-1
```

Anote os URIs dos repositórios criados.

### 2. Criar Cluster ECS

```bash
aws ecs create-cluster \
  --cluster-name tickets-cluster \
  --region us-east-1
```

### 3. Configurar IAM Roles

#### Task Execution Role

```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### Task Role (para acessar outros recursos AWS)

```bash
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'
```

### 4. Criar CloudWatch Log Groups

```bash
aws logs create-log-group \
  --log-group-name /ecs/tickets-api \
  --region us-east-1

aws logs create-log-group \
  --log-group-name /ecs/tickets-web \
  --region us-east-1
```

### 5. Configurar Secrets Manager

Armazene as variáveis sensíveis no AWS Secrets Manager:

```bash
# Database URL
aws secretsmanager create-secret \
  --name tickets/database-url \
  --secret-string "postgresql://user:password@host:5432/database" \
  --region us-east-1

# API URL para o frontend
aws secretsmanager create-secret \
  --name tickets/api-url \
  --secret-string "https://api.your-domain.com" \
  --region us-east-1
```

### 6. Atualizar Task Definitions

Edite os arquivos em `.aws/` e substitua:
- `YOUR_ACCOUNT_ID` pelo ID da sua conta AWS
- `us-east-1` pela região desejada (se diferente)
- Ajuste os ARNs dos secrets conforme necessário

### 7. Registrar Task Definitions

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

### 8. Criar Serviços ECS

Você precisará de:
- VPC ID
- Security Group ID (com portas 3000 abertas)
- Subnet IDs (pelo menos 2 em AZs diferentes)
- Target Group ARN (se usar ALB)

```bash
# Criar serviço da API
aws ecs create-service \
  --cluster tickets-cluster \
  --service-name tickets-api-service \
  --task-definition tickets-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxx,subnet-yyy],
    securityGroups=[sg-xxx],
    assignPublicIp=ENABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account-id:targetgroup/xxx,containerName=tickets-api,containerPort=3000" \
  --region us-east-1

# Criar serviço do Web
aws ecs create-service \
  --cluster tickets-cluster \
  --service-name tickets-web-service \
  --task-definition tickets-web \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxx,subnet-yyy],
    securityGroups=[sg-xxx],
    assignPublicIp=ENABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account-id:targetgroup/xxx,containerName=tickets-web,containerPort=3000" \
  --region us-east-1
```

### 9. Configurar GitHub Secrets

No GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

- `AWS_ACCESS_KEY_ID`: Access Key do usuário IAM
- `AWS_SECRET_ACCESS_KEY`: Secret Access Key do usuário IAM

#### Criar usuário IAM para GitHub Actions:

```bash
aws iam create-user --user-name github-actions-deployer

# Criar política com permissões necessárias
cat > github-actions-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
        "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskRole"
      ]
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name GitHubActionsDeployPolicy \
  --policy-document file://github-actions-policy.json

aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GitHubActionsDeployPolicy

# Criar access key
aws iam create-access-key --user-name github-actions-deployer
```

### 10. Atualizar Variáveis no Workflow

Edite `.github/workflows/ci-cd.yml` e atualize:

```yaml
env:
  AWS_REGION: us-east-1                      # Sua região AWS
  ECR_REPOSITORY_API: tickets-api            # Nome do repo ECR da API
  ECR_REPOSITORY_WEB: tickets-web            # Nome do repo ECR do Web
  ECS_SERVICE_API: tickets-api-service       # Nome do serviço ECS da API
  ECS_SERVICE_WEB: tickets-web-service       # Nome do serviço ECS do Web
  ECS_CLUSTER: tickets-cluster               # Nome do cluster ECS
```

## 🔄 Como Funciona o Pipeline

### 1. Test and Build Job
- Executa em todos os pushes e PRs
- Instala dependências com pnpm
- Executa linting e type checking
- Roda testes unitários e e2e
- Faz build de todas as aplicações
- Faz upload dos artefatos

### 2. Deploy API Job
- Executa apenas em pushes na branch `main`
- Baixa os artefatos do build
- Faz build da imagem Docker
- Faz push para Amazon ECR
- Atualiza a task definition
- Faz deploy no ECS

### 3. Deploy Web Job
- Executa apenas em pushes na branch `main`
- Baixa os artefatos do build
- Faz build da imagem Docker
- Faz push para Amazon ECR
- Atualiza a task definition
- Faz deploy no ECS

## 📊 Monitoramento

### CloudWatch Logs

Visualize os logs das aplicações:

```bash
# Logs da API
aws logs tail /ecs/tickets-api --follow

# Logs do Web
aws logs tail /ecs/tickets-web --follow
```

### Status dos Serviços

```bash
# Status do serviço da API
aws ecs describe-services \
  --cluster tickets-cluster \
  --services tickets-api-service \
  --region us-east-1

# Status do serviço Web
aws ecs describe-services \
  --cluster tickets-cluster \
  --services tickets-web-service \
  --region us-east-1
```

## 🛠️ Troubleshooting

### Deployment Falhou

1. Verifique os logs no GitHub Actions
2. Verifique os logs no CloudWatch
3. Verifique o status dos serviços ECS:
   ```bash
   aws ecs describe-services --cluster tickets-cluster --services tickets-api-service
   ```

### Imagem não foi enviada para ECR

1. Verifique as credenciais AWS no GitHub Secrets
2. Verifique se o repositório ECR existe
3. Verifique as permissões do usuário IAM

### Task Definition não atualiza

1. Verifique se o arquivo `.aws/task-definition-*.json` está correto
2. Verifique se os ARNs das roles estão corretos
3. Verifique se os secrets no Secrets Manager existem

## 🔐 Segurança

- ✅ Use IAM roles com permissões mínimas necessárias
- ✅ Armazene credenciais no Secrets Manager
- ✅ Nunca commite credenciais no código
- ✅ Use security groups para restringir acesso
- ✅ Habilite CloudTrail para auditoria
- ✅ Configure VPC privada para recursos sensíveis

## 📚 Recursos Adicionais

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs no CloudWatch
2. Verifique o status do workflow no GitHub Actions
3. Consulte a documentação da AWS
4. Abra uma issue no repositório
