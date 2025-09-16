#!/usr/bin/env bash
set -euo pipefail

# install-latex.sh
# Script para instalar uma distribuição LaTeX em Linux.
# Opções:
#   --tinytex  : instala TinyTeX (leve, recomendado)
#   --texlive  : instala TeX Live via apt (completo)
#   --force    : força reinstalação

CMD_NAME=$(basename "$0")
INSTALL_TINY=false
INSTALL_TEXLIVE=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tinytex) INSTALL_TINY=true; shift ;;
    --texlive) INSTALL_TEXLIVE=true; shift ;;
    --force) FORCE=true; shift ;;
    -h|--help) echo "Usage: $CMD_NAME [--tinytex|--texlive] [--force]"; exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

command -v pdflatex >/dev/null 2>&1 && PDFOUND=true || PDFOUND=false
if [ "$PDFOUND" = true ] && [ "$FORCE" = false ]; then
  echo "[INFO] pdflatex já encontrado no sistema. Use --force para reinstalar." && exit 0
fi

if [ "$INSTALL_TINY" = false ] && [ "$INSTALL_TEXLIVE" = false ]; then
  echo "Nenhuma opção especificada; instalando TinyTeX por padrão. Use --texlive para TeX Live completo.";
  INSTALL_TINY=true
fi

if [ "$INSTALL_TINY" = true ]; then
  echo "[INFO] Instalando TinyTeX (via script)..."
  if command -v R >/dev/null 2>&1; then
    echo "[INFO] R detectado — instalando via tinytex R package (recomendado)..."
    Rscript -e "if(!require('tinytex')) install.packages('tinytex', repos='https://cloud.r-project.org'); tinytex::install_tinytex()"
  else
    echo "[INFO] R não detectado — usando instalador shell do TinyTeX..."
    sh -c "curl -sL 'https://yihui.org/tinytex/install-bin-unix.sh' | sh"
  fi
  echo "[INFO] Verificando pdflatex..."
  if command -v pdflatex >/dev/null 2>&1; then
    echo "[OK] pdflatex instalado em: $(command -v pdflatex)"
  else
    echo "[WARN] pdflatex não encontrado após TinyTeX. Verifique PATH ou reinicie o shell." >&2
  fi
fi

if [ "$INSTALL_TEXLIVE" = true ]; then
  echo "[INFO] Instalando TeX Live via apt (debian/ubuntu)..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y texlive-full
    echo "[INFO] TeX Live instalado (texlive-full)."
  else
    echo "[ERROR] apt-get não encontrado. Instale TeX Live usando o instalador do projeto (install-tl) ou gerenciador da sua distro." >&2
    exit 1
  fi
fi

echo "[DONE] Instalação concluída. Verifique 'pdflatex --version' e reinicie o VS Code se necessário."
