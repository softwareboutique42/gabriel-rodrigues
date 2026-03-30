---
title: 'CSS word-wrap e Overflow de Texto: De Hack a Padrão'
description: 'Minha resposta no Stack Overflow de 2015 usava word-wrap: break-word como fix rápido. Em 2026, CSS lida com overflow de texto com elegância.'
date: 2026-03-29
tags: ['css', 'stackoverflow', 'tipografia', 'desenvolvimento-web']
lang: 'pt'
---

# CSS word-wrap e Overflow de Texto: De Hack a Padrão

Em 2015, respondi uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/95429) sobre texto longo escapando do container. O cenário clássico: um usuário cola uma URL como `https://example.com/this-is-an-incredibly-long-path-that-never-ends` num div de largura fixa, e o texto extravasa pelo layout inteiro.

A correção era uma linha de CSS. Mas a história de como essa linha evoluiu diz muito sobre onde o CSS chegou.

## O Fix de 2015: word-wrap: break-word

```css
.container {
  word-wrap: break-word;
}
```

Pronto. O texto longo quebrava na borda do container em vez de extravasar. Expliquei na minha resposta e segui em frente. Era um fix tão comum que a maioria dos desenvolvedores tinha decorado.

Mas o nome da propriedade era estranho. `word-wrap` era uma invenção da Microsoft da era IE5.5 que outros navegadores adotaram porque era útil. A spec CSS eventualmente padronizou com um nome diferente — mas a maioria de nós continuou usando o original.

## O Cenário de 2026: Múltiplas Ferramentas para Overflow de Texto

CSS agora tem um toolkit adequado para lidar com texto que não cabe no container. Cada propriedade faz algo ligeiramente diferente.

### overflow-wrap (o word-wrap renomeado)

```css
.container {
  overflow-wrap: break-word;
}
```

É no que `word-wrap` se tornou na spec. Mesmo comportamento, nome conforme padrão. Quebra palavras apenas quando extravasariam — quebras normais de palavra são preservadas.

### word-break: break-all

```css
.container {
  word-break: break-all;
}
```

Mais agressivo. Quebra entre quaisquer dois caracteres, não apenas quando overflow ocorreria. Útil para texto CJK ou conteúdo com scripts mistos, mas pode quebrar texto em inglês/português em lugares estranhos.

### hyphens: auto

```css
.container {
  hyphens: auto;
}
```

A solução elegante. Em vez de quebrar no meio da palavra em pontos arbitrários, o navegador insere um hífen num ponto válido de hifenização. Precisa do atributo `lang` para conhecer as regras do idioma.

```html
<p lang="pt" style="hyphens: auto;">
  Esta palavra extraordinariamente longa será hifenizada corretamente.
</p>
```

### text-wrap: balance e text-wrap: pretty

Adições mais recentes que mudam como o navegador distribui texto entre linhas:

```css
/* Equaliza comprimento das linhas — ótimo para títulos */
h1 {
  text-wrap: balance;
}

/* Evita órfãos na última linha — ótimo para parágrafos */
p {
  text-wrap: pretty;
}
```

`text-wrap: balance` ajusta quebras de linha para que todas tenham aproximadamente a mesma largura. Acabaram os títulos onde a última linha tem uma única palavra solitária.

`text-wrap: pretty` previne órfãos tipográficos — palavras isoladas na última linha de um parágrafo. O navegador ajusta quebras anteriores para evitar.

## Referência Rápida

| Propriedade                 | O que faz                         | Quando usar                        |
| --------------------------- | --------------------------------- | ---------------------------------- |
| `overflow-wrap: break-word` | Quebra palavras que extravasam    | URLs, conteúdo gerado pelo usuário |
| `word-break: break-all`     | Quebra entre quaisquer caracteres | Texto CJK, conteúdo multi-script   |
| `hyphens: auto`             | Adiciona hífens em pontos válidos | Texto corrido, artigos             |
| `text-wrap: balance`        | Equaliza comprimento das linhas   | Títulos, cabeçalhos                |
| `text-wrap: pretty`         | Previne órfãos                    | Parágrafos, texto corrido          |

## Conclusão

Em 2015, overflow de texto era um bug que você corrigia com uma propriedade. Em 2026, layout de texto é algo que você projeta. CSS evoluiu de "quebre em qualquer lugar para não extravasar" para "quebre inteligentemente para ficar bonito."

O original `word-wrap: break-word` ainda funciona — navegadores mantêm retrocompatibilidade. Mas se está começando um projeto novo, use a ferramenta certa: `overflow-wrap` para segurança, `hyphens` para prosa, `text-wrap` para refinamento.
