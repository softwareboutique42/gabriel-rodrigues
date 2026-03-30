---
title: 'AngularJS Form Validation Lessons: From $dirty/$valid to Modern Schema Validation'
description: 'My Stack Overflow answer about AngularJS form validation scored 5 upvotes. In 2026, React Hook Form with Zod or Valibot shows how far form state management has come.'
date: 2026-03-29
tags: ['angularjs', 'forms', 'stackoverflow', 'history']
lang: 'en'
---

# AngularJS Form Validation Lessons: From $dirty/$valid to Modern Schema Validation

I answered a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/72430) about AngularJS form validation — specifically how to use the built-in validation states to show error messages at the right time. It scored 5 upvotes, and it reflected a real struggle developers had with AngularJS's form system.

Looking back, what strikes me isn't that the solution was wrong. It's that AngularJS was genuinely ahead of its time in thinking about form state. The concepts it introduced are everywhere now, just with better APIs.

## The 2015 Problem: AngularJS Two-Way Binding and Form States

AngularJS gave every form and input a set of state properties through two-way data binding:

```html
<!-- 2015: AngularJS form validation -->
<form name="userForm" ng-submit="submit()" novalidate>
  <input type="email" name="email" ng-model="user.email" required />

  <span ng-show="userForm.email.$dirty && userForm.email.$invalid">
    Please enter a valid email
  </span>

  <span ng-show="userForm.email.$error.required && userForm.email.$dirty"> Email is required </span>

  <button ng-disabled="userForm.$invalid">Submit</button>
</form>
```

The `$dirty`, `$pristine`, `$valid`, `$invalid`, and `$touched` properties were powerful concepts. They told you exactly where the user was in the form lifecycle. But using them was verbose and error-prone.

## What Made It Painful

The form validation system had fundamental friction points:

1. **Two-way binding side effects** — Every keystroke updated the model, which triggered watchers, which could trigger more updates. In complex forms, this cascade caused performance problems and hard-to-trace bugs
2. **Validation logic in templates** — Conditions like `userForm.email.$dirty && userForm.email.$invalid && userForm.email.$error.required` were unreadable. One typo in a property name and the error message silently never appeared
3. **No schema validation** — Validation rules were scattered across HTML attributes (`required`, `ng-minlength`, `ng-pattern`) and custom directives. There was no single source of truth for what made a form valid
4. **Custom validators were complex** — Writing a custom validator meant creating a directive, linking it to `ngModelController`, and pushing/pulling from `$validators`. Ten lines of boilerplate for one rule

The biggest problem was that form state and validation rules lived in two different places: state in the controller, rules in the template. Keeping them in sync was a constant battle.

## The 2026 Approach: Schema-First Validation

### React Hook Form + Zod

The modern pattern puts the schema at the center:

```typescript
// 2026: Schema-first validation with Zod + React Hook Form
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const userSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  age: z.number().min(18, 'Must be at least 18'),
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

One schema defines all validation rules. TypeScript infers the form type from the schema. Error messages live next to the rules they belong to. The form state (`isDirty`, `isValid`, `isSubmitting`) is still there — AngularJS's concepts survived — but the API is clean.

### Valibot for Bundle-Conscious Apps

```typescript
// 2026: Valibot — tree-shakeable schema validation
import * as v from 'valibot';

const userSchema = v.object({
  email: v.pipe(v.string(), v.email('Please enter a valid email')),
  age: v.pipe(v.number(), v.minValue(18, 'Must be at least 18')),
});
```

Valibot provides the same pattern with a smaller bundle, using a functional pipe-based API instead of method chaining.

## What Changed

The core insight AngularJS had was correct: forms need explicit state tracking (`dirty`, `touched`, `valid`). What changed is where validation rules live. Moving from scattered HTML attributes to a centralized schema was the breakthrough. Type inference from the schema was the bonus.

That Stack Overflow answer helped developers work within AngularJS's model. But the lasting lesson is about separation of concerns: form state management, validation rules, and error presentation should be three distinct layers, not tangled together in template expressions.
