---
title: 'Zoom em Imagem com CSS: Efeitos Hover que Escalam'
description: 'Minha resposta no SO de 2015 usava transform:scale no hover. Em 2026, View Transitions e @starting-style tornam zoom suave nativo.'
date: 2026-03-29
tags: ['css', 'animação', 'stackoverflow', 'design']
lang: 'pt'
---

# Zoom em Imagem com CSS: Efeitos Hover que Escalam

Em 2015, respondi uma pergunta no Stack Overflow em Português sobre dar zoom em imagem ao passar o mouse. Recebeu 5 votos. A técnica era CSS puro e funcionava em todo lugar.

## A Abordagem de 2015

```css
.image-container {
  overflow: hidden;
}

.image-container img {
  transition: transform 0.3s ease;
}

.image-container img:hover {
  transform: scale(1.1);
}
```

Limpo e eficiente. `overflow: hidden` corta a imagem escalonada nos limites do container. Ainda válido em 2026.

## As Adições de 2026

### aspect-ratio Previne Layout Shift

```css
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-container img:hover {
  transform: scale(1.1);
}
```

`aspect-ratio` mantém proporções sem hardcodar dimensões. `object-fit: cover` garante que a imagem preenche o container sem distorção.

### @starting-style para Animações de Entrada

Novo em 2024, `@starting-style` anima elementos quando aparecem no DOM:

```css
img {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

@starting-style {
  img {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

Imagens aparecem com fade-in e scale-up quando renderizam pela primeira vez.

### contain: layout para Performance

Para grids com muitas imagens:

```css
.image-container {
  contain: layout;
  overflow: hidden;
}
```

Permite que o navegador pule recalculações de layout fora do container — útil para efeitos hover suaves em grids grandes.

## Conclusão

O padrão original `transform: scale()` de 2015 ainda é correto. O que mudou foi o suporte: `aspect-ratio` para containers responsivos, `object-fit` para cropping, `@starting-style` para entradas e `contain` para performance. O padrão ficou mais rico, não foi substituído.
