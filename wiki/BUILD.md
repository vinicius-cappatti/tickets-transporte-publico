# Como gerar os diagramas e compilar o PDF

Este repositório inclui um fluxo simples para gerar arquivos `.tex` a partir de arquivos PlantUML (`.puml`) e compilar o PDF do wiki.

Passos rápidos (na raiz do repositório):

1. Gerar diagramas e compilar o PDF:

```bash
make wiki
```

2. Gerar apenas os arquivos `.tex` dos diagramas:

```bash
make diagrams
```

3. Limpar arquivos auxiliares do LaTeX:

```bash
make clean
```

Notas:

- O `plantuml.jar` está em `wiki/bin/plantuml.jar`.
- Os arquivos `.puml` ficam em `wiki/uml/` e os `.tex` gerados também são colocados nesse diretório.
- O arquivo LaTeX principal é `wiki/README.tex` e o PDF resultante será `wiki/README.pdf`.
- Certifique-se de ter `java` e `pdflatex` instalados no seu sistema.

VS Code:

- Existe uma tarefa pronta (Tasks) no VS Code com o rótulo "Build Wiki (PlantUML + LaTeX)" que executa `make wiki`.
