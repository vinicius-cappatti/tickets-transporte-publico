#!/bin/bash
set -euo pipefail

# ==============================================================================
# Docker Swarm Deployment Script com Zero Downtime
# ==============================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
PROJECT_DIR="${HOME}/tickets-transporte-publico"
STACK_NAME="tickets"

# Registry
REGISTRY="${REGISTRY:-ghcr.io}"
REPO_OWNER="${REPO_OWNER}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Serviços
SERVICES=("app" "app-sql" "web" "nginx" "api-java")

# ==============================================================================
# Funções
# ==============================================================================

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# ==============================================================================
# MAIN
# ==============================================================================

main() {
    log "🚀 Iniciando deploy com Docker Swarm..."
    
    cd "$PROJECT_DIR" || exit 1

    # Verifica se Swarm está ativo
    if ! docker info | grep -q "Swarm: active"; then
        log "Inicializando Docker Swarm..."
        docker swarm init || true
    fi

    # Cria .env se necessário (de ENV_PRODUCTION do pipeline)
    if [ -n "${ENV_PRODUCTION:-}" ]; then
        log "Criando arquivo .env a partir de ENV_PRODUCTION..."
        echo "$ENV_PRODUCTION" > "${PROJECT_DIR}/.env"
    elif [ ! -f "${PROJECT_DIR}/.env" ]; then
        log_error "Arquivo .env não encontrado e ENV_PRODUCTION não definido!"
        exit 1
    fi

    # Login no GHCR
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        log "Login no GitHub Container Registry..."
        echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$REPO_OWNER" --password-stdin
    fi

    # Cria redes se não existirem
    docker network create --driver overlay --attachable tickets-network 2>/dev/null || true

    # Pull das novas imagens
    log "Baixando novas imagens..."
    for service in "${SERVICES[@]}"; do
        image="${REGISTRY}/${REPO_OWNER}/tickets-${service}:${IMAGE_TAG}"
        log "  ↓ ${service}"
        docker pull "$image" || {
            log_error "Falha ao baixar ${image}"
            exit 1
        }
    done

    # Cria/atualiza stack
    log "Deployando stack..."
    
    # Gera docker-compose-swarm.yml on-the-fly
    cat > "${PROJECT_DIR}/docker-compose-swarm.yml" <<EOF
version: '3.8'

services:
  postgres:
    image: postgres:17
    env_file:
      - .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tickets-network
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]
      restart_policy:
        condition: on-failure

  app-sql:
    image: ${REGISTRY}/${REPO_OWNER}/tickets-app-sql:${IMAGE_TAG}
    env_file:
      - .env
    networks:
      - tickets-network
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 1
        order: start-first
      restart_policy:
        condition: on-failure

  api-java:
    image: ${REGISTRY}/${REPO_OWNER}/tickets-api-java:${IMAGE_TAG}
    env_file:
      - .env
    networks:
      - tickets-network
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 1
        order: start-first
      restart_policy:
        condition: on-failure

  web:
    image: ${REGISTRY}/${REPO_OWNER}/tickets-web:${IMAGE_TAG}
    env_file:
      - .env
    networks:
      - tickets-network
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure

  nginx:
    image: ${REGISTRY}/${REPO_OWNER}/tickets-nginx:${IMAGE_TAG}
    ports:
      - "80:80"
      - "443:443"
    networks:
      - tickets-network
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
        order: start-first

networks:
  tickets-network:
    external: true

volumes:
  postgres_data:
EOF

    # Deploy da stack (atualização rolling automática)
    docker stack deploy -c "${PROJECT_DIR}/docker-compose-swarm.yml" \
        --with-registry-auth \
        "$STACK_NAME"

    # Aguarda serviços ficarem prontos
    log "Aguardando serviços ficarem prontos..."
    sleep 5
    
    for i in {1..30}; do
        if docker stack services "$STACK_NAME" --format "{{.Replicas}}" | grep -q "0/"; then
            echo -n "."
            sleep 2
        else
            break
        fi
    done
    echo ""

    # Status final
    log_success "Deploy concluído!"
    log ""
    log "Status da stack:"
    docker stack services "$STACK_NAME"
    
    log ""
    log "Para monitorar: docker service logs -f ${STACK_NAME}_<service>"
    log "Para rollback:  docker service rollback ${STACK_NAME}_<service>"
}

