---
title: 'Adicionar aos Favoritos: De APIs do Navegador a PWA Install'
description: 'Minha resposta no SO de 2015 mostrava window.external.AddFavorite() para IE. Em 2026, navegadores removeram bookmarking programático — mas PWA Install substituiu.'
date: 2026-03-29
tags: ['javascript', 'navegadores', 'stackoverflow', 'ux']
lang: 'pt'
---

# Adicionar aos Favoritos: De APIs do Navegador a PWA Install

Em 2015, respondi uma pergunta no Stack Overflow em Português sobre adicionar um site aos favoritos do navegador com JavaScript. Recebeu 4 votos.

## A Resposta de 2015: Hacks por Navegador

```javascript
function adicionarFavoritos(url, titulo) {
  if (window.external && 'AddFavorite' in window.external) {
    // Internet Explorer
    window.external.AddFavorite(url, titulo);
  } else if (window.sidebar && 'addPanel' in window.sidebar) {
    // Firefox
    window.sidebar.addPanel(titulo, url, '');
  } else {
    // Chrome, Safari — sem API
    alert('Pressione Ctrl+D (ou Cmd+D no Mac) para adicionar aos favoritos.');
  }
}
```

Mesmo então, Chrome e Safari não tinham API. Você já estava caindo no fallback Ctrl+D.

## A Realidade de 2026: APIs Removidas

Todos os navegadores removeram acesso programático a favoritos. `window.external.AddFavorite` desapareceu com o IE. A API sidebar do Firefox foi removida. Não existe `navigator.bookmark()`. Foi intencional — navegadores tratam favoritos como dados privados do usuário.

O fallback Ctrl+D de 2015 agora é a única opção para bookmarking tradicional.

## O Equivalente Moderno: PWA Install

O que substituiu o caso de uso de "salvar este site" é muito mais poderoso: Progressive Web Apps com `beforeinstallprompt`:

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  mostrarBotaoInstalar();
});

document.getElementById('btn-instalar').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('Usuário instalou o PWA');
  }
  deferredPrompt = null;
});
```

O usuário tem o site na tela inicial, na gaveta de apps, com suporte offline — muito mais valioso que um favorito no navegador.

## Conclusão

A API "adicionar aos favoritos" morreu porque navegadores tornaram o bookmarking uma ação controlada pelo usuário. PWA install deu ao caso de uso uma resposta melhor: em vez de salvar uma URL, usuários instalam uma experiência tipo app. A intenção (retorno rápido ao site) permaneceu; a implementação melhorou.
