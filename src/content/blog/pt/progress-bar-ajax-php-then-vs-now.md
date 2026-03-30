---
title: 'Barra de Progresso com AJAX e PHP: De Polling a Streams'
description: 'Minha pergunta no Stack Overflow de 2015 sobre barras de progresso usava AJAX polling. Em 2026, SSE e ReadableStream fazem nativamente.'
date: 2026-03-29
tags: ['php', 'javascript', 'ajax', 'stackoverflow']
lang: 'pt'
---

# Barra de Progresso com AJAX e PHP: De Polling a Streams

Em 2015, fiz uma pergunta no Stack Overflow em Português sobre como mostrar uma barra de progresso em tempo real durante um processo PHP demorado. A pergunta recebeu 16 votos — sinal de que "como mostrar ao usuário o que está acontecendo no servidor?" era um desafio universal.

## A Abordagem de 2015: AJAX Polling

A solução padrão envolvia três partes:

1. **Iniciar o processo** — uma chamada AJAX dispara um script PHP demorado
2. **Armazenar progresso** — o script PHP grava seu progresso em variável de sessão ou arquivo temporário
3. **Consultar atualizações** — uma segunda chamada AJAX roda num `setInterval`, lendo o valor de progresso

```javascript
// 2015: Iniciar o processo
$.post('/process.php', { data: formData });

// Consultar a cada 500ms
var pollInterval = setInterval(function () {
  $.get('/progress.php', function (data) {
    $('#progress-bar').css('width', data.percent + '%');
    if (data.percent >= 100) {
      clearInterval(pollInterval);
    }
  });
}, 500);
```

```php
// progress.php
session_start();
echo json_encode(['percent' => $_SESSION['progress'] ?? 0]);
```

Funcionava, mas era desperdiçador. A cada 500ms, o navegador enviava uma requisição HTTP completa só para perguntar "já chegou?" — mesmo quando nada tinha mudado.

## A Abordagem de 2026: Server-Sent Events

Server-Sent Events (SSE) permitem que o servidor envie atualizações ao navegador por uma única conexão HTTP de longa duração:

```javascript
// 2026: Uma conexão, servidor envia atualizações
const source = new EventSource('/process-stream.php');

source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  progressBar.style.width = `${data.percent}%`;

  if (data.percent >= 100) {
    source.close();
  }
};
```

```php
// process-stream.php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

for ($i = 0; $i <= 100; $i += 10) {
    echo "data: " . json_encode(['percent' => $i]) . "\n\n";
    ob_flush();
    flush();
    sleep(1); // Simular trabalho
}
```

Sem polling. Sem requisições desperdiçadas. O servidor envia dados quando tem algo a reportar.

### fetch() com ReadableStream

Para mais controle, você pode fazer streaming de respostas com a Fetch API:

```javascript
const response = await fetch('/process-stream', { method: 'POST', body: formData });
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const data = JSON.parse(text);
  progressBar.style.width = `${data.percent}%`;
}
```

Funciona com qualquer backend — Node.js, Go, Python — não apenas PHP. E lida com dados binários também.

### WebSocket para Bidirecional

Se precisa que o cliente envie mensagens _durante_ o processo (pausar, cancelar, ajustar parâmetros), WebSocket é a ferramenta certa:

```javascript
const ws = new WebSocket('wss://api.example.com/process');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  progressBar.style.width = `${data.percent}%`;
};

// Cancelar o processo no meio
cancelButton.onclick = () => ws.send(JSON.stringify({ action: 'cancel' }));
```

## Comparação Rápida

| Abordagem      | Direção            | Overhead | Complexidade | Melhor para                       |
| -------------- | ------------------ | -------- | ------------ | --------------------------------- |
| AJAX polling   | Cliente → Servidor | Alto     | Baixa        | Sistemas legados                  |
| SSE            | Servidor → Cliente | Baixo    | Baixa        | Barras de progresso, notificações |
| ReadableStream | Servidor → Cliente | Baixo    | Média        | Respostas streaming               |
| WebSocket      | Bidirecional       | Baixo    | Alta         | Processos interativos             |

## Conclusão

Em 2015, mostrar progresso do servidor significava polling — perguntar ao servidor a cada milissegundos se algo mudou. Em 2026, o servidor avisa _você_ quando algo muda. SSE é o caminho mais simples de upgrade para barras de progresso, e funciona com mudanças mínimas no backend. O padrão de polling não é errado, mas resolve um problema que a plataforma agora trata nativamente.
