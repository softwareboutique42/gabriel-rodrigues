---
title: 'Escalando um Micro-Produto com Skills Estrategicas: O Toolkit do Company Canvas'
description: 'Como construi 10 skills reutilizaveis assistidas por IA para iterar sistematicamente o Company Canvas de MVP a produto polido — cobrindo seguranca, testes, cache, analytics, pricing e mais.'
date: 2026-03-25
tags: ['produto', 'ia', 'arquitetura', 'ferramentas-dev']
lang: 'pt'
---

# Escalando um Micro-Produto com Skills Estrategicas: O Toolkit do Company Canvas

Lancar o MVP e a parte facil. A parte dificil e o que vem depois: blindar a seguranca, adicionar testes, cortar custos, alcancar novos publicos e evoluir o produto — tudo sem quebrar o que ja funciona.

Depois de lancar o [Company Canvas](/pt/canvas/) (um gerador de animacoes de marca com IA e pagamentos via Stripe), eu precisava de um sistema para iterar. Nao um roadmap vago, mas um conjunto de playbooks repetitivos e focados que eu pudesse invocar sempre que tivesse 30 minutos para melhorar o produto.

Construi 10 skills estrategicas — cada uma e um guia autossuficiente para um eixo especifico de melhoria. Veja o que fazem, por que existem e a ordem em que eu as executaria.

## O que e uma Skill?

Uma skill e um prompt estruturado que transforma uma tarefa complexa e multi-etapa em um workflow guiado. Em vez de comecar do zero toda vez ("como adiciono cache no meu Worker?"), a skill ja sabe:

- Quais arquivos ler para contexto
- Quais perguntas fazer antes de comecar
- Os passos de implementacao em ordem
- Como verificar o trabalho

Pense nelas como playbooks reutilizaveis que codificam decisoes arquiteturais e melhores praticas especificas do projeto.

## As 10 Skills

### 1. canvas-harden — Auditoria de Seguranca e Confiabilidade

**O problema:** O pipeline de pagamento lida com dinheiro real. Um bug na verificacao de sessao ou um CORS check faltando poderia significar dar downloads de graca ou vazar dados.

**O que faz:** Executa uma auditoria de seguranca estruturada no Stripe, endpoints do Worker e fluxo de pagamento client-side. Verifica 20+ cenarios especificos:

- O `payment_status === 'paid'` e aplicado antes de retornar a config?
- O que acontece se a API do Stripe estiver fora durante a verificacao?
- O que acontece se o mesmo session_id for usado duas vezes?
- As respostas de erro estao vazando detalhes de implementacao?

**Por que e primeira:** Voce blinda o que esta no ar antes de adicionar features. Cada nova feature aumenta a superficie de ataque — melhor comecar de uma base segura.

### 2. canvas-test — Suite de Testes

**O problema:** Sem testes, cada mudanca e um salto de fe. O fluxo de pagamento e especialmente arriscado — uma regressao poderia silenciosamente quebrar downloads apos o pagamento.

**O que faz:** Guia a criacao de tres camadas de teste:

