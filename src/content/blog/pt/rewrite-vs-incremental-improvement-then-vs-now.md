---
title: 'Reescrever vs Melhorar Incrementalmente: A Pergunta Que Todo Time Enfrenta'
description: 'De uma resposta de 2015 no Stack Overflow sobre reescrever software de faturamento até a realidade do strangler fig em 2026 — quando reescrever, quando melhorar, e por que a resposta geralmente é os dois.'
date: 2026-03-29
tags: ['arquitetura', 'stackoverflow', 'gestão', 'boas-práticas']
lang: 'pt'
---

# Reescrever vs Melhorar Incrementalmente: A Pergunta Que Todo Time Enfrenta

Em 2015, eu trabalhava numa empresa de software de faturamento que estava reescrevendo um sistema originalmente construído em 2004. Alguém no [Stack Overflow em Português](https://pt.stackoverflow.com/questions/50590) perguntou sobre como convencer clientes e equipes a adotar uma reescrita, e eu compartilhei minha experiência numa resposta que recebeu 4 votos positivos. Não viralizou, mas o suficiente pra mostrar que outros desenvolvedores estavam enfrentando a mesma questão.

Onze anos depois, já vi reescritas darem certo e darem errado. A pergunta não mudou — mas as ferramentas, os padrões e a forma como eu penso na resposta mudaram completamente.

## A Perspectiva de 2015: Venda a Reescrita Com Métricas

Naquela época, minha abordagem era direta: construir um caso que o cliente não conseguisse ignorar. O sistema de faturamento que estávamos substituindo era uma aplicação desktop atrelada a uma versão específica do Windows. Nosso pitch pros clientes tinha três pilares:

**Mais dispositivos.** O sistema antigo rodava numa máquina só. O novo era web — acessível pelo celular, tablet, qualquer navegador. Pra uma empresa de faturamento com técnicos em campo, só isso já era um argumento forte.

**Tempo de desenvolvimento mais rápido.** A base de código legada não tinha nenhuma separação de responsabilidades. Lógica de negócio vivia dentro de event handlers da interface. Adicionar um novo tipo de nota fiscal significava mexer em dezenas de arquivos em múltiplas camadas que na verdade nem eram camadas. Adotamos MVC, e de repente funcionalidades que levavam semanas levavam dias.

**Menos redundância no banco de dados.** O schema original tinha sido estendido tantas vezes que os mesmos dados de cliente viviam em quatro tabelas diferentes. Normalizamos o banco, reduzimos custos de armazenamento e — mais importante — eliminamos toda uma categoria de bugs onde os dados ficavam dessincronizados.

Também fizemos o novo sistema responsivo, o que em 2015 ainda era um diferencial. O cliente podia mostrar pros usuários finais uma interface moderna em vez de algo que parecia ter vindo junto com o Windows XP.

Funcionou. O cliente aprovou, fizemos a reescrita e o novo sistema foi pra produção. Vitória, certo?

## Joel Spolsky Disse Pra Nunca Fazer Isso

Tem um post famoso do Joel Spolsky do ano 2000 — "Things You Should Never Do, Part I" — onde ele argumenta que reescrever software do zero é o pior erro estratégico que uma empresa pode cometer. O exemplo dele foi o Netscape, que reescreveu o navegador e perdeu o mercado pro Internet Explorer no processo.

O argumento do Joel é convincente: código funcionando contém anos de conhecimento acumulado. Cada condicional estranha, cada tratamento de caso extremo, cada null check aparentemente sem sentido — tudo existe porque alguém encontrou um bug real em produção. Quando você reescreve do zero, joga tudo isso fora e começa a redescobrir esses edge cases um por um, em produção, com usuários reais.

Em 2015, eu reconhecia esse argumento mas não tinha internalizado de verdade. Nossa reescrita do sistema de faturamento deu certo, então achei que a chave era simplesmente ter boas métricas e um plano sólido. O que eu não enxergava era o viés de sobrevivência — eu estava olhando pra reescrita que deu certo e ignorando todas as que não deram.

## A Realidade de 2026: Você Não Precisa Escolher

A maior mudança no meu pensamento é que "reescrever vs melhorar" é uma falsa dicotomia. A indústria descobriu isso, e a resposta tem um nome: o padrão **strangler fig**.

A ideia é simples. Em vez de substituir o sistema antigo de uma vez, você constrói novas funcionalidades ao lado dele. Features novas vão pro sistema novo. Features antigas são migradas uma por vez. O sistema antigo vai encolhendo gradualmente até não sobrar nada pra estrangular.

Martin Fowler cunhou o termo, mas levou uma década pra ferramentaria acompanhar. Em 2026, essa abordagem é genuinamente prática:

**Micro-frontends tornam a migração incremental de UI real.** Você pode rodar um módulo React dentro de uma aplicação Angular, ou montar um componente novo ao lado de código legado em jQuery. Module federation, import maps e web components significam que o antigo e o novo podem coexistir na mesma página sem uma reescrita completa do shell.

**API gateways cuidam do roteamento.** Você aponta `/api/invoices` pro serviço novo e `/api/legacy-reports` pro antigo. O cliente não sabe nem se importa com qual sistema cuida de qual requisição.

**Ferramentas de migração assistidas por IA mudaram o cálculo.** Ferramentas como ast-grep e codemod conseguem automatizar as partes tediosas da migração — renomear APIs, atualizar caminhos de import, converter padrões. O que antes levava uma semana de busca-e-substitui entediante agora leva uma tarde revisando diffs gerados por IA.

Essa é a abordagem que eu recomendaria pra maioria dos times hoje. Não uma reescrita big-bang. Não "deixa como está." Uma substituição deliberada e incremental onde você sempre tem um sistema funcionando em produção.

## Quando Uma Reescrita Total Ainda Faz Sentido

Dito isso, existem situações onde a melhoria incremental bate num muro. Já vi três padrões que consistentemente empurram times pra uma reescrita:

**A stack é fundamentalmente limitante.** Se sua aplicação só roda no Internet Explorer, ou depende de um runtime que foi descontinuado sem caminho de migração, envolver com um strangler fig não ajuda. A fundação em si é o problema. Nosso sistema de faturamento de 2015 se encaixava nessa categoria — uma aplicação desktop Windows não podia virar uma aplicação web incrementalmente.

**Contratar é impossível.** Se seu sistema é escrito numa linguagem ou framework que ninguém quer trabalhar, cada sprint fica mais lento conforme o time encolhe. Já vi isso com sistemas COBOL, ASP clássico e até bases PHP antigas sem framework. Você não consegue melhorar incrementalmente o que não consegue staffar.

**Segurança é estruturalmente irrecuperável.** Quando autenticação foi adicionada como gambiarra depois, quando input do usuário flui pelo sistema sem nenhuma camada de sanitização, quando as credenciais do banco estão hardcoded em 200 arquivos — às vezes o custo de proteger o sistema existente supera o custo de reconstruir com segurança nativa.

## Quando Melhoria Incremental É a Decisão Certa

Por outro lado, existem sinais claros de que você _não_ deveria reescrever:

**Software funcionando com usuários pagantes.** Se o sistema gera receita e os usuários estão razoavelmente satisfeitos, uma reescrita introduz risco sem valor imediato pra eles. Cada mês que você gasta reescrevendo é um mês que você não está entregando funcionalidades que seus clientes estão pedindo.

**Lógica de domínio complexa demais pra re-derivar.** Alguns sistemas codificam décadas de regras de negócio que ninguém entende completamente mais. As regras de faturamento, os cálculos de imposto, os edge cases pra configurações específicas de cada cliente — esse conhecimento vive no código, não na cabeça de ninguém. Reescrever significa redescobrir tudo isso, e você vai deixar coisas passarem.

**O time não tem experiência com reescritas.** Uma reescrita é um desafio de gestão de projeto tanto quanto técnico. Você precisa manter o sistema antigo rodando, construir o novo, migrar dados e coordenar a transição. Se seu time nunca fez isso antes, o risco da reescrita se arrastar por anos é muito real.

## O Que Eu Diria Pro Gabriel de 2015

A resposta não é reescrever OU melhorar — é entender quais partes reescrever e quais encapsular. O padrão strangler fig permite fazer os dois simultaneamente. Comece pela parte do sistema que causa mais dor. Construa uma versão nova dessa peça. Redirecione o tráfego. Repita.

Se eu voltasse pra aquela empresa de faturamento hoje, não proporia uma reescrita completa. Identificaria os três módulos mais problemáticos, construiria substitutos modernos atrás de um API gateway, e deixaria o sistema antigo cuidar de todo o resto até estarmos prontos pra migrar a próxima peça.

A reescrita de 2015 funcionou porque o sistema era pequeno o suficiente e a distância tecnológica era grande o suficiente. Mas nem sempre é assim, e apostar a empresa numa reescrita big-bang é uma aposta que eu não estou mais disposto a fazer quando existem opções melhores.

A melhor estratégia de migração é aquela onde seus usuários não percebem nada.
