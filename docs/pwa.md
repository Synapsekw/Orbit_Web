# Orbit Aerials PWA

The production site supplies a standalone web app manifest with the existing Orbi artwork as its app icon and favicon. Installation uses the browser's native UI; there is no custom install banner. Browser and operating-system support determine where that UI appears. See [MDN's installability guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

## Integration

The generated site pages include these head links, alongside the existing `#071421` theme-color meta tag:

```html
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="/manifest.webmanifest">
```

The main site entry point imports `registerPwa` from `./pwa.js` and calls it once. It registers `/sw.js` for `/` only in a Vite production build, in a secure context, after page load. HTTPS deployments and production previews on localhost or `127.0.0.1` work; Vite development mode does not register a worker. Registration failure does not interrupt the site.

Serve `/sw.js` as `application/javascript` with `Cache-Control: no-cache`. Serve `/manifest.webmanifest` as `application/manifest+json` with `Cache-Control: no-cache`. Serve `/offline.html` with `Cache-Control: no-cache` and `X-Robots-Tag: noindex, nofollow`. Vite copies the files from `public` into the built site. The worker is at the root, so it needs no wider `Service-Worker-Allowed` header.

## Offline boundary and updates

The worker caches exactly six public files: `/offline.html` and the five PNGs in `/icons/`. Their combined download is about 146 KiB; the test suite enforces a 200 KiB ceiling. The offline document includes its own styling and a small inline Orbi image. It provides the real phone number, email address and a home-page retry link. Chat, forms, site pages and 3D views require a connection.

Normal document requests always use the network. A failed network request receives the offline document with HTTP 503 and `Cache-Control: no-store`; real HTTP errors from the server are preserved. The worker never writes navigated pages into CacheStorage. It has no runtime cache, so the list cannot grow with browsing history.

Requests with query strings or authorization headers, non-GET requests, range requests, cross-origin requests, and API, Netlify-function, Orbi or authentication/callback paths bypass the worker. Explicitly credentialed subresource requests also bypass it. Install-time asset fetches omit credentials and reject redirects, invalid content types, unsuccessful responses and private/no-store responses. Models, media, JavaScript bundles and conversation traffic are not cached.

Increment `CACHE_NAME` in `public/sw.js` whenever changing the offline document or icons. An update waits for existing controlled tabs to close; there is no `skipWaiting`, `clients.claim`, reload listener or update prompt. Activation removes only obsolete `orbit-pwa-` caches, leaving unrelated caches intact. This follows the browser's [service worker lifecycle](https://web.dev/articles/service-worker-lifecycle) rather than replacing the worker under open pages.

## Icon source

All icons derive from `public/orbi/orbi-fallback.webp`, the existing 640px Orbi render. Sharp trims its transparent border and resizes it onto a solid `#071421` background. Standard icons use 92% of the canvas width. Maskable icons scale the furthest nontransparent source pixel to a radius equal to 38% of the canvas width, preserving the complete face and orbital loops inside the [40% maskable safe circle](https://web.dev/articles/maskable-icon). The test suite checks every pixel outside that safe circle remains navy.

The 192px, 512px and 180px app PNGs use a 256-color palette. `favicon.ico` contains 16px, 32px and 48px PNG entries; separate 16px and 32px PNGs are also provided. No artwork generation or new character design is involved.

## Verification

Run `node --test tests/pwa.test.js` for the real worker in a Node VM with browser CacheStorage/event adapters, then `npm test` for the repository suite. Coverage includes network-only HTML, offline contact content, traffic bypasses, update cleanup, registration timing, actual image sizes, maskable safe zones and the ICO entries.

For browser verification, build and preview the production site, then:

1. Open the manifest in browser developer tools and check the app name, start URL, scope and four PNG icon entries.
2. Wait for `/sw.js` to activate, then navigate or reload once online so the page becomes controlled. The first already-open page is deliberately not claimed.
3. Set the browser offline and navigate to `/services/` or `/contact/`. Check that the offline page fits a narrow mobile viewport and that its contact links and home retry link are keyboard accessible.
4. Restore the connection and retry the home page. Check that it returns the current network document. Inspect CacheStorage: it should contain only the six fixed files.
5. Check the supported browser's install UI, installed name, standalone window and Orbi icon. Install UI may depend on browser engagement rules.
6. For an update check, bump the worker cache version in a temporary local test, rebuild and revisit. The update should wait while an old controlled tab is open, then activate after that tab closes and remove only the previous Orbit cache.

Use a separate browser profile or unregister the test worker after testing a preview on the same local origin used for development. `npm run dev` does not remove a previously installed production worker.
