# Architectural Atlas: three full website studies

The architectural atlas direction from round 4 is developed into three working, responsive websites. All studies now default to Orbit's deep navy and gold palette, with the original Orbit logo, shared company copy and local image assets.

- Atlas: strong staggered typography, open spatial plates, gold index details and ruled service chapters.
- Gallery: lighter typography, quieter pacing, inset image studies and a curated editorial composition.
- Fieldwork: a persistent contents rail, precise gold annotations and a field-guide structure.

Appearance: deep navy `#07182b`, elevated navy `#0d2239`, UI gold `#d6b56d` and soft white `#f3f4f5`. Gallery uses a slightly lighter navy base. The flat gold is drawn from the existing symbol's bronze-to-light-gold range (`#b98947`–`#faf0a1`); no formal brand specification was supplied. Light mode is optional, retaining navy ink and gold details. Appearance is saved and propagated across pages and variants. The comparison gallery switches its full-page screenshots with the selected mode.

Each variation includes Home, Services, all five service details, About, Journal, all three articles, Contact and Privacy. Select another study using the review bar; the current page is retained. The full-page index provides direct links to each study.

The 3D viewer uses the existing licensed stadium demonstration scan, with photogrammetry, point cloud, DSM, comparison slider, orbit and reset. It is not presented as commissioned Orbit work. Capability photography is sourced from Unsplash and Pexels, with distinct images for progress, interior walkthroughs, time-lapse and completed architecture. The mapping still is a derivative rendering of the licensed scan. See `/image-credits.html`, `public/ASSET-SOURCES.md` and `public/models/SOURCE.md` for attribution and licenses.

Contact prepares a brief for the visitor to review and send through their own email application; it does not submit to a backend. Journal articles remain draft copy for the owner's review.

Implementation: isolated Vite entry points in this directory, shared content imported from src/content.js, and the existing viewer imported on demand. Local preview is served on port 5173; production preview entries are included in the Vite build.
