---
title: 'Imagem de Fallback: Lidando com Imagens Quebradas Graciosamente'
description: 'Minha pergunta no SO de 2015 usava onerror para trocar src de imagem quebrada. Em 2026, picture, skeleton loading e CSS lidam com isso mais elegantemente.'
date: 2026-03-29
tags: ['html', 'imagens', 'ux', 'stackoverflow']
lang: 'pt'
---

# Imagem de Fallback: Lidando com Imagens Quebradas Graciosamente

Em 2015, fiz uma pergunta no Stack Overflow em Português sobre mostrar uma imagem de fallback quando a original falha ao carregar. Recebeu 8 votos — um problema universal para qualquer site com conteúdo enviado por usuários ou URLs de imagens externas.

## A Abordagem de 2015: onerror

```html
<img src="avatar.jpg" onerror="this.src='/imagens/avatar-padrao.png'" />
```

Ou mais defensivamente (para evitar loops infinitos):

```javascript
img.onerror = function () {
  this.onerror = null; // Previne loop infinito
  this.src = '/imagens/avatar-padrao.png';
};
```

Simples e eficaz. Ainda funciona em 2026.

## As Abordagens de 2026

### Elemento picture com Múltiplos Sources

Para fallbacks de formato (AVIF → WebP → PNG):

```html
<picture>
  <source srcset="avatar.avif" type="image/avif" />
  <source srcset="avatar.webp" type="image/webp" />
  <img src="avatar.jpg" alt="Avatar do usuário" loading="lazy" />
</picture>
```

O navegador escolhe o primeiro formato que suporta. Se todos os sources falharem, o `<img>` de fallback aplica — e você ainda pode adicionar `onerror` nele.

### Estilização CSS de Imagens Quebradas

CSS pode estilizar imagens quebradas especificamente com `::after`.

### Padrão de Skeleton Loading

UX moderno mostra um placeholder skeleton enquanto a imagem carrega:

```html
<div class="avatar loading">
  <img src="avatar.jpg" alt="Usuário" onload="this.parentNode.classList.remove('loading')" />
</div>
```

```css
.avatar.loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

## Conclusão

O handler `onerror` ainda é a ferramenta certa para fallbacks programáticos. Em 2026, você tem opções adicionais: `<picture>` para fallbacks de formato, CSS `::after` para estados de quebra estilizados, e skeleton loading para performance percebida. A escolha certa depende de precisar de uma imagem de fallback ou apenas degradação graciosa.
