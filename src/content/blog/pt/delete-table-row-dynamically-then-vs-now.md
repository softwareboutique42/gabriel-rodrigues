---
title: 'Deletar Linhas de Tabela Dinamicamente com JavaScript'
description: 'Minha resposta no SO de 2016 usava parentNode.removeChild. Em 2026, element.remove() e closest() resolvem em uma linha.'
date: 2026-03-29
tags: ['javascript', 'dom', 'stackoverflow', 'html']
lang: 'pt'
---

# Deletar Linhas de Tabela Dinamicamente com JavaScript

Em 2016, respondi uma pergunta no Stack Overflow em Português sobre deletar linhas de uma tabela HTML dinamicamente. Recebeu 6 votos. O padrão estava em todo lugar — tabelas editáveis onde usuários podiam adicionar e remover linhas.

## A Abordagem de 2016

```javascript
function deleteRow(button) {
  var row = button.parentNode.parentNode; // button > td > tr
  row.parentNode.removeChild(row);
}
```

A cadeia `parentNode.parentNode` era frágil — mude a estrutura HTML e a função quebra. `removeChild` também exigia referenciar o pai para remover o filho, o que sempre pareceu invertido.

## A Abordagem de 2026

```javascript
document.querySelector('table').addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    e.target.closest('tr').remove();
  }
});
```

**`closest('tr')`** sobe a árvore DOM e encontra o ancestral mais próximo correspondente. **`element.remove()`** remove o elemento diretamente. Sem referenciar o pai.

## Conclusão

O princípio não mudou: delegue eventos na tabela, suba até a linha, remova. O que mudou é a API. `closest()` e `remove()` transformaram uma cadeia frágil de `parentNode` em código auto-documentado.
