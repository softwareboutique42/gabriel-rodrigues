---
title: 'Lições de Versionamento de Bridge no CasinoCraftz: Como Evitamos Drift Entre Rotas'
description: 'Um relato prático sobre versionamento de envelope, parsing seguro, isolamento de autoridade e checks de paridade EN/PT no CasinoCraftz.'
date: 2026-04-03
tags: ['arquitetura', 'eventos', 'testes', 'i18n', 'slots']
lang: 'pt'
---

# Lições de Versionamento de Bridge no CasinoCraftz: Como Evitamos Drift Entre Rotas

Uma das formas mais fáceis de quebrar um shell de jogo embarcado é o drift de eventos: o host entende uma coisa, o módulo entende outra, e os dois ainda compilam.

Eu bati nesse risco ao endurecer a comunicação entre CasinoCraftz e Slots. A correção não foi criar mais nomes de evento. A correção foi impor contratos rígidos.

## Formato do Problema

Eu tinha três restrições simultâneas:

- payloads de evento precisavam manter compatibilidade retroativa
- host e módulo precisavam respeitar fronteiras de autoridade
- shells EN/PT precisavam se comportar da mesma forma

Sem versionamento e parsing seguro, essas restrições entram em conflito com o tempo.

## O Que Mudamos

A sequência principal de implementação foi:

- `f46e8c8` - `feat(bridge): version ccz:spin-settled envelope and add safe parser (33-01/Task-1)`
- `65b96b5` - `test(bridge): versioning, backward compat, and authority isolation contracts (33-01/Task-2)`
- `ce80fb4` - `test(e2e): lock EN/PT casinocraftz bridge parity in compatibility suite (33-01/Task-3)`

Essa ordem importa. Entregar parsing primeiro, depois contratos, depois paridade e2e trouxe feedback rápido com baixa fricção.

## Regra 1: Versionar o Envelope, Não Só o Nome do Evento

Em vez de depender de suposições implícitas de shape, tratamos payloads como envelopes com semântica explícita de versão.

Por que funcionou:

- produtores podem evoluir payload com segurança
- consumidores podem rejeitar formatos desconhecidos ou inválidos
- política de compatibilidade vira algo testável

Se eu pulasse versionamento explícito, cada ajuste de payload viraria uma aposta.

## Regra 2: Parse Defensivo na Fronteira

Introduzimos parsing seguro no limite da bridge, onde dados inválidos são mais baratos de rejeitar.

Isso trouxe dois ganhos concretos:

- payload malformado falha cedo
- código interno de tutorial/runtime fica mais simples

Hoje eu trato isso como padrão: validação rígida na borda, suposições limpas no núcleo.

## Regra 3: Testar Isolamento de Autoridade de Forma Explícita

Integração entre frames fica confusa quando a posse de responsabilidade é nebulosa. Usamos contratos para impor quem pode emitir e quem pode consumir cada evento.

Isso bloqueou regressões sutis em que os dois lados estavam "tecnicamente certos", mas semanticamente desalinhados.

## Regra 4: Tratar Paridade de Idioma Como Comportamento, Não Tradução

O problema EN/PT não era só texto. Era paridade de comportamento.

Travamos isso com checks E2E de compatibilidade para impedir que drift entre rotas ficasse escondido por diferenças de cópia.

Essa decisão rendeu depois, quando vieram mudanças de tutorial e estado dos cards. Os checks de paridade absorveram risco cedo.

## Papel da IA Nesta Fase

A IA ajudou a gerar rascunhos de testes e listas de edge cases, mas revisão humana continuou obrigatória para semântica de fronteira.

Onde a IA ajudou mais:

- geração rápida de casos negativos candidatos
- detecção de inconsistências de nomenclatura em testes
- rascunho de expansões para checks de paridade

Onde a IA foi menos confiável:

- inferir posse de autoridade com contexto parcial
- decidir política de compatibilidade de longo prazo

## Checklist Prático que Eu Uso Agora

Antes de enviar qualquer mudança de bridge, agora eu exijo:

- política explícita de versão de payload
- caminho de parse seguro para entrada desconhecida/inválida
- asserções de posse de autoridade
- checks de paridade de rota/idioma
- fatia end-to-end de validação em CI

Esse checklist desacelerou um PR e acelerou todos os seguintes.

## Fechamento

Confiabilidade de bridge é mais disciplina do que novidade.

Versione envelopes, rejeite entrada inválida cedo e execute checks de paridade sempre. Quando o contrato é explícito, evoluir fica tedioso no melhor sentido.
