# Orbit Aerials — completion report

13 October 2026. Local implementation; not publicly deployed.

## M350 propeller animation update

The M350 now has four separately animated original CAD propeller assemblies, including hub surfaces and blade markings. Hinge cylinders supply their pivots and tilted rotation axes. All 478,820 source triangles and 48,674 CAD line segments were preserved before simplification. The active GLB is 307,996 bytes with 134,035 simplified triangles; linework remains 584,088 bytes. Body framing includes the full rotor sweep. The shared renderer gives both DJI aircraft the same hover, alternating propeller rotation, manual-inspection hold, pause and reduced-motion behaviour. Homepage and Fleet use the same asset manifest.

The asset regression failed against the old rigid M350 and passes with the split model. It verifies four independent mesh nodes, hub alignment, opposing neighbouring directions, source geometry preservation and full-sweep bounds. The production build and all 33 tests pass. Desktop browser checks confirmed moving propellers while manual inspection holds the body, pixel-identical paused frames, and resumed motion. At 390 × 844 the spinning blades fit the mobile hero with no horizontal overflow, and the Fleet M350 also loaded its animated assembly. No console errors were observed. Screenshot: `docs/m350-flight-home.png`.

## Inline aircraft across the site

The homepage selector now switches directly between M400, M350 RTK and Elios 3 wireframes. M350 uses a new conversion of DJI's official STEP, served locally (287,684-byte surface and 584,088-byte linework); it rotates and hovers as one assembly. The M400 retains its separate propeller animation. Elios uses Flyability's official authorized embed, automatically loaded when selected or when its section enters view. Different camera presets supply the homepage feature, Services confined-space section and Fleet presentation. All three Fleet product images are now inline models. Aircraft pop-up viewers and their initial load buttons are removed. Explore links lead to manufacturer product pages. Industry and inspection-context photography remains.

Privacy copy now accurately describes automatic Sketchfab connections. Separate spatial/panorama dialogs remain. Motion controls apply across the page, Orbi remains intact, and hidden/offscreen models stop rendering. Failed model loads retain product artwork; the Elios failure state offers a retry. Native third-party attribution remains visible.

Validation: production build and all 32 Node tests passed. New regressions cover the inline aircraft page structure, distinct editorial views, external-connection disclosure and elevated camera math. Desktop browser checks verified M350 CAD, automatic hero Elios loading, switching, reset controls, lower-page and Services Elios models, and pause (pixel-identical captures while paused). A 390 × 844 Fleet check confirmed the Elios model loaded with no horizontal overflow. No browser console errors were observed in the tested flows. Physical-touch hardware and OS-level motion preference switching remain untested. See `docs/inline-elios-hero.png`, `docs/inline-elios-feature.png` and `docs/inline-elios-services.png`.

## M400 flight animation update

The official CAD was separated into its body and four original propeller assemblies. All 613,296 source triangles and 56,636 retained CAD line segments survived the split before surface simplification. The animated surface and line data total 1,010,296 bytes. The aircraft slowly turns, gently hovers and counter-rotates adjacent propellers around their actual hub axes. Rotor speed is deliberately illustrative. Manual inspection holds the automatic body turn briefly; pause and reduced motion freeze automatic movement. Inactive, hidden or offscreen viewers stop rendering and resume without a clock jump.

Validation: production build and all 28 Node tests pass. New checks cover paused/inspection clocks, frame-rate independence, suspended-tab timing and bounded hover. Desktop browser inspection showed intact geometry, independent propeller motion and no console errors. Two captures of the paused model were pixel-identical; resuming restored movement. Rotation/reset controls and Elios-to-M400 switching were checked. At 390 × 844, the aircraft fits without horizontal overflow; its stage was moved below the action links to give spinning blades space. The shared motion selector was restricted to buttons so pausing cannot replace Orbi's canvas content; his canvas was verified intact after pausing. Screenshot: `docs/m400-flight-home.png`. OS-level reduced-motion switching and physical touch hardware remain untested.

## Subsequent M400 wireframe update

After the initial delivery, the owner requested an M400 wireframe with scroll interaction. The homepage now uses DJI's actual public CAD assembly converted to a gold structural wireframe, faint blue triangulation and navy occluding surfaces. This supersedes the initial artwork-only M400 limitation below. The original 164.5 MB source is outside the served website; the optimized surface and line data total 986,880 bytes. Public redistribution permission remains a launch dependency. Full provenance is in `public/models/M400-SOURCE.md`.

Horizontal drag, arrow-key rotation, zoom/reset buttons and smooth normal-scroll choreography are implemented. Pause and reduced-motion preferences remove scroll animation while manual controls remain available. Rendering stops offscreen and in hidden tabs or large viewer dialogs. Failed loading retains the photograph. Source geometry was converted rather than recreated; no paid asset was used.

Validation for this update: production build passed and all 23 Node tests passed, including bounded scroll progress and preservation of manual controls when automatic motion is disabled. Browser checks at 1280 × 900 and 390 × 844 verified rendering, horizontal pointer drag, keyboard rotation, zoom/reset, switching to M350 and back, scrolling and pause state. A deliberately withheld built GLB verified that the original artwork remains visible and usable on failure; the asset was restored afterwards. The phone page had no horizontal overflow and the canvas retained `touch-action: pan-y`. Physical touch hardware and OS-level reduced-motion switching were not tested; the motion logic is covered by automated checks.

## Delivered

17 complete, navigable pages with shared static HTML, route metadata, canonical links, social previews, business structured data, sitemap and indexing controls. The five service routes and three Journal routes remain. Privacy source is preserved verbatim, with a separate addendum for this site's actual behaviour. Redirects map `/policy` to `/privacy/` and `/image-credits.html` to `/image-credits/`. The existing protected employee-access destination is preserved as a link.

