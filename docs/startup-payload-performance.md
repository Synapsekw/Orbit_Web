# Startup payload follow-up — October 13, 2026

The Netlify report for `https://6ace669090c080f38cb1392e--orbitaerials.netlify.app/` scored 62 performance with 3,610 ms total blocking time, 10.1 s time to interactive, and zero layout shift. It contains the merged software-rendering fixes from PR #5; this is not an old deployment.

A fresh audit of that exact URL on this workstation, using Lighthouse 9.6.8 and Chromium 107.0.5296.0 with software graphics, scored 86 with 181 ms blocking time and 4.16 s TTI. That does **not** reproduce Netlify's blocking result. Runner hardware and load remain an unresolved difference. The previous preview score of 90 and the user's production score of 62 were not a controlled before/after comparison.

## Verified waste and changes

Response headers confirmed that Netlify already compresses HTML, CSS and JavaScript. The text-compression warning points to the 669,120-byte M400 CAD edge binary, served without compression.

- Ship gzip copies of all ten M400/M350 edge files. M400's body edges shrink to 353,968 bytes. The original coordinate buffers and visible geometry are unchanged. Tests decompress every file and compare its bytes with the original.
- Load compressed edges with the browser's native Compression Streams API, with the original binary available to browsers lacking that API or if the compressed request fails. Hosts that send `Content-Encoding: gzip` are handled without decompressing twice. No decompression library is added.
- Use an 88,398-byte lossless WebP for Orbi's 154,042-byte baked lighting PNG. Decoded RGBA pixels were compared and are identical. The original PNG remains the reproducible source.
- Share a 20,752-byte, 256px Orbi image between the initial site launcher and the widget. Previously the page requested both an 80,846-byte, 640px fallback and a 12,696-byte compact icon.
- Use an 8,870-byte, 450px lossless WebP for the site logo in place of the 27,555-byte, 900px PNG. Its CSS dimensions and accessible text remain unchanged.
- Read the hero's layout when scroll/resize invalidates its pose, instead of on every animation frame. Body motion, all four propellers, manual controls and pause behavior remain enabled.

`npm run prepare:startup` recreates these derived assets from committed originals. It runs before development and production builds. The standalone Orbi bundle was also rebuilt. CAD conversion scripts still produce the original binaries; startup preparation derives compression from them.

## Matched local measurement

Both builds were tested sequentially at `http://127.0.0.1:4174/`, using Lighthouse 9.6.8, exact Chromium 107.0.5296.0, default mobile simulated throttling, and `--headless --no-first-run --disable-gpu`. All site animations were enabled and no requests were blocked.

| Metric | Before | After |
| --- | ---: | ---: |
| Performance | 73 | 90 |
| First contentful paint | 1.58 s | 1.59 s |
| Largest contentful paint | 2.71 s | 2.12 s |
| Speed index | 2.76 s | 2.37 s |
| Total blocking time | 747 ms | 298 ms |
| Time to interactive | 6.49 s | 4.90 s |
| Layout shift | 0.000213 | 0.000213 |
| Transferred bytes | 1,674,905 | 1,198,259 |

Transfer falls by 476,646 bytes (28.5%). These are individual local lab runs, not a guarantee of the Netlify runner's score. Both runs have 100 accessibility, 100 best practices, 93 SEO (local noindex), all eight weighted PWA checks passing, and no run warnings. The final network log confirms only compressed CAD edges were downloaded, with no raw retries.

Raw diagnostic reports remain in ignored `.local/`: `lighthouse107-regression-baseline`, `lighthouse107-payload-before`, and `lighthouse107-payload-final` (`.report.json`/`.report.html` plus traces). The intermediate `payload-after` run revealed the Vite double-decode issue, which was corrected and covered by a failing-then-passing real HTTP test before the final run.

## Validation and release

All 106 tests pass, including lossless CAD round trips, both HTTP compression modes, failed compressed requests and the legacy-browser fallback. Production build and public-output checks pass. Vite's existing warning about the shared Three.js chunk exceeding 500 kB remains. Independent code review found no actionable issues.

Desktop and 390px mobile browser checks exercised M400/M350 switching, rotation/reset controls, menu open/Escape, Orbi opening/closing, successful WebGL presentation, and no horizontal overflow or uncaught page errors. Lighting pixels were compared exactly; mobile and desktop screenshots were inspected. No enquiry or chat message was sent.

Release through the normal pull request and owner-controlled manual merge. Recheck the production Netlify audit after deployment; this pass does not establish that the 3,610 ms blocking result is eliminated on Netlify's machine.
