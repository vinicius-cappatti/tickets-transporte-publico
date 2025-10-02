#!/bin/bash

# Script de configuração inicial do CI/CD para AWS ECS
# Este script ajuda a configurar os recursos necessários na AWS

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI não está instalado. Instale usando: https://aws.amazon.com/cli/"
    exit 1
fi

log_info "AWS ECS CI/CD Setup Script"
echo ""

# Solicitar informações
read -p "AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

read -p "Nome do Cluster ECS (default: tickets-cluster): " CLUSTER_NAME
CLUSTER_NAME=${CLUSTER_NAME:-tickets-cluster}

read -p "Nome do repositório ECR para API (default: tickets-api): " ECR_API
ECR_API=${ECR_API:-tickets-api}

read -p "Nome do repositório ECR para Web (default: tickets-web): " ECR_WEB
ECR_WEB=${ECR_WEB:-tickets-web}

read -p "Database URL: " DATABASE_URL
read -p "API URL (para o frontend): " API_URL

echo ""
log_info "Configuração:"
echo "  Region: $AWS_REGION"
echo "  Cluster: $CLUSTER_NAME"
echo "  ECR API: $ECR_API"
echo "  ECR Web: $ECR_WEB"
echo ""

read -p "Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Obter Account ID
log_info "Obtendo Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
log_info "Account ID: $ACCOUNT_ID"

# Criar repositórios ECR
log_info "Criando repositórios ECR..."
aws ecr create-repository --repository-name $ECR_API --region $AWS_REGION 2>/dev/null || log_warn "Repositório $ECR_API já existe"
aws ecr create-repository --repository-name $ECR_WEB --region $AWS_REGION 2>/dev/null || log_warn "Repositório $ECR_WEB já existe"

# Criar cluster ECS
log_info "Criando cluster ECS..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION 2>/dev/null || log_warn "Cluster $CLUSTER_NAME já existe"

# Criar IAM roles
log_info "Criando IAM roles..."

# Execution Role
cat > /tmp/ecs-execution-role.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file:///tmp/ecs-execution-role.json \
    --region $AWS_REGION 2>/dev/null || log_warn "Role ecsTaskExecutionRole já existe"

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    2>/dev/null || log_warn "Policy já anexada"

# Task Role
aws iam create-role \
    --role-name ecsTaskRole \
    --assume-role-policy-document file:///tmp/ecs-execution-role.json \
    --region $AWS_REGION 2>/dev/null || log_warn "Role ecsTaskRole já existe"

# Criar CloudWatch Log Groups
log_info "Criando CloudWatch Log Groups..."
aws logs create-log-group --log-group-name /ecs/$ECR_API --region $AWS_REGION 2>/dev/null || log_warn "Log group já existe"
aws logs create-log-group --log-group-name /ecs/$ECR_WEB --region $AWS_REGION 2>/dev/null || log_warn "Log group já existe"

# Criar secrets no Secrets Manager
log_info "Criando secrets no Secrets Manager..."
aws secretsmanager create-secret \
    --name tickets/database-url \
    --secret-string "$DATABASE_URL" \
    --region $AWS_REGION 2>/dev/null || log_warn "Secret database-url já existe"

aws secretsmanager create-secret \
    --name tickets/api-url \
    --secret-string "$API_URL" \
    --region $AWS_REGION 2>/dev/null || log_warn "Secret api-url já existe"

# Atualizar task definitions
log_info "Atualizando task definitions..."

# API Task Definition
sed -i.bak \
    -e "s/YOUR_ACCOUNT_ID/$ACCOUNT_ID/g" \
    -e "s/us-east-1/$AWS_REGION/g" \
    -e "s/tickets-api/$ECR_API/g" \
    .aws/task-definition-api.json

# Web Task Definition
sed -i.bak \
    -e "s/YOUR_ACCOUNT_ID/$ACCOUNT_ID/g" \
    -e "s/us-east-1/$AWS_REGION/g" \
    -e "s/tickets-web/$ECR_WEB/g" \
    .aws/task-definition-web.json

# Registrar task definitions
log_info "Registrando task definitions..."
aws ecs register-task-definition \
    --cli-input-json file://.aws/task-definition-api.json \
    --region $AWS_REGION

aws ecs register-task-definition \
    --cli-input-json file://.aws/task-definition-web.json \
    --region $AWS_REGION

# Criar usuário IAM para GitHub Actions
log_info "Criando usuário IAM para GitHub Actions..."
aws iam create-user --user-name github-actions-deployer 2>/dev/null || log_warn "Usuário já existe"

# Criar política
cat > /tmp/github-actions-policy.json << EOF
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
      "Action": ["iam:PassRole"],
      "Resource": [
        "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
        "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskRole"
      ]
    }
  ]
}
EOF

aws iam create-policy \
    --policy-name GitHubActionsDeployPolicy \
    --policy-document file:///tmp/github-actions-policy.json 2>/dev/null || log_warn "Policy já existe"

aws iam attach-user-policy \
    --user-name github-actions-deployer \
    --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/GitHubActionsDeployPolicy 2>/dev/null || log_warn "Policy já anexada"

# Criar access key
log_info "Criando access key para GitHub Actions..."
ACCESS_KEY=$(aws iam create-access-key --user-name github-actions-deployer --output json 2>/dev/null || echo '{}')

echo ""
echo "=============================================="
log_info "Setup concluído com sucesso!"
echo "=============================================="
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure os GitHub Secrets:"
if [ ! -z "$ACCESS_KEY" ] && [ "$ACCESS_KEY" != "{}" ]; then
    echo "   AWS_ACCESS_KEY_ID: $(echo $ACCESS_KEY | jq -r .AccessKey.AccessKeyId)"
    echo "   AWS_SECRET_ACCESS_KEY: $(echo $ACCESS_KEY | jq -r .AccessKey.SecretAccessKey)"
else
    log_warn "Access key não foi criada (usuário já existe). Use o console AWS para criar uma nova."
fi
echo ""
echo "2. Crie os serviços ECS (você precisará de VPC, subnets e security groups):"
echo "   aws ecs create-service --cluster $CLUSTER_NAME --service-name ${ECR_API}-service ..."
echo ""
echo "3. Atualize o workflow em .github/workflows/ci-cd.yml com os nomes corretos"
echo ""
echo "4. Faça commit das mudanças e push para o repositório"
echo ""
log_info "Para mais detalhes, consulte: .aws/README.md"
