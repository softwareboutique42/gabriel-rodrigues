---
title: 'Pick List / Dual Listbox: De jQuery Sortable a Drag-and-Drop Headless'
description: 'Minha resposta no Stack Overflow sobre construir um pick list dual listbox recebeu 5 votos. Em 2026, bibliotecas headless UI e a API nativa de drag-and-drop tornam esse padrao acessivel por padrao.'
date: 2026-03-29
tags: ['ui', 'ux', 'javascript', 'stackoverflow']
lang: 'pt'
---

# Pick List / Dual Listbox: De jQuery Sortable a Drag-and-Drop Headless

Respondi uma pergunta no Stack Overflow em Portugues sobre construir um pick list — aquele padrao de dual listbox onde usuarios movem itens entre duas colunas. Recebeu 5 votos, porque esse componente de UI aparecia em todo app enterprise e ninguem encontrava um jeito limpo de construi-lo.

A solucao funcionava com o que tinhamos na epoca. Mas o ferramental mudou tanto que o mesmo padrao agora e quase trivial de implementar corretamente.

## O Problema de 2016: jQuery UI Sortable e Manipulacao Manual de DOM

A abordagem padrao era jQuery UI Sortable com listas conectadas:

```javascript
// 2016: Listas sortable conectadas com jQuery UI
$('#available, #selected')
  .sortable({
    connectWith: '.connectable',
    placeholder: 'ui-state-highlight',
    receive: function (event, ui) {
      updateHiddenField();
    },
  })
  .disableSelection();
```

```html
<ul id="available" class="connectable">
  <li>Item A</li>
  <li>Item B</li>
</ul>
<button onclick="moveSelected()">→</button>
<button onclick="moveBack()">←</button>
<ul id="selected" class="connectable"></ul>
```

Voce tambem precisava de botoes de seta para usuarios que nao sabiam que podiam arrastar. E a funcao `moveSelected()` era sempre uma bagunca — clonando nos DOM manualmente, removendo originais, atualizando campos hidden que realmente enviavam os dados.

## O Que Tornava Doloroso

O dual listbox era uma tempestade perfeita de desafios de UI:

1. **Acessibilidade era secundaria** — jQuery UI Sortable nao tinha suporte ARIA. Leitores de tela nao conseguiam informar o usuario do que estava acontecendo durante operacoes de arraste
2. **Estado vivia no DOM** — A fonte de verdade era a lista de elementos `<li>`, nao uma estrutura de dados JavaScript. Cada operacao era uma mutacao no DOM
3. **Mobile era quebrado** — jQuery UI Sortable nao suportava eventos touch nativamente. Voce precisava do jquery.ui.touch-punch.js, que era um hack em cima de outro hack
4. **Submissao de formulario era fragil** — Voce tinha que sincronizar a lista visivel com inputs hidden a cada mudanca, e torcer para nada ficar fora de sincronia

Vi implementacoes onde a atualizacao do campo hidden falhava silenciosamente, e usuarios organizavam cuidadosamente suas selecoes so para submeter uma lista vazia. Bons tempos.

## A Abordagem de 2026: Headless UI e APIs Nativas

### Componentes Listbox Headless

Bibliotecas de UI modernas separam comportamento de apresentacao:

```jsx
// 2026: Dual listbox headless com acessibilidade adequada
function DualListbox({ options, selected, onChange }) {
  return (
    <div role="group" aria-label="Selecao de itens">
      <Listbox
        aria-label="Itens disponiveis"
        items={options.filter((o) => !selected.includes(o.id))}
        onSelect={(items) => onChange([...selected, ...items])}
      />
      <div role="toolbar">
        <button aria-label="Mover selecionados para escolhidos">→</button>
        <button aria-label="Remover selecionados dos escolhidos">←</button>
      </div>
      <Listbox
        aria-label="Itens selecionados"
        items={options.filter((o) => selected.includes(o.id))}
        onSelect={(items) => onChange(selected.filter((s) => !items.includes(s)))}
      />
    </div>
  );
}
```

O estado vive no JavaScript. A UI e uma projecao desse estado. Sem manipulacao de DOM.

### Drag and Drop Nativo com ARIA Live Regions

```html
<!-- 2026: ARIA live region anuncia operacoes de arraste -->
<div aria-live="polite" class="sr-only" id="drag-announce"></div>
```

```javascript
// Anuncia operacoes de arraste para leitores de tela
element.addEventListener('dragstart', () => {
  document.getElementById('drag-announce').textContent =
    `Arrastando ${item.name}. Solte na lista selecionada para adicionar.`;
});
```

A API nativa de Drag and Drop agora funciona em dispositivos touch. Combinada com ARIA live regions, usuarios de leitores de tela recebem feedback em tempo real sobre o que esta acontecendo.

## O Que Mudou

O padrao do pick list em si nao mudou — usuarios ainda movem itens entre duas colunas. O que mudou e que o gerenciamento de estado migrou do DOM para o JavaScript, acessibilidade se tornou uma preocupacao de primeira classe ao inves de um retrofit, e suporte touch vem de graca com APIs da plataforma.

Aquela resposta no Stack Overflow resolveu o problema de implementacao imediato. Mas a licao maior e que padroes interativos complexos so se tornam confiaveis quando o modelo de dados e separado da apresentacao.
