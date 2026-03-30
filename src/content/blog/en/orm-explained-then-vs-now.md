---
title: 'ORM Explained: What It Is, Why It Matters, and How It Evolved'
description: 'From a 2016 Stack Overflow answer on ORM basics to the type-safe, edge-ready query layers of 2026 — what changed and what stayed the same.'
date: 2026-03-29
tags: ['databases', 'orm', 'stackoverflow', 'architecture']
lang: 'en'
---

# ORM Explained: What It Is, Why It Matters, and How It Evolved

In 2016, someone on Stack Overflow in Portuguese asked a straightforward question: "What is ORM?" I wrote an answer explaining the concept, listing pros and cons, and showing pseudo-code comparing raw SQL to ORM-style queries. That answer scored 19 upvotes — not bad for a concept explanation.

Ten years later, ORMs are everywhere. But the way we use them — and the way we think about them — has changed dramatically. Here's what I wrote then, what I'd write now, and what the gap teaches us.

## The 2016 Answer: ORM in a Nutshell

ORM stands for **Object-Relational Mapping**. It's a technique that maps database tables to objects in your programming language, so you can query and manipulate data using your language's syntax instead of writing raw SQL.

Here's the contrast I showed in that answer. Without ORM:

```sql
SELECT id, name, email FROM users WHERE id = 1;
```

```php
$result = mysqli_query($conn, "SELECT id, name, email FROM users WHERE id = 1");
$user = mysqli_fetch_assoc($result);
echo $user['name'];
```

With ORM (using a pseudo-code style similar to Eloquent or Doctrine):

```php
$user = User::find(1);
echo $user->name;
```

The difference is obvious. The ORM version is shorter, more readable, and you don't touch SQL at all. In my answer, I listed the classic pros and cons:

**Pros:**

- Less boilerplate code
- Database portability (switch from MySQL to PostgreSQL without rewriting queries)
- Protection against SQL injection (parameterized queries by default)
- Code that reads like your domain model

**Cons:**

- Performance overhead for complex queries
- Harder to optimize when the ORM generates inefficient SQL
- Learning curve — you need to learn the ORM _and_ SQL
- The "magic" can hide what's actually happening

That answer was solid for 2016. PHP developers were moving from raw `mysqli_*` calls to frameworks like Laravel (Eloquent) and Symfony (Doctrine). Java devs had Hibernate. Python had SQLAlchemy. The message was simple: ORMs save time, but learn SQL anyway.

## Why It Worked Then

In 2016, the typical audience was a PHP or Java developer building monolithic web apps with relational databases. The question wasn't "should I use an ORM?" — it was "what even is this thing?"

ORMs were gaining mainstream adoption beyond enterprise Java. Laravel had made Eloquent accessible to PHP developers who previously wrote raw queries. Django's ORM was a selling point for the framework. The conversation was about adoption.

The trade-offs were straightforward: convenience vs. control. Most developers picking up an ORM for the first time needed to understand that abstraction isn't free, but for CRUD-heavy applications, the productivity gains were massive.

## The 2026 Approach: Type-Safe, Lightweight, Composable

Fast forward to 2026. The ORM landscape looks completely different. Here's the same query in three modern approaches:

**Prisma (type-safe ORM):**

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true, email: true },
});
// user is typed as { id: number; name: string; email: string } | null
```

**Drizzle (thin ORM / query builder):**

```typescript
const user = await db
  .select({ id: users.id, name: users.name, email: users.email })
  .from(users)
  .where(eq(users.id, 1));
// Full type inference, SQL-like syntax
```

**Kysely (type-safe query builder):**

```typescript
const user = await db
  .selectFrom('users')
  .select(['id', 'name', 'email'])
  .where('id', '=', 1)
  .executeTakeFirst();
// Types inferred from database schema
```

Notice the pattern: all three give you full TypeScript type safety. Your IDE knows exactly what fields exist, what types they are, and catches mistakes at compile time. That was science fiction in 2016.

## What Changed

Three shifts reshaped how we think about ORMs:

**1. TypeScript made type-safe queries possible.** The biggest change isn't in the ORM itself — it's in the language. When your query result is a fully typed object, half the reasons you needed an ORM (mapping rows to objects, avoiding field name typos) are handled by the type system. This enabled a new category of tools that give you ORM-like ergonomics without the heavy abstraction layer.

**2. Edge computing pushed for lighter ORMs.** When your code runs on Cloudflare Workers or Vercel Edge Functions, you can't afford a 2MB ORM with connection pooling. Drizzle became popular partly because it's tiny. The "thin ORM" trend — tools that stay close to SQL while adding type safety — is a direct response to the serverless and edge runtime constraints.

**3. The pendulum swung from "ORM everything" to "right tool for the job."** In 2016, the advice was often "use an ORM or write raw SQL." In 2026, most teams mix approaches:

- ORM for simple CRUD operations
- Query builder for complex joins and aggregations
- Raw SQL for performance-critical queries and database-specific features
- Database-level tooling (views, functions, CTEs) for heavy lifting

This isn't new wisdom, but the tooling finally supports it. Prisma lets you drop to raw SQL with `$queryRaw`. Drizzle's API is essentially SQL with TypeScript types. The boundary between ORM and query builder is blurring.

## What Stayed the Same

Re-reading my 2016 answer, the core message still holds: **ORMs abstract SQL, they don't replace it.** If you don't understand `JOIN`, `GROUP BY`, and query execution plans, no ORM will save you from writing slow code.

The pros and cons list is essentially the same too. Performance overhead? Still real — Prisma generates verbose queries that can surprise you. SQL injection protection? Still the number one reason to use parameterized queries, whether through an ORM or a query builder. The "magic" hiding complexity? Drizzle exists precisely because developers wanted less magic.

## Key Takeaway

If I rewrote that Stack Overflow answer today, I'd add one line at the end:

**Learn SQL first. Then pick the thinnest abstraction that keeps you productive.**

In 2016, that abstraction was Eloquent, Hibernate, or Django ORM. In 2026, it might be Drizzle, Kysely, or even just tagged template literals with a type-safe SQL library. The tools changed. The principle didn't.

Understanding what happens between your code and your database is not optional — it's what separates developers who ship features from developers who debug mystery performance issues at 2 AM.
