---
title: 'Bloquear Caracteres Especiais no Input: De Regex a Validação Nativa'
description: 'Minha resposta no Stack Overflow de 2015 usava eventos keypress para filtrar caracteres. Em 2026, o evento input e validação nativa fazem melhor.'
date: 2026-03-29
tags: ['html', 'javascript', 'validação', 'stackoverflow']
lang: 'pt'
---

# Bloquear Caracteres Especiais no Input: De Regex a Validação Nativa

Em 2015, respondi uma pergunta no Stack Overflow em Português sobre como restringir campos de input para aceitar apenas certos caracteres. Recebeu 14 votos — um problema comum com uma solução enganosamente complicada.

A abordagem original funcionava. Mas tinha um ponto cego que levou anos para a comunidade perceber completamente.

## A Abordagem de 2015: Interceptando Teclas

Na época, o padrão era interceptar o evento `keypress` e verificar cada caractere contra uma lista permitida:

```javascript
// 2015: Bloquear caracteres no nível da tecla
input.onkeypress = function (e) {
  var char = String.fromCharCode(e.which || e.keyCode);
  var allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  if (allowed.indexOf(char) === -1) {
    e.preventDefault();
  }
};
```

Ou usando regex:

```javascript
input.onkeypress = function (e) {
  var char = String.fromCharCode(e.which);
  if (!/[a-zA-Z0-9]/.test(char)) {
    e.preventDefault();
  }
};
```

Era satisfatório. Digitar um caractere especial e nada acontecer. Feedback limpo e imediato.

## O Problema Que Ninguém Mencionou

Filtrar via keypress tem uma falha fundamental: **só captura entrada do teclado**. Em 2015, isso cobria a maioria dos casos. Mas o usuário também pode:

- **Colar** texto com Ctrl+V ou clique direito
- **Arrastar e soltar** texto no campo
- **Usar preenchimento automático** do navegador ou gerenciadores de senhas
- **Usar entrada por voz** ou ditado
- **Usar teclados virtuais** em dispositivos móveis
- **Usar IME** (Input Method Editor) para idiomas asiáticos

Nenhum desses dispara `keypress`. Seu campo de input cuidadosamente filtrado aceitaria qualquer caractere por esses métodos.

## A Abordagem de 2026: Limpe o Valor, Não Bloqueie a Entrada

Filtragem moderna de input usa o evento `input`, que dispara independente de como o valor mudou:

```javascript
// 2026: Limpar o valor em qualquer mudança
input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
});
```

Isso captura tudo — teclado, colar, preenchimento automático, voz, arrastar e soltar. Em vez de bloquear o caractere antes de aparecer, remove caracteres inválidos imediatamente após o valor mudar.

### Validação HTML Nativa

Para muitos casos, você nem precisa de JavaScript:

```html
<!-- Permitir apenas letras e números, validado no submit -->
<input type="text" pattern="[a-zA-Z0-9]+" title="Apenas letras e números" required />

<!-- Sugerir teclado numérico no mobile -->
<input type="text" inputmode="numeric" pattern="[0-9]*" />
```

O atributo `pattern` valida no envio do formulário. O atributo `inputmode` sugere qual layout de teclado navegadores mobile devem mostrar — sem restringir o que o usuário pode digitar.

### Mensagens de Validação Customizadas

Para melhor UX, combine o evento `input` com a Constraint Validation API:

```javascript
input.addEventListener('input', () => {
  if (/[^a-zA-Z0-9]/.test(input.value)) {
    input.setCustomValidity('Apenas letras e números são permitidos');
  } else {
    input.setCustomValidity('');
  }
});
```

Isso dá estilização nativa de validação do navegador e suporte a leitor de tela de graça.

## Conclusão

Não bloqueie teclas — valide e limpe o valor do input. O evento `keypress` era produto do seu tempo, quando teclados eram o único método de entrada relevante. O evento `input` reflete a realidade de que texto entra em campos por dezenas de canais.

E sempre lembre: validação no cliente é para UX. Validação no servidor é para segurança. Nenhuma quantidade de filtragem JavaScript substitui validar no servidor.