- **Testes unitarios** para o modulo de export (HTML valido, cores corretas, marca d'agua embutida)
- **Testes de integracao** para endpoints do Worker (rate limiting, validacao de input, respostas mockadas do Stripe)
- **Testes E2E** para o fluxo no browser (envio de formulario, dropdown de versao, botao de download, disclaimer)

Todas as APIs externas (Claude, Stripe) sao mockadas — testes nunca fazem chamadas reais de API.

**Por que e segunda:** Testes sao a rede de seguranca para tudo que vem depois. Cada skill subsequente pode ser verificada contra esta suite de testes.

### 3. canvas-cache — Cache Inteligente

**O problema:** Cada geracao da mesma empresa chama a API do Claude (~$0,002 cada). "Spotify" digitado 100 vezes custa $0,20 e da 100 resultados ligeiramente diferentes.

**O que faz:** Adiciona uma camada de cache (Cloudflare KV, R2 ou Cache API) que:

- Faz cache por nome normalizado da empresa + versao
- Retorna resultados cacheados instantaneamente (cache HIT)
- Cai para o Claude em cache MISS
- Suporta bypass de "regenerar" para resultados frescos
- Define TTL de 7 dias

**A matematica:** Com uma taxa de cache hit de 50%, os custos de API caem pela metade. Empresas populares como "Apple" ou "Tesla" sao cacheadas apos a primeira geracao, tornando requisicoes subsequentes gratuitas e instantaneas.

### 4. canvas-translate — Traducoes para Portugues

**O problema:** O site suporta ingles e portugues, mas os posts do blog so existem em ingles. Metade do publico potencial ve um blog incompleto.

**O que faz:**

- Audita en.json vs pt.json para chaves i18n faltando
- Traduz todos os posts em ingles para portugues brasileiro natural
- Mantem termos tecnicos em ingles onde sao padrao da industria
- Preserva blocos de codigo e estrutura markdown sem alteracao

**Por que e um quick win:** Traducao e trabalho puro de conteudo — nenhuma mudanca arquitetural, nenhum risco de quebrar o fluxo de pagamento. Dobra o alcance do blog da noite para o dia.

### 5. canvas-analytics — Rastreamento de Uso

**O problema:** Sem dados, cada decisao de produto e um palpite. Quais empresas as pessoas mais geram? Qual a taxa de conversao de geracao para download? Ha falhas pos-pagamento?

**O que faz:** Adiciona rastreamento de analytics leve e respeitoso com privacidade:

| Metrica                        | Proposito                      |
| ------------------------------ | ------------------------------ |
| Geracoes por dia               | Previsao de custo de API       |
| Top nomes de empresas          | Quais industrias otimizar      |
| Taxa de conversao              | O produto e convincente?       |
| Taxa de conclusao de pagamento | O checkout esta funcionando?   |
| Distribuicao de estilos        | Quais estilos Claude mais pega |

Quatro opcoes de implementacao sao oferecidas: Cloudflare Analytics Engine, contadores KV, servico externo (Plausible/Umami) ou logging estruturado. Todas as abordagens sao fire-and-forget — analytics nunca atrasam o fluxo do usuario.

**Por que antes de pricing:** Voce precisa de dados para tomar decisoes de preco. Rodar analytics por uma semana antes de mexer em pricing te da numeros reais em vez de suposicoes.

### 6. canvas-v2 — Nova Versao de Animacoes

**O problema:** A v1 tem quatro estilos de animacao solidos, mas sao todos 2D e relativamente simples. Uma v2 com efeitos de shader, profundidade 3D ou animacoes audio-reativas justifica um preco maior e da aos usuarios motivo para voltar.

**O que faz:** Guia o design e implementacao de 3-4 novos estilos de animacao:

- Estende a classe `BaseAnimation` existente
- Registra a nova versao em `versions.ts`
- Atualiza o pipeline de export para inlinar novo codigo de animacao
- Atualiza o prompt do Claude com novas opcoes de estilo
- Garante que animacoes v1 permanecam intocadas

**A restricao:** Cada nova animacao deve funcionar com a camera ortografica, fazer loop em 12 segundos e exportar como HTML autossuficiente. Isso mantem a arquitetura limpa.

### 7. canvas-pricing — Monetizacao Avancada

**O problema:** Preco fixo de $1 e simples, mas deixa dinheiro na mesa. Uma agencia gerando 50 animacoes deveria ter preco em volume. Uma animacao v2 com shaders pode valer mais que v1.

**O que faz:** Implementa um ou mais modelos de preco do Stripe:

| Modelo                           | Feature do Stripe             |
| -------------------------------- | ----------------------------- |
| Pacotes em volume (10 por $7)    | Checkout com quantidade       |
| Versoes com preco ($1 v1, $2 v2) | Precos diferentes por produto |
| Codigos promocionais             | Stripe Promotion Codes        |
| Assinaturas (ilimitado/mes)      | Stripe Billing                |

O download unico de $1 permanece como padrao — novos modelos sao adicoes, nao substituicoes.

### 8. canvas-seo — Otimizacao para Busca

**O problema:** Busca organica e trafego gratuito. Mas se meta tags estao faltando, dados estruturados estao ausentes ou posts do blog nao miram palavras-chave buscaveis, o Google nao vai mandar ninguem.

**O que faz:** Executa uma auditoria completa de SEO:

- **Tecnico:** titulos unicos, URLs canonicas, hreflang, Open Graph, Twitter Cards, dados estruturados JSON-LD
- **Performance:** impacto do Three.js nos Core Web Vitals, lazy loading, code splitting
- **Conteudo:** keywords nos titulos do blog, links internos entre posts e a ferramenta canvas, descricoes SERP convincentes

### 9. canvas-video-export — Saida MP4/WebM

**O problema:** Alguns usuarios querem um arquivo de video, nao um arquivo HTML. Incorporar uma animacao em uma apresentacao ou post de rede social requer MP4.

**O que faz:** Oferece duas abordagens:

- **Client-side:** `canvas.captureStream()` + `MediaRecorder` API — gratuito, funciona offline, qualidade depende do browser
- **Server-side:** Renderizacao headless browser no Cloudflare Browser — qualidade consistente, suporta MP4, requer plano pago

Ambos capturam exatamente um loop de 12 segundos com o overlay da empresa e marca d'agua.

### 10. canvas-embed — Widget Incorporavel

**O problema:** O gerador de animacoes so vive em um site. Um script de embed permitiria agencias, blogs e outros desenvolvedores incorporarem em seus sites — transformando a ferramenta em uma plataforma.

**O que faz:**

- Constroi uma tag `<script>` de embed (Shadow DOM ou iframe para isolamento)
- Adiciona endpoints de API para acesso programatico
- Lida com CORS para origens de terceiros
- Inclui atribuicao "Powered by Company Canvas"
- Suporta rastreamento de receita de afiliados

Este e o jogo de plataforma — a maior complexidade, mas tambem o maior alcance potencial.

## A Ordem de Iteracao

As skills sao projetadas para serem executadas em sequencia, onde cada uma constroi sobre a anterior:

```
1. /canvas-harden    — blindar o que esta no ar
2. /canvas-test      — adicionar rede de seguranca
3. /canvas-cache     — cortar custos
4. /canvas-translate — quick win de alcance
5. /canvas-analytics — entender o uso
6. /canvas-v2        — novo valor
7. /canvas-pricing   — capturar valor
8. /canvas-seo       — gerar trafego
9. /canvas-video-export — feature premium
10. /canvas-embed    — jogo de plataforma
```

As cinco primeiras sao defensivas: tornam o produto existente melhor, mais seguro e mais barato. As cinco ultimas sao ofensivas: adicionam novas features e fontes de receita.

Voce nao precisa executar todas as 10. Apos cada skill, voce tem um produto estritamente melhor. Pare quando estiver satisfeito.

## A Meta-Licao

O verdadeiro insight nao sao as skills em si — e o padrao. Qualquer projeto pode ser decomposto em eixos focados de melhoria:

1. **Seguranca** — auditar e blindar o que esta no ar
2. **Testes** — construir a rede de seguranca
3. **Otimizacao de custos** — reduzir despesas correntes
4. **Alcance** — traducoes, SEO, conteudo
5. **Analytics** — medir antes de decidir
6. **Features** — adicionar novo valor
7. **Monetizacao** — capturar o valor adicionado
8. **Distribuicao** — embeds, APIs, parcerias

Cada eixo e independente o suficiente para ser abordado em uma sessao, mas eles se multiplicam quando empilhados. Um produto com cache, testado, traduzido e com analytics e fundamentalmente diferente de um MVP cru — mesmo que a feature principal seja identica.

As skills codificam esse pensamento para que voce nao precise re-derivar toda vez que senta para trabalhar.

Experimente o Company Canvas em [gabriel-rodrigues.com/pt/canvas](/pt/canvas/).
