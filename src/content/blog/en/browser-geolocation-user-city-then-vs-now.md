---
title: "Geolocation: How to Identify a User's City in the Browser"
description: 'My 2015 Stack Overflow question used navigator.geolocation freely. In 2026, privacy restrictions changed the entire approach.'
date: 2026-03-29
tags: ['javascript', 'geolocation', 'stackoverflow', 'privacy']
lang: 'en'
---

# Geolocation: How to Identify a User's City in the Browser

In 2015, I asked a [question on Stack Overflow in Portuguese](https://pt.stackoverflow.com/questions/63498) about identifying a user's city through the browser. It scored 15 upvotes. The question felt simple enough — browsers have a Geolocation API, so getting the user's location should be straightforward, right?

It was. In 2015.

## The 2015 Approach: Ask and Receive

```javascript
// 2015: Get user position and reverse geocode
navigator.geolocation.getCurrentPosition(function (position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  // Reverse geocode with Google Maps API
  var geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(lat, lng);

  geocoder.geocode({ location: latlng }, function (results) {
    var city = results[0].address_components.find(function (c) {
      return c.types.includes('administrative_area_level_2');
    });
    console.log('City:', city.long_name);
  });
});
```

The browser prompted the user with "example.com wants to know your location." Most users clicked "Allow" without thinking twice. You got GPS-accurate coordinates, reverse geocoded them with Google Maps, and had the city name in seconds.

This worked because:

- Users were less privacy-conscious
- Most browsers showed a simple, easily dismissible prompt
- There was no penalty for asking early or often
- Google Maps Geocoding API was free for small volumes

## The 2026 Reality: Privacy First

### Users Deny More Often

Privacy awareness has shifted dramatically. Users now treat location permission like they treat camera access — they deny it unless there's a clear reason. Browsers have made the permission prompts more prominent and harder to accidentally approve.

The result: **conversion rates on geolocation prompts dropped significantly**. If your feature depends on users granting location access, plan for the majority saying no.

### Permissions Policy

Sites can no longer use the Geolocation API in third-party iframes by default. The `Permissions-Policy` header controls this:

```
Permissions-Policy: geolocation=(self)
```

This means embedded widgets and ads can't silently request user location — only the main site can.

### IP-Based Fallback

For many use cases, you don't need GPS precision. City-level accuracy is enough for showing local weather, currency, or language preferences. Server-side IP geolocation handles this without asking the user anything:

```javascript
// 2026: Cloudflare headers (zero user interaction)
// Cloudflare automatically adds these headers to requests:
// cf-ipcountry: BR
// cf-ipcity: Sao Paulo
// cf-ipregion: SP

// Or use a geolocation API
const response = await fetch('https://ipapi.co/json/');
const data = await response.json();
console.log(`${data.city}, ${data.region}`); // "São Paulo, SP"
```

No prompt. No permission. No user friction. The trade-off is accuracy — IP geolocation gives city-level at best, sometimes only country-level. But for most features, that's enough.

### The Modern Pattern: Progressive Enhancement

```javascript
async function getUserCity() {
  // 1. Try Cloudflare headers (if behind CF)
  // Available on the server side, passed to client via meta tag or API

  // 2. Try IP geolocation as default
  try {
    const response = await fetch('/api/location'); // Your server reads IP
    const data = await response.json();
    if (data.city) return data.city;
  } catch {}

  // 3. Only ask for GPS if the user explicitly wants precision
  // (e.g., they clicked "Use my exact location")
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(pos.coords);
        resolve(city);
      },
      () => resolve(null), // User denied — gracefully handle it
      { timeout: 5000 },
    );
  });
}
```

Start with the least invasive method. Escalate only when the user explicitly requests it.

## Key Takeaway

In 2015, `navigator.geolocation` was the answer to "where is the user?" In 2026, it's the last resort. IP-based geolocation handles most use cases without friction, Cloudflare headers give you country and city for free, and GPS should only be triggered by an explicit user action. The best geolocation is the one the user doesn't notice.
