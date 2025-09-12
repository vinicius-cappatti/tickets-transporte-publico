## Como gerar e inserir diagramas PlantUML em LaTeX (TikZ)

### Pré-requisitos

- Java instalado (necessário para rodar o PlantUML)
- Compilador LaTeX com suporte a TikZ e XeLaTeX:
	```bash
	sudo apt-get update && sudo apt-get install -y texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-lang-portuguese texlive-xetex
	```
- O arquivo `plantuml.jar` está em `wiki/bin/plantuml.jar`
- Os arquivos `.puml` dos diagramas estão em `wiki/uml/`

### Gerando diagramas em LaTeX (TikZ)

Para cada diagrama `.puml` que deseja inserir no LaTeX, execute:

```bash
cd wiki
java -jar bin/plantuml.jar -tlatex:nopreamble uml/NOME_DO_DIAGRAMA.puml
```

Isso irá gerar um arquivo `NOME_DO_DIAGRAMA.tex` na mesma pasta do `.puml`.

### Exemplo de inclusão no arquivo LaTeX principal

No preâmbulo do seu arquivo `.tex`, adicione:

```latex
\usepackage{tikz}
```

E para inserir o diagrama no local desejado:

```latex
\begin{figure}[H]
\centering
\input{wiki/uml/NOME_DO_DIAGRAMA.tex}
\caption{Legenda do diagrama}
\end{figure}
```

### Observações
- Sempre gere novamente o `.tex` se alterar o `.puml`.
- O comando `-tlatex:nopreamble` gera apenas o ambiente TikZ, pronto para ser incluído em qualquer documento LaTeX.
- O compilador recomendado é o `pdflatex`.