Aircraft-led navy/gold homepage, three accurate aircraft selections, five-industry selector and enquiry context, substantial industry/service/fleet/company pages, original brand and customer marks, and the finished 3D Orbi. Reference sites informed aircraft scale, open typography, depth and industrial context; no reference models or proprietary identity were copied.

M400 is explicitly interactive product artwork, with perspective/scale/reset and motion controls. M350 and Elios offer genuine optional Sketchfab viewing with rotate/zoom/reset. The stadium reconstruction supports photographed, sampled-point and DSM views with a shared camera and reveal slider. The construction walkthrough is a genuine spherical panorama. Viewers are deferred, disposable and retain posters and useful explanations on failure.

The enquiry flow validates and prepares a reviewable brief, provides clipboard copy and an encoded email-app link, and makes no submission or persistent storage. Orbi provides prepared local guidance only. Owner confirmation that Orbit operates Elios 3 is reflected alongside M350 and M400. Optional payloads remain qualified.

## Checks and observations

| Check | Result |
| --- | --- |
| Production build | Passed; 17 generated route entries plus preserved concept entries |
| Preview HTTP routes | All 17 routes returned successfully with meaningful content and the intended preview indexing control |
| Node test suite | 21 passed, 0 failed |
| Static route/content checks | Meaningful HTML and metadata, local links/anchors, image files/alt/dimensions, correct fleet identity, privacy preservation and no-JS form protection passed |
| Enquiry unit cases | Unknown contexts, whitespace, invalid email, optional phone, long text, special characters and URL encoding passed |
| Browser enquiry | Industry context preserved; invalid fields identified with focus; valid test details produced accurate review; clipboard copy succeeded. No email was sent |
| Hero | Platform selection updates correct aircraft and context; M400 has no M350 viewer link |
| Genuine aircraft viewer | Elios Sketchfab embed rendered successfully; custom camera controls worked. Both M350/Elios source identities and matching links were checked |
| Spatial viewer | Real model loaded, DSM selection and 64% reveal worked, camera controls operated |
| Panorama | Spherical construction interior rendered; look controls operated |
| Forced model failure | Temporarily withheld the built GLB; preview and readable error remained, controls disabled. Restored asset and successful loading verified |
| Dialog lifecycle | Escape restored focus to the launch button. Rapid close/reopen recovered to one working canvas. Pending renderer cleanup and stale-callback guards reviewed |
| Mobile navigation | Expanded menu links worked; Escape collapsed it and restored menu focus |
| Orbi | Local fleet response correctly names all three platforms and supplies working fleet/contact links; dismissal works |
| Responsive rendering | Phone 390 × 844, tablet 820 × 1180, laptop 1280 × 900 and wide 1600 × 1000 viewport checks. No horizontal body overflow observed. Phone hero, services, fleet and contact; tablet About; desktop home, industries, Journal and viewers visually inspected |
| Mobile overlap and scrolling | Orbi hidden over the phone hero and form. Actual Three.js canvases retain inline `touch-action: pan-y` after OrbitControls setup |
| Independent code review | Loading races, focus restoration, pending GPU disposal, copy-state clearing, concept indexing and no-JS motion issues were identified and addressed |

The build retains a Vite warning for the optional Three.js chunk (about 572 kB minified / 143 kB gzip). It is dynamically loaded for graphics rather than required to render initial page content. Historical concept assets are also retained in the output; they do not load on the main website.

## Performance observations and limits

One unthrottled local preview navigation in the Codex Chromium browser at 1600 × 1000 reported **LCP 1,412 ms** and **cumulative layout shift 0.006** through the opt-in diagnostic panel. These are a single local observation with potentially warm shared assets, not a Lighthouse run, cold mobile network test or field Core Web Vitals. No meaningful INP value was collected; the interaction observer did not report an interaction above its threshold during that observation.

Images have 800/1600 px responsive AVIF variants and WebP fallback, reserved dimensions and lazy loading below the fold. Self-hosted fonts, capped graphics pixel ratios, optional viewer loading, offscreen pauses and disposal reduce unnecessary work. The largest full-size industry AVIF is roughly 476 kB; the original 1.34 MB WebP remains a fallback.

Reduced-motion handling is implemented throughout and Orbi's stable reduced-motion behaviour is covered by automated tests. A real OS reduced-motion switch, physical touch gestures, screen-reader session, cross-browser Safari/Firefox testing, network throttling and external Sketchfab outage were not exercised in this environment. No field performance or accessibility certification is claimed. Static/no-JS content and safe form behaviour were checked at generated-source level rather than by disabling browser JavaScript. Actual sending through a user's email application and live host redirects were not tested.

## Remaining launch dependencies

1. Establish publication rights for DJI/Flyability manufacturer artwork or replace it with Orbit-owned material. Existing photographs, models and sample outputs retain their source records and visible attributions. No accurate licensed M400 model was obtained; the implemented artwork fallback is complete.
2. Confirm retained contact details, specific payload inventory, editorial drafts and the optional-viewer privacy addendum. The live Orbit website timed out during this build's recheck, so preserved records and owner confirmations were used.
3. Preserve the existing live `/log-in` employee system in deployment routing; static hosting does not migrate its authentication.
4. A backend is needed only if Orbit wants direct form submission instead of the implemented email-brief flow. There are no hidden credentials or simulated send results.
5. Public deployment requires a separate instruction. Build with `ORBIT_PUBLIC_BUILD=1` only for an approved release. Current builds remain noindex and robots-disallowed; concept history remains noindex even in a public build.

Setup and editing instructions are in `README.md`; asset provenance is in `public/ASSET-SOURCES.md` and `/image-credits/`. The implementation plan is in `docs/full-site-build-plan.md`.
