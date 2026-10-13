# Orbit website asset provenance

Accessed 12 October 2026 for a redesign of the same company website.

## Original brand assets

- `brand/orbit-aerials-white.png`: original white Orbit Aerials logo and tagline, unchanged, from https://assets.zyrosite.com/AR039Ky525sBaLrx/nobgwhite-1-Aq2JnVbkLgHRR1gx.png — displayed on https://www.orbitaerials.com/.
- `brand/orbit-symbol.svg`: original symbol from Orbit's existing website widget, https://synapsekw.github.io/orbit_widget/symbol.svg. Used as the favicon, a decorative mark, and the source geometry for the About-page interactive sculpture. Sculpture modifications: extruded paths, bevels, silver material, point sampling, and edge rendering; the source SVG is unchanged.

## Existing website photography

These are illustrative stock images already used by Orbit's existing website, not claims of commissioned Orbit project work or portraits of its employees. They were copied to local assets for reliable preview rendering.

- `images/construction-aerial.jpg`: poster of Pexels video 5715632, used on Orbit's Journal page. https://images.pexels.com/videos/5715632/4k-video-construction-drone-excavator-5715632.jpeg
- `images/site-overview.jpg`: poster of Pexels video 2818546, used on Orbit's homepage. https://images.pexels.com/videos/2818546/free-video-2818546.jpg
- `images/site-detail.jpg`: poster of Pexels video 2073130, used on Orbit's homepage. https://images.pexels.com/videos/2073130/free-video-2073130.jpg
- `images/drone-operator.jpg`: existing About-page photograph. https://images.unsplash.com/photo-1547044283-81919b74c110
- `images/camera-detail.jpg`: existing About-page photograph; retained source asset, not currently displayed. https://images.unsplash.com/photo-1533746228171-962520811097

## Capability imagery selected for the Atlas studies

Checked 12 October 2026. These images illustrate capabilities and are not Orbit project case studies. Original downloaded candidates are retained in `assets-source/capability-candidates/`. `scripts/prepare-capability-images.mjs` produces the resized/compressed WebP assets; layouts crop them with object-fit. Source photos retain their natural colour. Visible credits are available at `/image-credits.html` from the site footer.

