# Documento de Especificação do Projeto: Plataforma de Acessibilidade Urbana com IA  

## Autores  
- Felipe Gasparino  
- Gustavo Nascimento  
- Tiago Teraoka  
- Thomaz Scopel  
- Vinícius Cappatti  

---

## Capítulo 1: Introdução  

As cidades brasileiras enfrentam graves deficiências em acessibilidade urbana, impactando diretamente a qualidade de vida de pessoas com mobilidade reduzida, idosos, usuários de cadeiras de rodas, pessoas com deficiência visual e famílias com carrinhos de bebê.  

O presente projeto tem como objetivo desenvolver uma **plataforma open-source de acessibilidade urbana com inteligência artificial**, que permitirá o mapeamento colaborativo de barreiras e apoiará gestores públicos na priorização de intervenções.  

---

## Capítulo 2: Definição da Demanda  

### 2.1 Problema ou Oportunidade Percebida  
As cidades brasileiras apresentam deficiências significativas em acessibilidade urbana. Barreiras físicas, ausência de sinalização adequada e falta de infraestrutura comprometem diretamente a mobilidade de milhões de pessoas.  

A ausência de dados estruturados sobre essas barreiras dificulta a priorização de investimentos públicos e perpetua a exclusão social. Por outro lado, existe a oportunidade de usar tecnologias digitais e colaborativas para transformar denúncias dispersas em informações organizadas e úteis.  

### 2.2 Justificativa da Demanda  
- **Social:** melhora na qualidade de vida de mais de 17 milhões de brasileiros com mobilidade reduzida (IBGE 2019).  
- **Legal:** cumprimento da Lei Brasileira de Inclusão (Lei 13.146/2015).  
- **Econômico:** redução de custos com levantamentos manuais extensos e otimização de recursos públicos.  
- **Tecnológico:** uso de inteligência artificial e participação cidadã para acelerar a coleta e análise de dados.  

### 2.3 Descrição do Produto de Software  
Será desenvolvida uma plataforma que cria um **mapa colaborativo e inteligente de barreiras de acessibilidade urbana**.  

Principais componentes:  
- **Sistema de Coleta Colaborativa:** cidadãos reportam problemas com fotos e geolocalização.  
- **Plataforma de Dados Abertos:** disponibilização pública dos dados.  
- **Mapa Interativo:** visualização em tempo real das barreiras.  
- **Painel de Gestão:** dashboard para gestores públicos e sociedade civil acompanharem indicadores.  

### 2.4 Clientes, Usuários e Envolvidos  
- **Clientes diretos:** prefeituras, secretarias de mobilidade e obras.  
- **Usuários finais:** cidadãos em geral, com foco em PcD, idosos, famílias com carrinhos de bebê e ciclistas.  
- **Envolvidos/impactados:**  
  - ONGs e movimentos sociais de acessibilidade  
  - Empresas de tecnologia assistiva  
  - Universidades e centros de pesquisa  
  - Conselhos municipais de acessibilidade  

### 2.5 Principais Etapas de Construção do Produto  
1. **MVP inicial:** aplicativo de captura de fotos e mapa web simples.  
2. **Validação em piloto:** coleta de dados reais e ajustes nos modelos de IA.  
3. **Expansão funcional:** dashboard completo e sistema de priorização automática.  
4. **Escala:** expansão para múltiplas cidades com gamificação e engajamento comunitário.  

### 2.6 Critérios de Qualidade do Produto  
- **Confiabilidade:** detecção de barreiras com acurácia superior a 85% e menos de 5% de falsos positivos.  
- **Usabilidade:** interface simples, inclusiva e responsiva.  
- **Transparência:** algoritmos auditáveis e documentação pública.  
- **Segurança e privacidade:** conformidade com a LGPD.  
- **Escalabilidade:** suporte a múltiplas cidades e grandes volumes de dados.  
- **Engajamento:** incentivo à participação cidadã com feedback sobre impacto.  

---

## Capítulo 3: Requisitos do Produto  

As tabelas abaixo organizam os requisitos do sistema.  

### Requisitos Funcionais

| ID   | Tipo | Prioridade | Descrição do Requisito |
|------|------|------------|-------------------------|
| RF01 | RF   | Alta       | O sistema deve permitir o usuário de visualizar um mapa com geolocalização que demonstre sua localização assim como a localização de problemas de acessibilidade nos pontos de ônibus e estações de metro|
| RF02 | RF   | Alta       | O usuário deve ser capaz de gerar um relatório com foto e descrição de um novo problema encontrado no mapa.|
| RF03 | RF   | Alta       | O problema reportado pelo usuário deve ser demonstrado no mapa logo após dele gerar o relatório, associando sua geolocalização no momento em que entrou para criar o relatório. |
| RF04 | RF   | Alta       | O sistema deve notificar a entidade responsável para resolução do problema quando for marcada por um usuário. |
| RF05 | RF   | Alta       | O sistema não deve permitir usuários de criar um relatório para um problema já existente em outro relatório. |
| RF06 | RF   | Alta       | O sistema deve utilizar a IA para contribuir na validação de um relatório comparando foto, descrição do problema e localização do usuário. |
| RF07 | RF   | Média      | O usuário pode filtrar no mapa uma região específica para ver se há problemas de acessibilidade. |
| RF08 | RF   | Média      | O usuário deve ser capaz de marcar a entidade responsável para a resolução de um problema no relatório (ex: problema de acessibilidade na linha vermelha reportada a CPTM). |

