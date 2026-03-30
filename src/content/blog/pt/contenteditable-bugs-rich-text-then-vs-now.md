---
title: 'Bugs do contenteditable: Como a Dor dos Browsers Criou Editores Modernos'
description: 'Minha resposta no Stack Overflow lidava com bugs de padding do Firefox no contenteditable. Em 2026, Tiptap, ProseMirror e Lexical existem porque ninguém deveria fazer rich text na mão.'
date: 2026-03-29
tags: ['html', 'navegadores', 'stackoverflow', 'editores']
lang: 'pt'
---

# Bugs do contenteditable: Como a Dor dos Browsers Criou Editores Modernos

Por volta de 2016, respondi uma pergunta no Stack Overflow em Português sobre usar `contenteditable` como alternativa a textarea e lidar com um bug de padding específico do Firefox. A resposta recebeu 9 votos. A pergunta era simples: como tornar uma div editável e estilizar como textarea? A realidade era tudo menos simples.

## O Antes: Lutando Contra Cada Browser

O atributo `contenteditable` parece mágico. Adiciona em qualquer elemento e ele vira editável:

```html
<div contenteditable="true" class="editor">Digite aqui...</div>
```

Mas na prática? Cada browser implementava de um jeito. Minha resposta lidava com o Firefox adicionando um padding misterioso dentro de elementos contenteditable. O fix era CSS:

```css
[contenteditable] {
  /* Fix de padding do Firefox */
  -moz-appearance: textfield-multiline;
  padding: 8px;
}

/* Remove o <br> extra que o Firefox insere */
[contenteditable]:empty::before {
  content: attr(placeholder);
  color: #999;
}
```

Isso era só a ponta do iceberg. Eis o que construir em cima de contenteditable significava em 2016:

- **Chrome** envolvia texto em tags `<div>` quando você apertava Enter
- **Firefox** inseria elementos `<br>` no lugar
- **Safari** usava `<div>` mas com tratamento diferente de espaços
- **IE/Edge** envolvia em tags `<p>`
- Colar conteúdo do Word trazia montanhas de HTML lixo
- Comportamento de undo/redo era completamente inconsistente
- Posicionamento do cursor após mudanças programáticas no DOM era um pesadelo

Todo editor rich text construído sobre contenteditable era essencialmente uma coleção de hacks específicos por browser. Lembro de passar dias debugando por que o cursor pulava pra posição errada no Firefox depois de inserir um nó formatado.

## O Agora: Camadas de Abstração Que Funcionam de Verdade

Em 2026, a resposta pra "como faço um editor rich text?" nunca é "use contenteditable direto." É "escolha um framework":

### ProseMirror / Tiptap

```javascript
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const editor = new Editor({
  element: document.querySelector('.editor'),
  extensions: [StarterKit],
  content: '<p>Comece a digitar...</p>',
});
```

Tiptap (construído sobre ProseMirror) te dá um modelo de documento baseado em schema. A div contenteditable ainda está lá por baixo, mas você nunca toca nela diretamente. O sistema de transações do ProseMirror cuida de toda a normalização entre browsers.

### Lexical (Meta)

```javascript
import { createEditor } from 'lexical';

const editor = createEditor({
  namespace: 'MeuEditor',
  onError: (error) => console.error(error),
});
```

Lexical vai além — ele substitui completamente o comportamento padrão do contenteditable, interceptando cada tecla e mutação no DOM pra manter sua própria árvore de estado.

### O Que Todos Têm em Comum

Todo framework de editor moderno segue o mesmo padrão: **não confie na implementação de contenteditable do browser.** Eles mantêm seu próprio modelo de documento, traduzem inputs do usuário em operações no modelo, e depois reconciliam o DOM. É o mesmo conceito do virtual DOM do React, aplicado a edição de texto.

## A Lição

Minha resposta de 2016 era um band-aid num problema fundamental. contenteditable foi projetado pra edição simples, mas tentamos construir o Google Docs em cima dele. Os bugs e inconsistências não eram edge cases — eram a feature funcionando como projetada em diferentes engines de browser.

O fato de três frameworks de editor importantes (ProseMirror, Lexical, Slate) terem convergido em "mantenha seu próprio modelo, não confie no DOM" diz tudo sobre quão dolorosa a API crua era. Às vezes a melhor solução não é corrigir os bugs — é construir uma abstração que os torna irrelevantes.
