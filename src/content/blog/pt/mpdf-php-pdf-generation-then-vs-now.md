---
title: 'mPDF para Geração Moderna de PDF: Os Engines de Browser Venceram'
description: 'Minha resposta no Stack Overflow lutava com layout e CSS limitado do mPDF. Em 2026, Puppeteer, Playwright e Gotenberg usam engines de browser reais pra PDFs pixel-perfect.'
date: 2026-03-29
tags: ['php', 'pdf', 'stackoverflow', 'ferramentas']
lang: 'pt'
---

# mPDF para Geração Moderna de PDF: Os Engines de Browser Venceram

Respondi uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/167610) sobre problemas de layout e estilização no mPDF. Recebeu 6 votos. A pergunta era sobre fazer CSS funcionar direito no mPDF — tabelas desalinhando, margens não se comportando, fontes não renderizando. Experiência clássica com mPDF.

## O Antes: CSS, Mas Não de Verdade

mPDF era uma das várias bibliotecas PHP (junto com TCPDF e DOMPDF) que tentavam converter HTML/CSS em PDF. A proposta era atraente: escreva seu documento em HTML, receba um PDF. A realidade era um subconjunto de CSS com falhas surpreendentes:

```php
$mpdf = new \Mpdf\Mpdf([
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 16,
    'margin_bottom' => 16,
]);

$html = '
<style>
    /* Parte do CSS funciona... */
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border: 1px solid #000; }

    /* Mas flexbox? Não. Grid? Não. */
    /* float tem quirks, position: absolute é limitado */
    /* @media queries? Esquece. */
</style>

<h1>Nota Fiscal #1234</h1>
<table>
    <tr><td>Item</td><td>Preço</td></tr>
    <tr><td>Widget</td><td>R$ 49,90</td></tr>
</table>';

$mpdf->WriteHTML($html);
$mpdf->Output('nota-fiscal.pdf', 'D');
```

Todo projeto que usava mPDF tinha o mesmo arco: empolgação ("posso usar HTML!"), depois frustração ("por que esse CSS não funciona?"), depois resignação ("vou usar tabelas pra tudo").

Os problemas específicos que abordei na minha resposta eram comuns: elementos não posicionando onde esperado, margens colapsando diferente dos browsers, e fontes não embutindo corretamente. A solução era sempre algum workaround específico do mPDF em vez de CSS padrão.

## O Agora: Engines de Browser Reais

A sacada foi simples: em vez de reimplementar um engine CSS em PHP, use um browser real pra renderizar o HTML e exportar pra PDF.

### Puppeteer / Playwright

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setContent(`
  <html>
    <style>
      body { font-family: 'Inter', sans-serif; }
      .invoice { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media print { .no-print { display: none; } }
    </style>
    <div class="invoice">
      <h1>Nota Fiscal #1234</h1>
      <!-- Suporte CSS completo — flexbox, grid, fontes custom, tudo -->
    </div>
  </html>
`);

await page.pdf({
  path: 'nota-fiscal.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
});

await browser.close();
```

Toda feature CSS que funciona no Chrome funciona no seu PDF. Flexbox, Grid, fontes customizadas, gradients, `calc()`, container queries — tudo.

### Gotenberg: PDF Como Serviço

```bash
# Serviço de geração de PDF baseado em Docker
curl --request POST http://localhost:3000/forms/chromium/convert/html \
  --form files=@index.html \
  --form paperWidth=8.27 \
  --form paperHeight=11.7 \
  -o resultado.pdf
```

Gotenberg encapsula o Chromium numa API HTTP. Sua aplicação PHP manda HTML, recebe um PDF de volta. Sem dependência de browser no seu processo PHP.

### E o WKHTMLTOPDF?

WKHTMLTOPDF foi o passo intermediário — usava WebKit pra renderizar PDFs mas era baseado num fork antigo do Qt WebKit. Está oficialmente deprecado agora. O engine de renderização ficou parado no suporte CSS de 2015, o que anulava o propósito todo.

## O Cenário em 2026

| Ferramenta           | Suporte CSS                 | Melhor Pra                            |
| -------------------- | --------------------------- | ------------------------------------- |
| mPDF/DOMPDF          | Parcial (sem flex/grid)     | Documentos simples, ambientes só PHP  |
| Puppeteer/Playwright | Completo (Chromium)         | PDFs pixel-perfect, layouts complexos |
| Gotenberg            | Completo (Chromium via API) | Arquitetura de microsserviços         |
| WeasyPrint           | Bom (Python)                | Server-side sem headless browser      |
| WKHTMLTOPDF          | Datado                      | Deprecado, não use                    |

## O Que Mudou

A lição do mPDF é sobre lutar a batalha errada. Reimplementar um engine de renderização CSS é uma tarefa enorme, e você sempre vai estar anos atrás dos browsers. A abordagem moderna é pragmática: browsers já renderizam HTML/CSS perfeitamente, então use eles.

Minha resposta de 2016 ajudava alguém a contornar limitações de CSS do mPDF. Em 2026, a resposta é: não contorne. Use uma ferramenta que suporta CSS de verdade. O custo extra de infraestrutura de rodar Chrome headless é trivialmente pequeno comparado às horas gastas debugando quirks de layout do mPDF.
