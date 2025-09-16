#!/usr/bin/env bash
set -euo pipefail

# Gera arquivos .tex a partir de todos os .puml em ../uml usando plantuml.jar
# Uso: ./gen-diagrams.sh    (de dentro de wiki/scripts)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLANTUML_JAR="$ROOT_DIR/bin/plantuml.jar"
PUML_DIR="$ROOT_DIR/uml"

if [ ! -f "$PLANTUML_JAR" ]; then
  echo "Erro: plantuml.jar não encontrado em $PLANTUML_JAR"
  exit 1
fi

shopt -s nullglob
for puml in "$PUML_DIR"/*.puml; do
  echo "Gerando diagrama para: $puml"
  java -jar "$PLANTUML_JAR" -tlatex:nopreamble "$puml"
done

echo "Concluído.\nArquivos .tex gerados em: $PUML_DIR"
