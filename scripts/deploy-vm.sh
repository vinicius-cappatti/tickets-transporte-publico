#!/bin/bash

#############################################
# Script de Deploy para VM
# Execute este script diretamente na VM após fazer SSH
#############################################

set -e  # Para na primeira falha

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Deploy - Tickets Transporte Público${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Ir para o diretório do projeto
echo -e "\n${YELLOW}[1/8] Navegando para o diretório do projeto...${NC}"
cd ~/tickets-transporte-publico || {
    echo -e "${RED}Erro: Diretório ~/tickets-transporte-publico não encontrado${NC}"
    exit 1
}

# 2. Fazer backup do .env se existir
echo -e "\n${YELLOW}[2/8] Fazendo backup das configurações...${NC}"
if [ -f apps/api/.env ]; then
    cp apps/api/.env apps/api/.env.backup
    echo -e "${GREEN}✓ Backup do .env criado${NC}"
fi

# 3. Atualizar código do repositório
echo -e "\n${YELLOW}[3/8] Atualizando código do repositório...${NC}"
git fetch origin
git reset --hard origin/main
echo -e "${GREEN}✓ Código atualizado para a versão mais recente${NC}"

# 4. Restaurar .env se foi feito backup
if [ -f apps/api/.env.backup ]; then
    echo -e "\n${YELLOW}[4/8] Restaurando configurações...${NC}"
    mv apps/api/.env.backup apps/api/.env
    echo -e "${GREEN}✓ Arquivo .env restaurado${NC}"
else
    echo -e "\n${YELLOW}[4/8] Pulando restauração (sem backup)${NC}"
fi

# 5. Parar containers existentes
echo -e "\n${YELLOW}[5/8] Parando containers existentes...${NC}"
docker compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✓ Containers parados${NC}"

# 6. Limpar recursos antigos (opcional - descomente se necessário)
# echo -e "\n${YELLOW}Limpando imagens antigas...${NC}"
# docker image prune -f
# docker volume prune -f

# 7. Rebuild e iniciar containers
echo -e "\n${YELLOW}[6/8] Construindo e iniciando containers...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# Aguardar containers ficarem prontos
echo -e "\n${YELLOW}[7/8] Aguardando containers ficarem prontos...${NC}"
sleep 10

# 8. Executar migrações do banco de dados
echo -e "\n${YELLOW}[8/8] Executando migrações do banco de dados...${NC}"
docker compose -f docker-compose.prod.yml exec -T app pnpm --filter api prisma migrate deploy
echo -e "${GREEN}✓ Migrações executadas${NC}"

# Verificar status dos containers
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Status dos Containers${NC}"
echo -e "${BLUE}========================================${NC}"
docker compose -f docker-compose.prod.yml ps

# Mostrar logs recentes
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Últimos logs (app)${NC}"
echo -e "${BLUE}========================================${NC}"
docker compose -f docker-compose.prod.yml logs --tail=20 app

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Comandos úteis:${NC}"
echo -e "  - Ver logs:        ${BLUE}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "  - Parar:           ${BLUE}docker compose -f docker-compose.prod.yml down${NC}"
echo -e "  - Reiniciar:       ${BLUE}docker compose -f docker-compose.prod.yml restart${NC}"
echo -e "  - Status:          ${BLUE}docker compose -f docker-compose.prod.yml ps${NC}"
