# 🚀 Guia de Deploy na AWS EC2

Este guia ensina como fazer deploy do sistema de tickets de transporte público em uma instância EC2 da AWS.

---

## 📚 O que você vai aprender

Este documento é perfeito para iniciantes! Você aprenderá:

1. ✅ O que é CI/CD e por que é importante
2. ✅ Como funciona o GitHub Actions
3. ✅ Diferença entre GitHub Actions e Jenkins
4. ✅ Como fazer deploy manual e automático na EC2
5. ✅ Boas práticas de DevOps

---

## 🎓 Entendendo CI/CD (Para Iniciantes)

### O que é CI/CD?

**CI/CD** significa **Continuous Integration / Continuous Deployment** (Integração Contínua / Deploy Contínuo).

#### 🔄 Continuous Integration (CI) - Integração Contínua

É a prática de **testar automaticamente** seu código sempre que alguém faz uma alteração.

**Exemplo prático:**
```
Você faz um commit → GitHub Actions roda testes → Se passar, código é aprovado
```

**Benefícios:**
- ✅ Encontra bugs mais cedo
- ✅ Garante que o código novo não quebra o código antigo
- ✅ Economiza tempo da equipe

#### 🚀 Continuous Deployment (CD) - Deploy Contínuo

É a prática de **enviar automaticamente** o código aprovado para produção.

**Exemplo prático:**
```
Código passou nos testes → GitHub Actions faz deploy na EC2 → App atualizado automaticamente
```

**Benefícios:**
- ✅ Deploy rápido e confiável
- ✅ Menos erros humanos
- ✅ Entregas mais frequentes

---

## 🤖 GitHub Actions vs Jenkins

Para quem nunca usou ferramentas de CI/CD, aqui está uma comparação didática:

### GitHub Actions 🟢 (Escolhido neste projeto)

**O que é?** 
- Ferramenta de automação integrada ao GitHub
- Executa "workflows" (fluxos de trabalho) automaticamente

**Vantagens:**
- ✅ **Fácil de configurar** - Arquivo YAML simples
- ✅ **Gratuito** - 2.000 minutos/mês no plano grátis
- ✅ **Integrado ao GitHub** - Não precisa de servidor extra
- ✅ **Visual** - Interface amigável no próprio GitHub
- ✅ **Marketplace** - Milhares de ações prontas

**Quando usar:**
- Projetos no GitHub (como este)
- Times pequenos e médios
- Quando você quer simplicidade

### Jenkins 🔶 (Alternativa)

**O que é?**
- Ferramenta de automação open-source
- Precisa de um servidor próprio para rodar

**Vantagens:**
- ✅ **Muito poderoso** - Extremamente customizável
- ✅ **Plugins** - Milhares de extensões
- ✅ **Gratuito** - 100% open-source
- ✅ **Controle total** - Roda no seu servidor

**Desvantagens:**
- ❌ **Complexo** - Curva de aprendizado maior
- ❌ **Precisa de servidor** - Custo de infraestrutura
- ❌ **Manutenção** - Você gerencia tudo

**Quando usar:**
- Empresas grandes
- Projetos complexos com muitas integrações
- Quando você precisa de controle total

### 📊 Comparação Rápida

| Característica | GitHub Actions | Jenkins |
|---------------|----------------|---------|
| **Configuração** | ⭐⭐⭐⭐⭐ Fácil | ⭐⭐ Complexa |
| **Custo inicial** | ⭐⭐⭐⭐⭐ Gratuito | ⭐⭐⭐ Precisa servidor |
| **Manutenção** | ⭐⭐⭐⭐⭐ GitHub cuida | ⭐⭐ Você cuida |
| **Integração GitHub** | ⭐⭐⭐⭐⭐ Nativa | ⭐⭐⭐ Via plugins |
| **Poder/Customização** | ⭐⭐⭐⭐ Bom | ⭐⭐⭐⭐⭐ Excelente |
| **Iniciantes** | ⭐⭐⭐⭐⭐ Perfeito | ⭐⭐ Difícil |

**💡 Nossa escolha:** GitHub Actions - mais simples e perfeito para este projeto!

---