### Requisitos Não-Funcionais

| ID    | Tipo | Prioridade | Descrição do Requisito |
|-------|----- |------------|-------------------------|
| RNF01 | RNF  | Alta       | O sistema deve ter um tempo de resposta inferior a 2 segundos para carregar o mapa e os problemas de acessibilidade. |
| RNF02 |	RNF  | Alta       |	O sistema deve ser capaz de processar e validar, via IA, até 1000 relatórios por hora.|
| RNF03 |	RNF  | Média      |	O aplicativo deve ser compatível com as versões mais recentes dos sistemas operacionais iOS e Android.|
| RNF04 |	RNF  | Média      |	O sistema deve estar disponível 99% do tempo, garantindo a estabilidade e o acesso contínuo.|
| RNF05 |	RNF  | Média      |	O sistema deve ser escalável para suportar um aumento de 50% no número de usuários e relatórios sem comprometer o desempenho.|
| RNF06 |	RNF  | Média      |	As notificações para as entidades responsáveis devem ser entregues em tempo real.|
| RNF07 | RNF  | Baixa      | O sistema deve ser seguro, protegendo os dados pessoais dos usuários e as informações dos relatórios contra acessos não autorizados. |
| RNF08 |	RNF  | Baixa      |	A interface do usuário deve ser intuitiva e fácil de usar, permitindo que qualquer pessoa, independentemente de sua familiaridade com tecnologia, possa reportar um problema.|
---

## Capítulo 4: Wireframes  

