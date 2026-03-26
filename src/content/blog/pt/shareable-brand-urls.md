---
title: 'URLs Compartilháveis de Marca com Cache KV e Proteção contra XSS'
description: 'Como adicionei links compartilháveis ao Company Canvas — com cache no Cloudflare KV para cortar custos de API e uma correção de segurança que quase passei batido.'
date: 2026-03-26
tags: ['cloudflare', 'security', 'canvas', 'architecture']
lang: 'pt'
---

# URLs Compartilháveis de Marca com Cache KV e Proteção contra XSS

Depois de lançar o [Company Canvas](/pt/canvas/), as pessoas queriam compartilhar seus resultados. Alguém gera uma animação do Spotify e quer mandar o link para um amigo — mas a URL era só `/pt/canvas/` sem nenhum estado. Atualiza a página, animação perdida.

Eu precisava de três coisas: URLs compartilháveis que carregam uma marca específica, cache para que a mesma empresa não queime uma chamada de API toda vez que alguém abre o link, e — como descobri no meio do caminho — uma correção de segurança no código de renderização.

## O Problema do Site Estático

O site é construído com Astro em modo estático e publicado no GitHub Pages. Não tem servidor para lidar com rotas dinâmicas. Um caminho como `/pt/canvas/spotify` simplesmente daria 404 porque não existe um arquivo `spotify/index.html`.

Duas opções:

1. **Query parameters**: `/pt/canvas/?company=spotify` — funciona nativamente, sem truques de roteamento.
2. **URLs bonitas via 404.html**: `/pt/canvas/spotify` → GitHub Pages serve o 404.html → JS detecta o padrão → redireciona para a versão com query param.

Fiz os dois. A URL canônica usa query params (confiável, funciona em todo lugar), e a URL bonita é um progressive enhancement tratado por uma página 404 mínima:

```javascript
var match = path.match(/^\/(en|pt)\/canvas\/([^/]+)\/?$/);
if (match) {
  window.location.replace('/' + lang + '/canvas/?company=' + encodeURIComponent(company));
  return;
}
window.location.replace('/');
```

Sem layout do Astro, sem estilos, sem overhead de framework — só um redirect. Se a URL não bate com o padrão do canvas, redireciona para a home.

## Cache KV: Não Chame o Claude Duas Vezes pela Mesma Marca

Toda vez que alguém gera um canvas, o Worker chama a API do Claude (~$0.002 por requisição). Não é caro individualmente, mas se um link do Spotify for compartilhado nas redes sociais e 500 pessoas clicarem, são 500 chamadas de API para o mesmo resultado.

Cloudflare KV é perfeito aqui — armazenamento chave-valor distribuído globalmente com leituras em milissegundos. O fluxo:

