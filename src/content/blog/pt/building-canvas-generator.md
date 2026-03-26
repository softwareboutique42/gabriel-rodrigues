---
title: 'Construindo um Gerador de Animacoes Canvas com IA'
description: 'Como eu construi o Company Canvas — uma ferramenta que transforma qualquer nome de empresa em uma animacao de marca usando Claude AI e Three.js.'
date: 2026-03-25
tags: ['three.js', 'ia', 'canvas', 'projeto']
lang: 'pt'
---

# Construindo um Gerador de Animacoes Canvas com IA

O que acontece quando voce digita "Spotify" em um campo de texto e clica em Gerar? Em cerca de tres segundos, voce recebe uma animacao canvas viva que captura a essencia da marca — cores, estilo de movimento e energia — tudo gerado por IA.

Esse e o **Company Canvas**, e esta e a historia de como eu o construi.

## A Ideia

Eu queria uma peca de portfolio que nao fosse apenas mais uma pagina estatica. Algo que demonstrasse engenharia real: integracao com IA, creative coding e pensamento de produto, tudo em um.

O conceito: digite o nome de uma empresa, deixe a IA inferir a identidade da marca (cores, industria, vibe), depois renderize como uma animacao Three.js em tempo real. Sem logos, sem assets — apenas visuais generativos puros.

## Decisoes de Arquitetura

### Por que Astro + Cloudflare Workers

Meu portfolio ja roda com Astro no GitHub Pages. Estatico, rapido, custo zero. Mas geracao com IA precisa de um servidor — voce nao pode expor chaves de API em codigo client-side.

Cloudflare Workers resolveram isso perfeitamente:

- **Plano gratuito** cobre milhares de requisicoes/dia
- **Deploy no edge** significa baixa latencia mundial
- Atua como proxy seguro entre o cliente e a API do Claude

A arquitetura e simples: Astro serve o frontend estatico, o cliente faz POST para o Worker, o Worker chama o Claude e retorna dados estruturados da marca.

### Por que Three.js com Camera Ortografica

Para animacoes estilo 2D, Three.js com camera ortografica te da o melhor dos dois mundos: renderizacao acelerada por GPU com a simplicidade de coordenadas 2D. Sem distorcao de perspectiva, facil de raciocinar sobre posicoes, e voce tem acesso a todo o ecossistema Three.js (particulas, shaders, pos-processamento).

A alternativa era Canvas 2D puro, mas Three.js me deu particulas com additive blending de graca, o que faz as animacoes estilo tech brilharem.

## O Sistema de Animacoes

Eu projetei quatro estilos de animacao, cada um mapeado para diferentes industrias:

| Estilo          | Industrias                 | Carater Visual                           |
| --------------- | -------------------------- | ---------------------------------------- |
| **Particles**   | Tech, SaaS, IA             | Campos de particulas dinamicos com ondas |
| **Flowing**     | Saude, Natureza, Logistica | Curvas senoidais organicas que ondulam   |
| **Geometric**   | Financas, Enterprise       | Aneis estruturados com movimento orbital |
| **Typographic** | Midia, Criativo            | Grades de tiles coloridos com pulsos     |

Cada animacao estende uma classe abstrata `BaseAnimation` que lida com setup, o loop continuo de 12 segundos e disposal. O factory pattern mapeia strings de estilo para classes de animacao:

```typescript
const registry: Record<string, new () => BaseAnimation> = {
  particles: ParticlesAnimation,
  flowing: FlowingAnimation,
  geometric: GeometricAnimation,
  typographic: TypographicAnimation,
};
```

### Fazendo as Animacoes Parecerem Vivas

O segredo esta nos parametros. O Claude nao apenas escolhe um estilo — ele retorna valores de `speed`, `density` e `complexity` ajustados para a marca. Uma fintech rapida recebe alta velocidade e densidade. Uma marca de bem-estar recebe movimento lento, esparso e organico.

Toda animacao faz loop perfeitamente a cada 12 segundos usando tempo modular: `elapsed % LOOP_DURATION`. Isso significa que a animacao pode rodar para sempre sem drift ou acumulo de erros de ponto flutuante.

## O Prompt do Claude

Obter JSON estruturado de um LLM de forma consistente depende totalmente do prompt. Aqui esta o insight chave: seja extremamente especifico sobre o schema e de ao modelo criterios claros de decisao.

O prompt diz ao Claude para retornar JSON exato (sem wrapping em markdown), especifica o tipo e restricoes de cada campo, e inclui um guia de selecao de estilo mapeando industrias para tipos de animacao. Para empresas conhecidas, o Claude usa as cores reais da marca. Para nomes desconhecidos, ele infere a partir do nome e provavel industria.

O resultado e notavelmente consistente. De centenas de geracoes, vi talvez duas respostas malformadas — e essas foram tratadas pelo estado de erro.

## O que Aprendi

**IA como parceiro criativo funciona.** As identidades de marca geradas sao frequentemente surpreendentemente boas. O Claude escolhe cores que parecem certas, escreve taglines que capturam a essencia e combina estilos de animacao com industrias com boa intuicao.

**Saida estruturada de LLMs e confiavel o suficiente para producao.** Com um prompt bem elaborado e um schema claro, voce pode construir produtos reais em cima de JSON gerado por LLM. Basta adicionar validacao e tratamento de erros gracioso.

**Three.js e exagero para algumas coisas e perfeito para outras.** Para um sistema de particulas 2D, e exagero. Mas no momento em que voce quer additive blending, milhares de objetos animados ou 60fps com movimento complexo — ele justifica o tamanho do bundle.

O codigo completo esta no meu [GitHub](https://github.com/gabriel-rodrigues). Experimente voce mesmo em [gabriel-rodrigues.com/pt/canvas](/pt/canvas/).
