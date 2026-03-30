---
title: 'Licoes de Validacao de Formularios AngularJS: De $dirty/$valid a Validacao por Schema'
description: 'Minha resposta no Stack Overflow sobre validacao de formularios AngularJS recebeu 5 votos. Em 2026, React Hook Form com Zod ou Valibot mostra o quanto o gerenciamento de estado de formularios evoluiu.'
date: 2026-03-29
tags: ['angularjs', 'formulários', 'stackoverflow', 'história']
lang: 'pt'
---

# Licoes de Validacao de Formularios AngularJS: De $dirty/$valid a Validacao por Schema

Respondi uma pergunta no Stack Overflow em Portugues sobre validacao de formularios no AngularJS — especificamente como usar os estados de validacao embutidos para mostrar mensagens de erro no momento certo. Recebeu 5 votos, e refletia uma dificuldade real que desenvolvedores tinham com o sistema de formularios do AngularJS.

Olhando para tras, o que me chama atencao nao e que a solucao estava errada. E que o AngularJS estava genuinamente a frente do seu tempo em pensar sobre estado de formularios. Os conceitos que ele introduziu estao em todo lugar agora, so que com APIs melhores.

## O Problema de 2015: Two-Way Binding e Estados de Formulario do AngularJS

O AngularJS dava a cada formulario e input um conjunto de propriedades de estado atraves do two-way data binding:

```html
<!-- 2015: Validacao de formulario AngularJS -->
<form name="userForm" ng-submit="submit()" novalidate>
  <input type="email" name="email" ng-model="user.email" required />

  <span ng-show="userForm.email.$dirty && userForm.email.$invalid">
    Por favor, insira um email valido
  </span>

  <span ng-show="userForm.email.$error.required && userForm.email.$dirty">
    Email e obrigatorio
  </span>

  <button ng-disabled="userForm.$invalid">Enviar</button>
</form>
```

As propriedades `$dirty`, `$pristine`, `$valid`, `$invalid` e `$touched` eram conceitos poderosos. Elas diziam exatamente onde o usuario estava no ciclo de vida do formulario. Mas usa-las era verboso e propenso a erros.

## O Que Tornava Doloroso

O sistema de validacao de formularios tinha pontos de friccao fundamentais:

1. **Efeitos colaterais do two-way binding** — Cada tecla atualizava o model, que disparava watchers, que podiam disparar mais atualizacoes. Em formularios complexos, essa cascata causava problemas de performance e bugs dificeis de rastrear
2. **Logica de validacao nos templates** — Condicoes como `userForm.email.$dirty && userForm.email.$invalid && userForm.email.$error.required` eram iilegiveis. Um typo num nome de propriedade e a mensagem de erro silenciosamente nunca aparecia
3. **Sem validacao por schema** — Regras de validacao estavam espalhadas entre atributos HTML (`required`, `ng-minlength`, `ng-pattern`) e diretivas customizadas. Nao havia uma unica fonte de verdade para o que tornava um formulario valido
4. **Validadores customizados eram complexos** — Escrever um validador custom significava criar uma diretiva, liga-la ao `ngModelController` e fazer push/pull no `$validators`. Dez linhas de boilerplate para uma regra

O maior problema era que estado do formulario e regras de validacao viviam em dois lugares diferentes: estado no controller, regras no template. Manter sincronizados era uma batalha constante.

## A Abordagem de 2026: Validacao Schema-First

### React Hook Form + Zod

O padrao moderno coloca o schema no centro:

```typescript
// 2026: Validacao schema-first com Zod + React Hook Form
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const userSchema = z.object({
  email: z.string().email('Por favor, insira um email valido'),
  age: z.number().min(18, 'Deve ter pelo menos 18 anos'),
});

type UserForm = z.infer<typeof UserForm>;

function UserFormComponent() {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

Um schema define todas as regras de validacao. TypeScript infere o tipo do formulario a partir do schema. Mensagens de erro ficam junto das regras a que pertencem. O estado do formulario (`isDirty`, `isValid`, `isSubmitting`) ainda esta la — os conceitos do AngularJS sobreviveram — mas a API e limpa.

### Valibot para Apps Conscientes de Bundle

```typescript
// 2026: Valibot — validacao de schema com tree-shaking
import * as v from 'valibot';

const userSchema = v.object({
  email: v.pipe(v.string(), v.email('Por favor, insira um email valido')),
  age: v.pipe(v.number(), v.minValue(18, 'Deve ter pelo menos 18 anos')),
});
```

Valibot oferece o mesmo padrao com um bundle menor, usando uma API funcional baseada em pipe ao inves de method chaining.

## O Que Mudou

O insight central do AngularJS estava correto: formularios precisam de rastreamento explicito de estado (`dirty`, `touched`, `valid`). O que mudou e onde as regras de validacao vivem. Migrar de atributos HTML espalhados para um schema centralizado foi o avanco decisivo. Inferencia de tipos a partir do schema foi o bonus.

Aquela resposta no Stack Overflow ajudou desenvolvedores a trabalhar dentro do modelo do AngularJS. Mas a licao duradoura e sobre separacao de responsabilidades: gerenciamento de estado do formulario, regras de validacao e apresentacao de erros devem ser tres camadas distintas, nao emaranhadas em expressoes de template.
