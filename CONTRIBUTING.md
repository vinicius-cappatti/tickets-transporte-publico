# Contribuindo

Política de pull: usamos merge por padrão ao executar `git pull` neste repositório.

Motivação

- Evita reescrita de histórico inadvertida.
- Torna a integração explícita (commits de merge mostram quando unimos trabalho paralelo).

Como aplicar localmente

1. Execute o script (executável no diretório do repositório):

```bash
./scripts/setup-git-config.sh
```

Ou manualmente:

```bash
git config pull.rebase false
```

Como aplicar globalmente (opcional)

```bash
# aplica para todos os repositórios do usuário na máquina
git config --global pull.rebase false
```

Boas práticas

- Antes de fazer push, sincronize com `git pull` para reduzir chances de conflitos.
- Se preferir usar rebase localmente para limpar commits de trabalho, coordene com a equipe e use `git push --force-with-lease` apenas quando necessário.

Se tiver dúvidas sobre o fluxo, abra uma issue ou converse com o mantenedor do repositório.
