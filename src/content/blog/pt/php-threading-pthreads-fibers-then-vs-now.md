---
title: 'Threading em PHP: De pthreads a Fibers, ReactPHP e Além'
description: 'De uma pergunta no Stack Overflow sobre threading em PHP com pthreads ao cenário moderno de PHP 8.1 Fibers, ReactPHP, Amp e FrankenPHP em 2026.'
date: 2026-03-29
tags: ['php', 'concorrência', 'stackoverflow', 'arquitetura']
lang: 'pt'
---

# Threading em PHP: De pthreads a Fibers, ReactPHP e Além

Fiz uma pergunta no Stack Overflow em Português sobre threading em PHP — especificamente sobre a extensão pthreads. Recebeu 12 votos, e olhando pra trás, a pergunta capturou um momento em que desenvolvedores PHP estavam genuinamente confusos sobre concorrência. PHP era uma linguagem de request-response. Você processava uma requisição, mandava a resposta, e o processo morria. Por que precisaria de threads?

Acontece que as pessoas queriam fazer coisas como enviar emails em background, processar imagens sem bloquear, ou lidar com conexões WebSocket. A resposta em 2015 era complicada. A resposta em 2026 é uma paisagem completamente diferente.

## A Abordagem de 2015: pthreads

A extensão pthreads trazia threads POSIX reais para o PHP. Exigia builds ZTS (Zend Thread Safety) do PHP, que a maioria dos ambientes de hospedagem não oferecia. Instalar já era uma barreira.

```php
class AsyncTask extends Thread {
    private $data;

    public function __construct($data) {
        $this->data = $data;
    }

    public function run() {
        // Isso roda numa thread separada
        $result = file_get_contents("https://api.example.com/process");
        // Armazenar resultado de algum jeito...
    }
}

$task = new AsyncTask("payload");
$task->start();
// Fazer outro trabalho...
$task->join();
```

Os problemas eram significativos:

- **Requisito de ZTS.** A maioria das instalações PHP era NTS (Non-Thread-Safe). Hospedagem compartilhada? Esquece. Imagens Docker? Precisava de um build especial.
- **Compartilhamento de dados era doloroso.** Objetos PHP não foram feitos para acesso concorrente. pthreads precisava serializar e deserializar dados entre threads, com objetos `Threaded` especiais que tinham suas próprias regras.
- **Sem suporte do ecossistema.** Bibliotecas PHP assumiam execução single-threaded. Usar uma biblioteca de banco de dados dentro de uma thread podia causar problemas no pool de conexões. Usar sessions era impossível.
- **Peso de manutenção.** pthreads era mantido por uma pessoa (Joe Watkins). Era um esforço de engenharia incrível, mas estava lutando contra a arquitetura fundamental do PHP.

A verdade honesta em 2015 era: se você precisava de concorrência real, PHP provavelmente não era a ferramenta certa.

## O Que Mudou: pthreads Morreu, Vida Longa às Fibers

A extensão pthreads foi oficialmente abandonada e não funciona com PHP 8.x. Mas a história de concorrência do PHP foi completamente reescrita.

### PHP 8.1 Fibers

Fibers, introduzidas no PHP 8.1, são primitivas de concorrência cooperativa — coroutines leves com stack próprio:

```php
$fiber = new Fiber(function (): void {
    $value = Fiber::suspend('aguardando');
    echo "Retomado com: $value";
});

$result = $fiber->start(); // "aguardando"
$fiber->resume('olá');     // "Retomado com: olá"
```

Fibers não são threads. Não rodam em paralelo. Em vez disso, permitem que um trecho de código se suspenda e seja retomado depois. Essa é a fundação sobre a qual frameworks async constroem.

### ReactPHP e Amp

A história real de concorrência em PHP é I/O assíncrono baseado em event loop, usando Fibers por baixo dos panos:

```php
// ReactPHP com Fibers (estilo async/await)
use React\Http\Browser;
use function React\Async\await;

$browser = new Browser();
$response = await($browser->get('https://api.example.com/data'));
echo $response->getBody();
```

ReactPHP e Amp permitem lidar com milhares de operações I/O concorrentes num único processo PHP. Requisições HTTP, queries de banco, operações de arquivo — tudo acontece concorrentemente via event loop, não threads. O código lê como código síncrono graças às Fibers.

### Swoole e FrankenPHP

Para execução paralela de verdade, **Swoole** (e seu fork OpenSwoole) oferecem coroutines e arquitetura multi-processo como extensão PHP:

```php
Co\run(function() {
    go(function() {
        $result = Co\Http\get('https://api.example.com/a');
    });
    go(function() {
        $result = Co\Http\get('https://api.example.com/b');
    });
    // Ambas requisições rodam concorrentemente
});
```

**FrankenPHP**, construído sobre o `net/http` do Go, embute o PHP como biblioteca e serve com a concorrência baseada em goroutines do Go. Suporta modo worker, onde processos PHP persistem entre requisições, habilitando conexões de longa duração e processamento em background.

## A Lição

A história de concorrência do PHP foi de "use pthreads se tiver coragem" para um ecossistema rico de soluções, cada uma adequada a problemas diferentes. Precisa de I/O assíncrono? ReactPHP ou Amp com Fibers. Precisa de um servidor de alta performance com workers persistentes? Swoole ou FrankenPHP. Precisa de jobs simples em background? Um sistema de filas com workers ainda é a escolha mais pragmática.

O insight principal: PHP não precisava de threads. Precisava de concorrência cooperativa para trabalho I/O-bound, que é o que a maioria das aplicações web realmente faz. Fibers proveram a primitiva, e o ecossistema construiu o resto.
