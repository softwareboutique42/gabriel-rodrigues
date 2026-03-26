---
title: 'Criando Animações que Contam o que uma Empresa Faz'
description: 'Como eu projetei quatro novos estilos de animação em Three.js que transformam palavras-chave de marca em narrativas visuais — de legendas cinematográficas a mapas estelares interativos.'
date: 2026-03-26
tags: ['three.js', 'canvas', 'creative-coding', 'ai']
lang: 'pt'
---

# Criando Animações que Contam o que uma Empresa Faz

A primeira versão do [Company Canvas](/pt/canvas/) tinha quatro estilos de animação — partículas, linhas fluidas, formas geométricas e grades tipográficas. Ficavam bonitos, mas eram abstratos. Você digitava "Spotify" e recebia uma linda nuvem de partículas verdes, mas nada na animação dizia _streaming de música_ ou _playlists_ ou _descoberta_.

Eu queria animações que contassem uma história. Não narrar literalmente, mas comunicar visualmente o que a empresa realmente faz usando as palavras-chave que a IA já gera.

## A Ideia: Usar o que Já Existe

Toda vez que o Claude gera uma configuração de marca, ele retorna um array `visualElements` — 3 a 5 palavras-chave que descrevem a identidade central da empresa. Para o Spotify, pode ser `["PLAYLISTS", "DISCOVERY", "STREAMING", "ARTISTS", "PODCASTS"]`. Para a Tesla: `["ELECTRIC", "INNOVATION", "AUTOPILOT", "ENERGY", "FUTURE"]`.

Na v1, essas palavras-chave eram ignoradas pelo motor de animação. Só apareciam no painel de informações. A pergunta era: como transformar palavras em movimento?

## Texto em Three.js é Mais Difícil do que Parece

Three.js não tem uma primitiva de texto nativa que funcione bem para esse caso. As opções são:

1. **TextGeometry** — gera mesh 3D a partir de fontes. Pesado, precisa carregar arquivos de fonte, exagero para labels 2D.
2. **CSS2DRenderer** — sobrepõe elementos HTML no canvas. Não exporta bem para HTML standalone.
3. **CanvasTexture + Sprite** — renderiza texto num canvas 2D, usa como textura num sprite. Leve, exportável, funciona em todo lugar.

Fui com a opção 3. O utilitário `createTextSprite` renderiza texto num canvas offscreen, mede com precisão e cria um `THREE.Sprite` com a proporção correta:

```typescript
export function createTextSprite(text: string, color: string, fontSize = 64): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  // ...dimensiona canvas, desenha texto, cria textura
  const sprite = new THREE.Sprite(material);
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(scale * aspect, scale, 1);
  return sprite;
}
```

Essa abordagem tem um trade-off: o texto não é independente de resolução. Se alguém der zoom no HTML exportado, o texto fica borrado. Mas para o caso de uso alvo — animações de marca em 1920x1080 — fica nítido o suficiente, e mantém o pipeline de exportação simples (sem carregamento de fontes, sem dependências externas).

## Quatro Estilos, Quatro Formas de Contar uma História

Cada estilo responde uma pergunta diferente sobre a marca:

### Narrative — "No que essa empresa acredita?"

Palavras flutuam para cima uma de cada vez, como legendas cinematográficas. Fade in, pausa, fade out. Partículas ambiente derivam no fundo. É o estilo mais simples, mas funciona bem para marcas com uma missão forte — a revelação sequencial dá peso a cada palavra-chave.

A matemática de timing divide o loop de 12 segundos igualmente entre todas as palavras:

```typescript
const segmentDuration = 1 / total;
const segStart = index * segmentDuration;
const localProgress = (progress - segStart) / segmentDuration;
// Fade in (0-20%), pausa (20-70%), fade out (70-100%)
```

### Timeline — "Quais são os pilares dessa empresa?"

Uma linha horizontal se desenha pela tela, depois nós pulsam em existência em intervalos. Cada nó ganha um conector vertical e um label de texto — palavras-chave da marca organizadas como marcos. O posicionamento alternado cima/baixo mantém a legibilidade.

