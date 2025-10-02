# 🚀 Quick Start Guide - CI/CD Setup

Guia rápido para começar com o CI/CD do projeto em **5 minutos**.

## ⚡ Setup Rápido (Opção 1 - Automático)

### 1. Pré-requisitos
```bash
# Instalar AWS CLI (se ainda não tiver)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciais AWS
aws configure
```

### 2. Executar Script Automatizado
```bash
# Tornar o script executável
chmod +x ./scripts/setup-aws-ecs.sh

# Executar setup
./scripts/setup-aws-ecs.sh
```

O script irá:
- ✅ Criar repositórios ECR
- ✅ Criar cluster ECS
- ✅ Criar IAM roles
- ✅ Criar log groups
- ✅ Criar secrets
- ✅ Registrar task definitions
- ✅ Criar usuário para GitHub Actions
- ✅ Gerar credenciais

### 3. Configurar GitHub Secrets

No GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

```
AWS_ACCESS_KEY_ID: <valor gerado pelo script>
AWS_SECRET_ACCESS_KEY: <valor gerado pelo script>
```

### 4. Criar Serviços ECS

Você precisará de VPC, subnets e security groups. Se já tiver:

```bash
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
  --region us-east-1

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
  --region us-east-1
```

### 5. Deploy! 🎉

```bash
git add .
git commit -m "Configure CI/CD pipeline"
git push origin main
```

Vá para **Actions** no GitHub e acompanhe o deploy!

---

## 🛠️ Setup Manual (Opção 2 - Passo a Passo)

Se preferir fazer manualmente, siga o guia completo:

📋 **[.aws/SETUP_CHECKLIST.md](.aws/SETUP_CHECKLIST.md)** - Checklist completo com todos os comandos

---

## 📖 Documentação Completa

- 📄 **[SUMMARY.md](.aws/SUMMARY.md)** - Visão geral de tudo que foi configurado
- 📋 **[SETUP_CHECKLIST.md](.aws/SETUP_CHECKLIST.md)** - Checklist detalhado (50+ tarefas)
- 📚 **[README.md](.aws/README.md)** - Documentação completa com exemplos

---

## ✅ Verificar Configuração

### 1. Verificar recursos AWS
```bash
# ECR
aws ecr describe-repositories --region us-east-1

# ECS Cluster
aws ecs describe-clusters --clusters tickets-cluster --region us-east-1

# Services
aws ecs list-services --cluster tickets-cluster --region us-east-1

# Task Definitions
aws ecs list-task-definitions --region us-east-1
```

### 2. Testar localmente
```bash
# Instalar dependências
pnpm install

# Rodar testes
pnpm test

# Rodar build
pnpm build

# Testar Docker
docker build -f docker/app-sql/Dockerfile -t test-api .
docker build -f docker/web/Dockerfile -t test-web .
```

### 3. Verificar GitHub Actions
```bash
# Ver status do último workflow
gh run list --limit 1

# Ver logs do último workflow
gh run view --log
```

---

## 🔍 Monitoramento Rápido

### Ver logs em tempo real
```bash
# API
aws logs tail /ecs/tickets-api --follow

# Web
aws logs tail /ecs/tickets-web --follow
```

### Status dos serviços
```bash
aws ecs describe-services \
  --cluster tickets-cluster \
  --services tickets-api-service tickets-web-service \
  --query 'services[*].[serviceName,status,runningCount,desiredCount]' \
  --output table
```

---

## 🐛 Troubleshooting Rápido

### Pipeline falhou?
```bash
# Ver logs no GitHub
gh run view

# Ver logs no CloudWatch
aws logs tail /ecs/tickets-api --since 10m
```

### Service não inicia?
```bash
# Ver eventos do serviço
aws ecs describe-services \
  --cluster tickets-cluster \
  --services tickets-api-service \
  --query 'services[0].events[0:5]'

# Ver tasks que falharam
aws ecs list-tasks \
  --cluster tickets-cluster \
  --service-name tickets-api-service \
  --desired-status STOPPED
```

### Imagem não foi para ECR?
```bash
# Listar imagens
aws ecr list-images --repository-name tickets-api

# Ver últimas tags
aws ecr describe-images \
  --repository-name tickets-api \
  --query 'sort_by(imageDetails,& imagePushedAt)[-5:]'
```

---

## 🎯 Fluxo de Trabalho

### Desenvolvimento Normal
```bash
# 1. Criar feature branch
git checkout -b feature/minha-feature

# 2. Desenvolver e commitar
git add .
git commit -m "feat: add feature"
git push origin feature/minha-feature

# 3. Abrir PR (testes rodam automaticamente)
gh pr create

# 4. Merge para main (deploy automático)
gh pr merge
```

### Deploy Manual de Emergência
```bash
# Forçar novo deployment
aws ecs update-service \
  --cluster tickets-cluster \
  --service tickets-api-service \
  --force-new-deployment
```

### Rollback Rápido
```bash
# 1. Listar task definitions anteriores
aws ecs list-task-definitions \
  --family-prefix tickets-api \
  --sort DESC

# 2. Atualizar serviço para versão anterior
aws ecs update-service \
  --cluster tickets-cluster \
  --service tickets-api-service \
  --task-definition tickets-api:VERSAO_ANTERIOR
```

---

## 📊 Custos Estimados (AWS)

### Configuração Mínima (2 tasks cada)
- ECS Fargate: ~$30-50/mês
- ECR: ~$1-5/mês
- CloudWatch Logs: ~$5-10/mês
- ALB (se usar): ~$20-30/mês
- **Total estimado: $56-95/mês**

### Dicas para Reduzir Custos
- Use spot instances quando possível
- Configure log retention (7-30 dias)
- Delete imagens antigas do ECR
- Use ambiente de staging menor
- Configure auto-scaling adequadamente

---

## 📞 Precisa de Ajuda?

1. 📖 **Consultar documentação completa**: `.aws/README.md`
2. ✅ **Ver checklist detalhado**: `.aws/SETUP_CHECKLIST.md`
3. 📝 **Ver resumo completo**: `.aws/SUMMARY.md`
4. 🔍 **Ver logs**: CloudWatch ou GitHub Actions
5. 🐛 **Troubleshooting**: Seção específica em cada documento

---

## ✨ Recursos Criados

- ✅ 2 workflows GitHub Actions
- ✅ 2 task definitions ECS
- ✅ 4 arquivos de documentação
- ✅ 1 script de automação
- ✅ 1 arquivo de exemplo (.env.example)
- ✅ Configurações atualizadas (package.json, turbo.json)

**Você está pronto para fazer deploy! 🚀**

---

**Tempo estimado de setup**: 15-30 minutos (com script) ou 1-2 horas (manual)
