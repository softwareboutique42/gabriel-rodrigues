---
title: 'Mostrar/Esconder Divs com Radio Buttons: CSS :has() Substitui JS'
description: 'Minha resposta no SO de 2015 usava jQuery para mostrar/esconder divs por radio button. CSS :has() faz isso com zero JavaScript em 2026.'
date: 2026-03-29
tags: ['html', 'css', 'javascript', 'stackoverflow']
lang: 'pt'
---

# Mostrar/Esconder Divs com Radio Buttons: CSS :has() Substitui JS

Em 2015, respondi uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/80540) sobre mostrar ou esconder seções de conteúdo com base no radio button selecionado. Recebeu 4 votos.

## A Abordagem de 2015: Evento change do jQuery

```html
<input type="radio" name="plano" value="basico" /> Básico
<input type="radio" name="plano" value="pro" /> Pro

<div id="basico-details">Conteúdo plano básico</div>
<div id="pro-details" style="display:none">Conteúdo plano pro</div>
```

```javascript
$('input[name="plano"]').on('change', function () {
  $('#basico-details, #pro-details').hide();
  $('#' + this.value + '-details').show();
});
```

Funciona bem. Padrão jQuery de exibição condicional de 2015.

## A Abordagem de 2026: CSS :has() — Zero JavaScript

O seletor `:has()`, agora suportado em todos os navegadores principais, permite estilizar um elemento baseado no que ele contém:

```html
<form>
  <input type="radio" name="plano" id="basico" value="basico" />
  <label for="basico">Básico</label>
  <input type="radio" name="plano" id="pro" value="pro" />
  <label for="pro">Pro</label>

  <div class="painel" id="basico-details">Conteúdo plano básico</div>
  <div class="painel" id="pro-details">Conteúdo plano pro</div>
</form>
```

```css
/* Esconder todos os painéis por padrão */
.painel {
  display: none;
}

/* Mostrar painel básico quando radio básico está marcado */
form:has(#basico:checked) #basico-details {
  display: block;
}

/* Mostrar painel pro quando radio pro está marcado */
form:has(#pro:checked) #pro-details {
  display: block;
}
```

Sem JavaScript. Sem event listeners. O navegador trata o show/hide reativamente.

## Conclusão

Em 2015, exibição condicional exigia JavaScript. Em 2026, CSS `:has()` trata visibilidade baseada em estado reativamente. O padrão jQuery ainda funciona perfeitamente — mas se quer zero JS, a plataforma finalmente suporta nativamente.
