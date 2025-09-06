# Documento de Especificação do Projeto: Plataforma de Acessibilidade Urbana com IA

## Autores
* Felipe Gasparino
* Gustavo Nascimento
* Tiago Teraoka
* Thomaz Scopel
* Vinícius Cappatti

## 1. DEFINIÇÃO DO PROBLEMA

### 1.1 Contexto

As cidades brasileiras enfrentam graves deficiências em acessibilidade urbana, impactando diretamente a qualidade de vida de pessoas com mobilidade reduzida, idosos, usuários de cadeiras de rodas, pessoas com deficiência visual e famílias com carrinhos de bebê.

### 1.2 Problemas Identificados

- **Falta de dados estruturados**: Inexistência de base de dados centralizada e atualizada sobre barreiras de acessibilidade
- **Informações fragmentadas**: Denúncias dispersas em redes sociais e canais isolados sem sistematização
- **Ausência de priorização técnica**: Gestores públicos tomam decisões sem dados concretos sobre impacto e urgência
- **Invisibilidade do problema**: Barreiras não documentadas perpetuam exclusão social
- **Alto custo de mapeamento manual**: Levantamentos tradicionais demandam recursos humanos e tempo excessivos

### 1.3 Impacto do Problema

- 17,2 milhões de brasileiros com dificuldade de locomoção (IBGE 2019)
- Perda de autonomia e dignidade para população vulnerável
- Má alocação de recursos públicos em intervenções não prioritárias
- Descumprimento de legislação de acessibilidade (Lei 13.146/2015)

## 2. DEFINIÇÃO DA DEMANDA

### 2.1 Problema ou Oportunidade Percebida  
As cidades brasileiras apresentam deficiências significativas em acessibilidade urbana. Barreiras físicas, ausência de sinalização adequada e falta de infraestrutura comprometem diretamente a mobilidade de milhões de pessoas, incluindo idosos, pessoas com deficiência, famílias com carrinhos de bebê e demais cidadãos.  
A ausência de dados estruturados sobre essas barreiras dificulta a priorização de investimentos públicos e perpetua a exclusão social. Por outro lado, existe a oportunidade de usar tecnologias digitais e colaborativas para transformar denúncias dispersas em informações organizadas e úteis para gestores e sociedade.  

### 2.2 Justificativa da Demanda  
A demanda por uma solução tecnológica se justifica pelos seguintes fatores:  
- **Social:** melhora na qualidade de vida de mais de 17 milhões de brasileiros com mobilidade reduzida (IBGE 2019).  
- **Legal:** cumprimento da Lei Brasileira de Inclusão (Lei 13.146/2015), que estabelece diretrizes de acessibilidade.  
- **Econômico:** redução de custos com levantamentos manuais extensos e otimização de recursos públicos por meio da priorização de intervenções mais urgentes.  
- **Tecnológico:** possibilidade de usar inteligência artificial e participação cidadã para acelerar a coleta e análise de dados.  

### 2.3 Descrição do Produto de Software  
Será desenvolvida uma **plataforma open-source** que cria um mapa colaborativo e inteligente de barreiras de acessibilidade urbana.  
Os principais componentes incluem:  
- **Sistema de Coleta Colaborativa:** cidadãos poderão reportar problemas com fotos e geolocalização.  
- **Plataforma de Dados Abertos:** disponibilização pública dos dados para reutilização.  
- **Mapa Interativo e Pesquisável:** visualização em tempo real das barreiras detectadas.  
- **Painel de Gestão:** dashboard analítico para gestores públicos e sociedade civil acompanharem indicadores e priorizarem ações.  

### 2.4 Clientes, Usuários e Envolvidos  
- **Clientes diretos:** prefeituras, secretarias municipais/estaduais e órgãos públicos responsáveis por obras e mobilidade urbana.  
- **Usuários finais:** cidadãos em geral, com destaque para pessoas com deficiência, idosos, famílias com carrinhos de bebê e ciclistas.  
- **Envolvidos/impactados:**  
  - Organizações da sociedade civil ligadas à acessibilidade.  
  - Empresas de tecnologia assistiva.  
  - Universidades e centros de pesquisa.  
  - Movimentos sociais e conselhos municipais de acessibilidade.  

### 2.5 Principais Etapas de Construção do Produto  
1. **MVP inicial:** aplicativo de captura de fotos e mapa web simples.  
2. **Validação em piloto:** parceria com uma cidade para coleta de dados reais e ajustes nos modelos de IA.  
3. **Expansão funcional:** criação de dashboard completo, detecção de múltiplos tipos de barreiras e sistema de priorização automática.  
4. **Escala:** expansão para múltiplas cidades, gamificação e engajamento comunitário.  

