## 5. Modelagem “Leve do Sistema”  

### 5.1 UML - Casos de Uso  

<img width="410" height="270" alt="image" src="https://github.com/user-attachments/assets/59328def-1aca-4b1f-85ba-48c6754f89c2" />

### 5.1.1 Especificações dos Casos de Uso

#### 5.1.1.1 Reportar Problema

| **Identificador**      | UC001 – Reportar Problema  |
|------------------------|----------------------------|
| **Nome**               | Reportar Problema          |
| **Atores**             | Primário: Pedestre utilizando o Sistema de Reportes de Acessibilidade. <br> Secundário: Administrador de um ponto registrado no Sistema.|
| **Sumário**            | Um pedestre cria na plataforma um reporte para um problema de acessibilidade, visto em ponto de transporte público |
| **Complexidade**       | Média                      |
| **Regras de Negócio**  | - RN001: Apenas usuários autenticados podem registrar reportes. <br>- RN002: Todo reporte deve estar vinculado a um local existente no sistema. <br>- RN003: O reporte deve conter obrigatoriamente um título e uma descrição mínima. <br>- RN004: O sistema deve registrar data, hora e usuário responsável pelo reporte. <br>- RN005: O reporte pode conter evidências (foto ou vídeo), mas estas não são obrigatórias. <br>- RN006: O reporte não pode exceder o limite máximo de caracteres definidos pelo sistema (para título e descrição).|
| **Pré-condições**      | O pedestre deve possuir informações do problema (foto, vídeo). <br> O pedestre deverá disponibiliza sua localização. <br> O pedestre deve ter um cadastro para registrar um reporte. <br>         |
| **Pós-condição**       | O Sistema terá um reporte com todas as informações do problema registrado em seu banco de dados <br> O Sistema registrará o reporte e atualizará o mapa para que o reporte conste para a localização  |
| **Pontos de Inclusão** | UC004 – Autenticar Usuário (quando necessário). |
| **Pontos de Extensão** | UC005 – Notificar Administrador (para pontos monitorados).  |

#### Fluxo Principal

| **Ações do Ator**               | **Ações do Sistema**                                                                             |
|--------------------------------|--------------------------------------------------------------------------------------------------|
| 1. O Pedestre seleciona que deseja reportar um problema na página principal        | 2. O Sistema exibe uma listagem dos pontos e estações e o mapa|
| 3. Escolhe a localização através da busca pelo nome ou endereço, ou ainda através do mapa | 4. O Sistema retorna e solicita a confirmação do pedestre para que ele prossiga|
| 5. O pedestre verifica as informações do local selecionado e confirma | 6. O Sistema exibe uma lista de categorias problemas e oferece outro passo de confirmação para o pedestre|
| 7. O pedestre confirma a seleção da categoria e local | 8. O Sistema solicita informações sobre o problema e oferece dicas para que o reporte tenha boa qualidade|
| 9. O Pedestre registra um título para o problema e uma descrição que dê mais detalhes sobre a natureza dele e ao checar as informações envia o reporte | 10. O Sistema informa o envio do reporte e solicita se o pedestre deseja criar um novo reporte ou visualizar o reporte publicado.|

#### Fluxo Alternativo – Pedestre não está logado no sistema

| **Ações do Ator**                                             | **Ações do Sistema**                                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1a. O pedestre seleciona a opção de reportar sem estar logado | 2a. O Sistema redireciona para a tela de login/cadastro (UC004 – Autenticar Usuário).             |
| 3a. Após login/cadastro concluído                             | 4a. O Sistema retorna ao ponto em que o fluxo principal estava, permitindo prosseguir do passo 3. |

#### Fluxos de Exceção

| **Ações do Ator**                                                | **Ações do Sistema**                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1e. O pedestre seleciona uma localização inexistente ou inválida | 2e. O sistema exibe mensagem de erro e solicita nova seleção de localização.                           |
| 2e. O pedestre não insere título ou descrição                    | 3e. O sistema informa que os campos são obrigatórios e impede o envio até que sejam preenchidos.       |
| 3e. O pedestre tenta anexar arquivo em formato não suportado     | 4e. O sistema rejeita o upload e informa quais formatos são permitidos.                                |
| 4e. O sistema encontra falha de conexão no envio do reporte      | 5e. O sistema notifica falha técnica e oferece a opção de salvar localmente para tentar enviar depois. |

#### 5.1.1.2 Consultar o Mapa de Problemas

