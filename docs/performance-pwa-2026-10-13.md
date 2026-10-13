# Mobile performance and PWA follow-up

The reported Lighthouse 9.6.8 result was 45 performance with a timeout, 163,960 ms total blocking time and 0.376 layout shift. Its missing manifest, service worker and install icons were real omissions. PWA support and performance are separate concerns.

## Measured causes

- Mobile navigation was painted expanded before the deferred main module added the `js` class. The fresh trace showed a 247px header collapse, contributing 0.268 of the 0.292 total layout shift.
- Orbi generated the studio PMREM on each avatar mount. In the fresh live trace its module accounted for 2.66 seconds of scripting, including an 885ms task. The expensive lighting calculation is now baked once and shipped as a 154,042-byte texture; the real geometry and materials remain unchanged.
- Orbi prepares its final shaders asynchronously before its first WebGL frame. The same preparation runs after context restoration; stale completions after loss or destruction cannot revive a renderer. Compact rendering is capped at 30fps without slowing the eighteen-second choreography.
- Font requests were discovered through CSS. Critical regular fonts now preload in the head; the active site's CSS imports only the Latin subsets it uses. The mobile header also reserves its loaded height.

## Reproducible measurements

Use one audit at a time, a fresh Chrome profile, the default Lighthouse mobile simulated throttling, and the same server for before/after comparisons. The old user-supplied report used a different Chrome, device profile and Lighthouse version; it is not an apples-to-apples baseline for the current runner.

The fresh Lighthouse 13.5.0 production baseline at `https://www.orbitaerials.com/` scored 65 performance, with 800ms blocking time and 0.292 CLS. Accessibility, best practices and SEO each scored 100.

The matched local baseline was captured at `http://127.0.0.1:4174/` before rebuilding the merged `b8400dd` version. It scored 52 performance, with 777ms blocking time and 0.292 CLS. Local output deliberately has `noindex`; its SEO score is not the production SEO score.

The final local Lighthouse 13.5.0 run scored **84** performance, **100** accessibility and **100** best practices, with no run warnings. Results from the same URL and settings:

| Metric | Before | After |
| --- | ---: | ---: |
| Performance | 52 | 84 |
| First contentful paint | 2.27s | 2.04s |
| Largest contentful paint | 3.91s | 4.22s |
| Total blocking time | 777ms | 11ms |
| Layout shift | 0.292 | 0.000113 |

The local LCP remains a limitation, despite the improvement in blocking and stability; do not describe every metric as improved. Both local builds scored 69 SEO because they deliberately prevent indexing. Production indexing is separately verified by the generated-HTML tests.

```powershell
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx --yes lighthouse@13.5.0 http://127.0.0.1:4174/ --chrome-flags='--headless --no-first-run' --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path=.local/lighthouse-local-after --save-assets --quiet
```

Full reports and traces are local diagnostic artifacts under `.local/`; do not publish the whole diagnostic directory. Scores are lab observations, not guarantees for every phone or network.

## PWA and favicon

Lighthouse 9.6.8, the version in the supplied report, passed all eight weighted PWA checks in the local production preview: installable manifest, controlling service worker, splash screen, theme color, viewport sizing, viewport meta tag, Apple touch icon and maskable icon. The completed report had no audit warnings. Its old Chrome launcher then reported a Windows temporary-profile cleanup error; the audit results were already written successfully.

All favicons and install icons use existing Orbi artwork. See [PWA behavior and tests](pwa.md) for the six-file offline cache, privacy boundaries and browser install behavior. No API, enquiry, conversation, 3D model or runtime asset cache is introduced.

The complete suite passes 101 tests. Desktop and 390px mobile browser checks covered the actual lit 3D character and aircraft, menu expansion and Escape, and opening/closing Orbi. Automated lifecycle tests cover reduced motion, pause, visibility, shader failure, context loss/restoration and destruction during initialization. A read-only code review found a custom `assetBase` regression; it was corrected and the reviewer confirmed closure. No contact test message was sent in this pass.

## Release

Merge the reviewed PR manually, then allow the normal GitHub-connected Netlify build to publish. No new environment variables, DNS changes or secret changes are needed. The service worker uses conservative waiting updates and does not forcibly reload open tabs. Check the final production URL again after deployment.
