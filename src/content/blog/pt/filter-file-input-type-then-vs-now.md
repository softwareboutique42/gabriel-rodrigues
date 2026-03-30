---
title: 'Filtrar Input de Arquivo por Tipo: Do Atributo accept à File System Access API'
description: 'Em 2015, perguntei no Stack Overflow como filtrar inputs de arquivo por tipo. O atributo accept era a resposta — mas hoje temos opções muito mais poderosas.'
date: 2026-03-29
tags: ['html', 'formulários', 'javascript', 'stackoverflow']
lang: 'pt'
---

# Filtrar Input de Arquivo por Tipo: Do Atributo accept à File System Access API

Em 2015, fiz uma pergunta no Stack Overflow em Português sobre como filtrar quais tipos de arquivo o usuário poderia selecionar através de um `<input type="file">`. A pergunta recebeu 7 votos, o que me diz que outras pessoas tinham a mesma dúvida. A resposta na época era direta — usar o atributo `accept`. Mas uma década depois, o cenário para lidar com upload de arquivos no navegador mudou bastante.

## Como Funcionava Antes

O atributo `accept` nos inputs de arquivo era a ferramenta principal. Você podia passar tipos MIME ou extensões de arquivo para indicar quais arquivos o seletor deveria mostrar:

```html
<!-- Filtrar por tipo MIME -->
<input type="file" accept="image/*" />

<!-- Filtrar por extensões específicas -->
<input type="file" accept=".pdf,.doc,.docx" />

<!-- Combinar as duas abordagens -->
<input type="file" accept="image/png, image/jpeg, .webp" />
```

Isso funcionava, na maioria das vezes. O diálogo de arquivos do sistema operacional filtrava os arquivos visíveis de acordo com seus critérios. Mas tinha limitações reais. O atributo `accept` é uma **sugestão**, não uma restrição. O usuário pode mudar o seletor para "Todos os Arquivos" e escolher o que quiser. Não havia validação real no lado do cliente — se alguém escolhesse um `.exe` quando você pediu `.pdf`, seu JavaScript tinha que pegar isso depois.

A validação também era básica. Você verificava `file.type` ou `file.name` e torcia pelo melhor:

```javascript
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione um arquivo de imagem');
    input.value = '';
  }
});
```

Isso era frágil. Extensões de arquivo podem ser renomeadas. Os tipos MIME reportados pelo navegador dependem da associação de arquivos do sistema operacional, não do conteúdo real do arquivo.

## O Que Temos Hoje

O ferramental para manipulação de arquivos no navegador expandiu muito.

**A File System Access API** dá controle programático sobre quais arquivos o usuário pode selecionar, com filtragem de tipo mais robusta que o atributo `accept`:

```javascript
async function escolherImagem() {
  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Arquivos de imagem',
        accept: {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/webp': ['.webp'],
        },
      },
    ],
    multiple: false,
  });
  const file = await handle.getFile();
  return file;
}
```

Essa API te dá objetos `FileSystemFileHandle`, o que significa que você também pode escrever de volta no mesmo arquivo depois — algo que o antigo `<input type="file">` nunca conseguiu fazer.

**Validação por magic bytes** é agora uma técnica prática no lado do cliente. Em vez de confiar na extensão do arquivo, você lê os primeiros bytes para verificar o formato real:

```javascript
async function isPNGValido(file) {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Magic bytes do PNG: 137 80 78 71 13 10 26 10
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}
```

Isso é validação de verdade. Um arquivo `.txt` renomeado com extensão `.png` vai falhar nessa verificação. É a mesma técnica que servidores usam há anos, agora rodando no navegador.

**Zonas de drag-and-drop** se tornaram o padrão de UX preferido para uploads. Combinadas com a API `DataTransfer` e `webkitGetAsEntry()` (agora amplamente suportado), você pode construir experiências de upload que lidam com pastas, filtram tipos no drop e dão feedback visual instantâneo — tudo sem o diálogo nativo de arquivos.

## O Que Eu Diria Pro Meu Eu de 2015

O atributo `accept` ainda tem lugar no seu HTML — é a base, o ponto de partida de progressive enhancement. Mas se você está construindo qualquer fluxo sério de upload hoje, deveria adicionar a File System Access API para navegadores modernos, validar o conteúdo do arquivo com magic bytes em vez de confiar em extensões, e considerar drag-and-drop como a interação principal. O navegador não é mais um wrapper fino ao redor do seletor de arquivos do SO. É uma plataforma capaz de manipulação de arquivos por conta própria.
