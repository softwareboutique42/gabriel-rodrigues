---
title: 'jQuery DOM Traversal para Vanilla JS: siblings(), next() e Além'
description: 'Minha resposta no Stack Overflow explicava siblings() e next() do jQuery. Em 2026, métodos nativos como closest() e :has() cobrem tudo que jQuery oferecia.'
date: 2026-03-29
tags: ['javascript', 'jquery', 'dom', 'stackoverflow']
lang: 'pt'
---

# jQuery DOM Traversal para Vanilla JS: siblings(), next() e Além

Respondi uma pergunta no Stack Overflow em Português sobre os métodos `siblings()` e `next()` do jQuery — como funcionam, quando usar cada um. Recebeu 7 votos. Naquela época, jQuery não era só popular; era a forma padrão de interagir com o DOM. Ninguém questionava se você precisava dele.

## O Antes: jQuery Como a API do DOM

A pergunta era sobre navegar entre elementos irmãos. No jQuery, era elegante:

```javascript
// Pega todos os irmãos de um elemento
$('.current').siblings().addClass('faded');

// Pega o próximo irmão
$('.current').next().addClass('highlighted');

// Pega o irmão anterior
$('.current').prev().addClass('highlighted');

// Pega todos os próximos irmãos até um match
$('.current').nextUntil('.stop').addClass('selected');

// Sobe até um pai
$('.current').closest('.container').addClass('active');

// Filtra irmãos
$('.current')
  .siblings('.item')
  .each(function () {
    $(this).toggle();
  });
```

Isso era genuinamente bom design de API. Os métodos de traversal do jQuery eram encadeáveis, legíveis e consistentes. A API nativa do DOM em 2012-2016 parecia primitiva em comparação — `nextSibling` retornava text nodes, `parentNode` não filtrava, e não existia `closest()`.

As pessoas não usavam jQuery por preguiça. Usavam porque a alternativa nativa era dolorosa.

## O Agora: O DOM Nativo Alcançou

Em 2026, todo método de traversal do jQuery tem um equivalente nativo igualmente limpo:

```javascript
const el = document.querySelector('.current');

// Próximo elemento irmão (pula text nodes automaticamente)
el.nextElementSibling.classList.add('highlighted');

// Elemento irmão anterior
el.previousElementSibling.classList.add('highlighted');

// Ancestral mais próximo que bate com um seletor
el.closest('.container').classList.add('active');

// Todos os irmãos — sem método direto, mas padrão fácil
const siblings = [...el.parentElement.children].filter((child) => child !== el);
siblings.forEach((sib) => sib.classList.add('faded'));

// QuerySelector a partir de um pai
el.parentElement.querySelectorAll('.item').forEach((item) => {
  item.classList.toggle('visible');
});
```

### O :has() Mudou o Jogo

O CSS `:has()` — disponível em todos os browsers desde 2023 — eliminou categorias inteiras de traversal JavaScript:

```css
/* Estiliza um pai baseado nos filhos — sem JS */
.container:has(.current) {
  border-color: var(--highlight);
}

/* Estiliza irmãos de um input checked */
.item:has(+ .item.active) {
  opacity: 0.5;
}

/* Estilização condicional complexa que antes precisava de jQuery */
.nav:has(.dropdown:hover) .backdrop {
  display: block;
}
```

Coisas que precisavam de chamadas `siblings()` e toggle de classes no jQuery agora são CSS puro.

### Padrões Modernos Substituem Traversal

A mudança mais profunda é arquitetural. No React, Vue ou Svelte, você raramente percorre o DOM:

```javascript
// Em vez de percorrer irmãos, você gerencia estado
const [activeIndex, setActiveIndex] = useState(0);

items.map((item, i) => <div className={i === activeIndex ? 'active' : 'faded'}>{item.label}</div>);
```

## O Que Aprendi

O traversal do jQuery era um sintoma de uma API do DOM que não foi projetada pra desenvolvimento de aplicações. Os vendors de browsers viram o que os devs precisavam e eventualmente entregaram nativamente: `closest()`, `nextElementSibling`, `:has()`, `classList`, `querySelectorAll()`.

Minha resposta no Stack Overflow ensinava o jeito jQuery. Hoje, eu diria: aprenda a API nativa primeiro. Não estamos mais em 2014 — a plataforma alcançou, e os 30KB extras do jQuery não compram quase nada.
