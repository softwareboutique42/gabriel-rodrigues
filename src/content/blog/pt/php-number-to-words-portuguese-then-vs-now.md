---
title: 'Números por Extenso em PHP: De Funções Manuais ao Intl'
description: 'Minha resposta no Stack Overflow criou uma função recursiva pra escrever números por extenso em português. Em 2026, PHP intl e JS Intl.NumberFormat fazem isso nativamente.'
date: 2026-03-29
tags: ['php', 'localização', 'stackoverflow', 'português']
lang: 'pt'
---

# Números por Extenso em PHP: De Funções Manuais ao Intl

Lá por 2016, alguém no Stack Overflow em Português perguntou como converter números para a forma escrita por extenso em português. Tipo transformar `1542` em "mil quinhentos e quarenta e dois." Minha resposta (9 votos) era uma função recursiva em PHP com arrays de palavras em português hardcoded. Funcionava, mas olhando agora... era muito código pra algo que deveria ser uma chamada de biblioteca.

## O Antes: Escrevendo Números na Mão

A abordagem era decomposição recursiva clássica. Você quebra o número em grupos (milhares, centenas, dezenas, unidades) e mapeia cada um pra sua palavra em português:

```php
function numeroPorExtenso($numero) {
    $unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco',
                 'seis', 'sete', 'oito', 'nove'];
    $dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta',
                'sessenta', 'setenta', 'oitenta', 'noventa'];
    $centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos',
                 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos',
                 'novecentos'];

    // Casos especiais: 11-19 em português
    $especiais = ['onze', 'doze', 'treze', 'quatorze', 'quinze',
                  'dezesseis', 'dezessete', 'dezoito', 'dezenove'];

    // Lógica recursiva tratando cada magnitude...
    // "cem" vs "cento", conectores "e", "mil" vs "milhão"...
}
```

O problema estava nos detalhes. Português tem suas particularidades: "cem" (exatamente 100) vs "cento e algo" (101-199). O conector "e" vai entre grupos, mas não sempre. "Um mil" é errado — é só "mil." E nem me fale de "milhão" vs "milhões" (singular vs plural).

Cada caso especial de localização era um novo `if`. E isso só cobria português. Precisa de espanhol? Começa de novo. Precisa formatar moeda? Outra função.

## O Agora: Uma Linha com PHP intl

A extensão `intl` do PHP usa o ICU (International Components for Unicode), e a classe `NumberFormatter` resolve isso nativamente:

```php
$formatter = new NumberFormatter('pt-BR', NumberFormatter::SPELLOUT);
echo $formatter->format(1542);
// "mil quinhentos e quarenta e dois"

echo $formatter->format(100);
// "cem"

echo $formatter->format(101);
// "cento e um"

// Funciona pra qualquer locale
$en = new NumberFormatter('en-US', NumberFormatter::SPELLOUT);
echo $en->format(1542);
// "one thousand five hundred forty-two"
```

Todos os casos especiais — "cem" vs "cento," milhões no singular, conectores corretos — são tratados pela formatação baseada em regras do ICU. Suporta todos os locales, não só português.

### JavaScript Também Faz

Desde 2020+, browsers e Node.js suportam isso nativamente:

```javascript
// Não tem spellout direto, mas Intl lida com formatação por locale
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
console.log(formatter.format(1542));
// "R$ 1.542,00"

// Pra spellout completo, bibliotecas como 'written-number' resolvem
// Ou use Intl.Segmenter + regras customizadas
```

Embora o `Intl.NumberFormat` do JavaScript não tenha modo spellout direto, a formatação por locale já vem embutida. Pra extenso completo, bibliotecas usam os mesmos dados ICU por baixo dos panos.

## O Que Mudou

A mudança real não foi só "use uma biblioteca." Foi a padronização do ICU como motor universal de localização. A extensão intl do PHP, `java.text` do Java, `babel` do Python e as APIs Intl dos browsers — todos usam os mesmos dados ICU. Localização write-once virou possível.

Minha resposta de 2016 me ensinou que localização é enganosamente complexa. Toda língua tem números irregulares, formas com gênero e regras de conectores que só falantes nativos percebem. A lição: nunca faça na mão o que o ICU já resolve. Sua função recursiva pode funcionar pro português, mas o ICU funciona pra mais de 500 locales sem uma única string hardcoded.
