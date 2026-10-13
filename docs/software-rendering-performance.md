# Chromium 107 graphics stall

The October 13 follow-up report on `https://6ace5a098925e870912c9f3c--orbitaerials.netlify.app/` scored 56 with 166,290 ms total blocking time and a page-load timeout. PWA passed and CLS was zero. This deployment already contained the previous fixes; it was not stale. The earlier modern-Chrome result did not reproduce this failure.

## Reproduction and isolation

Lighthouse 9.6.8 with Chromium **107.0.5296.0**, revision **1045629**, reproduced the timeout on that immutable deployment: performance 51, TBT 142,144 ms, TTI 158.68 seconds. About 155 seconds of simulated main-thread time was classified as Other, versus 1.9 seconds of scripting. The trace showed long compositor waits concurrent with GPU work, rather than long JavaScript callbacks.

Diagnostic-only request blocking on localhost isolated the initial drone renderer:

| Renderer disabled for isolation | Performance | TBT | Timeout |
| --- | ---: | ---: | --- |
| Orbi only | 55 | 163,877 ms | Yes |
| DJI drone only | 81 | 178 ms | No |

These isolation scores are not release results. No request blocking, browser detection, audit detection or delayed animation was added to the website.

## Changes

- Keep the real CAD model and every original gold feature edge. Remove the redundant faint wireframe of all surface triangles, which added roughly half a million lines for the M400.
- Simplify the dark backing body surfaces offline. M400 total surface triangles fall from **171,690 to 22,596**; M350 from **134,035 to 25,373**. The individual rotor meshes, hubs, axes and surface simplification settings are unchanged. Their rotation and the aircraft's hover/turn remain active.
- Disable multisample antialiasing on the shared DJI canvas, retaining the existing bounded high-DPI resolution. This avoids expensive multisample rendering/resolves on software graphics. Thin diagonal lines can be a little sharper; desktop and 390px mobile visual checks retained the intended gold CAD appearance.
- Add real-asset decoding tests that enforce the 30,000-triangle surface budget and preserve the five-part assembly and rotor translations. The tests failed against both original assets before regeneration.

The M400 GLB shrinks from 330,664 to 65,044 bytes; M350 from 307,996 to 88,404 bytes. Metadata and CAD line files are byte-for-byte unchanged. Elios, PWA, SEO and contact handling are unchanged.

## Validation

One change was measured at a time with the same old browser and software rendering. On localhost, removing only the redundant triangle overlay still timed out. Simplifying the surfaces eliminated the timeout (62 performance, 1,236 ms TBT). Removing multisampling then scored 88 with 278 ms TBT.

The first full localhost audit, with **all normal components and animations enabled**, returned:

| Measurement | Result |
| --- | ---: |
| Performance | **89** |
| Accessibility | **100** |
| Best practices | **100** |
| SEO | 93 (the local preview deliberately has noindex) |
| PWA weighted checks | **8/8 passed** |
| First contentful paint | 1.59 s |
| Largest contentful paint | 2.64 s |
| Speed index | 2.84 s |
| Total blocking time | **256 ms** |
| Time to interactive | **4.62 s** |
| Cumulative layout shift | 0.000213 |
| Run warnings | None |

The initial reproduction was hosted and these development measurements were local, so they should not be presented as a matched score comparison. They establish that the specific software-graphics stall is gone in the local build. Scores vary with server, hardware and network conditions.

### Hosted follow-up

The first hosted preview (`dd5b3fa`) completed without a timeout but scored 67, with 1,494 ms TBT. Disabling only Orbi for diagnostic isolation raised it to 93 / 203 ms. With both renderers now able to load quickly, the compact avatar's multisampling became a remaining source of graphics contention.

The follow-up also avoids MSAA for compact Orbi avatars on high-DPI screens, retaining their existing resolution, geometry, materials and full animation. Full-size Orbi views and compact avatars below DPR 1.5 keep MSAA for smooth edges. Its first localhost check scored 91 / 203 ms TBT with no warnings. Independent review confirmed lifecycle behavior and the regenerated standalone bundle are consistent.

The hosted follow-up at `2c3e61b` scored **90 performance**, **100 accessibility**, **100 best practices**, **93 SEO** (preview noindex), and passed **all eight weighted PWA checks**, with no warnings. LCP was 1.75 s, TBT **260 ms**, TTI **4.59 s**, speed index 4.13 s, and CLS 0.000213. Raw report: `.local/lighthouse107-netlify-orbi-after.report.json`. The final low-DPI appearance adjustment keeps the same rendering path at the audit's DPR 2.625; it was visually checked on a standard-density desktop.

The final hosted code revision **`f9225d2`** was audited again after that visual adjustment. It also scored **90 / 100 / 100 / 93**, with **PWA 8/8**, **186 ms TBT**, **3.80 s TTI**, **1.57 s LCP**, **1.35 s FCP** and **0.000213 CLS**, with no warnings. Speed index varied to **6.16 s**; not every metric improved, and the animated page's visual-completion measure remains variable. Raw report: `.local/lighthouse107-netlify-final.report.json`. This is the final measured product code; subsequent documentation changes do not alter its built assets.

Preview URL: `https://deploy-preview-5--orbitaerials.netlify.app/?ntl-drawer-state=hidden`. The query uses Netlify's own option to hide its injected review tooling; network records confirm the drawer did not load. No Orbit request or animation was blocked in this measurement. The previous immutable production deploy also had no review drawer. The hosted before/after runs use the same Lighthouse version, exact Chromium revision, machine and software-graphics flags, but the new site is a preview with noindex. Recheck production after the user's manual merge.

103 tests pass, including model budgets, propeller animation, framing, PWA and production SEO generation. The production build and both repository/public credential scans pass. The existing Vite warning about the shared Three.js chunk remains. Desktop/mobile browser checks cover M400/M350 switching, visible real wireframes, keyboard reset, no horizontal overflow, Orbi opening/closing, and no captured console errors. No enquiry was sent.

## Repeat the old-browser audit

The browser revision is listed in the [official Puppeteer changelog](https://pptr.dev/CHANGELOG). Keep downloaded diagnostic binaries and raw traces outside Git, under the ignored `.local` directory.

```powershell
npx --yes @puppeteer/browsers install chromium@1045629 --path .local/audit-browsers
$env:CHROME_PATH=(Resolve-Path '.local/audit-browsers/chromium/win64-1045629/chrome-win/chrome.exe').Path
npx --yes lighthouse@9.6.8 http://127.0.0.1:4174/ --chrome-flags='--headless --no-first-run --disable-gpu' --output=json --output=html --output-path=.local/lighthouse107-final --save-assets --quiet
```

Run audits sequentially. The `--disable-gpu` flag forces the older browser's software graphics path; it does not disable WebGL. Confirm the report's `environment.hostUserAgent` contains the exact Chromium version. Raw local report: `.local/lighthouse107-final.report.json`.

No environment-variable, DNS or certificate changes are required. Release through the reviewed PR and the existing GitHub-connected Netlify deployment.