A revelação é escalonada: linha primeiro, depois nós da esquerda para direita, depois conectores, depois labels. Cada camada espera a anterior começar a aparecer. Essa entrada em cascata dá à animação um senso de progressão.

### Constellation — "Como o ecossistema dessa empresa se conecta?"

Palavras-chave se tornam nós estelares brilhantes organizados em círculo, conectados por linhas. Os nós orbitam suavemente ao redor de suas posições base, e as linhas de conexão os acompanham — então toda a constelação respira.

Esse foi o mais difícil de acertar. A geometria das linhas precisa ser atualizada a cada frame para acompanhar as estrelas em órbita:

```typescript
const positions = line.geometry.attributes.position.array as Float32Array;
positions[0] = this.stars[i].position.x;
positions[1] = this.stars[i].position.y;
positions[3] = this.stars[next].position.x;
positions[4] = this.stars[next].position.y;
line.geometry.attributes.position.needsUpdate = true;
```

Mutar diretamente os arrays de atributos do `BufferGeometry` e sinalizar `needsUpdate` é o padrão no Three.js, mas é fácil esquecer essa flag e ficar se perguntando por que nada se move.

### Spotlight — "Qual é o momento principal dessa marca?"

Um efeito de zoom cinematográfico: anéis concêntricos giram lentamente enquanto palavras-chave ciclam pelo centro em grande escala. Cada palavra faz zoom in partindo de pequena, segura com um pulso suave, depois faz zoom out e desaparece. Partículas radiais orbitam no fundo.

Esse estilo funciona melhor para marcas ousadas ou lançamentos de produto — dá a cada palavra-chave uma entrada dramática.

## O Desafio da Exportação

Toda animação precisa funcionar em dois contextos: o canvas ao vivo (usando classes TypeScript) e a exportação HTML standalone (usando JS vanilla inline). Isso significa que toda animação é escrita duas vezes — uma como classe que estende `BaseAnimation`, e outra como string auto-contida no pipeline de exportação.

O código de exportação v2 também precisa da função `createTextSprite` inline. Extraí em um `createTextSpriteCode()` compartilhado que retorna a função como string, para que todos os quatro estilos v2 de exportação a incluam:

```typescript
case 'narrative':
case 'timeline':
case 'constellation':
case 'spotlight':
  return generateV2AnimationCode(config);
```

Essa abordagem de implementação dupla é um trade-off claro. Manter duas versões sincronizadas é custo de manutenção. Uma melhoria futura seria compilar as classes TypeScript diretamente no bundle de exportação, eliminando a duplicação. Mas por enquanto, a abordagem inline significa que os exports são arquivos HTML sem dependências que funcionam offline.

## Ensinando a IA Quando Usar V2

A última peça foi atualizar o prompt do Claude no Cloudflare Worker para conhecer os novos estilos:

```
v2 — Story (baseado em texto, conta o que a empresa faz):
- "narrative": marcas com missão ou história forte
- "timeline": empresas com marcos ou processos de múltiplas etapas
- "constellation": empresas com serviços interconectados ou ecossistemas
- "spotlight": marcas ousadas ou lançamentos de produto

Prefira estilos v2 quando a empresa tem uma história clara para contar. Use v1 para branding abstrato.
```

Isso permite que a IA decida se uma empresa se beneficia mais da beleza abstrata (v1) ou da narrativa visual (v2). As palavras-chave em `visualElements` se tornam críticas para v2 — não são mais metadados decorativos, são o conteúdo da animação.

## Próximos Passos

A renderização de texto poderia ser mais nítida com fontes SDF (signed distance field), que escalam sem borrar. A duplicação na exportação deveria eventualmente ser substituída por um build step adequado. E o timing das animações poderia ser mais dinâmico — agora todas as palavras-chave recebem tempo igual de tela, mas algumas palavras merecem mais destaque que outras.

Mas a ideia central funciona: pegar o que a IA já sabe sobre uma empresa e tornar visível. As animações não são mais apenas fundos bonitos — elas comunicam algo.
