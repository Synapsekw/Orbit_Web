# Orbit Aerials website

Complete 16-page local website for Orbit's broader drone services: oil and gas, construction, power, security and the environment. Deep navy and gold, original brand artwork, aircraft-led homepage, industrial photography, embedded aircraft wireframes and optional spatial viewers and the existing Orbi character. This build follows the owner's complete brief and reference sites; earlier Atlas and Round 6 studies remain as noindex design history.

## Run and build

Use Node.js 24, matching GitHub Actions and the Netlify configuration.

```sh
npm ci
npm run dev
```

Development: http://127.0.0.1:5173/

```sh
npm test
npm run build
npm run preview -- --port 4174
```

Production preview: http://127.0.0.1:4174/. `dist/` is generated output. Both development and build regenerate meaningful route HTML first. The included optimized media can be regenerated with `npm run prepare:media`. Do not edit generated route HTML directly.

## Repository and review

Source: [Synapsekw/Orbit_Web](https://github.com/Synapsekw/Orbit_Web). Changes are submitted through pull requests for manual owner review and merging. `Website validation` installs locked dependencies, builds the site, runs the tests and scans repository/public output without live API credentials. See [CONTRIBUTING.md](CONTRIBUTING.md). The initial `main` baseline is intentionally empty; the website and CI arrive together in the initial import pull request.

## Pages and editing

- Home, Industries, Services, Fleet, About, Journal, Contact, Privacy and Image Credits.
- Five service details: progress documentation, spatial mapping, 360 walkthroughs, time-lapse and handover media.
- Two rewritten original Blog articles at their existing URLs: construction services in Kuwait and drone surveying. Three prototype field notes remain unpublished drafts. No online editor or CMS; articles are maintained through the AI agent and repository.

`src/site/data.js` contains shared business, industry and fleet data. `src/content.js` holds retained services and legacy study copy. Current Blog content is in `content/journal/`; `scripts/journal.mjs` generates the read-only article data and RSS feed. `src/site/render.js` generates shared navigation, footer and all page compositions; `src/site/site.css` holds responsive styles and design tokens. `src/site/main.js` progressively enhances navigation, selectors, aircraft artwork and motion. `src/site/enquiry.js` implements enquiry preparation. `src/site/viewers.js` owns optional dialogs, loading, fallbacks and camera controls. `src/site/orbi.js` connects the retained character to the private Netlify backend. See `NETLIFY-SETUP.md` for activation and `docs/polish-status-2026-10-13.md` for verification and remaining inputs.

`scripts/build-site.mjs` produces the 16 routes, metadata, sitemap, robots rules and redirects. `src/privacy-content.html` preserves the existing policy verbatim; the page adds a separate explanation of the local form, Orbi and automatic inline Sketchfab connections. Company contact details are retained from the existing project records; the live site timed out during this build's recheck.

## Working interactions

The hero selects DJI M400, M350 RTK and Flyability Elios 3, updating the aircraft, copy, applications and links together. The M400 loads a real wireframe converted from DJI's official CAD assembly: gold structural edges, subtle blue triangulation and surface occlusion. It slowly turns and hovers, with four independent propellers rotating about their CAD hub axes. Adjacent propellers counter-rotate at an illustrative, slowed speed. Drag horizontally to rotate; arrows rotate, plus/minus zoom and Home resets. Manual inspection holds the automatic body turn for three seconds while the propellers continue. Normal scrolling also turns and banks the model. Pause/reduced motion stop automatic movement while preserving manual controls; rendering stops offscreen, in hidden tabs and during large viewer dialogs. The M350 uses the same renderer with its own official CAD; its four original propeller assemblies now counter-rotate independently, with the same hover, inspection and pause behaviour as the M400. Its framing includes the full blade sweep. Product artwork is retained as a loading/failure fallback. Public redistribution rights for the official CAD remain to be confirmed; this is a local evaluation build.

M400 preparation: place DJI's `DJI_Matrice_400_3D_Model.stp` in `assets-source/m400/`, install `cadquery-ocp-novtk==7.9.3.1.1` in an isolated Python environment, run `scripts/prepare-m400-flight-cad.py`, then `node scripts/prepare-m400-flight-web.mjs`. The 164.5 MB engineering source becomes a 331 kB compressed five-part surface and 680 kB of quantized CAD lines. No CAD runtime is included in the website. The original static conversion scripts/assets are retained. `src/site/m400-hero.js` renders the aircraft; `aircraft-motion.js` defines the bounded scroll pose and `m400-flight.js` defines elapsed-time hover, turn and rotor motion. Geometry source notes are in `public/models/M400-SOURCE.md`.

All three hero options now show embedded wireframes. The M350 uses a local 308.0 kB surface and 584.1 kB of quantized CAD edges converted from DJI’s official STEP; see `public/models/M350-SOURCE.md`. `inline-aircraft.js` loads the local models as needed. Elios uses Flyability’s official Sketchfab embed automatically on selection or section visibility. `embedded-elios.js` supplies distinct hero, profile, elevated and three-quarter views, slow orbit, manual controls and pause support. The homepage feature, Services and Fleet use these inline presentations instead of product cutouts. Aircraft dialogs are removed. Explore links point to manufacturer websites; spatial and panorama dialogs remain.

The spatial demonstration uses the real stadium reconstruction, sampled point view and derived DSM with one camera and a comparison slider. The spherical construction panorama has drag/look, zoom, reset and keyboard controls. Only one large viewer is mounted at a time; pending contexts are released on closing, completed scenes are disposed, rendering pauses offscreen, and canvas interaction preserves native vertical touch scrolling. Aircraft models are lazy-loaded as their presentations enter view; the larger spatial and panorama explorers remain optional.

Orbi now answers through OpenAI in the local preview, using the owner's privately supplied key and GPT-6 Luna. Real English, Arabic and follow-up replies were verified. The reviewed Grok handoff is also enabled locally: a single authorised test was accepted and the owner confirmed receiving its notification. No public deployment is active. See NETLIFY-SETUP.md and docs/orbi-activation-check.md.

The enquiry form carries service/industry choices forward, validates fields, then prepares a reviewable email brief. Copy and Open email app are explicit visitor actions. Nothing is submitted, stored persistently or sent by this website. Without JavaScript, email and phone links remain available and the form cannot accidentally put personal details in a URL.

## Provenance and scope

The owner confirmed Orbit operates DJI M350, DJI M400 and Elios 3. Particular thermal, LiDAR, surveying, gas-sensing and ultrasonic payload ownership is not established. Technical scope is qualified accordingly.

Sources, transformations and rights are in `public/ASSET-SOURCES.md`, `public/models/` and the public `/image-credits/` page. Manufacturer artwork remains local evaluation material pending publication rights. Stock photographs and sample outputs illustrate capabilities; they are not presented as Orbit commissions, Kuwait facilities, measured data or client evidence. Original customer marks are used at the owner's request without invented endorsements.

The 2.3 MB stadium GLB is **Stadium under construction | Drone 3D Scan**, Sircher, CC BY 4.0, from https://sketchfab.com/3d-models/9f5edb6287284b9885fc833982d11962, distributed through Objaverse. The mesh is simplified and its photo atlas compressed. Derived points and surface raster are demonstration views, not validated survey outputs. To rebuild it, place the original Objaverse `glbs/000-105/9f5edb6287284b9885fc833982d11962.glb` at `assets-source/stadium-site.glb`, then run `npm run prepare:scan`.

The panorama is **Interior Construction**, Sergej Majboroda / Poly Haven, CC0: https://polyhaven.com/a/interior_construction. It is served as a 4096 × 2048 spherical WebP with a matching static preview.

## Verification and release

See `docs/completion-report.md` for actual checks, performance observations and untested conditions. Add `?diagnostics=1` to a local page to display browser-observed LCP, cumulative layout shift and the longest recorded interaction. This opt-in panel makes no requests and stores nothing; it is not a field Core Web Vitals measurement.

Default builds are **noindex,nofollow**, with robots disallowing indexing. `ORBIT_PUBLIC_BUILD=1` enables public indexing rules when building an approved release. No deployment was performed. Review contact details, editorial drafts, optional-viewer privacy wording and manufacturer media rights before publishing.

`/policy` and `/policy/` redirect to `/privacy/`; `/image-credits.html` redirects to `/image-credits/`. `_redirects` supplies host rules and HTML aliases support local previews. Hosts without `_redirects` support need equivalent rules. Employee access still links to https://www.orbitaerials.com/log-in. A static deployment must preserve that protected system through the hosting configuration; this project does not replace its authentication.
# Elios 3 official wireframe

On the homepage, choose **Flyability Elios 3** to switch directly to the official inline wireframe. The same model appears automatically in its homepage, Services and Fleet sections with different starting perspectives. Product artwork remains a failure fallback, and the privacy page discloses the automatic external connection. Unlike the M400 STEP, the Elios model is not available for download; see `docs/elios-3-model-source.md` for source evidence and the route to an approved local model.
