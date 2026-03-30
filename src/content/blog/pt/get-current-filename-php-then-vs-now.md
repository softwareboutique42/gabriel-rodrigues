---
title: 'Pegar o Nome do Arquivo Atual em PHP: Do $_SERVER ao Roteamento Moderno'
description: 'Em 2015, perguntei no Stack Overflow como pegar o nome do arquivo atual em PHP. A resposta era simples — mas frameworks modernos tornaram a pergunta quase irrelevante.'
date: 2026-03-29
tags: ['php', 'stackoverflow', 'básico', 'desenvolvimento-web']
lang: 'pt'
---

# Pegar o Nome do Arquivo Atual em PHP: Do $\_SERVER ao Roteamento Moderno

Em 2015, fiz uma pergunta no Stack Overflow em Português sobre como pegar o nome do arquivo PHP que estava sendo executado. Recebeu 14 votos, o que pra uma pergunta tão básica me diz que muita gente precisava pesquisar isso. As respostas cobriam `$_SERVER['PHP_SELF']`, `__FILE__`, `basename()` e companhia. Era uma pergunta perfeitamente razoável na época porque aplicações PHP eram frequentemente estruturadas como coleções de arquivos individuais que mapeavam diretamente para URLs.

## Como Funcionava Antes

PHP em 2015 ainda estava muito na era "um arquivo por página" em muitos projetos. Você tinha `index.php`, `sobre.php`, `contato.php`, e precisava saber qual arquivo estava rodando para coisas como destacar o item ativo na navegação, logging ou lógica condicional.

As abordagens comuns eram:

```php
// O caminho completo do servidor para o arquivo atual
echo __FILE__;
// /var/www/html/pages/contato.php

// Só o nome do arquivo
echo basename(__FILE__);
// contato.php

// O caminho da URL (não o caminho do filesystem)
echo $_SERVER['PHP_SELF'];
// /pages/contato.php

// A URI requisitada incluindo query string
echo $_SERVER['REQUEST_URI'];
// /pages/contato.php?ref=home

// O nome do script (similar ao PHP_SELF mas mais seguro)
echo $_SERVER['SCRIPT_FILENAME'];
// /var/www/html/pages/contato.php
```

Havia uma distinção sutil mas importante entre `__FILE__` e `$_SERVER['PHP_SELF']`. A constante mágica `__FILE__` sempre retornava o caminho do filesystem do arquivo onde foi escrita — mesmo dentro de um arquivo incluído. `$_SERVER['PHP_SELF']` retornava o caminho da URL do script de entrada. Isso confundia as pessoas constantemente ao usar `include` ou `require`.

Tinha também o ângulo de segurança. `$_SERVER['PHP_SELF']` era injetável através de manipulação de URL. Se a action do seu formulário usava sem escapar:

```php
<!-- Vulnerável a XSS -->
<form action="<?php echo $_SERVER['PHP_SELF']; ?>">
```

Um atacante podia criar uma URL tipo `/contato.php/%22%3E%3Cscript%3Ealert(1)%3C/script%3E` e injetar HTML arbitrário. Era uma vulnerabilidade bem conhecida que pegava muitos iniciantes de surpresa.

## Como o PHP Moderno Mudou a Pergunta

A questão é a seguinte — no desenvolvimento PHP moderno, você quase nunca precisa saber o nome do arquivo atual. E o motivo é roteamento.

**Todo framework PHP relevante** — Laravel, Symfony, Slim, até WordPress moderno — roteia todas as requisições através de um único ponto de entrada (geralmente `public/index.php`) e usa um router para despachar pro handler correto. A URL `/sobre` não corresponde a um arquivo `sobre.php`. Corresponde a uma definição de rota:

```php
// Laravel
Route::get('/sobre', [PageController::class, 'sobre']);

// Symfony
#[Route('/sobre', name: 'sobre')]
public function sobre(): Response { ... }
```

Nesse mundo, o "arquivo atual" é sempre `index.php`. O identificador significativo é o nome da rota, não o caminho do arquivo. Se você precisa saber onde está para destacar a navegação, você verifica a rota:

```php
// Template Laravel Blade
<li class="{{ request()->routeIs('sobre') ? 'active' : '' }}">
    <a href="{{ route('sobre') }}">Sobre</a>
</li>
```

**Onde `__FILE__` ainda importa.** As constantes mágicas não ficaram inúteis — só mudaram de contexto. Em scripts CLI, `__FILE__` continua sendo a forma confiável de resolver caminhos relativos à localização do script. O `__DIR__` do PHP 8 (que é atalho para `dirname(__FILE__)`) está em todo lugar em configurações de autoloader e arquivos de config:

```php
// Autoload do Composer - esse padrão está em todo projeto PHP
require __DIR__ . '/vendor/autoload.php';

// Config relativa à raiz do projeto
$config = parse_ini_file(__DIR__ . '/../config/app.ini');
```

**`$_SERVER['PHP_SELF']` está efetivamente deprecated na prática.** Nenhum framework moderno o expõe, e o risco de XSS significa que você nunca deveria usá-lo em output sem escapar. A alternativa segura sempre foi `$_SERVER['SCRIPT_NAME']`, mas até isso é irrelevante quando seu router cuida da geração de URLs.

## O Que Eu Diria Pro Meu Eu de 2015

A pergunta era válida — roteamento baseado em arquivo era a norma, e saber qual era seu arquivo atual importava. Mas eu adicionaria uma nota de rodapé: "Aprenda um framework com router. Quando aprender, você nunca mais vai fazer essa pergunta." A mudança de arquitetura baseada em arquivo para baseada em rota não mudou só como lidamos com URLs. Ela eliminou uma categoria inteira de perguntas sobre introspecção de arquivos PHP que todos nós gastávamos tempo respondendo no Stack Overflow.
