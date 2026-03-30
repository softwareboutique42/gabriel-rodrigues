---
title: 'MIME Types Explicados: O Que os Navegadores Realmente Fazem com Content-Type'
description: 'De uma pergunta no Stack Overflow de 2015 sobre atributos type em script tags, até a verificação de MIME como questão de segurança em 2026.'
date: 2026-03-29
tags: ['desenvolvimento-web', 'http', 'stackoverflow', 'fundamentos']
lang: 'pt'
---

# MIME Types Explicados: O Que os Navegadores Realmente Fazem com Content-Type

Em 2015, me deparei com uma pergunta no Stack Overflow em Português que chamou minha atenção: o que exatamente são MIME types, por que importam para a renderização, e são obrigatórios? A pergunta recebeu 17 votos — sinal de que muitos desenvolvedores tinham a mesma dúvida.

A pergunta me fez pensar. Eu vinha escrevendo `<script type="text/javascript">` por anos sem questionar. Por que `<script>` sem nenhum atributo `type` funcionava igualmente? E se o navegador conseguia descobrir sozinho, por que MIME types existiam?

Essa curiosidade me levou a pesquisar fundo. Aqui está o que eu entendia na época, o que sei agora, e o que mudou entre os dois.

## O Entendimento de 2015: Rótulos de Conteúdo

Naquela época, MIME types pareciam rótulos educados. Você configurava `Content-Type: text/html` na resposta do servidor, e o navegador sabia renderizar HTML. Você escrevia `type="text/javascript"` numa tag script, e... bom, funcionava. Mas omitir também funcionava.

O básico era direto. MIME significa **Multipurpose Internet Mail Extensions** — originalmente criado para anexos de email, depois adotado pelo HTTP. O formato é sempre `type/subtype`:

- `text/html` — documento HTML
- `text/css` — folha de estilo
- `application/javascript` — arquivo JavaScript
- `image/png` — imagem PNG
- `application/json` — dados JSON

O header `Content-Type` dizia ao navegador que tipo de recurso estava vindo. Se você esquecesse, os navegadores faziam **MIME sniffing** — inspecionavam os primeiros bytes da resposta e adivinhavam o tipo. E honestamente, funcionava na maioria das vezes.

O HTML5 já tinha tornado `type="text/javascript"` o padrão para tags script, então você podia omitir tranquilamente. O atributo `type` em tags `<style>` tinha `text/css` como padrão. Tudo simplesmente... funcionava. MIME types eram importantes na teoria mas tolerantes na prática.

Isso era 2015. Navegadores eram lenientes. Servidores eram relaxados. E ninguém se machucava — ou assim pensávamos.

## A Realidade de 2026: MIME Types como Portões de Segurança

Avançando para hoje, MIME types passaram de "bom ter" para "erre isso e seu site quebra." Eis o que mudou.

### X-Content-Type-Options: nosniff

Lembra daquele comportamento útil de MIME sniffing? Acabou sendo uma falha de segurança enorme. Atacantes descobriram que podiam fazer upload de arquivos maliciosos com extensões enganosas, e navegadores alegremente os identificavam como scripts executáveis.

A correção foi o header `X-Content-Type-Options: nosniff`. Quando definido, diz ao navegador: "Não adivinhe. Confie no header Content-Type e nada mais." Em 2026, isso é padrão. Todo framework major define por padrão. Toda auditoria de segurança aponta sua ausência.

```
X-Content-Type-Options: nosniff
Content-Type: application/javascript
```

Se seu servidor envia um arquivo JavaScript com `Content-Type: text/plain` e `nosniff` está habilitado, o navegador se recusa a executá-lo. Ponto.

### CORB e CORP

Cross-Origin Read Blocking (CORB) e Cross-Origin Resource Policy (CORP) foram além. Essas políticas usam MIME types para decidir se um recurso cross-origin deveria ser legível.

Se uma resposta cross-origin tem MIME type `text/html`, `application/json` ou `text/xml`, o CORB remove o corpo da resposta antes que chegue à página requisitante. Isso bloqueia ataques de canal lateral estilo Spectre que poderiam ler dados sensíveis através de requisições cross-origin.

