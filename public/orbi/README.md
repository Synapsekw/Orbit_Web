# Orbi — Halo Companion

The approved Orbit Aerials character, animated with Three.js and packaged with an accessible website guide widget. The original visual direction is `design-concepts/orbi-round-1/02-halo-companion.png`.

Visual revision 1.0.1 brings the animated model closer to that reference: broad silver ribbons follow continuous sculpted curves, including the diagonal front sweep; warm eye halos are stronger and soften with blinks. The hero and widget share this model. The integration API is unchanged.

## Files to deploy

Copy this directory to `/orbi/` on the website. Runtime files:

- `orbi.js` — standalone ES module, includes Three.js; no CDN or additional runtime dependency.
- `orbi.css` — styles for standalone avatars. The widget also carries its own scoped stylesheet inside Shadow DOM.
- `orbi-fallback.webp` — 640px transparent artwork for larger avatars.
- `orbi-icon.webp` — 160px transparent artwork for compact avatars.
- `orbi-launcher.webp` — 256px transparent artwork for the animated widget and initial site launcher.
- `orbi-studio-cubeuv.webp` — prefiltered studio lighting required by the 3D model. Deploy it unchanged alongside the other runtime assets; `assetBase` also controls this image's location.
- `orbi-fallback.png` — original transparent artwork, available for design use; not needed at runtime.
- `THIRD-PARTY-LICENSES.txt` — Three.js license.

`preview.html`, `preview.js`, and `preview.css` form the interactive review page. They are optional on the public site. This preview assumes the directory is served at `/orbi/`.

## Add the widget

```html
<script type="module">
  const { mountOrbiWidget } = await import('/orbi/orbi.js');
  const orbi = mountOrbiWidget();
  // Keep `orbi` if the host router needs to call orbi.destroy() on unmount.
</script>
```

The default widget provides **prepared local service guidance**. It does not make AI calls, send enquiries, save conversations, or require credentials. Messages remain in memory until the widget is destroyed or the page is left. Its disclosure states that clearly. Service and contact links navigate to the site's own pages; the contact page owns its email preparation flow.

Only mount one widget at a time per document. In a client-side router, mount it once at the shell level, or destroy the current instance before mounting another. A full page navigation resets the conversation by design.

### Website preview routing

Canonical links are `/services/`, the five `/services/SLUG/` pages, and `/contact/`. Supply either a routes map or a resolver to translate links into the Atlas preview routes. The resolver is applied to both prepared and backend-provided links, after safe-link validation; its output must also be a root-relative same-site URL or a fragment.

```js
const orbi = mountOrbiWidget({
  resolveHref(href) {
    const url = new URL(href, location.origin);
    const parts = url.pathname.split('/').filter(Boolean);
    const query = new URLSearchParams({ v: 'atlas', mode: 'dark' });
    if (parts[0] === 'services' && parts[1]) {
      query.set('p', 'service');
      query.set('service', parts[1]);
    } else {
      query.set('p', parts[0] || 'home');
    }
    return '/design-concepts/round-5/preview.html?' + query;
  },
});
```

`routes` can instead override these keys: `services`, `contact`, `progress`, `mapping`, `walkthroughs`, `timelapse`, `handover`.

### Theme and placement

The default colors match Atlas. Set custom properties on `orbi.element` (the Shadow DOM host) to override them. No global website CSS is changed.

```js
orbi.element.style.setProperty('--orbi-bottom', '64px'); // preview toolbar clearance
orbi.element.style.setProperty('--orbi-right', '24px');
orbi.element.style.setProperty('--orbi-font', 'Manrope, Arial, sans-serif');
```

