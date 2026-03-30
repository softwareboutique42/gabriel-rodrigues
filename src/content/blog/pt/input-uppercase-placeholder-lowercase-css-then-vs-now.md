---
title: 'Input Maiúsculo + Placeholder Minúsculo: Uma Dor de Cabeça CSS, Resolvida'
description: 'De uma pergunta no Stack Overflow sobre text-transform: uppercase quebrando o estilo do placeholder ao pseudo-elemento ::placeholder totalmente padronizado em 2026.'
date: 2026-03-29
tags: ['css', 'formulários', 'stackoverflow', 'ux']
lang: 'pt'
---

# Input Maiúsculo + Placeholder Minúsculo: Uma Dor de Cabeça CSS, Resolvida

Fiz uma pergunta no Stack Overflow em Português sobre uma peculiaridade do CSS que deixava desenvolvedores de formulários loucos: você colocava `text-transform: uppercase` num campo input para o texto digitado aparecer em maiúsculas, mas o texto do placeholder também ficava em caixa alta. A pergunta recebeu 13 votos porque era uma irritação real do dia a dia.

Você queria o texto digitado em maiúsculas para coisas como placas de carro, CEPs ou números de documento. Mas o placeholder — "Digite seu código" — ficava estranho gritando em caixa alta. Era uma dica, não um dado.

## O Problema de 2015: Placeholder Herdava Tudo

Naquela época, o pseudo-elemento `::placeholder` ainda era inconsistente entre navegadores. Cada browser tinha sua versão com prefixo de vendor:

```css
/* A bagunça que a gente lidava */
::-webkit-input-placeholder {
  /* Chrome, Safari */
}
:-moz-placeholder {
  /* Firefox 4-18 */
}
::-moz-placeholder {
  /* Firefox 19+ */
}
:-ms-input-placeholder {
  /* IE 10-11 */
}
```

O problema fundamental era que `text-transform` aplicado ao elemento input também transformava o texto do placeholder. O placeholder herdava (ou parecia herdar) a estilização de texto do input. Não dava para sobrescrever facilmente só o text-transform do placeholder sem navegar um labirinto de prefixos de vendor e inconsistências entre browsers.

O workaround típico era assim:

```css
input.uppercase {
  text-transform: uppercase;
}

input.uppercase::-webkit-input-placeholder {
  text-transform: none;
}

input.uppercase:-moz-placeholder {
  text-transform: none;
}

input.uppercase::-moz-placeholder {
  text-transform: none;
}

input.uppercase:-ms-input-placeholder {
  text-transform: none;
}
```

Cinco seletores para fazer uma coisa: manter o placeholder em minúsculas. E mesmo assim não funcionava perfeitamente em todo lugar. Alguns navegadores ignoravam certas propriedades nos pseudo-elementos de placeholder, e as regras de especificidade ao redor desses seletores eram imprevisíveis.

### O Fallback em JavaScript

Quando o CSS falhava, desenvolvedores partiam pro JavaScript:

```javascript
input.addEventListener('focus', function () {
  this.setAttribute('placeholder', '');
});

input.addEventListener('blur', function () {
  if (!this.value) {
    this.setAttribute('placeholder', 'Digite seu código');
  }
});
```

Simplesmente esconder o placeholder no focus. Não era uma solução de verdade — era mais desistir do problema de estilização.

## O Que Mudou: `::placeholder` Está Padronizado

O pseudo-elemento `::placeholder` agora é padronizado e funciona consistentemente em todos os navegadores modernos. Sem prefixos de vendor. Sem inconsistências. Um seletor, comportamento previsível:

```css
input.uppercase {
  text-transform: uppercase;
}

input.uppercase::placeholder {
  text-transform: none;
  color: #999;
  font-style: italic;
}
```

Pronto. O placeholder fica em minúsculas (ou na caixa original), e o texto digitado se transforma em maiúsculas. Dois seletores, limpo e confiável.

### O Que `::placeholder` Consegue Estilizar

O pseudo-elemento padronizado suporta um conjunto bem definido de propriedades:

- `color` e `opacity`
- Propriedades de `font` (`font-size`, `font-style`, `font-weight`, `font-family`)
- `text-transform`, `text-indent`, `text-decoration`
- `letter-spacing`, `word-spacing`
- Propriedades de `background`
- `line-height`

Isso cobre praticamente tudo que você gostaria de personalizar. Os dias de "será que essa propriedade funciona no placeholder do Firefox?" acabaram.

### Um Padrão Moderno de Formulário

Veja como eu estilizaria um input maiúsculo com um placeholder bem desenhado hoje:

```css
.code-input {
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.15em;
  padding: 0.75rem 1rem;
}

.code-input::placeholder {
  text-transform: none;
  letter-spacing: normal;
  font-family: system-ui, sans-serif;
  color: oklch(0.6 0 0);
  font-style: italic;
}
```

O placeholder e o valor do input podem ter tratamentos tipográficos completamente diferentes. O placeholder parece uma dica; o valor digitado parece um dado. Essa é a distinção de UX que estávamos tentando alcançar em 2015 — só não conseguíamos fazer de forma limpa.

## A Lição

Esse era um caso clássico de fragmentação entre vendors de browser tornando uma tarefa CSS simples desnecessariamente difícil. A correção não foi alguma API nova e esperta — foi apenas os navegadores concordando num padrão e implementando de forma consistente. `::placeholder` agora funciona do jeito que você espera, e `text-transform: none` nele faz exatamente o que diz.

Pequenas vitórias assim se acumulam. Cada hack com prefixo de vendor que a gente pode deletar é código que não vai confundir o próximo desenvolvedor que ler.