### 2.6 Critérios de Qualidade do Produto  
- **Confiabilidade:** detecção de barreiras com acurácia superior a 85% e menos de 5% de falsos positivos.  (NÚMERO À SER DEFINIDO E PODE SER ALTERADO)
- **Usabilidade:** interface simples, inclusiva e responsiva, acessível em múltiplos dispositivos.  
- **Transparência:** algoritmos auditáveis e documentação pública.  
- **Segurança e privacidade:** conformidade com a LGPD, anonimização de dados pessoais e armazenamento seguro.  
- **Escalabilidade:** capacidade de expansão para múltiplas cidades e grandes volumes de dados.  
- **Engajamento:** incentivo à participação cidadã com feedback claro sobre impacto dos reports.  


### 2.X Diagrama de caso de uso --------------

![Diagrama de Caso de Uso](wiki\imgs\use-case-diagram.png)

## 3. ESPECIFICAÇÕES TÉCNICAS

### 3.1 Arquitetura do Sistema

![Diagrama de Arquitetura](wiki\imgs\system-design-diagram.png)

### 3.2 Stack Tecnológico Proposto
- **Backend**: Node.js (NestJS)
- **Banco de Dados**: PostgreSQL com PostGIS
- **Armazenamento**: S3 ou compatível
- **Frontend**: React + Next.js
- **Infraestrutura**: Docker + Kubernetes

### 3.3 Categorias de Barreiras Detectáveis

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

## 5. IMPLEMENTAÇÃO

### 4.1 Fases do Projeto

**Fase 1 - MVP**
- App básico de captura de fotos
- Detecção de 3 tipos principais de barreiras
- Mapa web simples
- API básica

**Fase 2 - Validação**
- Piloto com 1 cidade parceira
- Ajuste dos modelos de IA com dados reais
- Interface para validação humana
- Métricas de acurácia

**Fase 3 - Expansão**
- Dashboard completo para gestores
- Detecção de 10+ tipos de barreiras
- Sistema de priorização automática
- Integrações com sistemas municipais

**Fase 4 - Escala**
- Expansão para múltiplas cidades
- Recursos de engajamento e gamificação
- Evolução contínua da plataforma e dos modelos

### 5.2 Métricas de Sucesso
- **Técnicas**: Acurácia >85% na detecção, <5% falsos positivos
- **Engajamento**: 1000+ usuários ativos/mês por cidade
- **Impacto**: 30% das barreiras reportadas resolvidas em 6 meses
- **Negócio**: 1-2 bairros em uso

## 6. GOVERNANÇA E SUSTENTABILIDADE

### 6.1 Modelo Open Source
- Licença MIT para código base
- Documentação completa e atualizada
- Processo transparente de contribuição
- Datasets públicos, respeitando a privacidade dos cidadãos

### 5.2 Parcerias Estratégicas

- Universidades para pesquisa e desenvolvimento
- Organizações de direitos das pessoas com deficiência
- Órgãos públicos municipais e estaduais
- Empresas e entidades de tecnologia assistiva

### 5.3 Conformidade e Ética

- Conformidade com a LGPD: Anonimização automática dos dados pessoais
- Transparência nos algoritmos
- Conselho consultivo incluindo representantes de pessoas com deficiência
- Auditorias periódicas para evitar vieses e promover justiça algorítmica

## 6. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Baixa adoção inicial | Alta | Alto | Parcerias com lideranças PcD e campanhas locais |
| Viés nos modelos de IA | Média | Alto | Dataset diversificado e validação contínua |
| Sustentabilidade do projeto | Média | Alto | Engajamento da sociedade e busca de apoios institucionais |
| Questões de privacidade | Baixa | Alto | Anonimização, blur automático e políticas claras de dados |
| Resistência política | Média | Médio | Argumentação baseada em impactos sociais e legais |

## 7. PRÓXIMOS PASSOS

1. Formar equipe voluntária e definir a stack tecnológica final
2. Desenvolver prova de conceito técnica
3. Buscar cidade parceira para projeto piloto
4. Lançar MVP e iniciar coleta de feedback da comunidade
5. Iterar com base em dados reais e expandir funcionalidades

---

*Este documento é um trabalho em progresso e será atualizado conforme o projeto evolui. Contribuições e feedback são bem-vindos através do repositório do projeto.*