## 🔧 Como funciona nosso CI/CD?

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. Desenvolvedor faz commit e push para GitHub            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GitHub Actions detecta mudança e inicia workflow        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Job "Test and Build" executa:                           │
│     ✓ Instala dependências (pnpm install)                   │
│     ✓ Verifica código (lint + type check)                   │
│     ✓ Roda testes (unit + e2e)                              │
│     ✓ Build da aplicação                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │ Passou? │
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │ NÃO                 │ SIM
              ▼                     ▼
    ┌─────────────────┐   ┌──────────────────────────────┐
    │ ❌ Deploy        │   │ 4. Job "Deploy to EC2":      │
    │    cancelado     │   │    ✓ Conecta na EC2 via SSH  │
    │                  │   │    ✓ Faz git pull            │
    └─────────────────┘   │    ✓ Rebuild containers      │
                          │    ✓ Roda migrations         │
                          │    ✓ Verifica saúde          │
                          └────────────┬─────────────────┘
                                       │
                                       ▼
                          ┌──────────────────────────────┐
                          │ ✅ App atualizado em          │
                          │    produção!                 │
                          └──────────────────────────────┘
```

### Arquivos Importantes

**`.github/workflows/ci-cd.yml`** - Pipeline principal
- Roda em **PUSH** na branch `main`
- Faz testes e deploy automático

**`.github/workflows/pr-preview.yml`** - Preview de Pull Requests
- Roda em **PULL REQUEST**
- Só testa, NÃO faz deploy
- Adiciona comentário no PR com resultado

---

## 🤖 Configurando Deploy Automático com GitHub Actions

### Por que usar deploy automático?

**Antes (Deploy Manual):**

```text
😓 Você → SSH na EC2 → git pull → rebuild → restart → verificar
   (5-10 minutos, risco de erro humano)
```

**Depois (Deploy Automático):**

```text
😎 Você → git push → ✨ MÁGICA ✨ → App atualizado
   (Automático, confiável, rastreável)
```

### Passo 1: Configurar Secrets no GitHub

**Secrets** são variáveis secretas (senhas, chaves SSH) que o GitHub Actions usa.

#### 1.1 Gerar Par de Chaves SSH

Na sua máquina **local** (não na EC2):

```bash
# Gerar chave SSH específica para deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/ec2-deploy-key

# Isso cria dois arquivos:
# ~/.ssh/ec2-deploy-key (chave privada - NUNCA compartilhe!)
# ~/.ssh/ec2-deploy-key.pub (chave pública - pode compartilhar)
```

#### 1.2 Adicionar Chave Pública na EC2

```bash
# Conectar na EC2
ssh -i sua-chave.pem ubuntu@seu-ec2-ip

# Adicionar chave pública ao authorized_keys
nano ~/.ssh/authorized_keys

# Cole o conteúdo de ~/.ssh/ec2-deploy-key.pub
# Salve e saia (Ctrl+X, Y, Enter)

# Ajustar permissões
chmod 600 ~/.ssh/authorized_keys
```

#### 1.3 Adicionar Secrets no GitHub

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**

**Adicione os seguintes secrets:**

| Nome do Secret | Valor | Como obter |
|---------------|-------|------------|
| `EC2_HOST` | IP público da EC2 | Console AWS → EC2 → Sua instância → Public IPv4 |
| `EC2_USERNAME` | `ubuntu` | Usuário padrão do Ubuntu (ou `ec2-user` no Amazon Linux) |
| `EC2_SSH_KEY` | Conteúdo da chave privada | `cat ~/.ssh/ec2-deploy-key` |
| `EC2_SSH_PORT` | `22` | Porta SSH (22 é padrão) |
| `ENV_PRODUCTION` | Conteúdo literal do arquivo .env para a VM | Cole o arquivo `.env` com variáveis (API_IMAGE, WEB_IMAGE, NGINX_IMAGE, POSTGRES_*, JWT_SECRET etc.) |

**📸 Como adicionar um secret:**

```text
1. New repository secret
2. Name: EC2_HOST
3. Value: 54.123.45.67 (seu IP)
4. Add secret
```

### Passo 2: Testar o Workflow

#### 2.1 Fazer um commit e push

```bash
# Fazer uma alteração qualquer
echo "# Testing CI/CD" >> README.md

