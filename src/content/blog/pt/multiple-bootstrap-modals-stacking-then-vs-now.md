---
title: 'Múltiplos Modais Bootstrap: Da Guerra de z-index aos Diálogos Nativos'
description: 'De uma pergunta no Stack Overflow de 2015 sobre empilhar modais Bootstrap com hacks de z-index ao elemento nativo <dialog> e a API top-layer em 2026.'
date: 2026-03-29
tags: ['bootstrap', 'javascript', 'ux', 'stackoverflow']
lang: 'pt'
---

# Múltiplos Modais Bootstrap: Da Guerra de z-index aos Diálogos Nativos

Lá em 2015, fiz uma pergunta no Stack Overflow em Português sobre empilhar múltiplos modais do Bootstrap. O problema era dolorosamente comum: você abre um modal, depois precisa abrir outro por cima — talvez uma confirmação ou uma visualização de detalhe. O Bootstrap não foi feito para isso. A pergunta recebeu 13 votos porque todo desenvolvedor Bootstrap esbarrava nesse muro em algum momento.

Os workarounds eram feios, e o fato de precisarmos deles diz muito sobre o quanto a plataforma evoluiu.

## O Problema de 2015: Caos de z-index

Os modais do Bootstrap usavam um valor fixo de `z-index` tanto para o modal quanto para o backdrop (aquela sobreposição escura). Quando você abria um segundo modal, ele renderizava atrás do backdrop do primeiro, ficando impossível de clicar. O empilhamento de backdrops simplesmente não funcionava.

As "soluções" que circulavam eram todas gambiarras:

```javascript
// Incrementar z-index manualmente para cada novo modal
$(document).on('show.bs.modal', '.modal', function () {
  var zIndex = 1040 + 10 * $('.modal:visible').length;
  $(this).css('z-index', zIndex);
  setTimeout(function () {
    $('.modal-backdrop')
      .not('.modal-stacked')
      .css('z-index', zIndex - 1)
      .addClass('modal-stacked');
  }, 0);
});
```

Você ficava ouvindo modais abrindo, contando quantos estavam visíveis e ajustando manualmente o `z-index` do modal e do backdrop. Algumas soluções iam além — ajustando padding do body, gerenciando scroll lock, tratando o evento `hidden.bs.modal` para restaurar estados de modais anteriores.

Era frágil. Cada caso especial — fechar o modal do topo, pressionar Escape, clicar no backdrop — precisava de tratamento especial. E se você errasse a conta do z-index, acabava com um backdrop cobrindo tudo e sem como interagir com a página.

## Por Que Era Tão Difícil

O problema fundamental era que `z-index` no CSS cria contextos de empilhamento, e esses contextos são relativos aos elementos pais. Não existia o conceito de "coloque este elemento acima de absolutamente tudo na página". Você tinha que gerenciar manualmente uma hierarquia global de z-index, e cada biblioteca na página podia estar competindo pelas mesmas faixas de valores.

O modal do Bootstrap também era fortemente acoplado ao jQuery, ao DOM e à suposição de um backdrop único. A arquitetura simplesmente não suportava empilhamento.

## O Que Mudou: `<dialog>` Nativo e Top Layer

O HTML agora tem o elemento `<dialog>`, e quando você chama `showModal()`, o navegador coloca ele em algo chamado **top layer**. O top layer fica acima de tudo no documento — acima de todos os contextos de empilhamento z-index, acima de todos os outros elementos. Ponto final.

```html
<dialog id="confirmar">
  <h2>Tem certeza?</h2>
  <button onclick="this.closest('dialog').close()">Sim</button>
</dialog>

<script>
  document.getElementById('confirmar').showModal();
</script>
```

Múltiplos diálogos abertos com `showModal()` empilham naturalmente. Cada um vai para o top layer em ordem. O navegador gerencia o empilhamento, o aprisionamento de foco e o backdrop. Sem matemática de z-index. Sem gambiarras em JavaScript.

O pseudo-elemento `::backdrop` dá controle total de estilo:

```css
dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
```

Cada diálogo tem seu próprio backdrop, devidamente empilhado. Você pode estilizá-los de forma diferente, animá-los, e o navegador cuida da ordenação.

### Gerenciamento de Foco de Graça

Quando um `<dialog>` abre via `showModal()`, o navegador aprisiona o foco dentro dele. Tab e Shift+Tab percorrem os elementos focáveis do diálogo. Quando o diálogo fecha, o foco volta para o elemento que o abriu. Em 2015, escrevíamos dezenas de linhas de JavaScript para aproximar esse comportamento — e geralmente errávamos nos casos especiais.

### Escape, Clique Fora

Pressionar Escape fecha o diálogo do topo. Você pode ouvir o evento `close` para fazer limpeza. Clique no backdrop pode ser tratado com um padrão simples — verificando se o alvo do clique é o próprio elemento dialog (não seus filhos).

## A Lição

Passamos anos construindo workarounds em JavaScript para o que acabou sendo uma primitiva faltando na plataforma. O elemento `<dialog>` com `showModal()` e a API top layer resolveram empilhamento de modais, aprisionamento de foco, gerenciamento de backdrop e acessibilidade de uma vez só.

Se você ainda está usando modais do Bootstrap em 2026, está lutando uma batalha que o navegador já venceu. O `<dialog>` nativo faz menos — sem animações prontas, sem transições sofisticadas — mas a base é sólida. Coloque seu próprio CSS por cima, e nunca mais vai precisar contar valores de z-index.
