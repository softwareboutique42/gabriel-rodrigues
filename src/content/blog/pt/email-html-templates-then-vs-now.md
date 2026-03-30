---
title: 'Templates HTML para Email: De Layouts com Tabelas a Ferramentas Modernas'
description: 'De uma resposta de 2016 no Stack Overflow sobre compatibilidade de HTML em email até 2026 — MJML, React Email, e por que desenvolvimento de email ainda é um universo à parte.'
date: 2026-03-29
tags: ['html', 'email', 'stackoverflow', 'css']
lang: 'pt'
---

# Templates HTML para Email: De Layouts com Tabelas a Ferramentas Modernas

Em 2016, eu respondi uma pergunta no Stack Overflow em Português sobre como fazer HTML de emails funcionar em diferentes clientes de email. A pessoa estava com layouts quebrando no Outlook, o Gmail removendo estilos, e o caos geral da renderização de emails. Expliquei as regras do HTML para email — tabelas para layout, estilos inline em tudo, esqueça `<div>` e `float`, e teste em todo cliente que puder. A resposta recebeu 7 upvotes.

Dez anos depois, ainda fico um pouco ansioso quando alguém fala "você pode fazer um template de email?" Mas as ferramentas mudaram completamente a forma como escrevemos esses templates, mesmo que as limitações por baixo não tenham desaparecido totalmente.

## A Resposta de 2016: Tabelas, Estilos Inline e Sofrimento

Naquela época, se você queria um email HTML que ficasse igual no Gmail, Outlook, Yahoo Mail e Apple Mail, tinha exatamente uma abordagem confiável: tabelas HTML aninhadas com estilos inline em cada elemento.

Nada de layout com `<div>`. Nada de folhas de estilo externas. Nada de `flexbox`. Nada de `grid`. O Outlook usava o motor de renderização do Word (sim, o Microsoft Word) para exibir emails HTML, o que significava que ele suportava um subconjunto bizarro de CSS que correspondia mais ou menos ao que o Word conseguia processar. O Gmail removia agressivamente tags `<style>` do `<head>`, então qualquer CSS que não fosse inline simplesmente não existia.

Um layout típico de email era assim:

```html
<table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>
    <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 14px; color: #333333;">
      Seu conteúdo aqui
    </td>
  </tr>
</table>
```

Cada. Elemento. Recebia estilos inline. Quer espaçamento consistente? `cellpadding` e `cellspacing`. Quer colunas? Tabelas aninhadas dentro de elementos `<td>`. Quer um botão? Uma célula de tabela com cor de fundo e um link centralizado, porque elementos `<button>` não renderizam de forma previsível.

Era como escrever HTML em 2002, exceto que era 2016 e você tinha que fazer isso de propósito.

## Por Que Era Tão Doloroso

O problema central é que clientes de email não são navegadores. Eles não seguem padrões web. Cada um tem seu próprio motor de renderização com suas próprias peculiaridades:

- **Outlook (desktop)** usava o renderizador HTML do Microsoft Word. Nada de `background-image` em `<div>`, nada de `max-width`, `padding` quebrado em certos elementos.
- **Gmail** removia blocos `<style>` inteiros, matando qualquer estilização baseada em classes.
- **Yahoo Mail** adicionava seu próprio CSS que podia sobrescrever o seu.
- **Lotus Notes** (sim, gente ainda usava) era um pesadelo que não vou descrever mais.

Testar significava enviar seu email para quinze clientes diferentes e verificar cada um manualmente. Ferramentas como Litmus e Email on Acid existiam, mas eram caras e ainda exigiam que você corrigisse as coisas na mão.

## O Que Mudou: A Revolução nas Ferramentas de Autoria

O cenário de renderização de email melhorou um pouco — o Gmail finalmente começou a suportar tags `<style>` incorporadas por volta de 2016-2017, o que foi uma vitória enorme. Mas a verdadeira transformação foi na forma como escrevemos HTML de email, não em como os clientes renderizam.

**MJML** foi a primeira ferramenta que realmente fez sentido pra mim. É uma linguagem de marcação que compila para HTML compatível com email. Em vez de escrever tabelas aninhadas na mão, você escreve componentes semânticos:

