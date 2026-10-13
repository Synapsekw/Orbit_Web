# Orbit Aerials website

A 14-page local website in the selected Atlas direction, with Orbit's actual logo, deep navy surfaces and gold accents. Dark mode is the default. The homepage has an interactive construction scan with smooth automatic rotation, three spatial representations and a comparison slider.

## Pages and editing

- Home: interactive spatial hero, company introduction, services, process, and Journal.
- Services: overview and five detail pages for progress documentation, spatial mapping, 360° walkthroughs, time-lapse, and handover media.
- About, Contact, Journal with three newly drafted field notes, and Privacy.
- Employee access links to the existing protected area on the live website. No replacement authentication is implemented.

`src/content.js` contains service and Journal copy. `scripts/build-atlas-pages.mjs` generates route-specific HTML shells and metadata. `design-concepts/round-5/site.js` provides the selected Atlas layouts, shared with the design previews. Its styles are in `site.css`, `dark.css` and `atlas-experiences.css`; `theme.js` manages the theme preference. `src/privacy-content.html` preserves the existing privacy policy. Both `npm run dev` and `npm run build` regenerate the HTML automatically. Vite builds all entries listed in `pages-manifest.json`, plus the round-five comparison and preview pages. Earlier page builders and styles are retained as design history.

Home and the spatial-mapping page include the interactive construction scan. Rotation pauses during interaction and resumes after five seconds; visitors can also pause it explicitly. Reduced motion disables automatic rotation. The 360° capability uses a real spherical construction panorama with drag, keyboard, zoom, reset and fullscreen controls. Services, About and Journal use full photographic chapters; articles have reading progress and section navigation. The home service index and service FAQs expand on demand. No motion is required to read or navigate the site.

The Contact form validates and prepares an email brief. The visitor reviews it and opens their email application to send it. It does not send a message, save personal information, or connect to a backend. Service-specific links preselect the requested service. A live web form would need a submission service.

The Journal articles are new editorial drafts for review, not migrated published articles. Company service information, contact details, and privacy text are based on orbitaerials.com as accessed on 12 October 2026. Photography reused from the current website is illustrative, not presented as an Orbit project portfolio. Asset provenance is documented in `public/ASSET-SOURCES.md`.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Drag the scene to orbit, scroll or use arrow keys to zoom, and select Photogrammetry, Point cloud, or DSM. The reveal slider compares the selected spatial representation with the photographed mesh using one camera.

```sh
npm test
npm run build
npm run preview
```

## Real scan

The 2.3 MB browser asset shows Austin FC Stadium under construction, including the stadium structures, surrounding site activity, roads, and staging areas. It is a real reconstruction from aerial video, reduced from about 600,000 triangles to 449,999 triangles. The available downloaded asset has a 1024-pixel photo atlas; scan distortions and softness become visible at close zoom. Its captured lighting is preserved. The point view samples the mesh surface; the DSM rasterizes its highest surfaces, excluding areas without coverage. These derived views are demonstration assets, not survey deliverables. Display coordinates are normalized for the hero, not georeferenced.

Source: **Stadium under construction | Drone 3D Scan — Sircher, 2020. CC BY 4.0.**

- https://sketchfab.com/3d-models/9f5edb6287284b9885fc833982d11962
- Distributed through https://huggingface.co/datasets/allenai/objaverse
- License and source documentation: `public/models/`

The page includes attribution and identifies the scan as a sample project, not Orbit's work. Changes include mesh simplification, texture compression, presentation transforms, and derived spatial views. Source metadata and the license are included in `public/models/`.

To recreate the optimized asset, download `glbs/000-105/9f5edb6287284b9885fc833982d11962.glb` from the Objaverse dataset into `assets-source/stadium-site.glb`, then run `npm run prepare:scan`. The original is kept outside the served public directory and ignored by Git.

## Scope

The current design exploration is **Round 6**, a fresh positioning of Orbit as a drone services company across oil and gas, construction, power, security, and the environment. Start at `/design-concepts/round-6/`. Flightpath, Vector, and Horizon are full-page dark concepts with independent layouts and interactions. The earlier Atlas pages remain as a reference while a new direction is selected.

Round 6 uses the owner's confirmed DJI M350/M400 fleet and presents Flyability Elios 3 capabilities with optional-payload qualifications. M400 hero motion uses a manufacturer product image with CSS perspective and scroll choreography; the dedicated M350 and Elios viewers use genuine Sketchfab models. Equipment references, image rights, and model credits are documented in `design-concepts/round-6/sources.html`. Orbi is reused through `round-6/orbi-integration.js`, with local prepared guidance for the broader services and links into the concept page. No backend is connected.

The pages, responsive navigation, FAQs, enquiry preparation, spatial controls and construction panorama work locally. This website has not been deployed to the live Orbit domain. The included construction samples can be replaced without changing the interaction design.

## Construction panorama

`src/panorama.js` renders **Interior Construction** by Sergej Majboroda / Poly Haven, released under CC0. The source is https://polyhaven.com/a/interior_construction. The complete panorama is served locally as `public/images/construction-360.webp` (4096 × 2048); its static preview is a rectilinear view of the same photograph. Sources and transformations are recorded in `public/ASSET-SOURCES.md` and visible at `/image-credits.html`. The panorama is demonstration material, not an Orbit commission.

## Orbi

The completed Halo Companion package is mounted on every Atlas page through `design-concepts/round-5/atlas-orbi.js`. It imports the source widget so the website and Orbi share the Three.js dependency. The Atlas preview translates service links into preview routes and raises the launcher above its comparison toolbar. Normal pages use canonical routes. The 3D avatar has a transparent image fallback, motion controls, and reduced-motion support.

Atlas's `orbi-launcher.css` keeps the corner launcher to the character alone, with a small gold glow underneath. The accessible button label and the click-to-open guide remain available. The homepage customer section uses official artwork for Sinohydro, UGCC, Bay Zero and Future Kid, supplied as customer names by the owner. Run `node scripts/prepare-customer-logos.mjs` to reproduce the prepared assets from the retained originals.

Orbi currently provides a labelled local service guide. Messages stay in page memory, and no AI endpoint or enquiry submission is connected. The Contact page remains responsible for preparing an email. Package API, provenance and standalone build instructions are in `public/orbi/README.md`; source belongs to `src/orbi/`. Run `node scripts/build-orbi.mjs` when updating the optional standalone package. The main Vite build compiles the integrated widget directly from source.
