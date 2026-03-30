---
title: 'CSS @import vs link: O Debate Que CSS Layers Ressuscitou'
description: 'Minha pergunta no Stack Overflow de 2015 sobre incluir stylesheets tinha resposta clara: use link. Em 2026, @import encontrou novo propósito com @layer.'
date: 2026-03-29
tags: ['css', 'performance', 'stackoverflow', 'desenvolvimento-web']
lang: 'pt'
---

# CSS @import vs link: O Debate Que CSS Layers Ressuscitou

Em 2015, fiz uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/100133) sobre a diferença entre `@import` e `<link>` para incluir arquivos CSS. Recebeu 12 votos. A resposta era unânime: não use `@import`.

## A Resposta de 2015: @import É Lento

O problema era o efeito cascata de requisições. Uma tag `<link>` permite que o navegador descubra todas as stylesheets em paralelo ao escanear o HTML. Mas `@import` esconde dependências dentro de arquivos CSS — o navegador só as encontra depois de baixar e parsear a stylesheet pai.

```html
<!-- Bom: navegador descobre ambos num parse do HTML -->
<link rel="stylesheet" href="reset.css" />
<link rel="stylesheet" href="main.css" />
```

```css
/* Ruim: navegador descobre reset.css só após baixar main.css */
@import url('reset.css');
/* ... resto do main.css */
```

Steve Souders chamou `@import` de uma das piores práticas de performance CSS. O conselho era simples: sempre use `<link>`.

## A Virada de 2026: @import e @layer

CSS Cascade Layers mudou a equação. A feature `@layer` permite definir prioridades explícitas de cascata, e `@import` é como você atribui arquivos externos a layers:

```css
/* Importar estilos de terceiros em layer de baixa prioridade */
@import url('vendor/normalize.css') layer(reset);
@import url('vendor/component-library.css') layer(components);

/* Seus estilos automaticamente vencem sobre imports em layers */
@layer reset, components, custom;

.button {
  /* Isso sempre sobrescreve estilos da component-library,
     independente de especificidade */
  background: var(--color-neon);
}
```

Não dá para fazer isso só com tags `<link>`. Embora exista uma proposta de atributo `layer` para `<link>`, `@import` com `layer()` é o padrão estabelecido em 2026.

### Mas Bundlers Tornam a Questão Acadêmica

Em produção, ferramentas de build (Vite, Lightning CSS, PostCSS) resolvem statements `@import` em tempo de build, inlining tudo num único arquivo. O problema de waterfall desaparece porque não há nada para cascatear — é tudo um arquivo.

```css
/* Em desenvolvimento: @import chains legíveis */
@import url('./tokens.css') layer(tokens);
@import url('./reset.css') layer(reset);
@import url('./components.css') layer(components);

/* Em produção: bundled num arquivo, zero requisições extras */
```

## Quando Usar Cada Um em 2026

| Método                  | Usar quando                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| `<link>`                | Carregar stylesheets independentes sem necessidade de ordenação por layer |
| `@import` com `layer()` | Controlar prioridade de cascata de CSS externo                            |
| Imports via bundler     | Sempre em produção (automático)                                           |

## Conclusão

Em 2015, `@import` era um erro de performance. Em 2026, é uma ferramenta de gerenciamento de cascata — quando combinado com `@layer`. A preocupação com performance é válida mas acadêmica: bundlers inlinam tudo em produção de qualquer forma. A verdadeira questão mudou de "como carregar CSS" para "como controlar a cascata."