# Commit e push
git add .
git commit -m "test: Testing automated deployment"
git push origin main
```

#### 2.2 Acompanhar a execução

1. Vá para o repositório no GitHub
2. Clique na aba **Actions**
3. Você verá o workflow em execução
4. Clique nele para ver os detalhes

**O que acontece:**

```text
✅ Checkout code          (Baixa o código)
✅ Setup Node.js          (Instala Node 22)
✅ Install dependencies   (pnpm install)
✅ Run linting           (Verifica código)
✅ Run tests             (Executa testes)
✅ Build                 (Compila app)
✅ Deploy to EC2         (Deploy via SSH)
✅ Verify deployment     (Testa saúde)

Nota sobre migrações Java/Flyway:
- O pipeline agora envia o conteúdo do secret `ENV_PRODUCTION` para o arquivo `~/tickets-transporte-publico/.env` na VM antes do deploy.
- Depois de iniciar os containers, o script de deploy tentará executar migrações usando o Flyway CLI na VM (ele será baixado automaticamente na primeira execução se necessário). Garanta que `DATABASE_URL` e credenciais estejam definidas no `.env` (o script lerá `DATABASE_URL` ou `POSTGRES_*`).
```

### Passo 3: Criar Environment de Produção (Opcional mas Recomendado)

**Environments** adicionam uma camada de segurança - você pode exigir aprovação manual antes do deploy.

#### 3.1 Criar Environment

1. Vá em **Settings** → **Environments**
2. Clique em **New environment**
3. Nome: `production`
4. Clique em **Configure environment**

#### 3.2 Configurar Proteções (Opcional)

**Protection rules** - Adicione segurança extra:

- ✅ **Required reviewers** - Exige aprovação de alguém antes do deploy
- ✅ **Wait timer** - Aguarda X minutos antes do deploy
- ✅ **Deployment branches** - Só permite deploy da `main`

**Exemplo de configuração segura:**

```text
✅ Required reviewers: 1 pessoa
✅ Deployment branches: Only main
```

Agora, todo deploy precisa de aprovação! 🔒

### Passo 4: Entendendo os Workflows

#### Arquivo: `.github/workflows/ci-cd.yml`

**Quando roda?**

- ✅ Push na branch `main` → Roda testes + Deploy
- ✅ Pull Request → Roda apenas testes

**Jobs principais:**

1. **test-and-build** - Sempre executa
   - Instala dependências
   - Roda linting e type check
   - Executa testes
   - Build das aplicações

2. **deploy-to-ec2** - Só executa em push na main
   - Conecta na EC2 via SSH
   - Atualiza código (git pull)
   - Rebuild containers
   - Executa migrations
   - Verifica saúde da aplicação

#### Arquivo: `.github/workflows/pr-preview.yml`

**Quando roda?** Apenas em Pull Requests

**O que faz?**

- Roda testes
- Faz build
- Adiciona comentário no PR com resultado

**Não faz deploy!** É só para validar o código.

### Passo 5: Customizar o Workflow (Avançado)

Você pode personalizar o workflow editando `.github/workflows/ci-cd.yml`:

#### Exemplo 1: Adicionar notificação no Slack

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Exemplo 2: Deploy apenas em horário comercial

```yaml
deploy-to-ec2:
  # ... código existente ...
  if: |
    github.ref == 'refs/heads/main' && 
    github.event_name == 'push' &&
    (github.event.head_commit.message contains '[deploy]')
```

#### Exemplo 3: Rollback automático em caso de falha

```yaml
- name: Rollback on failure
  if: failure()
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.EC2_HOST }}
    username: ${{ secrets.EC2_USERNAME }}
    key: ${{ secrets.EC2_SSH_KEY }}
    script: |
      cd tickets-transporte-publico
      git reset --hard HEAD~1
      docker-compose up -d --build