| **Identificador**      | UC002 – Consultar Mapa de Problemas |
| ---------------------- | ------------------------------------|
| **Nome**               | Consultar Mapa de Problemas|
| **Atores**             | Primário: Pedestre (usuário do sistema). <br> Secundário: Administrador (para análise de ocorrências).|
| **Sumário**            | O pedestre acessa o sistema para visualizar, no mapa, os problemas de acessibilidade reportados em pontos de transporte público.|
| **Complexidade**       | Baixa|
| **Regras de Negócio**  | - RN007: O mapa deve exibir apenas problemas confirmados e devidamente  em status "Aceito" ou posterior.<br> - RN008: O usuário pode aplicar filtros (categoria, data, status).<br> - RN009: Cada problema deve estar associado a uma localização válida.<br> - RN010: O sistema deve mostrar a data de registro e a situação do problema (pendente, em análise, resolvido).<br> - RN011: Problemas com mais de 1 ano podem ser arquivados, mas ainda disponíveis mediante filtro avançado.<br> -RN012: Não devem ser exibidos os problemas em status "Rejeitado" |
| **Pré-condições**      | O sistema deve conter reportes cadastrados.<br> O pedestre precisa ter acesso à plataforma (não é obrigatório login apenas para consulta).|
| **Pós-condição**       | O usuário terá acesso visual aos problemas existentes no mapa e poderá selecionar pontos para ver detalhes.|
| **Pontos de Inclusão** | UC006 – Visualizar Detalhes de Problema (quando o usuário seleciona um ponto específico).|
| **Pontos de Extensão** | UC001 – Reportar Problema (usuário pode criar um novo reporte a partir do mapa).|

#### Fluxo Principal

| **Ações do Ator**                                                  | **Ações do Sistema**                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 1. O pedestre acessa a opção “Consultar mapa de problemas”.        | 2. O sistema carrega o mapa com todos os pontos e marcadores de problemas registrados. |
| 3. O pedestre pode aplicar filtros (categoria, data, status).      | 4. O sistema atualiza o mapa exibindo apenas os problemas que atendem ao filtro.       |
| 5. O pedestre navega pelo mapa e seleciona um marcador específico. | 6. O sistema exibe informações resumidas do problema e opção de ver detalhes (UC006).  |

#### Fluxo Alternativo – Sem problemas cadastrados

| **Ações do Ator**                                               | **Ações do Sistema**                                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1a. O pedestre acessa o mapa sem que haja reportes cadastrados. | 2a. O sistema exibe mensagem “Nenhum problema cadastrado até o momento” e mostra apenas os pontos sem ocorrências. |

#### Fluxos de Exceção

| **Ações do Ator**                                                              | **Ações do Sistema**                                                                                 |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1e. O sistema não consegue carregar o mapa (falha na API de mapas ou conexão). | 2e. O sistema exibe mensagem de erro “Não foi possível carregar o mapa. Tente novamente mais tarde”. |
| 2e. O usuário aplica um filtro inválido ou inexistente.                        | 3e. O sistema exibe mensagem “Filtro inválido” e mantém a última visualização correta.               |
| 3e. O marcador selecionado não possui dados válidos (erro no registro).        | 4e. O sistema exibe mensagem de inconsistência e oculta o marcador defeituoso.                       |

#### 5.1.1.3 Atualizar Status de Problema

| **Identificador**      | UC003 – Atualizar Status de Problema|
| ---------------------- | ------------------------------------|
| **Nome**               | Atualizar Status de Problema|
| **Atores**             | Primário: Administrador (responsável por um ponto de transporte público). <br> Secundário: Pedestre autor do reporte.|
| **Sumário**            | O administrador acessa o sistema para alterar o status de um problema reportado|
| **Complexidade**       | Média|
| **Regras de Negócio**  | - RN013: Apenas administradores autenticados podem atualizar status.<br> - RN014: O status pode assumir: **Aguardando análise**, **Rejeitado**, **Aceito**, **Correção em andamento**, **Corrigido** e **Pausado**.<br> - RN015: Toda atualização deve registrar contagem de dias no status, data e hora da alteração, e administrador autor da alteração.<br> -RN016: O administrador pode inserir um comentário detalhando os motivos da mudança de status.<br> -RN017: O administrador pode anexar arquivos em .png, .jpg ou .jpeg no comentário da descrição|
| **Pré-condições**      | O administrador deve estar autenticado.<br> Deve existir pelo menos um problema reportado no ponto administrado.|
| **Pós-condição**       | O status do problema será atualizado no sistema, refletindo tanto a ação do administrador.|
| **Pontos de Inclusão** | UC002 – Consultar Mapa de Problemas (para localizar o problema).|
| **Pontos de Extensão** | N/A|

#### Fluxo Principal

| **Ações do Ator**                                                                   | **Ações do Sistema**                                                                              |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------  |
| 1. O administrador acessa a lista/mapa de problemas reportados.                     | 2. O sistema exibe os problemas associados ao ponto.                                              |
| 3. O administrador seleciona um problema específico.                                | 4. O sistema exibe detalhes do problema e status atual.                                           |
| 5. O administrador escolhe a opção de avançar o status do problema.                 | 6. O sistema exibe a tela para inserção de comentário sobre a mudança e anexar arquivos.          |
| 7. O administrador faz comentários e anexa arquivos sobre sua ação e a confirma.    | 8. O sistema exibe uma mensagem de alteração concluída e altera o status do problema.             |

