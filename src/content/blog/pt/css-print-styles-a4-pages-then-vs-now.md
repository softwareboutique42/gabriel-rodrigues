---
title: 'CSS de Impressão para Páginas A4: De @media print a Paged.js'
description: 'Minha pergunta no SO de 2015 sobre estilos CSS para impressão A4. Em 2026, regras @page e Paged.js dão controle preciso sobre saída impressa.'
date: 2026-03-29
tags: ['css', 'impressão', 'stackoverflow', 'layout']
lang: 'pt'
---

# CSS de Impressão para Páginas A4: De @media print a Paged.js

Em 2015, fiz uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/161282) sobre estilizar uma página para saída de impressão A4 com CSS. Recebeu 9 votos.

## A Abordagem de 2015: @media print

```css
@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .sem-impressao {
    display: none;
  }

  @page {
    size: A4;
    margin: 2cm;
  }
}
```

As principais frustrações:

- Navegadores adicionavam suas próprias margens sobre o seu CSS
- Quebras de página eram imprevisíveis — tabelas dividiam no meio de uma linha
- Testar exigia imprimir ou usar visualização de impressão

## A Abordagem de 2026

### @page e propriedades break

`@page` tem suporte melhorado agora, e as propriedades `break-before`/`break-after` substituíram as `page-break-*` depreciadas:

```css
@page {
  size: A4 portrait;
  margin: 2cm 2.5cm;
}

/* Capítulos começam numa nova página */
h1 {
  break-before: page;
}

/* Previne tabelas de dividir no meio de linha */
tr {
  break-inside: avoid;
}

/* Mantém cabeçalhos com o conteúdo seguinte */
h2,
h3 {
  break-after: avoid;
}
```

### Paged.js para Layouts Complexos

Para faturas, relatórios e documentos que precisam de controle real de paginação, [Paged.js](https://pagedjs.org/) é um polyfill da spec W3C CSS Paged Media:

```html
<script src="paged.js"></script>
```

Com Paged.js você define margens, cabeçalhos, rodapés, cabeçalhos correntes e numeração de página — tudo em CSS, sem brigar com o comportamento de impressão do navegador.

### Imprimir para PDF no Navegador

Navegadores modernos produzem saída PDF excelente com Ctrl+P → "Salvar como PDF." Combinado com CSS de impressão cuidadoso, isso elimina a necessidade de geração de PDF server-side para muitos casos.

## Conclusão

CSS de impressão era um cidadão de segunda classe em 2015. Em 2026, `break-before`/`break-after` substituíram as antigas `page-break-*`, `@page` tem suporte melhorado, e Paged.js preenche as lacunas para layouts complexos.