```

### 🎯 Boas Práticas de CI/CD

1. ✅ **Sempre rode testes antes do deploy**
   - Evita colocar código quebrado em produção

2. ✅ **Use branches protegidas**
   - Configure no GitHub: Settings → Branches → Add rule
   - Exija PR reviews antes de merge

3. ✅ **Tenha ambientes separados**
   - Desenvolvimento (local)
   - Staging (pré-produção - opcional)
   - Produção (EC2)

4. ✅ **Monitore seus deploys**
   - Verifique os logs no GitHub Actions
   - Configure alertas de falha

5. ✅ **Faça backup antes de deploy**
   - Nosso workflow já faz backup do .env
   - Considere backup do banco também

6. ✅ **Documente mudanças importantes**
   - Use mensagens de commit descritivas
   - Mantenha um CHANGELOG.md

---

## 📋 Pré-requisitos

- ✅ Conta AWS criada
- ✅ Instância EC2 criada e em execução (Ubuntu 20.04+ ou Amazon Linux 2023)
- ✅ Acesso SSH à instância EC2
- ✅ Security Group configurado com portas abertas:
  - **22** (SSH)
  - **80** (HTTP)
  - **443** (HTTPS - opcional)

---

## 🎯 Opção 1: Deploy Automatizado (Recomendado)

### Passo 1: Conectar na EC2

```bash
# Conectar via SSH (substitua com seus dados)
ssh -i sua-chave.pem ubuntu@seu-ec2-public-ip
```

### Passo 2: Baixar e Executar Script de Setup

```bash
# Fazer download do repositório
git clone https://github.com/vinicius-cappatti/tickets-transporte-publico.git
cd tickets-transporte-publico

# Tornar o script executável
chmod +x scripts/setup-ec2.sh

# Executar o script de setup
./scripts/setup-ec2.sh
```

O script irá:
- ✅ Instalar Docker e Docker Compose
- ✅ Configurar firewall (UFW)
- ✅ Clonar o repositório (se ainda não estiver)
- ✅ Configurar variáveis de ambiente
- ✅ Iniciar os containers
- ✅ Configurar auto-start no boot

### Passo 3: Acessar a Aplicação

```
http://seu-ec2-public-ip
```

---

## 🛠️ Opção 2: Deploy Manual (Passo a Passo)

### Passo 1: Conectar e Atualizar o Sistema

```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@seu-ec2-public-ip

# Atualizar o sistema
sudo apt update && sudo apt upgrade -y
```

### Passo 2: Instalar Docker

```bash
# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
```

### Passo 3: Instalar Docker Compose

```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker-compose --version
```

### Passo 4: Instalar Git e Clonar Repositório

```bash
# Instalar Git
sudo apt install -y git

# Clonar o repositório
git clone https://github.com/vinicius-cappatti/tickets-transporte-publico.git
cd tickets-transporte-publico
```

### Passo 5: Configurar Variáveis de Ambiente

```bash
# Copiar exemplo de produção
cp .env.production.example .env

# Editar variáveis de ambiente
nano .env
```

**Configure as seguintes variáveis:**

```bash
# Database - ALTERE A SENHA!
POSTGRES_USER=tickets
POSTGRES_PASSWORD=SUA_SENHA_FORTE_AQUI
POSTGRES_DB=tickets

# API
DATABASE_URL=postgresql://tickets:SUA_SENHA_FORTE_AQUI@postgres:5432/tickets
NODE_ENV=production
PORT=3000

# Web - Substitua pelo IP público da sua EC2
NEXT_PUBLIC_API_URL=http://SEU_IP_PUBLICO/api
```

### Passo 6: Iniciar os Containers

```bash
# Build e iniciar em produção
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar se os containers estão rodando
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Passo 7: Executar Migrations do Prisma

```bash
# Acessar o container da API
docker exec -it tickets-api sh

# Executar migrations
npx prisma migrate deploy

# (Opcional) Executar seed
npx prisma db seed

# Sair do container
exit
```

### Passo 8: Configurar Firewall (UFW)

```bash
# Instalar UFW se não estiver instalado
sudo apt install -y ufw

# Configurar regras
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (opcional)

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

### Passo 9: Configurar Auto-Start

```bash
# Criar arquivo de serviço systemd
sudo nano /etc/systemd/system/tickets-app.service
```

**Cole o seguinte conteúdo:**

```ini
[Unit]
Description=Tickets Transport App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/tickets-transporte-publico
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=ubuntu

