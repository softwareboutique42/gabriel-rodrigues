---
title: 'Header Fixo: De position:fixed a position:sticky'
description: 'Minha resposta no SO de 2015 mostrava position:fixed com hacks de padding. Em 2026, position:sticky fica no flow até precisar fixar.'
date: 2026-03-29
tags: ['css', 'layout', 'stackoverflow', 'desenvolvimento-web']
lang: 'pt'
---

# Header Fixo: De position:fixed a position:sticky

Em 2015, respondi uma pergunta no Stack Overflow em Português sobre deixar um header no topo da página durante o scroll — sem JavaScript. Recebeu 5 votos.

## A Abordagem de 2015: position:fixed

```css
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 60px;
}

body {
  padding-top: 60px; /* Compensar header saindo do flow */
}
```

Funcionava, mas `position: fixed` remove o elemento do flow do documento. Você tinha que adicionar manualmente `padding-top` igual à altura do header. Mude a altura e esqueça de atualizar o padding — conteúdo fica escondido.

## A Abordagem de 2026: position:sticky

`position: sticky` era experimental em 2015 e tem suporte completo em 2026:

```css
header {
  position: sticky;
  top: 0;
  z-index: 100;
}
```

Sem `padding-top`. Elementos sticky ficam no flow até que seriam rolados para fora da view, então "grudam" na borda especificada.

### scroll-margin-top para Links de Âncora

Problema clássico com headers fixos: clicar `<a href="#secao">` pula para o alvo, mas o header sobrepõe. O fix moderno:

```css
:target,
[id] {
  scroll-margin-top: 80px; /* Altura do header + buffer */
}
```

Sem JavaScript. O navegador considera esse offset ao pular para âncoras.

## Conclusão

`position: fixed` briga contra o flow do documento. `position: sticky` trabalha com ele. A migração geralmente é só trocar a propriedade, remover o hack de padding do body, e adicionar `scroll-margin-top` para âncoras.
