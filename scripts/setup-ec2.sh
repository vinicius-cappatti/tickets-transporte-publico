#!/bin/bash

# Script de Setup Automatizado para EC2
# Sistema de Tickets de Transporte Público

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════╗
║   Tickets Transporte Público - EC2 Setup   ║
║            Setup Automatizado              ║
╚════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se é root
if [ "$EUID" -eq 0 ]; then 
    print_error "Não execute este script como root!"
    exit 1
fi

# Verificar sistema operacional
if ! command -v apt &> /dev/null; then
    print_error "Este script é para sistemas Ubuntu/Debian com apt"
    exit 1
fi

print_step "Atualizando sistema..."
sudo apt update -qq
sudo apt upgrade -y -qq
print_success "Sistema atualizado"

# Instalar Docker
if ! command -v docker &> /dev/null; then
    print_step "Instalando Docker..."
    
    # Instalar dependências
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common -qq
    
    # Adicionar repositório do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    sudo apt update -qq
    sudo apt install -y docker-ce docker-ce-cli containerd.io -qq
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    
    print_success "Docker instalado com sucesso"
else
    print_success "Docker já está instalado"
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_step "Instalando Docker Compose..."
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose instalado com sucesso"
else
    print_success "Docker Compose já está instalado"
fi

# Instalar Git
if ! command -v git &> /dev/null; then
    print_step "Instalando Git..."
    sudo apt install -y git -qq
    print_success "Git instalado com sucesso"
else
    print_success "Git já está instalado"
fi

# Obter IP público da EC2
print_step "Obtendo IP público da EC2..."
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
print_success "IP público: $EC2_PUBLIC_IP"

# Configurar variáveis de ambiente
print_step "Configurando variáveis de ambiente..."

if [ ! -f .env ]; then
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        
        # Gerar senha aleatória para o banco
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        
        # Substituir valores no .env
        sed -i "s|CHANGE_ME_IN_PRODUCTION|$DB_PASSWORD|g" .env
        sed -i "s|your-ec2-public-ip|$EC2_PUBLIC_IP|g" .env
        
        print_success "Arquivo .env criado e configurado"
        print_warning "Senha do banco de dados gerada automaticamente"
    else
        print_error "Arquivo .env.production.example não encontrado"
        exit 1
    fi
else
    print_warning "Arquivo .env já existe, pulando configuração"
fi

# Configurar Firewall (UFW)
print_step "Configurando firewall (UFW)..."

if ! command -v ufw &> /dev/null; then
    sudo apt install -y ufw -qq
fi

sudo ufw --force enable
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

print_success "Firewall configurado"

# Build e iniciar containers
print_step "Fazendo build dos containers..."
newgrp docker << END
docker-compose -f docker-compose.prod.yml build --no-cache
END
print_success "Build concluído"

print_step "Iniciando containers..."
newgrp docker << END
docker-compose -f docker-compose.prod.yml up -d
END
print_success "Containers iniciados"

# Aguardar containers ficarem saudáveis
print_step "Aguardando containers ficarem saudáveis..."
sleep 10

# Executar migrations
print_step "Executando migrations do banco de dados..."
docker exec tickets-api npx prisma migrate deploy 2>/dev/null || print_warning "Migrations não executadas (pode ser normal na primeira execução)"

# Executar seed (opcional)
read -p "Deseja executar o seed do banco de dados? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_step "Executando seed..."
    docker exec tickets-api npx prisma db seed 2>/dev/null || print_warning "Seed não executado"
    print_success "Seed concluído"
fi

# Configurar auto-start com systemd
print_step "Configurando auto-start..."

sudo tee /etc/systemd/system/tickets-app.service > /dev/null <<EOF
[Unit]
Description=Tickets Transport App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tickets-app.service
print_success "Auto-start configurado"

# Verificar status dos containers
print_step "Verificando status dos containers..."
sleep 5
newgrp docker << END
docker-compose -f docker-compose.prod.yml ps
END

# Sumário final
echo -e "\n${GREEN}╔════════════════════════════════════════════╗"
echo -e "║        Setup Concluído com Sucesso!        ║"
echo -e "╚════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📋 Informações Importantes:${NC}"
echo -e "   • Aplicação Web: ${GREEN}http://$EC2_PUBLIC_IP${NC}"
echo -e "   • API: ${GREEN}http://$EC2_PUBLIC_IP/api${NC}"
echo -e "   • Configurações: ${YELLOW}$(pwd)/.env${NC}"
echo -e ""

echo -e "${BLUE}📊 Comandos Úteis:${NC}"
echo -e "   • Ver logs: ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "   • Ver status: ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
echo -e "   • Parar app: ${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"
echo -e "   • Iniciar app: ${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
echo -e ""

echo -e "${YELLOW}⚠  Próximos Passos Recomendados:${NC}"
echo -e "   1. Configure um domínio personalizado"
echo -e "   2. Configure HTTPS com Let's Encrypt"
echo -e "   3. Configure backups automáticos do banco"
echo -e "   4. Revise as configurações de segurança"
echo -e ""

echo -e "${BLUE}📚 Documentação Completa:${NC}"
echo -e "   • Deploy: ${YELLOW}DEPLOY_EC2.md${NC}"
echo -e "   • README: ${YELLOW}README.md${NC}"
echo -e ""

print_warning "IMPORTANTE: Você precisará fazer logout e login novamente para usar o Docker sem sudo"
print_warning "Ou execute: newgrp docker"
echo -e ""

print_success "Setup finalizado! 🎉"
