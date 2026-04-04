---
title: 'Como Eu Construí o CasinoCraftz Slots com IA: Diário de Engenharia por Fases'
description: 'Um relato prático, em primeira pessoa, de como usei IA em ciclos reais de implementação com foco em segurança de bridge, paridade e fechamento de milestone.'
date: 2026-04-03
tags: ['ia', 'engenharia', 'slots', 'testes', 'astro']
lang: 'pt'
---

# Como Eu Construí o CasinoCraftz Slots com IA: Diário de Engenharia por Fases

Eu queria que o CasinoCraftz fosse divertido, mas nunca manipulativo. Essa regra de produto mudou todas as decisões técnicas.

Este post é meu diário de build do módulo Slots no ciclo da milestone `v1.8`: o que eu realmente alterei, onde a IA ajudou, onde ela falhou, e quais decisões em nível de commit tornaram o sistema mais confiável.

## Regra Base: Educacional, Determinístico e Explicável

Desde o início, a direção não era "fazer um clone de cassino". Era:

- simulação educacional browser-first
- comportamento determinístico de runtime
- sinais explícitos de transparência
- enquadramento sem dinheiro real

Isso significa que polish de produto e segurança de engenharia precisavam evoluir em paralelo.

## Como Usei IA na Prática (Sem Hype)

Usei IA como acelerador de implementação e parceira de revisão, não como piloto automático.

Meu loop foi:

1. Definir requisito e objetivo da fase.
2. Pedir para a IA propor edições concretas de código/testes.
3. Aplicar apenas o conjunto mínimo de mudanças preservando a arquitetura.
4. Rodar contratos, fatia de Playwright, lint e build.
5. Rejeitar ou revisar saída da IA quando ela introduzia ambiguidade.

A IA foi rápida em:

- rascunhos de seletores, wiring de estado e variantes de cópia
- apontar gaps de consistência entre rotas EN/PT
- apertar asserções de teste após mudanças de comportamento

A IA foi fraca em (e exigiu correção humana rigorosa) quando:

- manter intenção semântica em múltiplos arquivos com nomes parecidos
- evitar edições amplas demais em textos UI e classes de animação
- respeitar disciplina de release em nível de milestone por padrão

## Fase 33: Segurança de Bridge Antes de Expandir Features

Antes de adicionar delight ou tutorial mais rico, eu travei o contrato da bridge.

Commits principais:

- `f46e8c8` - `feat(bridge): version ccz:spin-settled envelope and add safe parser (33-01/Task-1)`
- `65b96b5` - `test(bridge): versioning, backward compat, and authority isolation contracts (33-01/Task-2)`
- `ce80fb4` - `test(e2e): lock EN/PT casinocraftz bridge parity in compatibility suite (33-01/Task-3)`

O efeito prático:

- parsing de payload de evento ficou explícito e versionado
- compatibilidade retroativa foi testada, não assumida
- paridade entre rotas inglês/português virou contrato automatizado

Essa foi uma das decisões de maior impacto do ciclo. Ela evitou mais regressões futuras do que qualquer ajuste visual.

## Fases 34-36: Comportamento, Paridade e Fechamento de Segurança

Depois da estabilidade da bridge, o trabalho migrou para três objetivos conectados:

- realismo da progressão do tutorial e clareza de replay/recap
- hardening de paridade (cópia, seletores e comportamento de rota)
- fechamento de segurança com cadeia completa de validação

Nesse ponto, edições assistidas por IA aumentaram o ritmo, mas toda mudança ainda precisava passar por restrições de determinismo e paridade.

## Pass de Delight Sem Quebrar Guardrails

O pass visual aconteceu depois, no commit:

- `830ccda` - `feat(casinocraftz): add delightful tutorial microinteractions`

Adicionei microinterações nas transições do tutorial e nos estados de ativação dos cards. Regra não negociável: motion pode clarificar estado, mas nunca esconder estado.

Por isso, a implementação manteve:

- labels explícitas para cards bloqueados/desbloqueados
- sinais de progressão vinculados ao estado determinístico do tutorial
- comportamento seguro para reduced motion

## Disciplina de Validação Foi o Maior Multiplicador

O hábito de maior impacto não foi gerar código mais rápido. Foi repetir a mesma cadeia de fechamento:

- contratos de código
- fatia de compatibilidade Playwright
- lint
- build de produção

Essa rotina tornou a IA realmente útil porque sugestões incorretas ficaram baratas de rejeitar.

Sem testes, velocidade com IA cria fragilidade. Com testes, velocidade com IA cria convergência mais rápida.

## Fechamento de Milestone e Higiene de Release

Quando a confiança da milestone foi travada, eu arquivei artefatos de planejamento e concluí bookkeeping de release.

Commits de fechamento:

- `6365c7d` - `chore(milestone): close v1.8 confidence lock and archives`
- `f86dab6` - `docs(state): mark v1.8 milestone as tagged complete`

Essa parte é menos glamourosa que animações, mas é essencial. Se estado de planning, estado de requisitos e tags de git divergem, o time perde confiança no histórico de release.

## O Que Eu Repetiria

- definir guardrails antes de floreio visual
- forçar paridade EN/PT com checks automatizados, não revisão manual
- usar IA para gerar propostas, não como autoridade final
- sincronizar artefatos de milestone com o histórico real de git

## O Que Eu Melhoraria no Próximo Ciclo

- ampliar cobertura de asserções em causalidade de recap do tutorial
- ampliar checks E2E para reentrada de estado após transições de rota
- automatizar mais validações de consistência de release em CI

## Conclusão

A IA foi mais valiosa quando combinada com contratos determinísticos e restrições explícitas de produto.

Se eu remover qualquer lado dessa equação, a qualidade cai rápido:

- IA sem guardrails vira ruído.
- Guardrails sem IA diminuem ritmo de iteração.

O ponto ideal foi usar IA para acelerar implementação enquanto testes, paridade e disciplina de milestone permaneciam como fonte da verdade.
