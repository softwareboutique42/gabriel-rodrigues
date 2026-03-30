---
title: 'Estilizar Scrollbar: De Hacks WebKit a Padroes W3C'
description: 'Minha resposta no Stack Overflow de 2015 usava pseudo-elementos ::-webkit-scrollbar para scrollbars customizadas. Em 2026, duas propriedades CSS padrao substituem dezenas de pseudo-elementos.'
date: 2026-03-29
tags: ['css', 'ux', 'stackoverflow', 'design']
lang: 'pt'
---

# Estilizar Scrollbar: De Hacks WebKit a Padroes W3C

Em 2015, respondi uma [pergunta no Stack Overflow em Portugues](https://pt.stackoverflow.com/questions/87413) sobre estilizar scrollbars com CSS. Recebeu 4 votos — um daqueles problemas onde a resposta funcionava perfeitamente no Chrome e nao funcionava em mais nenhum lugar.

Esse era o problema fundamental com estilizacao de scrollbar por quase uma decada. Era um mundo exclusivo do WebKit, e todos os outros estavam de fora.

## A Abordagem de 2015: Pseudo-Elementos WebKit

Estilizar scrollbars em 2015 significava usar uma familia de pseudo-elementos com prefixo de vendor que so Chrome e Safari entendiam:

```css
/* 2015: Os pseudo-elementos de scrollbar do WebKit */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 6px;
  border: 2px solid #1a1a1a;
}

::-webkit-scrollbar-thumb:hover {
  background: #888;
}

::-webkit-scrollbar-corner {
  background: #1a1a1a;
}
```

Ficava otimo no Chrome. O problema? Firefox exibia o scrollbar padrao do sistema. Internet Explorer tinha suas proprias propriedades `scrollbar-*` da era do IE5 que mal funcionavam. Todos os outros navegadores — Edge (pre-Chromium), Opera Mini, navegadores mobile — mostravam o que queriam.

### A Lista Completa de Pseudo-Elementos

A API de scrollbar do WebKit era surpreendentemente detalhada. Voce podia mirar:

- `::-webkit-scrollbar` — o scrollbar inteiro
- `::-webkit-scrollbar-track` — a trilha atras do thumb
- `::-webkit-scrollbar-thumb` — a alca arrastavel
- `::-webkit-scrollbar-track-piece` — as partes da trilha nao cobertas pelo thumb
- `::-webkit-scrollbar-corner` — a intersecao dos scrollbars horizontal e vertical
- `::-webkit-scrollbar-button` — as setas cima/baixo (quando presentes)

E cada um desses aceitava pseudo-classes de estado como `:hover`, `:active`, `:horizontal`, `:vertical`, `:increment`, `:decrement`. A matriz de combinacoes era enorme.

Na pratica, a maioria dos desenvolvedores usava tres: o scrollbar em si, a trilha e o thumb. Mas o fato de que voce precisava no minimo tres seletores para uma mudanca visual simples ja indicava que a API era superengenheirada para a maioria dos casos.

### O Problema do Firefox

Firefox nao tinha suporte CSS para scrollbar em 2015. As opcoes eram:

1. **Aceitar o scrollbar padrao** — tecnicamente ok, visualmente inconsistente
2. **Esconder o scrollbar e construir um customizado** — bibliotecas JavaScript como Perfect Scrollbar, SimpleBar, ou implementacoes customizadas usando `overflow: hidden` com container de scroll controlado por JavaScript
3. **Usar overlay especifico para Firefox** — alguns desenvolvedores colocavam uma div colorida sobre onde o scrollbar apareceria, o que era fragil e quebrava no resize

A maioria dos projetos escolhia opcao 1 ou 2. Opcao 2 significava adicionar uma dependencia JavaScript para uma preocupacao puramente visual, o que nunca pareceu certo.

## A Abordagem de 2026: Duas Propriedades, Suporte Total nos Navegadores

O W3C padronizou estilizacao de scrollbar com apenas duas propriedades:

```css
/* 2026: Estilizacao padrao de scrollbar */
.container {
  scrollbar-width: thin; /* auto | thin | none */
  scrollbar-color: #555 #1a1a1a; /* cor-thumb cor-trilha */
}
```

So isso. Duas propriedades substituem toda a familia de pseudo-elementos WebKit para o caso de uso mais comum.

### O Que Cada Propriedade Faz

**`scrollbar-width`** aceita tres valores:

- `auto` — scrollbar padrao do navegador
- `thin` — um scrollbar mais estreito (navegador determina o tamanho exato)
- `none` — esconde o scrollbar completamente (conteudo continua rolavel)

```css
/* Esconder scrollbar mas manter rolagem */
.horizontal-scroll {
  overflow-x: auto;
  scrollbar-width: none;
}
```

**`scrollbar-color`** recebe exatamente dois valores de cor:

- Primeiro valor: cor do thumb (a parte arrastavel)
- Segundo valor: cor da trilha (o fundo)

```css
/* Scrollbar tema escuro */
.dark-panel {
  scrollbar-color: #8eff71 #0e0e0e;
}

/* Scrollbar sutil que se mistura */
.sidebar {
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
```

### Suporte nos Navegadores

Em 2026, `scrollbar-width` e `scrollbar-color` funcionam em:

- Firefox (suporte desde 2019 — estavam a frente do padrao)
- Chrome/Edge (suporte desde 2024)
- Safari (suporte desde 2024)

Estilizacao de scrollbar cross-browser finalmente e real sem prefixos de vendor.

### scrollbar-gutter: A Propriedade Bonus

Existe uma terceira propriedade que resolve um problema de layout que ninguem falava em 2015:

```css
/* Reservar espaco para o scrollbar, prevenindo salto de layout */
.content {
  scrollbar-gutter: stable;
}

/* Reservar espaco nos dois lados para layout simetrico */
.centered-content {
  scrollbar-gutter: stable both-edges;
}
```

`scrollbar-gutter: stable` reserva a largura do scrollbar mesmo quando o conteudo nao transborda. Isso previne aquele salto irritante de layout que acontece quando o conteudo cresce o suficiente para acionar um scrollbar — a pagina inteira pula lateralmente pela largura do scrollbar.

Era um problema que todos conheciamos em 2015 mas nao tinhamos solucao limpa. O contorno usual era `overflow-y: scroll` para forcar um scrollbar permanentemente, o que ficava feio.

## Pseudo-Elementos WebKit vs Propriedades Padrao

| O Que Voce Quer     | 2015 (WebKit)                                      | 2026 (Padrao)                   |
| ------------------- | -------------------------------------------------- | ------------------------------- |
| Mudar cor do thumb  | `::-webkit-scrollbar-thumb { background: ... }`    | `scrollbar-color: thumb trilha` |
| Mudar cor da trilha | `::-webkit-scrollbar-track { background: ... }`    | `scrollbar-color: thumb trilha` |
| Deixar mais fino    | `::-webkit-scrollbar { width: 8px }`               | `scrollbar-width: thin`         |
| Esconder scrollbar  | `::-webkit-scrollbar { display: none }`            | `scrollbar-width: none`         |
| Bordas arredondadas | `::-webkit-scrollbar-thumb { border-radius: ... }` | Navegador cuida disso           |
| Efeitos de hover    | `::-webkit-scrollbar-thumb:hover { ... }`          | Nao disponivel (por design)     |

A API padrao e intencionalmente mais simples. Voce nao pode definir larguras exatas em pixels, nao pode adicionar border-radius e nao pode estilizar estados de hover. Isso foi uma decisao consciente — navegadores devem controlar a renderizacao exata para acessibilidade e consistencia de plataforma, enquanto desenvolvedores controlam as cores e aparencia geral.

### Quando Voce Ainda Precisa dos Pseudo-Elementos WebKit

Se seu design exige dimensoes de scrollbar pixel-perfect, border-radius customizado ou mudancas de estado hover/active, os pseudo-elementos WebKit ainda funcionam no Chromium e Safari. Alguns projetos usam ambos:

```css
/* Propriedades padrao para Firefox e futuro */
.panel {
  scrollbar-width: thin;
  scrollbar-color: #555 #1a1a1a;
}

/* Pseudo-elementos WebKit para polimento extra no Chromium/Safari */
.panel::-webkit-scrollbar {
  width: 8px;
}
.panel::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}
.panel::-webkit-scrollbar-thumb:hover {
  background: #888;
}
```

Esse padrao de progressive enhancement oferece estilizacao base cross-browser com visuais aprimorados onde suportado.

## A Conclusao

Estilizacao de scrollbar foi de um hack WebKit para um padrao W3C. Duas propriedades CSS — `scrollbar-width` e `scrollbar-color` — substituem dezenas de pseudo-elementos para o caso comum. Adicione `scrollbar-gutter` para estabilidade de layout, e voce tem uma solucao completa cross-browser que teria me economizado horas de malabarismo com prefixos de vendor em 2015. A API padrao e deliberadamente mais simples que a do WebKit, e isso e uma feature, nao uma limitacao.
