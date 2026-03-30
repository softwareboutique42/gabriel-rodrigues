---
title: 'disabled vs readonly: O Atributo HTML Que Ninguém Acerta'
description: 'Minha resposta no Stack Overflow de 2015 mostrou que disabled="false" ainda desabilita. Em 2026, o atributo inert adiciona uma terceira opção.'
date: 2026-03-29
tags: ['html', 'formulários', 'stackoverflow', 'acessibilidade']
lang: 'pt'
---

# disabled vs readonly: O Atributo HTML Que Ninguém Acerta

Em 2015, respondi uma [pergunta no Stack Overflow em Português](https://pt.stackoverflow.com/questions/6770) sobre a diferença entre `disabled` e `readonly`. O que surpreendeu a maioria não foi a diferença entre os dois — foi descobrir que `disabled="false"` ainda desabilita o input.

## A Resposta de 2015: Atributos Booleanos São Estranhos

Tanto `disabled` quanto `readonly` são **atributos booleanos** em HTML. Sua mera presença significa "true." O valor não importa:

```html
<!-- Todos esses desabilitam o input -->
<input disabled />
<input disabled="disabled" />
<input disabled="false" />
<input disabled="goku" />

<!-- A única forma de NÃO desabilitar: remover o atributo -->
<input />
```

Isso confundia desenvolvedores constantemente. Você escrevia `disabled="false"` esperando habilitar o campo, e ele continuava desabilitado. O atributo estar presente é o que importa, não seu valor.

### A Diferença Real

| Comportamento                | `disabled`  | `readonly`   |
| ---------------------------- | ----------- | ------------ |
| Usuário pode editar          | Não         | Não          |
| Valor enviado com formulário | **Não**     | Sim          |
| Pode receber foco            | Não         | Sim          |
| Tab navega até ele           | Não         | Sim          |
| Aparência visual             | Acinzentado | Normal       |
| Funciona em todos inputs     | Sim         | Apenas texto |

A distinção crítica: **campos disabled não são enviados com o formulário**. Se você tem um campo mostrando um valor calculado que o servidor precisa, use `readonly`. Se o campo é realmente inativo, use `disabled`.

## A Perspectiva de 2026: Três Opções Agora

### O Atributo `inert`

HTML ganhou um novo jogador: `inert`. Diferente de `disabled` (que foca em controles individuais de formulário), `inert` desabilita uma subárvore inteira:

```html
<div inert>
  <h2>Seção de Pagamento</h2>
  <input type="text" name="card" />
  <button>Pagar</button>
  <!-- Tudo aqui dentro é não-interativo -->
</div>
```

Uma subárvore `inert` é:

- Não focável (inputs, buttons, links — nada)
- Não clicável
- Oculta de leitores de tela (como se não existisse)
- Visualmente esmaecida (na maioria dos navegadores)

Perfeito para diálogos modais — quando o modal está aberto, marque o conteúdo de fundo como `inert` para prevenir interação.

### Considerações ARIA

`disabled` tem implicações de acessibilidade que `readonly` não tem. Leitores de tela anunciam campos disabled diferentemente:

```html
<!-- Leitor de tela: "Número do cartão, editar, desabilitado" -->
<input disabled aria-label="Número do cartão" />

<!-- Leitor de tela: "Número do cartão, editar, somente leitura" -->
<input readonly aria-label="Número do cartão" />
```

Existe também `aria-disabled="true"`, que comunica o estado desabilitado para tecnologia assistiva sem remover o elemento da ordem de tab:

```html
<!-- Focável mas anunciado como desabilitado -->
<input aria-disabled="true" aria-label="Número do cartão" />
```

Use quando quer que usuários de leitor de tela encontrem o campo e entendam por que está desabilitado (talvez com uma explicação próxima), em vez de ele desaparecer silenciosamente da navegação.

### Guia Rápido de Decisão

- **Campo não deve ser enviado:** `disabled`
- **Campo deve ser enviado mas não editado:** `readonly`
- **Seção inteira deve ser não-interativa:** `inert`
- **Campo deve ser encontrável mas não-funcional:** `aria-disabled="true"`

## Conclusão

Em 2015, a confusão principal era "por que `disabled='false'` ainda desabilita?" Em 2026, o cenário expandiu. `disabled`, `readonly`, `inert` e `aria-disabled` servem propósitos diferentes. Escolha errado e vai quebrar o envio do formulário, a navegação por teclado ou a experiência do leitor de tela. Entender a diferença não é trivia — é a base de formulários acessíveis.
