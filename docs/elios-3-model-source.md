# Elios 3 official model — 13 October 2026

## Source and limitation

Flyability's product page embeds its own **Elios 3: A versatile indoor inspection drone** model:

- Manufacturer: https://www.flyability.com/elios-3
- Official model: https://sketchfab.com/3d-models/309440e0ee9041b7b264a24898f0f8d6
- Public metadata: https://api.sketchfab.com/v3/models/309440e0ee9041b7b264a24898f0f8d6
- Official documentation checked: https://knowledge.flyability.com/aircraft/elios-3/elios-3-documentation

The public metadata identifies Flyability as the uploader, reports 1,698,539 faces, `isDownloadable: false`, and no download licence. No public aircraft STEP/CAD download was found in the manufacturer product/documentation pages or focused searches. Documentation about CAD/BIM **outputs captured with** Elios 3 is not an aircraft model.

## Implementation

The homepage's Elios selector loads the wireframe automatically when selected. Additional inline presentations load when their sections enter the viewport: the homepage feature, Services and Fleet. Each uses a different starting perspective. The privacy addendum describes these automatic Sketchfab connections. The official geometry stays within its embed. Nothing was extracted from the viewer or republished as a local GLB.

The documented Viewer API sets navy materials and a translucent gold triangle wireframe. It provides rotate, zoom and reset controls, a slow idle orbit and subtle hero scroll motion. Focusing the embedded model suspends the idle orbit for native manual inspection. Pause/reduced-motion removes automatic movement. The viewer stops when hidden, offscreen or underneath a spatial/panorama modal. A failed load retains product artwork and a retry button. Separate aircraft dialogs and initial load buttons have been removed; Explore links point to the manufacturers. Implementation: `src/site/embedded-elios.js` and `src/site/inline-aircraft.js`.

This is an **official visualization mesh**, not a downloaded CAD assembly. It is considerably denser than the optimized local M400 model and retains Sketchfab's availability requirements.

The manufacturer annotation/payload tour is removed from each embedded session with the documented `removeAllAnnotations` API. The unrestricted `ui_stop: 0` setting removes the external stop control; Orbit retains its own pause control. The provider's `ui_controls: 0` setting was tested but ignored for this model, so it is not shipped.

At the owner's request, each Elios iframe now extends 80 px above and below a clipped viewport, moving the peripheral hover toolbar outside the visible presentation. Camera distance compensates for the additional iframe height and updates on resize, retaining the full cage at the default framing. The interactive center has no pointer-blocking overlay. The caption explicitly credits Flyability and Sketchfab with links outside the crop. Keyboard users have Orbit's rotate/zoom/reset/pause controls; the iframe is excluded from sequential tab navigation so focus does not enter its offscreen toolbar. This is presentation cropping, not removal of the provider's UI: native shortcuts or future provider-layout changes can still expose UI. The geometry remains in the official embed.

API references:

- https://sketchfab.com/developers/viewer/functions (setWireframe, setMaterial, getCameraLookAt, setCameraLookAt, start/stop)
- https://sketchfab.com/developers/viewer/initialization (wireframe_preload, dnt, account limitations)

## Path to a fully local model

Request from Flyability, through Orbit's existing customer relationship, an external-envelope STEP file or a reduced-detail GLB/FBX/OBJ, with permission to host and adapt it on Orbit's commercial website. That would allow local optimization and CAD-edge rendering equivalent to the M400 without an external viewer. No message has been sent and no third-party model purchased.

## Earlier opt-in implementation validation (superseded flow)

- Production build completed; all 25 tests pass. Two camera-math regressions cover rotation around an off-origin target and zoom without mutating the source camera.
- Browser checks: explicit opt-in before the external iframe exists; official wireframe renders; rotate/zoom controls; pause state; M400/Elios switching; mobile hero spacing and no horizontal overflow; larger viewer; no console errors observed in the tested flows.
- Phone hero screenshot: `docs/elios-wireframe-mobile.png`. Desktop proof: `docs/elios-wireframe-home.png`.
- Native Sketchfab drag behavior remains available. The automation tool could not dispatch a drag into the fractional-position iframe, so this gesture was not independently automated. Physical-device performance and OS-level reduced-motion switching were not tested.

The embedded camera starts with `camera: 0` and `animation_autoplay: 0`, so initial framing is captured after the default view is established rather than part-way through Sketchfab’s opening animation. Every inline frame has a unique API ID.

## Cropped presentation validation — 13 October 2026

- Production build and all 33 automated tests pass.
- Hover/focus screenshots verified the peripheral toolbar outside the visible crop on the homepage, Fleet and Services. The full cage remains visible at the default framing, with external attribution links below it.
- A 390 × 844 fresh load and a desktop-to-phone resize preserve the cage framing; no horizontal document overflow was observed. Orbit's turn/reset/pause controls were exercised. No console errors were observed in the Fleet check.
- Native dragging remains unobstructed in the implementation, but the browser automation rejects drags into fractionally positioned cross-origin iframes, so that gesture was not independently automated.
- Screenshots: `docs/elios-cropped-home.png` and `docs/elios-cropped-mobile.png`.
