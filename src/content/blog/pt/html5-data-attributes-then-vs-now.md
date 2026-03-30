---
title: 'Atributos data-* HTML5: De Conveniência jQuery a Arquitetura de Framework'
description: 'Minha resposta no SO de 2016 mostrou atributos data-* com jQuery .data(). Em 2026, Alpine.js e htmx os usam como sua API inteira.'
date: 2026-03-29
tags: ['html', 'javascript', 'stackoverflow', 'dom']
lang: 'pt'
---

# Atributos data-\* HTML5: De Conveniência jQuery a Arquitetura de Framework

Em 2016, respondi uma pergunta no Stack Overflow em Português sobre atributos `data-*` do HTML5. Recebeu 6 votos. Na época, a maioria dos desenvolvedores ou não sabia sobre eles, ou dependia do `.data()` do jQuery sem pensar em como funcionavam.

## A Resposta de 2016: Armazenando Dados no Markup

Atributos `data-*` permitem armazenar dados customizados diretamente em elementos HTML:

```html
<button data-user-id="42" data-action="delete" data-confirm="Tem certeza?">Deletar Usuário</button>
```

O prefixo `data-` diz ao navegador que é dado customizado, não atributo oficial.

**Lendo com jQuery** (abordagem 2016):

```javascript
$('button').on('click', function () {
  var userId = $(this).data('user-id'); // '42' (conversão camelCase)
});
```

**Com JavaScript nativo via dataset**:

```javascript
button.addEventListener('click', () => {
  const userId = button.dataset.userId; // data-user-id → dataset.userId
});
```

## A Realidade de 2026: data-\* como Arquitetura de Framework

Em 2026, atributos `data-*` são a fundação de frameworks inteiros.

**Alpine.js** usa como toda sua API:

```html
<div x-data="{ aberto: false }">
  <button @click="aberto = !aberto">Toggle</button>
  <div x-show="aberto">Conteúdo</div>
</div>
```

**htmx** adiciona comportamento AJAX diretamente no HTML:

```html
<button hx-post="/api/delete" hx-target="#resultado" hx-confirm="Tem certeza?">Deletar</button>
```

Ambos escolheram atributos `data-*` porque os dados ficam com o elemento que controlam. Sem arquivo JavaScript separado para interações simples.

## Conclusão

Atributos `data-*` migraram de "conveniência jQuery para guardar IDs" para "a camada de markup de uma web progressivamente aprimorada." São a ponte entre HTML e comportamento — e em 2026, frameworks inteiros são construídos sobre essa ponte.
