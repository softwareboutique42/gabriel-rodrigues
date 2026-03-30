---
title: 'Geolocalização: Como Identificar a Cidade do Usuário no Navegador'
description: 'Minha pergunta no Stack Overflow de 2015 usava navigator.geolocation livremente. Em 2026, restrições de privacidade mudaram toda a abordagem.'
date: 2026-03-29
tags: ['javascript', 'geolocalização', 'stackoverflow', 'privacidade']
lang: 'pt'
---

# Geolocalização: Como Identificar a Cidade do Usuário no Navegador

Em 2015, fiz uma pergunta no Stack Overflow em Português sobre identificar a cidade do usuário pelo navegador. Recebeu 15 votos. Parecia simples — navegadores têm API de Geolocalização, então obter a localização deveria ser direto, certo?

Era. Em 2015.

## A Abordagem de 2015: Pergunte e Receba

```javascript
// 2015: Obter posição e fazer geocodificação reversa
navigator.geolocation.getCurrentPosition(function (position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  // Geocodificação reversa com Google Maps API
  var geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(lat, lng);

  geocoder.geocode({ location: latlng }, function (results) {
    var city = results[0].address_components.find(function (c) {
      return c.types.includes('administrative_area_level_2');
    });
    console.log('Cidade:', city.long_name);
  });
});
```

O navegador mostrava "example.com quer saber sua localização." A maioria dos usuários clicava "Permitir" sem pensar. Você recebia coordenadas precisas via GPS, fazia geocodificação reversa com Google Maps, e tinha o nome da cidade em segundos.

Funcionava porque:

- Usuários eram menos conscientes sobre privacidade
- A maioria dos navegadores mostrava um prompt simples, fácil de dispensar
- Não havia penalidade por perguntar cedo ou frequentemente
- A API de Geocoding do Google Maps era gratuita para volumes pequenos

## A Realidade de 2026: Privacidade Primeiro

### Usuários Negam Mais

A consciência sobre privacidade mudou dramaticamente. Usuários agora tratam permissão de localização como tratam acesso à câmera — negam a menos que haja razão clara. Navegadores tornaram os prompts de permissão mais proeminentes e difíceis de aprovar acidentalmente.

O resultado: **taxas de conversão em prompts de geolocalização caíram significativamente**. Se sua feature depende de usuários concedendo acesso à localização, planeje para a maioria dizer não.

### Permissions Policy

Sites não podem mais usar a API de Geolocalização em iframes de terceiros por padrão. O header `Permissions-Policy` controla isso:

```
Permissions-Policy: geolocation=(self)
```

Widgets e anúncios embarcados não podem silenciosamente requisitar localização — apenas o site principal pode.

### Fallback por IP

Para muitos casos, você não precisa de precisão GPS. Precisão a nível de cidade é suficiente para mostrar clima local, moeda ou preferências de idioma. Geolocalização por IP no servidor resolve isso sem perguntar nada ao usuário:

```javascript
// 2026: Headers da Cloudflare (zero interação do usuário)
// Cloudflare adiciona automaticamente esses headers:
// cf-ipcountry: BR
// cf-ipcity: Sao Paulo
// cf-ipregion: SP

// Ou use uma API de geolocalização
const response = await fetch('https://ipapi.co/json/');
const data = await response.json();
console.log(`${data.city}, ${data.region}`); // "São Paulo, SP"
```

Sem prompt. Sem permissão. Sem fricção. O trade-off é precisão — geolocalização por IP dá no máximo nível de cidade, às vezes só país. Mas para a maioria das features, é suficiente.

### O Padrão Moderno: Progressive Enhancement

```javascript
async function getUserCity() {
  // 1. Tentar headers Cloudflare (se atrás da CF)
  // Disponível no servidor, passado ao cliente via meta tag ou API

  // 2. Tentar geolocalização por IP como padrão
  try {
    const response = await fetch('/api/location'); // Servidor lê o IP
    const data = await response.json();
    if (data.city) return data.city;
  } catch {}

  // 3. Só pedir GPS se o usuário explicitamente quiser precisão
  // (ex: clicou "Usar minha localização exata")
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(pos.coords);
        resolve(city);
      },
      () => resolve(null), // Usuário negou — lidar graciosamente
      { timeout: 5000 },
    );
  });
}
```

Comece com o método menos invasivo. Escale apenas quando o usuário explicitamente requisitar.

## Conclusão

Em 2015, `navigator.geolocation` era a resposta para "onde está o usuário?" Em 2026, é o último recurso. Geolocalização por IP resolve a maioria dos casos sem fricção, headers da Cloudflare dão país e cidade de graça, e GPS só deveria ser disparado por ação explícita do usuário. A melhor geolocalização é aquela que o usuário nem percebe.
