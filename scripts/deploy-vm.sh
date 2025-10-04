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

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}Erro: docker-compose.prod.yml não encontrado${NC}"
    echo -e "${YELLOW}Execute este script do diretório raiz do projeto${NC}"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}Erro: Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}Crie o arquivo .env com as variáveis necessárias${NC}"
    echo -e "${YELLOW}Use .env.production.example como referência${NC}"
    exit 1
fi

# 1. Parar containers existentes
echo -e "\n${YELLOW}[1/6] Parando containers existentes...${NC}"
docker compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✓ Containers parados${NC}"

# 2. Puxar imagens mais recentes do GitHub Container Registry
echo -e "\n${YELLOW}[2/6] Baixando imagens mais recentes do GitHub Container Registry...${NC}"
docker compose -f docker-compose.prod.yml pull
echo -e "${GREEN}✓ Imagens atualizadas${NC}"

# 3. Remover imagens antigas (economizar espaço)
echo -e "\n${YELLOW}[3/6] Limpando imagens antigas...${NC}"
docker image prune -f
echo -e "${GREEN}✓ Limpeza concluída${NC}"

# 4. Iniciar containers
echo -e "\n${YELLOW}[4/6] Iniciando containers...${NC}"
docker compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓ Containers iniciados${NC}"

# 5. Aguardar containers ficarem prontos
echo -e "\n${YELLOW}[5/6] Aguardando containers ficarem prontos...${NC}"
sleep 20

# 6. Executar migrações do banco de dados
echo -e "\n${YELLOW}[6/6] Executando migrações do banco de dados...${NC}"
docker compose -f docker-compose.prod.yml exec -T api pnpm --filter api prisma migrate deploy
echo -e "${GREEN}✓ Migrações executadas${NC}"

# Verificar status dos containers
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Status dos Containers${NC}"
echo -e "${BLUE}========================================${NC}"
docker compose -f docker-compose.prod.yml ps

# Mostrar logs recentes
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Últimos logs${NC}"
echo -e "${BLUE}========================================${NC}"
docker compose -f docker-compose.prod.yml logs --tail=10

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Comandos úteis:${NC}"
echo -e "  - Ver logs:        ${BLUE}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "  - Parar:           ${BLUE}docker compose -f docker-compose.prod.yml down${NC}"
echo -e "  - Reiniciar:       ${BLUE}docker compose -f docker-compose.prod.yml restart${NC}"
echo -e "  - Status:          ${BLUE}docker compose -f docker-compose.prod.yml ps${NC}"