#### Fluxo Alternativo - Pedestre rejeita a resolução

| **Ações do Ator**                       | **Ações do Sistema**                                                                    |
| -----------------------------------     | --------------------------------------------------------------------------------------- |
| 9a. O administrador rejeita o problema. | 10a. O sistema altera o status para **Rejeitado**.                                      |

#### Fluxo de Exceção

| **Ações do Ator**                                                            | **Ações do Sistema**                                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1e. O administrador não está autenticado.                                    | 2e. O sistema não exibe a opção de alterar status do problema.   |

### 5.2 UML - Diagrama de Classe de Domínio

![Diagrama de Classe](https://github.com/vinicius-cappatti/tickets-transporte-publico/blob/main/wiki/imgs/class-diagram.png)

### 5.3 UML - Diagrama de Sequência

#### 5.4.1 - US01 - Reportar Problema

![Diagrama de sequencia](https://github.com/user-attachments/assets/12d24d3b-81a3-4a8b-81dd-f2abeac3009e)

#### 5.4.2 - US02 - Consultar mapa

![Diagrama de sequencia](https://github.com/vinicius-cappatti/tickets-transporte-publico/blob/main/wiki/imgs/sequencia-consulta-mapa.png)

#### 5.4.3 - US03 - Atualizar status de problema

![Diagrama de sequencia](https://github.com/vinicius-cappatti/tickets-transporte-publico/blob/main/wiki/imgs/sequencia-atualizar-status.png)

## 6. Descrição da Arquitetura e Ferramentas Utilizadas

### Stack Tecnológico

**Backend:**

- Node.js com framework NestJS
- PostgreSQL com extensão PostGIS para dados geoespaciais
- Docker para containerização

**Frontend:**

- React + Next.js para aplicação web
- ShadcnUI para componentes de interface

**Infraestrutura:**

- Kubernetes para orquestração
- AWS S3 ou MinIO para armazenamento de objetos
- GitHub Actions para CI/CD

### Padrões e Princípios

- Arquitetura de microsserviços
- API RESTful seguindo OpenAPI 3.0
- Autenticação via JWT
- Princípios SOLID e Clean Architecture
- Testes automatizados (unitários, integração, E2E)

## 7. Plano de Desenvolvimento

### 7.1 Cronograma Detalhado (16 semanas)

**Fase 0 — Preparação (Semana 1)**
- Alinhamento de requisitos e definição do escopo MVP
- Backlog priorizado e ambiente de desenvolvimento

**Fase 1 — Protótipo Web (Semanas 2–4)**
- Protótipo PWA com mock de dados
- Fluxos principais: cadastro, mapa, painel

**Fase 2 — Análise e Modelagem (Semanas 4–6)**
- Casos de uso e entidades
- Modelo conceitual e dicionário de dados

**Fase 3 — Design de Classes (Semanas 6–8)**
- Diagrama de classes do domínio
- Especificação de serviços

**Fase 4 — Diagramas de Sequência (Semanas 8–9)**
- Fluxos críticos modelados
- Definição de APIs e contratos

**Fase 5 — Banco de Dados (Semanas 9–10)**
- Esquema físico PostGIS
- Scripts DDL e migração

**Fase 6 — Implementação API (Semanas 10–13)**
- API REST/GraphQL com CRUD
- Testes automatizados e CI

**Fase 7 — Integração e Testes (Semanas 13–14)**
- Integração frontend-backend
- Testes E2E e acessibilidade

**Fase 8 — Finalização (Semanas 15–16)**
- Documentação completa
- Release MVP e roadmap futuro

### 7.2 Métricas de Sucesso
- **Técnicas**: Acurácia >85% na detecção
- **Impacto**: Taxa de resolução de barreiras


## 8. Resultados

*[Esta seção será preenchida após a implementação, incluindo:

- Métricas de desempenho do sistema
- Estatísticas de uso e engajamento
- Casos de sucesso e impactos mensuráveis
- Feedback dos usuários e gestores
- Lições aprendidas]*

## 9. Conclusão e Trabalhos Futuros

### Conclusão Preliminar

O projeto visa criar uma solução tecnológica escalável e sustentável para o mapeamento colaborativo de barreiras de acessibilidade urbana, contribuindo diretamente para o cumprimento do ODS 11 e promovendo cidades mais inclusivas e acessíveis.

### Próximos Passos

1. Formar equipe técnica multidisciplinar
2. Desenvolver prova de conceito
3. Estabelecer parceria com cidade piloto
4. Lançar MVP e coletar feedback
5. Iterar com base em dados reais

### Trabalhos Futuros

- Integração com sistemas de transporte público
- Expansão para detecção de barreiras em ambientes internos
- Desenvolvimento de rotas acessíveis personalizadas
- Implementação de realidade aumentada para navegação
- Criação de índice de acessibilidade por cidade/bairro
