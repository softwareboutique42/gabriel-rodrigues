---
title: 'De Projeto Pessoal a Micro-Produto: Adicionando Pagamentos a um Site Portfolio'
description: 'Como transformei uma vitrine de portfolio em um micro-produto que gera receita com Stripe, versionamento e um preco de $1.'
date: 2026-03-25
tags: ['stripe', 'produto', 'cloudflare', 'negocios']
lang: 'pt'
---

# De Projeto Pessoal a Micro-Produto: Adicionando Pagamentos a um Site Portfolio

A maioria dos desenvolvedores constroi projetos de portfolio para mostrar habilidades. Eu quis ir um passo alem: fazer gerar receita. Nao dinheiro que muda a vida — apenas o suficiente para cobrir custos de API e provar o conceito.

Veja como transformei um gerador de animacoes canvas em um micro-produto com preco de $1.

## Por que Cobrar?

Toda vez que alguem gera uma animacao, me custa cerca de $0,002 em taxas de API do Claude. E pouco, mas acumula:

- 100 geracoes/dia = $0,20/dia = $6/mes
- Viralizar no Twitter = centenas de dolares em chamadas de API

O modelo de preview gratuito resolve isso: **gere de graca, pague para baixar.** Os usuarios podem brincar com a ferramenta infinitamente. O custo da API se justifica pelo engajamento. Mas baixar um arquivo HTML polido e autossuficiente? Esse e o valor que vale $1.

## Escolhendo Stripe Checkout

Eu avaliei tres opcoes:

| Opcao                    | Pros                            | Contras                     |
| ------------------------ | ------------------------------- | --------------------------- |
| **Stripe Checkout**      | Pagina hospedada, cuida de tudo | Fluxo de redirecionamento   |
| **Stripe Payment Links** | Zero codigo                     | Sem controle programatico   |
| **LemonSqueezy**         | Conformidade fiscal inclusa     | Mais uma dependencia vendor |

Stripe Checkout venceu. Ele lida com a pagina de pagamento, recibos, deteccao de fraude e reembolsos. Eu nao toco em numeros de cartao. A integracao e uma unica chamada de API para criar a checkout session e uma unica chamada para verificar o pagamento no retorno.

## O Fluxo de Pagamento

Aqui esta a jornada completa do usuario:

1. Usuario digita nome da empresa, clica em Gerar
2. Animacao renderiza — **gratis**
3. Usuario clica em "Download ($1)"
4. Frontend faz POST para o Worker `/checkout` com a config da animacao
5. Worker cria uma Stripe Checkout session, retorna a URL hospedada
6. Usuario paga na pagina do Stripe
7. Stripe redireciona de volta com `?session_id=xxx`
8. Frontend chama Worker `/download?session_id=xxx`
9. Worker verifica pagamento via API do Stripe
10. Worker retorna a config, frontend gera HTML e dispara o download

O insight chave: **a config da animacao e armazenada nos metadados da sessao do Stripe**, nao em um banco de dados. O Stripe se torna tanto o processador de pagamento quanto o armazenamento de dados. Sem KV, sem banco de dados, sem infraestrutura extra.

## Implementacao Sem Banco de Dados

Os metadados da sessao do Stripe aceitam ate 500 caracteres por chave. Um JSON blob de CompanyConfig tem cerca de 400-600 bytes. Eu divido em duas chaves de metadados (`config_1`, `config_2`) e remonto no download.

Isso significa:

- Nenhum banco de dados para gerenciar
- Nenhum token expirando para lidar
- Verificacao de pagamento e recuperacao de dados acontecem em uma unica chamada de API
- O sistema e stateless — o Worker tem zero estado persistente

## O Sistema de Versoes

Eu construi um seletor de versao no formulario de geracao. Agora so tem a v1, mas a arquitetura suporta versoes futuras:

```typescript
const VERSIONS = [
  { id: 'v1', label: 'v1 — Classic', styles: ['particles', 'flowing', 'geometric', 'typographic'] },
  // Futuro: v2 com animacoes baseadas em shaders, v3 com audio-reativas, etc.
];
```

Por que construir versionamento antes de precisar? Porque muda a narrativa do produto. Em vez de "aqui esta uma ferramenta", vira "aqui esta uma ferramenta que esta ficando melhor." Usuarios que pagaram pela v1 tem motivo para voltar para a v2.

O ID da versao viaja por todo o pipeline: selecionado no dropdown, enviado para o Worker, armazenado nos metadados do Stripe, embutido no HTML exportado. Isso significa que eu sempre posso rastrear qual versao produziu uma determinada animacao.

## O Export Autossuficiente

O arquivo HTML baixado e completamente standalone. Ele inclui:

- A biblioteca Three.js carregada de um CDN
- O codigo da animacao inline como module script
- A config da marca embutida como JSON
- Nome da empresa e tagline sobrepostos no canvas
- Uma pequena marca d'agua: "Company Canvas v1 — gabriel-rodrigues.com"

Abra em qualquer navegador e a animacao toca. Sem servidor, sem dependencias, sem expiracao. E um arquivo que voce possui.

## Protecao Legal

IA gera conteudo baseado em nomes de empresas, o que toca territorio de marcas registradas. O disclaimer e curto:

> Animacoes geradas sao criadas por IA e fornecidas como estao. Sem responsabilidade por conteudo, precisao ou uso. Sem endosso ou afiliacao com as empresas nomeadas. Ao baixar, voce concorda com estes termos.

Nao e a prova de balas, mas estabelece que a saida e gerada por IA, nao-oficial e use-por-sua-conta-e-risco.

## O que Eu Adicionaria

**Analytics de uso.** Quais empresas as pessoas mais geram? Esses dados podem informar para quais industrias otimizar as animacoes.

**Precos em volume.** Uma agencia gerando 50 animacoes deveria pagar menos por unidade. Um simples desconto por volume via pricing de quantidade do Stripe.

**Export de video.** Alguns usuarios querem MP4, nao HTML. Renderizacao server-side com Puppeteer ou um pipeline canvas-to-video habilitaria isso, mas e significativamente mais infraestrutura.

**Modo afiliado/embed.** Permitir que pessoas incorporem o gerador de animacoes em seus proprios sites com divisao de receita. Isso transforma a ferramenta em uma plataforma.

## Os Numeros que Importam

A economia de um micro-produto e refrescantemente simples:

- **Custo por geracao:** ~$0,002
- **Receita por download:** $1,00
- **Break-even:** 1 download cobre ~500 geracoes
- **Custo de infraestrutura:** $0 (Cloudflare free tier + GitHub Pages)
- **Taxa Stripe por transacao:** $0,30 + 2,9% = $0,33
- **Liquido por download:** $0,67

Nao vai substituir um salario. Mas prova algo importante: voce pode lancar um produto em um fim de semana, sem infraestrutura backend, e ter ele gerando receita desde o primeiro dia.

O codigo e open source. O produto esta no ar. Experimente em [gabriel-rodrigues.com/pt/canvas](/pt/canvas/).
