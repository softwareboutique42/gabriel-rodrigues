---
title: 'Frontend com IA: Colocando Codigo Gerado pelo Claude em Producao'
description: 'Licoes praticas de usar a API do Claude como servico backend — engenharia de prompts, saida estruturada, tratamento de erros e o padrao Worker proxy.'
date: 2026-03-25
tags: ['ia', 'claude', 'cloudflare', 'arquitetura']
lang: 'pt'
---

# Frontend com IA: Colocando Codigo Gerado pelo Claude em Producao

A maioria dos tutoriais ensina como construir um chatbot. Este post e sobre algo diferente: usar um LLM como servico backend estruturado que alimenta uma experiencia frontend em tempo real.

## Claude como API JSON

Quando voce pensa em APIs de IA, provavelmente pensa em interfaces de chat. Mas o Claude e igualmente poderoso como gerador de dados estruturados. No Company Canvas, o Claude atua como um motor de analise de marca:

**Entrada:** `"Spotify"`

**Saida:**

```json
{
  "companyName": "Spotify",
  "colors": {
    "primary": "#1DB954",
    "secondary": "#191414",
    "accent": "#1ED760",
    "background": "#0a0a0a"
  },
  "tagline": "Music for everyone",
  "industry": "Music Streaming",
  "animationStyle": "flowing",
  "animationParams": { "speed": 1.2, "density": 0.7, "complexity": 0.6 }
}
```

Sem historico de conversa, sem streaming, sem follow-ups. Uma requisicao, uma resposta JSON. O LLM e uma funcao.

## Engenharia de Prompts para Confiabilidade

O maior desafio nao e fazer o Claude gerar bons dados — e fazer com que ele gere dados **consistentes**. Eis o que funcionou:

### 1. Schema explicito no prompt

Nao descreva a saida informalmente. Cole o schema JSON exato com tipos e restricoes. O Claude segue exemplos concretos muito melhor do que descricoes abstratas.

### 2. Criterios de decisao, nao intuicao

Em vez de "escolha um estilo apropriado", eu forneco uma tabela de mapeamento:

- `particles` → tech, SaaS, IA
- `flowing` → saude, natureza, logistica
- `geometric` → financas, enterprise
- `typographic` → midia, criativo

Isso elimina ambiguidade e torna os resultados previsiveis.

### 3. "Retorne APENAS JSON valido"

Essa unica instrucao elimina code fences em markdown, texto explicativo e desculpas. O Claude respeita isso quase perfeitamente.

### 4. Faixas numericas delimitadas

`"speed": <number 0.5-2.0>` e melhor que `"speed": <number>`. Sem limites, voce ocasionalmente recebe valores extremos que quebram animacoes.

## O Padrao Worker Proxy

Nunca exponha chaves de API em codigo client-side. Isso deveria ser obvio, mas ja vi em producao. O padrao:

```
Browser → Cloudflare Worker → Claude API
         (rate limit, validacao, proxy)
```

O Worker faz tres coisas:

1. **Rate limiting** — 10 requisicoes por minuto por IP. Um simples mapa em memoria com arrays de timestamps.
2. **Validacao de entrada** — O nome da empresa deve existir e ter menos de 100 caracteres.
3. **Proxy de API** — Encaminha para o Claude, faz parse da resposta, retorna JSON limpo.

Cloudflare Workers rodam no edge, entao a latencia e baixa independente de onde seus usuarios estao. O plano gratuito lida com milhares de requisicoes diarias.

## Lidando com a Imprevisibilidade da IA

LLMs sao probabilisticos. Mesmo com um prompt perfeito, coisas podem dar errado:

**JSON malformado:** Raramente, o Claude pode retornar JSON com uma virgula sobrando ou aspas faltando. Eu envolvo o `JSON.parse` em try/catch e retorno um 502 para o cliente, que mostra uma mensagem amigavel de "geracao falhou".

**Valores inesperados:** E se o Claude retornar `"animationStyle": "abstract"` — um estilo que nao existe no meu registro? O factory pattern lida com isso usando um fallback: `registry[style] ?? ParticlesAnimation`. Estilos desconhecidos degradam graciosamente para particles.

**Variacao de latencia:** Respostas do Claude variam de 1 a 4 segundos. A UI mostra uma animacao de loading com uma barra de progresso que se move em ritmo fixo. Os usuarios nao veem a latencia real da API — veem feedback suave.

## A Questao do Custo

Chamadas a API do Claude custam dinheiro. Para um projeto de portfolio, eu precisava que a economia funcionasse:

- Cada geracao usa ~400 tokens de entrada e ~300 tokens de saida
- No preco do Claude Sonnet, isso da aproximadamente $0,002 por geracao
- Uma taxa de download de $1 cobre ~500 geracoes

A matematica funciona. Mesmo com previews gratuitos generosos, os downloads pagos mais que cobrem os custos de API. A integracao com Stripe usa uma simples checkout session — sem assinaturas, sem cobranca recorrente. Um dolar, um download.

## O que Eu Faria Diferente?

**Adicionar cache.** Agora, gerar "Spotify" duas vezes faz duas chamadas de API com resultados ligeiramente diferentes. Um simples cache KV indexado por nome da empresa economizaria dinheiro e daria resultados consistentes.

**Fazer streaming da resposta.** Tres segundos de loading e aceitavel, mas fazer streaming dos campos JSON conforme chegam poderia permitir que a animacao comece a ser construida antes da resposta estar completa. A UI poderia mostrar as cores aparecendo, depois o tagline, depois a animacao girando.

**Usar tool_use.** O recurso de tool calling do Claude me permitiria definir o schema de saida mais formalmente, com saida JSON garantida. Eu construi isso antes do tool_use estar maduro, mas e a escolha certa agora.

Construir com APIs de IA me ensinou que os problemas interessantes nao estao na IA — estao na engenharia ao redor dela. Rate limiting, tratamento de erros, gestao de custos e design de UX importam tanto quanto o prompt.