```html
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>Seu conteúdo aqui</mj-text>
        <mj-button href="https://example.com">Clique aqui</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

O MJML compila isso no HTML horroroso baseado em tabelas que os clientes de email precisam, mas você nunca precisa olhar pra ele. Ele cuida dos condicionais do Outlook, geração de estilos inline e breakpoints responsivos.

**React Email** trouxe o modelo de componentes pro desenvolvimento de email. Se sua equipe já pensa em React, dá pra construir templates de email com componentes JSX que compilam pra HTML seguro para email. Integra com o Resend para envio e tem um servidor de preview local.

**Maizzle** seguiu uma abordagem diferente — é basicamente Tailwind CSS para email. Você escreve seu HTML de email com classes utilitárias, e o Maizzle processa tudo em output inline e compatível com email. Para equipes que já usam Tailwind, é o caminho mais rápido.

## O Problema do Dark Mode

Uma coisa que não existia em 2016 e agora é uma dor de cabeça constante: **dark mode em email**. Apple Mail, Outlook e Gmail todos têm dark mode agora, e cada um lida com as cores do email de forma diferente.

Alguns clientes invertem suas cores automaticamente. Alguns respeitam media queries `prefers-color-scheme`. Alguns fazem ambos, dependendo da fase da lua. Você pode adicionar estilos de dark mode, mas não pode garantir que serão aplicados consistentemente.

O conselho prático em 2026: projete com dark mode em mente desde o início. Use PNGs transparentes em vez de JPGs com fundo branco. Teste o contraste de cores nos dois modos. E aceite que alguns clientes vão fazer seu email parecer diferente do que você planejou.

## AMP for Email: Um Breve Desvio

O Google lançou o AMP for Email por volta de 2019 com a promessa de emails interativos — carrosséis, formulários, dados ao vivo direto na caixa de entrada. Era ambicioso. Também era uma iniciativa exclusiva do Google que exigia que os remetentes se registrassem com o Google e mantivessem uma versão especial de cada email.

Em 2026, o AMP for Email está essencialmente morto para a maioria dos remetentes. A adoção nunca atingiu massa crítica, e o custo de manutenção não compensava os ganhos marginais de interatividade. Alguns grandes remetentes (os próprios serviços do Google, Pinterest) ainda usam, mas a indústria seguiu em frente. Email interativo acabou sendo uma solução procurando um problema.

## O Cenário de 2026

Assim que o desenvolvimento de HTML para email funciona agora:

- **Autoria**: MJML, React Email ou Maizzle. Ninguém mais escreve HTML de tabelas na mão, a não ser que esteja mantendo templates legados.
- **Testes**: Litmus e Email on Acid ainda são os padrões, mas a renderização de preview ficou muito melhor.
- **Envio**: Resend, Postmark e SendGrid cuidam da entrega. O mercado de ESPs se consolidou.
- **Suporte CSS**: Melhor que 2016, mas ainda anos atrás dos navegadores. Outlook desktop ainda usa o renderizador do Word. Isso não mudou e provavelmente nunca vai mudar.
- **Dark mode**: Uma consideração real de design agora, não um caso extremo.

## O Que Eu Escreveria Hoje

Se alguém me fizesse a mesma pergunta do Stack Overflow em 2026, eu ainda alertaria que HTML de email é um mundo próprio com suas próprias regras. Isso não mudou. Mas imediatamente apontaria pra MJML ou React Email em vez de explicar como codar layouts de tabela na mão.

As limitações subjacentes ainda estão lá — Outlook ainda usa o Word, alguns clientes ainda removem estilos, e email responsivo ainda é mais difícil que web responsiva. Mas as ferramentas modernas abstraem a dor tão bem que você raramente precisa pensar nisso.

HTML de email é um exemplo perfeito de um problema que não foi resolvido pelos padrões melhorando (embora tenham melhorado, devagar), mas por ferramentas que aceitaram as limitações e construíram uma experiência de autoria melhor por cima delas. Às vezes a resposta não é "esperar a plataforma melhorar." Às vezes é "construir um compilador."