### 1. Página Principal  
Resumo inicial do sistema com estatísticas de locais, reports ativos e categorias de problemas mais comuns.  
![Página Principal](https://github.com/user-attachments/assets/a1aab998-f84f-45bc-a72e-4b7e6ddaa921)

### 2. Área do Cliente (Login/Cadastro)  
Tela de acesso ao sistema, onde o usuário entra com nome e e-mail para começar a reportar.  
![Área do cliente](https://github.com/user-attachments/assets/35ab1283-e8d6-4de1-9609-f9ba5e1125cf)

### 3. Selecionar Local  
Etapa onde o usuário escolhe o ponto de ônibus ou estação onde identificou o problema.  
![Adicionar um reports](https://github.com/user-attachments/assets/958eec39-176a-44b4-9cac-6150fbede392)

### 4. Reportar Problema – Tipo  
Seleção da categoria do problema (rampa, piso tátil, elevador, etc.).  
![Reportar problema](https://github.com/user-attachments/assets/20296355-3ca5-4202-9c22-3f730bbbd4ff)

### 5. Reportar Problema – Descrição  
Formulário para detalhar o problema, com título e descrição completa.  
![Descrição do report](https://github.com/user-attachments/assets/94aab9c7-9736-44fb-9c91-e843e2781ec3)

### 6. Dashboard – Visão Geral  
Painel com estatísticas globais: número de reports, status, categorias e taxa de resolução.  
![Dashboards](https://github.com/user-attachments/assets/2f363496-38e3-4cb1-9d98-0fcea3134fce)

### 7. Dashboard – Meus Reports  
Lista dos problemas reportados pelo próprio usuário, com seus status.  
![Dashboards -Meus reports](https://github.com/user-attachments/assets/52224af4-a5e6-4d60-b1a1-4cd93d7ee6e9)

### 8. Dashboard – Todos os Reports  
Exibe todos os reports do sistema, permitindo visualizar detalhes e acompanhar pendências.    
![Dashboards -All reports](https://github.com/user-attachments/assets/6585f785-17fa-48d1-ada5-48dcc66b2e6d)

---

## Capítulo 5: Modelagem “Leve do Sistema”  

### 5.1 UML - Casos de Uso  

<img width="410" height="270" alt="image" src="https://github.com/user-attachments/assets/59328def-1aca-4b1f-85ba-48c6754f89c2" />

### 5.2. Especificações dos Casos de Uso

#### 5.2.1. Reportar Problema

### 5.2 UML - Diagrama de Classe de Domínio

### 3.2.2.6 Cancelar Serviço
---

#### Caso de Uso – Reportar Problema

| **Identificador**      | UC001 – Reportar Problema                                                                               |
|------------------------|----------------------------------------------------------------------------------------------------------|
| **Nome**               | Reportar Problema                                                                                        |
| **Atores**             | Primário: Pedestre utilizando o Sistema de Reportes de Acessibilidade. <br> Secundário: Administrador de um ponto registrado no Sistema      |
| **Sumário**            | Um pedestre cria na plataforma um reporte para um problema de acessibilidade, visto em ponto de transporte público |
| **Complexidade**       | Média                                                                                                   |
| **Regras de Negócio**  | ????????                                                                                            |
| **Pré-condições**      | O pedestre deve possuir informações do problema (foto, vídeo). <br> O pedestre deverá disponibiliza sua localização. <br> O pedestre deve ter um cadastro para registrar um reporte. <br>        |
| **Pós-condição**       | O Sistema terá um reporte com todas as informações do problema registrado em seu banco de dados <br> O Sistema registrará o reporte e atualizará o mapa para que o reporte conste para a localização  |
| **Pontos de Inclusão** |                                                                                                         |
| **Pontos de Extensão** | —                                                                                                        |

#### Fluxo Principal

| **Ações do Ator**               | **Ações do Sistema**                                                                             |
|--------------------------------|--------------------------------------------------------------------------------------------------|
| 1. O Pedestre seleciona que deseja reportar um problema na página principal        | 2. O Sistema exibe uma listagem dos pontos e estações e o mapa|
| 3. Escolhe a localização através da busca pelo nome ou endereço, ou ainda através do mapa | 4. O Sistema retorna e solicita a confirmação do pedestre para que ele prossiga|
| 5. O pedestre verifica as informações do local selecionado e confirma | 6. O Sistema exibe uma lista de categorias problemas e oferece outro passo de confirmação para o pedestre|
| 7. O pedestre confirma a seleção da categoria e local | 8. O Sistema solicita informações sobre o problema e oferece dicas para que o reporte tenha boa qualidade|
| 9. O Pedestre registra um título para o problema e uma descrição que dê mais detalhes sobre a natureza dele e ao checar as informações envia o reporte | 10. O Sistema informa o envio do reporte e solicita se o pedestre deseja criar um novo reporte ou visualizar o reporte publicado.|

#### Fluxo Alternativo – Pedestre não está logado no sistema

| **Ações do Ator**         | **Ações do Sistema**                           |
|---------------------------|------------------------------------------------|
|     |  |

#### Fluxos de Exceção

| **Ações do Ator**         | **Ações do Sistema**                                                     |
|---------------------------|--------------------------------------------------------------------------|
|  |  |
---

### 5.3 UML - Diagrama de Sequência



---

## Capítulo 6: Arquitetura do Sistema e Tecnologias  

### 6.1 Descrição da Arquitetura  
![Diagrama de Arquitetura](wiki\imgs\system-design-diagram.png)  

### 6.2 Stack Tecnológico Proposto  
- **Backend**: Node.js (NestJS)  
- **Banco de Dados**: PostgreSQL com PostGIS  
- **Armazenamento**: S3 ou compatível  
- **Frontend**: React + Next.js  
- **Infraestrutura**: Docker + Kubernetes  

### 6.3 Categorias de Barreiras Detectáveis  

1. **Infraestrutura Física**  
   - Escadas sem alternativa acessível  
   - Rampas fora de norma (>8,33% inclinação)  
   - Calçadas danificadas ou estreitas (<1,20m)  
   - Desníveis e buracos  

2. **Sinalização e Orientação**  
   - Ausência de piso tátil  
   - Falta de sinalização visual/sonora  
   - Semáforos sem recurso sonoro  

3. **Obstáculos**  
   - Mobiliário urbano mal posicionado  
   - Veículos estacionados irregularmente  
   - Obras sem passagem alternativa  
   - Comércio informal obstruindo passagem  

---

## Apêndice A: Governança, Sustentabilidade e Ética  

- **Modelo Open Source:** licença MIT, documentação completa, datasets públicos respeitando a privacidade.  
- **Parcerias Estratégicas:** universidades, ONGs, órgãos públicos e empresas de tecnologia assistiva.  
- **Conformidade e Ética:**  
  - Conformidade com a LGPD  
  - Transparência nos algoritmos  
  - Conselho consultivo com representantes PcD  
  - Auditorias periódicas para evitar vieses  

---

## Apêndice B: Riscos e Mitigações  

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Baixa adoção inicial | Alta | Alto | Parcerias com lideranças PcD e campanhas locais |
| Viés nos modelos de IA | Média | Alto | Dataset diversificado e validação contínua |
| Sustentabilidade do projeto | Média | Alto | Engajamento da sociedade e apoios institucionais |
| Questões de privacidade | Baixa | Alto | Anonimização, blur automático e políticas claras |
| Resistência política | Média | Médio | Argumentação baseada em impactos sociais e legais |

---

## Apêndice C: Próximos Passos  

1. Formar equipe voluntária e definir a stack tecnológica final  
2. Desenvolver prova de conceito técnica  
3. Buscar cidade parceira para projeto piloto  
4. Lançar MVP e iniciar coleta de feedback da comunidade  
5. Iterar com base em dados reais e expandir funcionalidades  

---
