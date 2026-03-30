---
title: 'Datepicker com Dias Especificos: De beforeShowDay a Controles Modernos de Data'
description: 'Minha resposta no Stack Overflow sobre habilitar apenas dias especificos em um datepicker Bootstrap recebeu 5 votos. Em 2026, inputs nativos de data e bibliotecas headless fazem isso com muito menos codigo.'
date: 2026-03-29
tags: ['bootstrap', 'formulários', 'javascript', 'stackoverflow']
lang: 'pt'
---

# Datepicker com Dias Especificos: De beforeShowDay a Controles Modernos de Data

Respondi uma [pergunta no Stack Overflow em Portugues](https://pt.stackoverflow.com/questions/108453) sobre habilitar apenas dias especificos em um datepicker do Bootstrap. Recebeu 5 votos — um cenario comum em sistemas de reservas, agendamento de consultas e qualquer lugar onde regras de negocio ditavam quais datas o usuario podia selecionar.

O callback `beforeShowDay` dava conta do recado. Mas comparar com o que temos agora mostra quanta friccao a gente aceitava como normal.

## O Problema de 2016: bootstrap-datepicker e beforeShowDay

A ferramenta padrao era o plugin jQuery `bootstrap-datepicker`. Para restringir quais dias eram selecionaveis, voce usava o callback `beforeShowDay`:

```javascript
// 2016: bootstrap-datepicker com beforeShowDay
var allowedDates = ['2016-03-15', '2016-03-18', '2016-03-22'];

$('#datepicker').datepicker({
  format: 'yyyy-mm-dd',
  beforeShowDay: function (date) {
    var formatted =
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2);

    if (allowedDates.indexOf(formatted) !== -1) {
      return { enabled: true, classes: 'available-day' };
    }
    return { enabled: false };
  },
});
```

Aquela formatacao manual de data era necessaria porque o objeto `Date` do JavaScript nao tinha um metodo de formato ISO confiavel entre navegadores. O `getMonth() + 1` e o zero-padding eram bugs esperando para acontecer.

## O Que Tornava Doloroso

O padrao `beforeShowDay` tinha varios problemas:

1. **Chamado para cada dia visivel** — O callback rodava 42 vezes (6 semanas x 7 dias) cada vez que o calendario renderizava. Com arrays grandes de datas permitidas, ficava visivelmente lento
2. **Comparacao de strings para datas** — Voce tinha que formatar datas de forma identica para comparar com sua lista. Um erro de formato e o dia era desabilitado sem nenhum aviso
3. **Sem suporte async** — Se as datas permitidas vinham de uma API, voce tinha que buscar tudo antes e armazenar antes de inicializar o datepicker
4. **Cadeia de dependencias de plugins jQuery** — bootstrap-datepicker precisava de jQuery, CSS do Bootstrap, e seus proprios arquivos CSS e JS. Quatro dependencias para um input de data

A pior parte era debugar. Quando um dia era incorretamente desabilitado, voce tinha que percorrer o callback para aquela data especifica e descobrir por que a comparacao de strings falhou. Geralmente era um offset de timezone deslocando a data em um dia.

## A Abordagem de 2026: Inputs Nativos e Bibliotecas Headless

### Input Nativo de Data com min/max

Para restricoes simples de intervalo, HTML nativo da conta:

```html
<!-- 2026: Input nativo de data com restricoes -->
<input type="date" min="2026-03-01" max="2026-03-31" required />
```

Datepickers nativos do navegador agora ficam bonitos, suportam navegacao por teclado e respeitam `min`/`max` sem uma unica linha de JavaScript. No mobile, voce ganha o date picker nativo do sistema operacional de graca.

### Bibliotecas Headless de Datepicker

Para regras complexas como "apenas tercas e quintas" ou "apenas datas desta lista da API", bibliotecas headless de datepicker fornecem a logica sem prender voce a uma UI:

```javascript
// 2026: Datepicker headless com validacao de data
const allowedDates = new Set(['2026-03-15', '2026-03-18', '2026-03-22']);

const calendar = createCalendar({
  isDateDisabled: (date) => !allowedDates.has(date.toISOString().slice(0, 10)),
  onSelect: (date) => handleSelection(date),
  locale: navigator.language,
});
```

`Set.has()` e O(1) ao inves de `Array.indexOf()` que era O(n). `toISOString()` da formatacao consistente. A abordagem headless significa que voce e dono da marcacao e estilizacao completamente.

### API Temporal

O pesadelo de formatacao de datas tambem foi resolvido no nivel da linguagem:

```javascript
// 2026: API Temporal — chega de getMonth() + 1
const date = Temporal.PlainDate.from('2026-03-15');
const formatted = date.toString(); // "2026-03-15" — sempre
```

Sem surpresas de timezone. Sem off-by-one no indice do mes. Datas sao apenas datas.

## O Que Mudou

O padrao mudou de "plugin jQuery grandao com callbacks" para "input nativo para casos simples, biblioteca headless para complexos." O inferno de formatacao de datas que tornava o `beforeShowDay` tao propenso a erros foi resolvido tanto pelo `Temporal` quanto pelo suporte consistente ao `toISOString()`.

Aquela resposta no Stack Overflow foi uma correcao pratica para uma restricao real. Mas a licao verdadeira e que controles de formulario devem ser o mais proximos possivel do nativo, e so recorrer a bibliotecas quando regras de negocio exigirem.