Supported properties: `--orbi-navy` (#07182b), `--orbi-raised` (#0d2239), `--orbi-gold` (#d6b56d), `--orbi-text` (#f3f4f5), `--orbi-muted` (#a8b6c8), `--orbi-line` (#2b4058), `--orbi-font`, `--orbi-bottom`, `--orbi-right`, `--orbi-z` (1000). Bottom positioning includes the device safe-area inset. Desktop defaults are 24px; mobile defaults are 16px for the launcher. A host override applies on both sizes.

The mobile chat panel uses a native modal dialog with focus containment. It follows the visible viewport and restores the prior body scroll style when closed or destroyed. Desktop uses a nonmodal dialog so the website remains available.

### Widget options and methods

```js
mountOrbiWidget({
  container: document.body,
  assetBase: '/orbi/',           // include the trailing slash
  motion: true,
  renderMode: 'auto',           // 'artwork' forces static fallback
  routes: {},
  resolveHref: href => href,
  // respond: async (message, context) => ({ reply, links }),
  requestTimeout: 25000,        // clamped to 1–60 seconds
  // disclosure: 'Your accurate processing/privacy disclosure',
});
```

Methods: `open()`, `close()`, `reset()`, `setMotion(boolean)`, `getStatus()`, `destroy()`. `element` is the host for placement/theme variables. Destruction aborts an in-flight request, removes listeners, disposes the character renderers, removes the widget, and restores focus/scroll state. State methods after destruction are harmless.

### Optional live AI connection

No live backend is included or connected. The integration owner can supply `respond` once there is an approved server endpoint. Never place an API key in browser code.

```js
const orbi = mountOrbiWidget({
  async respond(message, { history, signal, requestId }) {
    // Use the website's authenticated server endpoint and CSRF policy.
    const response = await fetch('/api/orbi', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, request_id: requestId }),
      signal,
    });
    if (!response.ok) throw new Error('Unavailable');
    return response.json();
  },
  disclosure: 'AI can make mistakes. Messages are processed by [your actual provider].',
});
```

Response shape: `{ reply: string, links?: [{ label: string, href: string }] }`. Reply text is rendered as plain text, never HTML/Markdown. Only root-relative same-site links and fragments are accepted. The adapter receives at most 23 prior `{role, content}` entries; the current message is supplied separately. Messages are limited to 1,000 characters, responses to 12,000. Retries preserve `requestId` so a backend can implement idempotency. Reset invalidates pending results; the timeout also releases the UI if an adapter ignores cancellation. Closing the panel keeps the current request/conversation in memory; reopening shows its result.

Supplying `respond` changes the label to “AI assistant”; the host must supply an accurate disclosure and a functioning backend. The default local guide never falls through to a remote service.

## Use Orbi outside the widget

```html
<link rel="stylesheet" href="/orbi/orbi.css">
<div id="orbi-hero" role="img" aria-label="Orbi, your Orbit guide"
     style="width:360px;aspect-ratio:1"></div>
<script type="module">
  const { createOrbiAvatar } = await import('/orbi/orbi.js');
  const avatar = createOrbiAvatar(document.querySelector('#orbi-hero'), {
    fallbackUrl: '/orbi/orbi-fallback.webp',
    environmentUrl: '/orbi/orbi-studio-cubeuv.png',
    compact: false,
    interactive: true,
    motion: true,
  });
  avatar.setState('listening');
</script>
```

States: `idle`, `curious`, `listening`, `thinking`, `speaking`, `happy`, `surprised`, `concerned`.

Methods: `setState(name)`, `setMotion(boolean)`, `setVisible(boolean)`, `playGesture('greet')`, `getStatus()`, `destroy()`. `compact: true` lowers geometry detail for small avatars. `interactive: true` enables pointer gaze. `renderMode: 'artwork'` forces the image with no WebGL context. `onError(error)` can receive a WebGL initialization error. Calling `createOrbiAvatar` twice on the same element reuses the instance.

The avatar renders over a transparent canvas; give the host a width and height. It pauses when offscreen, manually hidden, or the document is hidden. Reduced motion disables the loop and renders a still pose; expressions can still be changed. Loss of the WebGL context exposes the transparent artwork. The fallback remains a static image, so it does not depict different expressions.

The studio texture preserves the original lighting without generating an environment map on each visitor's GPU. Avatars sharing an environment URL reuse its decoded pixels while owning independent GPU textures. The first 3D frame waits for shader preparation; context restoration prepares the replacement context. Compact avatars render at up to 30 fps while the choreography keeps its eighteen-second timing. For a standalone avatar installed outside `/orbi/`, set both `fallbackUrl` and `environmentUrl`.

The procedural 3D rig interprets the approved artwork; it is not a pixel-identical reproduction of the generated image. Three broad ribbon loops produce the six-lobed orbital silhouette while keeping the face open. Speaking is a visual expression, not audio playback or a claim that voice support exists.

## Build and verification

From the website workspace:

```sh
node scripts/build-orbi.mjs
npm test
```

Build only touches `/public/orbi/`; it does not rebuild website pages. Source is in `src/orbi/`, preview source in `orbi-preview/`.

To rebake the studio after an intentional lighting change, run the development server and open `/src/orbi/bake-environment.html`. Save its PNG as `public/orbi/orbi-studio-cubeuv.png`; the helper documents lossless recompression. Keep the CubeUV dimensions, orientation, colors and roughness levels intact.

Browser regression checks are in `tests/orbi-browser.mjs`. Run against a local Vite server with `ORBI_PREVIEW_URL` if using a port other than 5190. They need Playwright and Chrome; `ORBI_PLAYWRIGHT_MODULE` can point to an existing installed Playwright package. The test creates its own isolated headless browser and does not use the website session's browser profile.

The image fallback was generated with the built-in ImageGen tool from the approved Option 2 artwork, then resized to WebP for delivery. The generation prompt is in `artwork-provenance.json`.

Verified on 12 October 2026: 11 Node tests passed; 32 browser checks and 3 additional regression scenarios passed in isolated Chrome, with no JavaScript errors. Desktop and 390px mobile layouts were inspected. Independent review findings for delayed-response focus and context-restoration lighting were fixed and regression tested. Dynamic reduced-motion pause/resume and the mobile host bottom-offset override were also verified. Verification is local; final deployment and backend activation belong to the website integration session.
