---
title: 'Formatação de Datas em Java para Português: De SimpleDateFormat a java.time'
description: 'De uma pergunta no Stack Overflow sobre formatar datas em português brasileiro com SimpleDateFormat à moderna API java.time e comparação com JS Temporal.'
date: 2026-03-29
tags: ['java', 'datetime', 'localização', 'stackoverflow']
lang: 'pt'
---

# Formatação de Datas em Java para Português: De SimpleDateFormat a java.time

Fiz uma pergunta no Stack Overflow em Português sobre formatar datas em português brasileiro usando Java. A pergunta recebeu 13 votos — localização era (e ainda é) um tropeço real para desenvolvedores que precisam que seus apps exibam "segunda-feira, 15 de março de 2026" em vez de "Monday, March 15, 2026."

O problema central não mudou: você precisa de formatação de data com suporte a locale. Mas as ferramentas que usamos para isso são fundamentalmente diferentes agora.

## A Abordagem de 2015: SimpleDateFormat

Naquela época, `SimpleDateFormat` era a classe padrão para formatar datas em Java. Para obter saída em português, você passava um `Locale`:

```java
SimpleDateFormat sdf = new SimpleDateFormat(
    "EEEE, dd 'de' MMMM 'de' yyyy",
    new Locale("pt", "BR")
);
String formatted = sdf.format(new Date());
// "segunda-feira, 15 de março de 2026"
```

Funcionava, mas `SimpleDateFormat` era um campo minado:

- **Não era thread-safe.** Compartilhar uma instância entre threads causava corrupção silenciosa de dados. Já vi bugs em produção onde datas de uma requisição vazavam para outra porque alguém cacheou um `SimpleDateFormat` num campo static.
- **Objetos `Date` mutáveis.** `java.util.Date` era mutável, então passar uma data para um método significava que aquele método podia modificar sua data. Cópia defensiva era obrigatória.
- **Ginástica com Calendar.** Fazer aritmética — somar dias, encontrar o primeiro dia do mês — exigia `Calendar`, que era verboso, confuso e também mutável.
- **Confusão de timezone.** `Date` armazenava um timestamp mas imprimia no timezone padrão da JVM. `SimpleDateFormat` tinha sua própria configuração de timezone. Obter comportamento consistente exigia configuração cuidadosa.

Para algo tão simples quanto "mostrar a data de hoje em português", você tinha que desviar de um número surpreendente de armadilhas.

## O Que Mudou: java.time

O Java 8 (2014) introduziu o pacote `java.time`, inspirado no Joda-Time. Em 2026, é a única API de data/hora que você deveria estar usando em Java:

```java
LocalDate today = LocalDate.now();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern(
    "EEEE, dd 'de' MMMM 'de' yyyy",
    new Locale("pt", "BR")
);
String formatted = today.format(formatter);
// "segunda-feira, 15 de março de 2026"
```

O código parece similar, mas o design por baixo é completamente diferente:

- **Imutável.** `LocalDate`, `LocalDateTime`, `ZonedDateTime` — todos imutáveis. Sem cópia defensiva. Sem problemas de thread-safety.
- **Formatadores thread-safe.** `DateTimeFormatter` é imutável e thread-safe. Pode cachear num campo static sem preocupação.
- **Sistema de tipos claro.** `LocalDate` não tem hora. `LocalTime` não tem data. `ZonedDateTime` tem ambos mais timezone. O tipo diz qual informação está presente.
- **Aritmética fluente.** `today.plusDays(7)`, `today.withDayOfMonth(1)`, `today.minusMonths(3)` — legível e retorna uma nova instância.

### Estilos Localizados Embutidos

Você nem precisa de padrões customizados para formatos comuns:

```java
DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL)
    .withLocale(new Locale("pt", "BR"));

LocalDate.now().format(formatter);
// "segunda-feira, 29 de março de 2026"
```

O JDK sabe o formato de data correto para português brasileiro. Deixe ele cuidar do padrão.

## Comparação Cross-Language: JavaScript Temporal

O JavaScript passou pela sua própria evolução de datas. `Intl.DateTimeFormat` já lida com formatação localizada há anos:

```javascript
const date = new Date();
const formatted = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(date);
// "segunda-feira, 29 de março de 2026"
```

E a API `Temporal`, agora disponível em navegadores e runtimes modernos, traz tipos de data imutáveis ao estilo Java para o JavaScript:

```javascript
const today = Temporal.Now.plainDateISO();
const formatted = today.toLocaleString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
```

O padrão está convergindo: objetos de data imutáveis, distinções claras de tipo (data vs. hora vs. datetime vs. zoned), e formatação com locale embutida. Java chegou primeiro com `java.time`, JavaScript seguiu com `Temporal`.

## A Lição

A pergunta original era sobre um padrão de formatação — um problema de sintaxe. Mas a questão real era que a API de data/hora do Java era mal desenhada. `SimpleDateFormat` funcionava no caminho feliz e quebrava em todo outro cenário. A API `java.time` não corrigiu apenas a formatação — corrigiu o modelo mental inteiro ao redor de datas, horas e timezones.

Quando uma plataforma redesenha uma API fundamental, preste atenção. O custo de migração é real, mas os bugs que você nunca vai escrever valem a pena.