main "$@"

# Faz rollback em caso de falha
rollback() {
    log_error "Iniciando rollback..."

    local latest_backup=$(ls -t "${BACKUP_DIR}"/*_images.txt | head -n 1)

    if [ -z "$latest_backup" ]; then
        log_error "Nenhum backup encontrado para rollback!"
        return 1
    fi

    log "Restaurando containers do backup: ${latest_backup}"

    # Para novos containers
    docker compose -f "$COMPOSE_FILE" down --remove-orphans

    # Restaura imagens antigas
    while IFS=$'\t' read -r container image; do
        log "Restaurando container ${container} com imagem ${image}"
        docker compose -f "$COMPOSE_FILE" up -d "${container##*-}"
    done < "$latest_backup"

    log_success "Rollback concluído!"
}

# ==============================================================================
# Função Principal de Deploy
# ==============================================================================

deploy_service() {
    local service=$1
    local image_name="${REGISTRY}/${REPO_OWNER}/tickets-${service}:${IMAGE_TAG}"

    log "========================================"
    log "Deployando serviço: ${service}"
    log "Imagem: ${image_name}"
    log "========================================"

    # 1. Pull da nova imagem
    log "Baixando nova imagem..."
    if ! docker pull "$image_name"; then
        log_error "Falha ao fazer pull da imagem ${image_name}"
        return 1
    fi
    log_success "Imagem baixada com sucesso"

    # 2. Identifica containers atuais (blue/green)
    local container_blue="${service}-blue"
    local container_green="${service}-green"
    local active_container=""
    local inactive_container=""

    # Descobre qual está ativo
    if docker ps -q -f name="${container_blue}" | grep -q .; then
        active_container="${container_blue}"
        inactive_container="${container_green}"
        log "Container ativo: BLUE, deploying to GREEN"
    else
        active_container="${container_green}"
        inactive_container="${container_blue}"
        log "Container ativo: GREEN, deploying to BLUE"
    fi

    # 3. Remove container inativo se existir
    docker rm -f "${inactive_container}" 2>/dev/null || true

    # 4. Configuração por serviço
    local port_mapping=""
    local health_cmd=""
    local env_args=""
    
    case ${service} in
        "app")
            port_mapping="-p 3100:3000"  # Porta temporária
            health_cmd="--health-cmd='curl -f http://localhost:3000/health || exit 1'"
            env_args="--env-file ${PROJECT_DIR}/.env"
            ;;
        "app-sql")
            port_mapping="-p 3101:3000"
            health_cmd="--health-cmd='curl -f http://localhost:3000/health || exit 1'"
            env_args="--env-file ${PROJECT_DIR}/.env"
            ;;
        "api-java")
            port_mapping="-p 8180:3000"
            health_cmd="--health-cmd='curl -f http://localhost:3000/actuator/health || exit 1'"
            env_args="--env-file ${PROJECT_DIR}/.env"
            ;;
        "web")
            port_mapping="-p 3102:3000"
            health_cmd="--health-cmd='curl -f http://localhost:3000 || exit 1'"
            env_args="-e NEXT_PUBLIC_API_URL=/api"
            ;;
        "nginx")
            port_mapping="-p 8888:80"  # Porta temporária
            health_cmd="--health-cmd='curl -f http://localhost:80 || exit 1'"
            ;;
    esac

    # 5. Inicia novo container na cor inativa
    log "Iniciando novo container (${inactive_container})..."
    
    docker run -d \
        --name "${inactive_container}" \
        --restart unless-stopped \
        --network tickets-network \
        ${port_mapping} \
        ${env_args} \
        --health-interval=10s \
        --health-timeout=5s \
        --health-retries=3 \
        ${health_cmd} \
        "$image_name" || {
            log_error "Falha ao iniciar novo container"
            return 1
        }

    # 6. Health check do novo container
    log "Aguardando health check..."
    local retries=30
    for i in $(seq 1 ${retries}); do
        if docker ps --filter "name=${inactive_container}" --filter "health=healthy" --format "{{.Names}}" | grep -q "${inactive_container}"; then
            log_success "Health check passou!"
            break
        fi
        if [ $i -eq ${retries} ]; then
            log_error "Health check falhou após ${retries} tentativas"
            docker logs "${inactive_container}" --tail 50
            docker rm -f "${inactive_container}"
            return 1
        fi
        echo -n "."
        sleep 2
    done

    # 7. Swap: atualiza portas do novo container para produção
    log "Fazendo swap para produção..."
    docker stop "${inactive_container}"
    
    # Remove mapeamento temporário e adiciona produção
    case ${service} in
        "app")
            port_mapping="-p 3000:3000"
            ;;
        "app-sql")
            port_mapping="-p 3001:3000"
            ;;
        "api-java")
            port_mapping="-p 8080:3000"
            ;;
        "web")
            port_mapping="-p 3002:3000"
            ;;
        "nginx")
            port_mapping="-p 80:80 -p 443:443"
            ;;
    esac

    # Recria container com portas corretas
    local container_id=$(docker ps -aq -f name="${inactive_container}")
    docker commit "${container_id}" "${image_name}-ready"
    docker rm -f "${inactive_container}"
    
    docker run -d \
        --name "${inactive_container}" \
        --restart unless-stopped \
        --network tickets-network \
        ${port_mapping} \
        ${env_args} \
        --health-interval=10s \
        --health-timeout=5s \
        --health-retries=3 \
        ${health_cmd} \
        "${image_name}-ready"

    # 8. Para e remove container antigo
    if docker ps -q -f name="${active_container}" | grep -q .; then
        log "Parando container antigo (${active_container})..."
        docker stop "${active_container}" 2>/dev/null || true
        docker rm "${active_container}" 2>/dev/null || true
    fi

    # 9. Cleanup
    docker rmi "${image_name}-ready" 2>/dev/null || true
    
    log_success "Deploy do serviço ${service} concluído!"
}

# ==============================================================================
# MAIN
# ==============================================================================

main() {
    log "🚀 Iniciando deploy..."
    
    cd "$PROJECT_DIR" || exit 1

    # Verifica dependências
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi

    # Cria rede se não existir
    docker network create tickets-network 2>/dev/null || log "Rede já existe"

    # Inicia PostgreSQL se não estiver rodando
    if ! docker ps -q -f name=postgres | grep -q .; then
        log "Iniciando PostgreSQL..."
        docker run -d \
            --name postgres \
            --restart unless-stopped \
            --network tickets-network \
            -p 5432:5432 \
            --env-file ${PROJECT_DIR}/.env \
            -v postgres_data:/var/lib/postgresql/data \
            --health-cmd="pg_isready -U postgres" \
            --health-interval=10s \
            postgres:17
        sleep 5
    fi

    # Login no registry
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        log "Fazendo login no GitHub Container Registry..."
        echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$REPO_OWNER" --password-stdin
    else
        log_warning "GITHUB_TOKEN não definido, assumindo já logado"
    fi

    # Backup do estado atual
    backup_state

    # Deploy de cada serviço
    local failed_services=()
    for service in "${SERVICES[@]}"; do
        if ! deploy_service "$service"; then
            log_error "Falha no deploy do serviço: ${service}"
            failed_services+=("$service")
        fi
    done

    # Verifica se houve falhas
    if [ ${#failed_services[@]} -gt 0 ]; then
        log_error "Falha no deploy dos seguintes serviços: ${failed_services[*]}"
        log_warning "Sistema mantido com containers antigos"
        exit 1
    fi

    # Cleanup final
    log "Limpando recursos não utilizados..."
    docker image prune -f
    docker container prune -f

    log_success "========================================="
    log_success "✓ Deploy concluído com sucesso!"
    log_success "========================================="
    log ""
    log "Containers ativos:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Captura erros (mas não faz rollback automático - mantém sistema no ar)
trap 'log_error "Erro detectado durante deploy!"' ERR

# Executa
main "$@"