1. **POST /** (geração manual): chama Claude, guarda o resultado no KV, retorna ao cliente.
2. **GET /config/:company** (URL de marca): verifica KV primeiro. Cache hit → retorna imediatamente com `X-Cache: HIT`. Cache miss → chama Claude, cacheia, retorna com `X-Cache: MISS`.

```typescript
const cached = await env.CONFIG_CACHE.get(key);
if (cached) {
  return new Response(cached, {
    headers: { ...headers, 'X-Cache': 'HIT' },
  });
}
```

A chave do cache inclui o nome normalizado da empresa e a versão: `v1:v1:spotify`. A normalização remove caracteres especiais e colapsa espaços em hífens, então "Spotify!", "spotify" e " SPOTIFY " batem na mesma entrada do cache.

Um bug sutil que peguei: a implementação inicial usava fire-and-forget para a escrita no KV — `env.CONFIG_CACHE.put(key, data).catch(() => {})`. No Cloudflare Workers, se você não dá `await` numa promise, o runtime pode terminar antes dela completar. O cache nunca estava sendo escrito. A correção foi simplesmente usar `await`:

```typescript
await env.CONFIG_CACHE.put(key, configJson, { expirationTtl: 604800 });
```

TTL de sete dias significa que as configurações de marca se renovam semanalmente. Tempo suficiente para ser útil, curto o bastante para que se uma empresa mudar a identidade visual, a animação eventualmente atualize.

## O XSS que Eu Quase Publiquei

Enquanto refatorava o código client-side para suportar URLs de marca, notei isso na função `renderInfo`:

```typescript
// Antes (vulnerável)
swatch.innerHTML = `<span style="background:${hex}">...${hex}</span>`;
```

O valor `hex` vem da resposta da API — que vem do output do Claude. Se alguém manipular a resposta ou a IA retornar dados malformados, é um ponto direto de injeção XSS. Um valor de cor como `"><script>alert(1)</script>` executaria no navegador do usuário.

A correção foi trocar para métodos da DOM API e adicionar validação:

```typescript
function isValidHex(color: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(color);
}

const colorBox = document.createElement('span');
if (isValidHex(hex)) colorBox.style.background = hex;

const label = document.createElement('span');
label.textContent = `${name}: ${hex}`; // textContent, não innerHTML
```

`textContent` escapa HTML automaticamente. O check `isValidHex` garante que só cores hex válidas cheguem ao `style.background`. Sem necessidade de biblioteca de sanitização — só usando as APIs corretas do DOM.

Esse é o tipo de bug que passa em todos os testes de caminho feliz. A IA sempre retorna cores hex válidas, então você nunca veria falhar durante o desenvolvimento. Mas segurança não é sobre o que acontece quando as coisas funcionam corretamente.

## Tematização de Marca: Faça a Página Inteira Combinar

Com URLs de marca, o usuário chega numa página que já mostra a animação da empresa. Mas o resto da interface — botões, bordas, brilhos — ainda usa o tema padrão neon verde. Parecia desconectado.

O site já usa custom properties CSS para tematização (`--color-neon`, `--color-cyan`, `--color-gold`). Sobrescrever na raiz do documento tematiza a página inteira instantaneamente:

```typescript
function applyBrandTheme(config: CompanyConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--color-neon', config.colors.primary);
  root.style.setProperty('--color-cyan', config.colors.secondary);
  root.style.setProperty('--color-gold', config.colors.accent);
}
```

Gera Coca-Cola → a página inteira fica vermelha. Clica em Retry → `resetBrandTheme()` remove as sobrescritas e os padrões voltam. Sem troca de classes, sem recálculo de estilos — só cinco mudanças de propriedade CSS.

## O Botão de Compartilhar

A parte mais simples, mas a que amarra tudo:

```typescript
getEl('canvas-share')?.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = getEl('canvas-share');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = orig;
    }, 2000);
  });
});
```

Depois de gerar ou carregar um canvas de marca, a URL já contém `?company=spotify`. O botão Share copia. O destinatário abre, o cache KV serve a configuração instantaneamente, e ele vê a mesma animação — sem precisar pagar (downloads continuam protegidos pelo Stripe).

## Trade-offs e Melhorias Futuras

- **O redirect do 404.html causa um flash** — usuários veem uma página em branco por uma fração de segundo antes do redirect disparar. Um service worker poderia interceptar a requisição e reescrevê-la client-side sem o redirect.
- **KV é eventualmente consistente** — uma configuração escrita em uma região pode não ser legível em outra por alguns segundos. Para esse caso de uso, tudo bem. Usuários gerando e compartilhando não estão competindo entre continentes.
- **Sem invalidação de cache** — se a IA gerar uma configuração ruim, fica presa no KV por 7 dias. Adicionar um endpoint de purge ou ferramenta admin seria o próximo passo natural.
- **O regex `isValidHex` permite hex de 4-8 caracteres** — isso tecnicamente aceita `#RRGGBBAA` (com alpha), que é CSS válido mas incomum para cores de marca. Uma verificação mais estrita poderia forçar exatamente 3 ou 6 dígitos hex.

A lição maior: toda feature que toca dados externos — mesmo da sua própria IA — precisa tratar a entrada como não confiável. O vetor de XSS era invisível no uso normal, mas é exatamente o tipo de coisa que um atacante procuraria.
