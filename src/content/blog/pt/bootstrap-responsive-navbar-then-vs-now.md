---
title: 'Navbar Responsiva com Bootstrap: Do jQuery Collapse à Navegação Só com CSS'
description: 'Respondi uma pergunta no Stack Overflow sobre navbars responsivas com Bootstrap 3 em 2017. Hoje você faz a mesma coisa sem nenhum JavaScript.'
date: 2026-03-29
tags: ['bootstrap', 'css', 'responsivo', 'stackoverflow']
lang: 'pt'
---

# Navbar Responsiva com Bootstrap: Do jQuery Collapse à Navegação Só com CSS

Em 2017, escrevi uma [resposta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/179273) sobre como fazer uma navbar responsiva com Bootstrap 3. A resposta recebeu 4 votos e cobria a abordagem padrão — `navbar-collapse`, `data-toggle` e o plugin jQuery que animava o menu hamburger. Era o feijão com arroz do desenvolvimento front-end na época. Praticamente todo site que construí entre 2014 e 2018 tinha exatamente esse mesmo padrão de navbar.

## O Collapse Movido a jQuery

A navbar responsiva do Bootstrap 3 era elegante para a sua era, mas vinha com bagagem. A configuração típica era assim:

```html
<nav class="navbar navbar-default">
  <div class="container">
    <div class="navbar-header">
      <button
        type="button"
        class="navbar-toggle collapsed"
        data-toggle="collapse"
        data-target="#main-nav"
      >
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="/">MeuSite</a>
    </div>
    <div class="collapse navbar-collapse" id="main-nav">
      <ul class="nav navbar-nav">
        <li><a href="/sobre">Sobre</a></li>
        <li><a href="/contato">Contato</a></li>
      </ul>
    </div>
  </div>
</nav>
```

Pra isso funcionar, você precisava do CSS do Bootstrap, do JavaScript do Bootstrap e do jQuery. Três dependências para um menu hamburger. O plugin de collapse alternava uma classe, o jQuery animava a altura, e se você tinha algum comportamento customizado, escrevia mais jQuery em cima. Lembro de debugar problemas de z-index, lidar com a navbar que não fechava quando um link era clicado no mobile, e brigar com o timing da transição.

O Bootstrap 4 melhorou as coisas migrando para opções com JavaScript vanilla e flexbox, e o Bootstrap 5 abandonou o jQuery completamente. Mas o modelo mental continuou o mesmo — um mecanismo de toggle dirigido por JavaScript.

## Navegação Só com CSS em 2026

Hoje você consegue construir uma navbar totalmente responsiva sem uma única linha de JavaScript. O CSS moderno fechou essa lacuna por completo.

**O elemento `<details>`** te dá um widget de disclosure com comportamento de toggle embutido, sem JS:

```html
<nav class="site-nav">
  <a href="/" class="brand">MeuSite</a>
  <details class="nav-menu">
    <summary aria-label="Menu">☰</summary>
    <ul>
      <li><a href="/sobre">Sobre</a></li>
      <li><a href="/contato">Contato</a></li>
    </ul>
  </details>
</nav>
```

```css
.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-menu > summary {
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  list-style: none;
}

.nav-menu ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

@container (max-width: 600px) {
  .nav-menu > summary {
    display: block;
  }
  .nav-menu ul {
    flex-direction: column;
  }
  .nav-menu:not([open]) ul {
    display: none;
  }
}
```

**Container queries** fazem a navbar responder ao tamanho do seu próprio container, não da viewport. Isso é uma mudança fundamental. Seu componente de navbar pode ser colocado em uma sidebar, um modal ou um header full-width, e ele se adapta baseado no espaço disponível.

**O seletor `:has()`** abre padrões que eram impossíveis sem JavaScript. Quer estilizar a navbar de forma diferente quando o menu está aberto? Não precisa de classe toggle:

```css
.site-nav:has(details[open]) {
  background: var(--color-surface);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
}
```

Dá até pra usar `:has()` pra impedir o scroll do body quando o menu mobile está aberto — algo que antes exigia event listeners em JavaScript:

```css
body:has(.nav-menu[open]) {
  overflow: hidden;
}
```

## O Cenário Maior

A mudança aqui não é só sobre navbars. É sobre toda uma categoria de interações de UI que costumavam precisar de JavaScript virando CSS puro. Accordions, tabs, menus dropdown, tooltips — o CSS dá conta de tudo isso agora. Quando respondi aquela pergunta sobre Bootstrap em 2017, eu não imaginaria construir uma navbar de produção com zero dependências de JavaScript. Hoje não é só possível, é a abordagem melhor na maioria dos casos — menos bytes, sem custo de hidratação, e funciona mesmo quando o JavaScript falha ao carregar.
