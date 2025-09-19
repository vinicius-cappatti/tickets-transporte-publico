## Makefile para gerar diagramas PlantUML e compilar o wiki LaTeX

WIKI_DIR := wiki
PLANTUML := $(WIKI_DIR)/bin/plantuml.jar
PUML_DIR := $(WIKI_DIR)/uml
LATEX_DIR := $(WIKI_DIR)/latex
MAIN_TEX := $(LATEX_DIR)/README.tex

.PHONY: help diagrams tex pdf wiki clean

help:
	@echo "Targets:"
	@echo "  make diagrams   # gera arquivos .tex a partir dos .puml"
	@echo "  make tex        # compila o arquivo .tex principal (pdflatex)"
	@echo "  make pdf        # gera pdf final (rodando pdflatex duas vezes)"
	@echo "  make wiki       # executa diagrams + pdf"
	@echo "  make clean      # remove arquivos auxiliares de LaTeX"

diagrams: $(PLANTUML)
	@echo "Gerando diagramas PlantUML..."
	@mkdir -p $(PUML_DIR)
	@java -jar "$(PLANTUML)" -tlatex:nopreamble $(PUML_DIR)/*.puml || true
	@echo "Diagramas gerados em $(PUML_DIR)"


tex: diagrams
	@if [ -f "$(MAIN_TEX)" ]; then \
		echo "Compilando $(MAIN_TEX) ..."; \
		pdflatex -interaction=nonstopmode -halt-on-error -output-directory "$(LATEX_DIR)" "$(MAIN_TEX)"; \
	else \
		echo "Arquivo $(MAIN_TEX) não encontrado."; exit 1; \
	fi


pdf: tex
	@echo "Gerando PDF (rodando pdflatex novamente)..."
	@pdflatex -interaction=nonstopmode -halt-on-error -output-directory "$(LATEX_DIR)" "$(MAIN_TEX)"


wiki: pdf
	@echo "Wiki compilada: $(LATEX_DIR)/README.pdf"

clean:
	@rm -f $(WIKI_DIR)/*.aux $(WIKI_DIR)/*.log $(WIKI_DIR)/*.out $(WIKI_DIR)/*.toc $(WIKI_DIR)/*.synctex.gz