[Install]
WantedBy=multi-user.target
```

**Ativar o serviço:**

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Ativar serviço
sudo systemctl enable tickets-app.service

# Iniciar serviço
sudo systemctl start tickets-app.service

# Verificar status
sudo systemctl status tickets-app.service
```

---

## 🔒 Configurar HTTPS (Opcional mas Recomendado)

### Usando Let's Encrypt (Certificado Gratuito)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Parar o Nginx temporariamente
docker-compose -f docker-compose.prod.yml stop nginx

# Gerar certificado (substitua seu-dominio.com)
sudo certbot certonly --standalone -d seu-dominio.com

# Os certificados estarão em: /etc/letsencrypt/live/seu-dominio.com/

# Copiar certificados para o projeto
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ./nginx/ssl/key.pem
sudo chown $USER:$USER ./nginx/ssl/*.pem

# Editar nginx.conf para habilitar HTTPS
nano nginx/nginx.conf
# (Descomente a seção do servidor HTTPS)

# Reiniciar containers
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

---

## 📊 Comandos Úteis

### Verificar Status

```bash
# Ver containers rodando
docker-compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Atualizar Aplicação

```bash
# Parar containers
docker-compose -f docker-compose.prod.yml down

# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml up -d --build

# Executar migrations (se houver)
docker exec -it tickets-api npx prisma migrate deploy
```

### Backup do Banco de Dados

```bash
# Criar backup
docker exec tickets-postgres pg_dump -U tickets tickets > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
cat backup_20231003_120000.sql | docker exec -i tickets-postgres psql -U tickets tickets
```

### Monitoramento

```bash
# Ver uso de recursos
docker stats

# Ver logs de erros
docker-compose -f docker-compose.prod.yml logs | grep -i error

# Verificar saúde dos containers
docker inspect --format='{{.State.Health.Status}}' tickets-api
docker inspect --format='{{.State.Health.Status}}' tickets-web
docker inspect --format='{{.State.Health.Status}}' tickets-nginx
```

### Reiniciar Serviços

```bash
# Reiniciar todos
docker-compose -f docker-compose.prod.yml restart

# Reiniciar serviço específico
docker-compose -f docker-compose.prod.yml restart api
docker-compose -f docker-compose.prod.yml restart web
docker-compose -f docker-compose.prod.yml restart nginx
```

### Limpar Recursos

```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Remover volumes não utilizados (CUIDADO!)
docker volume prune -f

# Limpar tudo (MUITO CUIDADO!)
docker system prune -a --volumes -f
```

---

## 🐛 Troubleshooting

### Problema: Containers não iniciam

```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs

# Verificar se as portas estão em uso
sudo netstat -tulpn | grep -E ':(80|443|3000|3001|5432)'

# Matar processo na porta
sudo kill -9 $(sudo lsof -t -i:80)
```

### Problema: Erro de conexão com o banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml ps postgres

# Acessar o PostgreSQL
docker exec -it tickets-postgres psql -U tickets

# Verificar DATABASE_URL no .env
cat .env | grep DATABASE_URL
```

### Problema: API não responde

```bash
# Ver logs da API
docker-compose -f docker-compose.prod.yml logs -f api

# Verificar health check
curl http://localhost:3000/health

# Acessar container da API
docker exec -it tickets-api sh
```

### Problema: Web não carrega

```bash
# Ver logs do Web
docker-compose -f docker-compose.prod.yml logs -f web

# Verificar variáveis de ambiente
docker exec tickets-web env | grep NEXT_PUBLIC

# Rebuild do Next.js
docker-compose -f docker-compose.prod.yml up -d --build web
```

---

## 📈 Melhorias Futuras

- [ ] Implementar HTTPS com Let's Encrypt
- [ ] Implementar backup automático do banco de dados
- [ ] Configurar CI/CD com GitHub Actions para EC2
- [ ] Adicionar rate limiting e WAF (fora do escopo)

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose -f docker-compose.prod.yml logs`
2. Confira o [README.md](../README.md) principal
3. Abra uma issue no GitHub
4. Consulte a documentação do Docker: https://docs.docker.com
