---
title: 'O Que Pode Ir Dentro de uma Tag Anchor no HTML5'
description: 'Minha resposta no Stack Overflow de 2016 sobre colocar divs dentro de links. Em 2026, HTML válido e HTML acessível são conversas diferentes.'
date: 2026-03-29
tags: ['html', 'html5', 'stackoverflow', 'acessibilidade']
lang: 'pt'
---

# O Que Pode Ir Dentro de uma Tag Anchor no HTML5

Em 2016, respondi uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/107718) que aparecia o tempo todo: pode colocar um `<div>` dentro de uma tag `<a>`? A resposta era mais nuançada do que as pessoas esperavam.

## A Resposta de 2016: Depende da Versão do HTML

No **HTML4**, a resposta era não. O elemento `<a>` era inline, e elementos inline não podiam conter elementos block. Colocar um `<div>` dentro de um link era markup inválido.

**HTML5 mudou as regras.** O elemento `<a>` ganhou um **modelo de conteúdo transparente** — significando que pode conter qualquer coisa que seu pai poderia conter, exceto outros elementos interativos. Então se seu `<a>` está dentro de um `<div>`, pode conter elementos block como `<div>`, `<p>`, `<h1>`, etc.

```html
<!-- Inválido no HTML4, válido no HTML5 -->
<a href="/produto/123">
  <div class="card">
    <h3>Nome do Produto</h3>
    <p>Descrição do produto aqui</p>
    <span class="price">R$ 29,99</span>
  </div>
</a>
```

O que **não pode** colocar dentro de um `<a>`:

- Outro `<a>` (sem links aninhados)
- Elementos `<button>`
- `<input>`, `<select>`, `<textarea>` (controles de formulário)
- Qualquer elemento interativo

A regra é simples: **sem conteúdo interativo dentro de conteúdo interativo**.

## A Perspectiva de 2026: Válido Nem Sempre É Acessível

HTML5 tornou válido envolver conteúdo block em tags `<a>`. Frameworks abraçaram isso — componentes de card envolvidos em links se tornaram onipresentes. Mas auditorias de acessibilidade em 2026 revelam um problema que o validador não detecta.

### Experiência do Leitor de Tela

Quando um leitor de tela encontra um link, lê o **nome acessível inteiro**. Para um card envolvido numa tag `<a>`, isso significa ler cada pedaço de texto dentro:

> "Link: Nome do Produto Descrição do produto aqui R$ 29,99"

Experiência terrível. Compare com um link simples:

> "Link: Nome do Produto"

### O Padrão Moderno: Área de Clique com Pseudo-Elemento

Em vez de envolver o card inteiro num link, implementações modernas usam um pseudo-elemento posicionado para expandir a área de clique:

```html
<div class="card">
  <h3><a href="/produto/123" class="card-link">Nome do Produto</a></h3>
  <p>Descrição do produto aqui</p>
  <span class="price">R$ 29,99</span>
</div>
```

```css
.card {
  position: relative;
}

.card-link::after {
  content: '';
  position: absolute;
  inset: 0;
}
```

O card inteiro é clicável, mas o leitor de tela só anuncia "Link: Nome do Produto." Melhor dos dois mundos.

### Quando Envolver Ainda É OK

Para conteúdo simples — uma imagem com legenda, ou um título curto — envolver em `<a>` é perfeitamente acessível:

```html
<a href="/artigo/123">
  <article>
    <h3>Título do Artigo</h3>
  </article>
</a>
```

A diretriz: se o anúncio do leitor de tela soa natural quando lido como uma frase, envolver está OK. Se vira um parágrafo de texto embaralhado, use o padrão de pseudo-elemento.

## Conclusão

HTML5 nos deu permissão para colocar conteúdo block dentro de anchor tags. Essa é uma questão de spec, e a resposta é sim. Mas se você _deveria_ é uma questão de acessibilidade — e a resposta depende de como o conteúdo soa quando lido em voz alta. HTML válido nem sempre é HTML acessível, e em 2026, acessibilidade não é opcional.
