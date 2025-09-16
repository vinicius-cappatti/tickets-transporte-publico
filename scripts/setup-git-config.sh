#!/usr/bin/env bash
# Script para configurar preferências de git para este repositório
# Aplica: git config pull.rebase false

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [ -z "$REPO_ROOT" ]; then
  echo "Este script deve ser executado dentro de um repositório Git." >&2
  exit 1
fi

# Aplica configuração apenas no repositório atual (local)
git config pull.rebase false

cat <<EOF
Configuração aplicada: git config pull.rebase false
Isto define que 'git pull' use merge por padrão neste repositório.

Recomendações adicionais:
 - Para aplicar globalmente (todas os repositórios desta máquina):
     git config --global pull.rebase false
 - Se preferir rebase em vez de merge, use:
     git config pull.rebase true

EOF