| Local asset | Creator / source | License |
| --- | --- | --- |
| `images/progress-aerial.webp` | Ivan Bandura, [aerial concrete construction photograph](https://unsplash.com/photos/aerial-photography-of-white-high-rise-concrete-building-Wv2U24G2F78) | [Unsplash License](https://unsplash.com/license) |
| `images/walkthrough-interior.webp` | Average GUY, [Wire on Ground with Columns Behind](https://www.pexels.com/photo/wire-on-ground-with-columns-behind-18672134/) | [Pexels License](https://www.pexels.com/license/) |
| `images/construction-timelapse.webp` | Site Engine, [Time Lapse Video of a Construction Site](https://www.pexels.com/video/time-lapse-video-of-a-construction-site-5674342/) — poster frame, displayed as a still | [Pexels License](https://www.pexels.com/license/) |
| `images/handover-architecture.webp` | Gustavo Galeano Maz, [Exterior of a Modern Villa](https://www.pexels.com/photo/exterior-of-a-modern-villa-13752348/) | [Pexels License](https://www.pexels.com/license/) |
| `images/architectural-detail.webp` | Luca Arfini, [Modern Apartment Building in Amsterdam at Dusk](https://www.pexels.com/photo/modern-apartment-building-in-amsterdam-at-dusk-33331096/) | [Pexels License](https://www.pexels.com/license/) |
| `images/spatial-model-preview.webp` | Static rendering of [Stadium under construction \| Drone 3D Scan by Sircher](https://sketchfab.com/3d-models/stadium-under-construction-drone-3d-scan-9f5edb6287284b9885fc833982d11962), with a derived surface view | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

The stock licenses permit free commercial website use, subject to their stated restrictions. Attribution is optional for the stock photography but is provided. CC BY attribution is mandatory for the model and derivative image and is included in the viewer and credits page. The walkthrough image is an ordinary interior still, not an actual 360° output. The derived surface view is illustrative rather than a validated survey deliverable.

## Interactive construction panorama

- `images/construction-360.webp`: **Interior Construction**, photographed by **Sergej Majboroda**, published by **Poly Haven**. [Source](https://polyhaven.com/a/interior_construction), [asset license](https://polyhaven.com/license), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- Download: `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/interior_construction.jpg` — original 8192 × 4096 tone-mapped JPEG, retained in `assets-source/capability-candidates/interior-construction-360.jpg`.
- Served locally as a 4096 × 2048 WebP (quality 88), with a true spherical panorama viewer. `images/construction-360-preview.webp` is a rectilinear screenshot from that viewer, compressed at quality 85.
- Verified 12 October 2026. CC0 permits commercial use without attribution; credit is nevertheless shown. A demonstration panorama, not an Orbit project. This replaces the ordinary interior photograph in the selected Atlas design.

## Company copy

Company copy was rewritten using the existing Home, Services, and About pages. The customer names below were supplied by the owner. No project case studies, invented staff identities, or testimonials were added. Contact address, office hours, phone, email, Instagram, and LinkedIn links came from the existing site. The privacy policy is carried over from https://www.orbitaerials.com/policy without changing its meaning. Journal field notes are new drafts for the owner's review.

## Customer logos

All four customer marks are displayed in white via CSS and SVG filters, preserving their transparent backgrounds and the original source files. Luminance masks retain the UGCC lettering and Future Kid emblem linework as white details and transparent cutouts.

Added at the owner's request on 12 October 2026. These are customer trademarks, not stock images or assets licensed for general reuse. Original source files are retained in `assets-source/customer-logos/`. The logos are served locally; `scripts/prepare-customer-logos.mjs` performs the lossless WebP preparation and copies the SVGs.

| Customer | Official artwork source | Website treatment |
| --- | --- | --- |
| Sinohydro | [Sinohydro Ecuador](https://sinohydroecuador.com/), [original logo](https://sinohydroecuador.com/wp-content/uploads/2023/03/01_LOGO_WEB@0.5x.png) | Regional Spanish tagline omitted; original symbol and wordmark retained, padding trimmed, resized. Displayed in white via CSS on navy. The main Sinohydro website was unavailable during retrieval. |
| UGCC — United Gulf Construction Company | [UGCC](https://ugcc.com/), [original logo](https://ugcc.com/wp-content/uploads/2020/09/UGCC-Logo-V2-PS-2.png) | Original crest and acronym cropped from the full horizontal lockup, omitting the long bilingual company descriptor. Colours preserved. |
| Bay Zero | [Bay Zero](https://bayzero.com.kw/), [original logo](https://bayzero.com.kw/Content/BZTemplateLTR/images/logoEn.png) | Transparent padding trimmed, resized; original turquoise preserved. |
| Future Kid | [Future Kid](https://www.futurekid.com.kw/), [official white SVG](https://www.futurekid.com.kw/assets/images/logo/logo-brand-white.svg) | Original white wordmark and colour mascot SVG, unchanged. |

## Spatial model

The stadium is a licensed demonstration scan, not an Orbit project. See `models/SOURCE.md` and `models/LICENSE.txt` for source, attribution, and modifications.

## Complete website build — 13 October 2026

The current website is generated by `src/site/`. Earlier Atlas/interactive-sculpture references above describe earlier studies; the current About page uses the original symbol as a static brand composition. The finished Orbi model and prepared guide are reused from `src/orbi/`, with original fallback artwork from `public/orbi/`. No new generated imagery was used in this build.

`scripts/prepare-site-media.mjs` creates `public/media/` from the already recorded assets: full-width (up to 1600 px) and 800 px AVIF/WebP variants, preserving natural colours and alpha where relevant. Photographs use responsive AVIF with a WebP error fallback. Named aircraft use accurate product cutouts. `media/orbit-logo.png` resizes the original white artwork to 900 px wide without changing its proportions or wording. `media/social-preview.jpg` arranges that same logo and M400 artwork on the brand background; its manufacturer-image publication limitation also applies.

### Fleet and industry media inherited from Round 6

Full source links are retained in `design-concepts/round-6/sources.html` and reproduced in the current Image Credits page.

| Asset | Source / use | Publication basis |
| --- | --- | --- |
| `media/m400-cutout.webp` | Official DJI Matrice 400 artwork, `https://www-cdn.djiits.com/cms/uploads/3c9712c308bac3e36007c3a9ded88d9d.png` | Manufacturer-owned; local evaluation pending publication permission |
| `media/m350-cutout.webp` | Official DJI Matrice 350 RTK artwork, `https://www-cdn.djiits.com/cms/uploads/3f33b79fc054eaf64bd357bf287069f9.png` | Manufacturer-owned; local evaluation pending publication permission |
| `media/elios.*`, `media/elios-inspection.*` | Flyability product and inspection imagery; exact originals in Round 6 source record | Manufacturer-owned; local evaluation pending publication permission |
| `media/oil-gas.*` | Tom Fisk / Pexels refinery photograph 6767962 | Pexels License; illustrative industrial setting |
| `media/construction.*`, `media/progress-aerial.*` | Ivan Bandura construction photo, already recorded above | Unsplash License; illustrative construction site |
| `media/power.*`, `media/security.*` | Manufacturer illustration of applications, inherited from Round 6 | Manufacturer-owned; local evaluation pending publication permission; does not establish Orbit's payload configuration |
| `media/environment.*` | Unsplash landscape source recorded in Round 6 | Unsplash License; no Kuwait location or environmental sensing claim |
| Remaining `media/` capability images | Resized derivatives of recorded `images/` sources above | Original source licence continues to apply |

M350 genuine model: **DJI M350 with Zenmuse L2 Lidar Scanner**, johnnokomis, [Sketchfab](https://sketchfab.com/3d-models/6221a8447eb34495b6f9173c88e5991b), CC BY 4.0. Loaded using the authorised embed after the visitor chooses to connect. The pictured payload is a reference, not evidence of Orbit's sensor inventory.

Elios genuine model: official Flyability **Elios 3**, [Sketchfab](https://sketchfab.com/3d-models/309440e0ee9041b7b264a24898f0f8d6). Used through its available authorised embed, not downloaded or redistributed as geometry. No accurate licensed M400 geometry was obtained; the M400 presentation is explicitly perspective product artwork.

Owner confirmation during this build establishes that Orbit owns and operates Elios 3, alongside the previously confirmed M350 and M400. This does not establish optional payload ownership or manufacturer-image publication rights. No public deployment has occurred.

## M400 wireframe update — 13 October 2026

The owner subsequently requested a wireframe M400. The homepage now renders a genuine model converted from [DJI's official STEP assembly](https://enterprise.dji.com/matrice-400/downloads), with CAD structural edges and a simplified occluding surface. This supersedes the earlier statement that the M400 uses artwork alone. Artwork remains the loading/failure fallback. No paid model was purchased or used, and no aircraft geometry was invented. Source, conversion details, omitted CAD faces and the unresolved public redistribution basis are documented in [models/M400-SOURCE.md](models/M400-SOURCE.md). This remains a local evaluation build.

The later flight-animation update separates the four original propeller assemblies from that same CAD. The body gently turns and hovers while adjacent propellers counter-rotate at a deliberately slowed illustrative speed. The split preserves the source geometry and CAD linework; it introduces no replacement aircraft parts. The active asset is `models/m400-flight.glb`, with five matching line-data files and `m400-flight.json` metadata.

## Inline fleet update — 13 October 2026

The M350 now uses [DJI's official M350 STEP model](https://enterprise.dji.com/matrice-350-rtk/downloads), downloaded from `https://dl.djicdn.com/downloads/matrice_350_rtk/Matrice_350_RTK_3D_Model.stp`. This replaces the third-party M350/L2 Sketchfab scan in the current site. Conversion, skipped surfaces, byte sizes and local-evaluation rights status are in [models/M350-SOURCE.md](models/M350-SOURCE.md).

The M350's original propellers are now separate animated CAD assemblies. The active model is `models/m350-flight.glb`, with five matching CAD-edge files referenced by `m350-cad.json`. All source surface geometry and retained lines were preserved during separation. Adjacent propellers counter-rotate at the same illustrative speed as the M400; no replacement blade geometry was introduced.

All three aircraft are embedded in the homepage selector and Fleet page. Elios product presentations in the homepage feature and Services are also inline wireframes, with different starting camera angles. The official Elios model automatically connects to Sketchfab on selection or section visibility. The privacy addendum reflects this change from the earlier opt-in flow. The geometry has not been downloaded or extracted. At the owner's request, the embedded viewer's top and bottom edges are cropped to keep its peripheral hover controls outside the presentation; visible caption links credit Flyability and Sketchfab. Separate aircraft viewer dialogs have been removed. Explore links point to DJI and Flyability.
# Elios 3 wireframe update — 13 October 2026

Official Flyability model: https://sketchfab.com/3d-models/309440e0ee9041b7b264a24898f0f8d6, linked from https://www.flyability.com/elios-3. Displayed through the official Sketchfab embed with navy materials and gold wireframe using its documented Viewer API. Public metadata reports downloads disabled; no Elios geometry was extracted or locally redistributed. An official downloadable aircraft CAD file was not found. This visualization mesh is not labelled as CAD. The optional viewer loads only after a visitor chooses to connect.


## Blog revision — 13 October 2026

The two recovered original posts were rewritten at the owner’s request. Each displays a credited hero and two inline images drawn from the already licensed assets above: Ivan Bandura / Unsplash construction photograph, Site Engine / Pexels time-lapse poster, Sergej Majboroda / Poly Haven CC0 panorama preview, and Sircher’s CC BY 4.0 stadium scan derivative. Captions identify illustrative/demo content. No image is represented as an Orbit commission or a Kuwait site. Orbi’s prepared guide is now replaced in the current site by a configured-server adapter; live activation is still pending.