### Scripts de Módulo Exigem type="module"

Em 2015, `type="text/javascript"` era redundante. Em 2026, `type="module"` é essencial. Módulos ES não carregam sem ele:

```html
<!-- Script clássico — type é opcional -->
<script src="app.js"></script>

<!-- Script de módulo — type é OBRIGATÓRIO -->
<script type="module" src="app.mjs"></script>
```

E aqui está o detalhe: scripts de módulo verificam o MIME type estritamente. Se seu servidor responder com qualquer coisa diferente de um MIME type JavaScript válido, o módulo não carrega. Sem sniffing, sem fallback.

### Novos MIME Types para Formatos Modernos

O cenário de mídia da web expandiu desde 2015. Aqui estão MIME types que não existiam ou não eram amplamente usados:

| Formato     | MIME Type          | Notas                         |
| ----------- | ------------------ | ----------------------------- |
| AVIF        | `image/avif`       | Formato de imagem next-gen    |
| WebP        | `image/webp`       | Amplamente adotado desde 2020 |
| WOFF2       | `font/woff2`       | Formato padrão de web font    |
| Módulo JSON | `application/json` | Import assertions no JS       |
| WebAssembly | `application/wasm` | MIME estrito obrigatório      |

WebAssembly é um bom exemplo da nova rigidez. Navegadores simplesmente se recusam a compilar um arquivo `.wasm` se não for servido com `application/wasm`. Sem sniffing. Sem exceções.

## O Ângulo de Segurança: Por Que Isso Importa

Ataques de MIME sniffing eram mais criativos do que você esperaria. Aqui está o cenário clássico:

1. Uma aplicação web permite upload de arquivos (digamos, fotos de perfil)
2. Um atacante faz upload de um arquivo chamado `avatar.jpg` que na verdade contém JavaScript
3. O servidor armazena e serve sem um Content-Type estrito
4. O navegador fareja o conteúdo, detecta JavaScript e o executa
5. O atacante agora tem XSS no contexto do seu domínio

O header `nosniff` matou esse vetor de ataque. Mas a lição vai mais fundo. Navegadores modernos tratam MIME types como uma fronteira de confiança. Cross-origin isolation, Content Security Policy e service workers todos dependem de MIME types corretos para tomar decisões de segurança.

## O Que Acontece Quando Você Erra

Referência rápida de erros comuns e suas consequências em 2026:

**Servir JS com `text/plain`:** Navegador se recusa a executar. Console mostra erro de MIME type. Sua aplicação quebra silenciosamente.

**Servir CSS com MIME errado:** Folha de estilo bloqueada em modo estrito. Sua página renderiza sem estilo.

**Servir WASM sem `application/wasm`:** `WebAssembly.instantiateStreaming()` lança TypeError. Fallback para `instantiate()` com array buffer ainda funciona mas é mais lento.

**Content-Type faltando em respostas de API:** CORB pode remover o corpo da resposta em requisições cross-origin. Seus fetch calls retornam dados vazios sem erro óbvio.

**Servir JSON com `text/html`:** Potencial XSS se o JSON contém strings HTML controladas pelo usuário e alguém navega diretamente para a URL.

## Conclusão

Em 2015, MIME types eram sugestões educadas. Navegadores farejavam, adivinhavam e geralmente acertavam. Você podia omitir atributos `type`, configurar errado headers Content-Type, e tudo continuava funcionando.

Em 2026, MIME types são infraestrutura crítica de segurança. `nosniff` é o padrão. CORB remove respostas com tipo errado. Scripts de módulo verificam MIME estritamente. WebAssembly se recusa a compilar sem o header correto.

A pergunta original do Stack Overflow perguntava se MIME types são obrigatórios. A resposta de 2015 era "tecnicamente sim, na prática não." A resposta de 2026 é "sim, e se você errar, navegadores modernos se recusam a carregar seus recursos."

Configure seus headers Content-Type corretamente. Não é opcional mais.
