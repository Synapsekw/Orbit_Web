# Orbit Aerials complete website build

## Content audit and direction — 13 October 2026

The owner supplied the complete build brief in this chat. Implementation follows its proposed aircraft-led Flightpath direction, with editorial industrial photography and useful service detail. This is a new consolidated website, not a claim that a previous concept was selected. Dark navy #071421, secondary #0C1D2D, white #F1F3F5, muted #A7B4BF and gold #D6B56D; original logo, Manrope and DM Sans.

The live site timed out on this review. Preserved company content, privacy policy, social destinations and contact details are available locally. The five service and three article routes are retained. Existing journal copy remains editorial drafts for owner review. No case studies, staff profiles or performance statistics are invented.

Owner-confirmed fleet: DJI M350, DJI M400, and (confirmed in this turn) owned and operated Flyability Elios 3. Ownership does not establish individual payload availability. Industries: oil and gas, construction, power, security and environment. Customer names: Sinohydro, UGCC, Bay Zero and Future Kid. Keep their transparent white artwork without inferred endorsements.

## Reference direction added during implementation

Reviewed the actual rendered pages and content at https://www.velmax.llc/, https://www.cognichip.ai/, https://drone.riotters.com/ and https://www.cerbair.com/. The duplicated Velmax URL was normalized. Relevant cues: substantial aircraft scale and open composition (Riotters), large typography with fine details (Velmax), depth around a central visual (Cognichip), and industrial scene context (CERBAIR). Preserve Orbit's own palette and truthful operating scope; do not reproduce the references' product claims, proprietary models or visual identity. The implementation uses a large aircraft chapter, controllable perspective, distinct industrial chapters and restrained transitions.

## Page map

- `/`: aircraft selector, industry selector, service index, demonstration outputs, Elios feature, process, customers, journal and enquiry CTA.
- `/industries/`: five substantial anchored industry chapters, each describing need, capture, outputs and discussion scope.
- `/services/`: overview, inspection and confined-space chapters, five existing service links.
- `/services/{progress-documentation,spatial-mapping,360-walkthroughs,time-lapse,handover-media}/`: use case, visual, deliverables, process, FAQs, enquiry context.
- `/fleet/`: M400, M350 and Elios chapters, accurate product presentations, available genuine 3D viewers and payload qualification.
- `/about/`, `/journal/`, three existing article routes, `/contact/`, `/privacy/`, `/image-credits/`.
- Preserve `/image-credits.html` with redirect to the new credits page and `/policy` to `/privacy/`; preserve existing protected employee destination as an external link.

## Asset inventory

- Original Orbit wordmark and symbol in `public/brand/`; four existing customer marks.
- Finished Orbi source in `src/orbi/` and fallback artwork in `public/orbi/`.
- Manufacturer M400/M350 cutouts and Elios imagery in `public/concepts/round-6/`; publication rights are unresolved, local evaluation only until approved.
- Licensed construction, architecture and time-lapse stills in `public/images/`; refinery/environment and industry illustration assets from Round 6. No stock image is labelled a Kuwait facility or Orbit commission.
- Sircher stadium scan (CC BY 4.0), surface-derived demonstrations, poster and source records in `public/models/`.
- True spherical Interior Construction panorama by Sergej Majboroda / Poly Haven (CC0), with matching poster.
- Authorized embedded M350 reference (johnnokomis, CC BY 4.0; pictured L2 does not establish Orbit payload ownership) and official Flyability Elios model. No accurate licensed M400 geometry is available locally; use labelled perspective artwork, never substitute M350 geometry.

## Architecture and implementation plan

Vite, JavaScript, CSS and Three.js remain. New shared modules in `src/site/` render meaningful static HTML at build time and progressively enhance controls. Keep old design concepts as noindex history. Generate route metadata, canonicals, social images, sitemap and host redirect configuration. The local build remains noindex until explicit release configuration and deployment authorization.

1. [x] Shared content, page renderer, navigation/footer, tokens and static route generator. Useful URLs and privacy source preserved.
2. [x] Responsive media and provenance record. Accurate aircraft selector, perspective/scale controls, pause/reset and reduced-motion handling.
3. [x] Complete industries, services, fleet, about, journal, privacy and credits with meaningful static HTML.
4. [x] Single optional large viewer in a native dialog, with loading/failure states, keyboard controls, attribution and explicit aircraft-embed connection.
5. [x] Enquiry context, validation, review, copy and mailto. Updated local Orbi guidance and phone control clearance.
6. [x] Automated checks, production build and browser review completed. Actual test conditions, performance observations and untested device/OS scenarios are recorded in `completion-report.md`.

## Review focus

Unknown query parameters must not inject markup or preselect nonexistent services. Whitespace-only fields must fail validation. Long email briefs must remain copyable. Model errors must leave readable content and restore focus on dismissal. Mobile interaction must retain native page scrolling and prevent Orbi covering enquiry controls.

## Launch dependencies (separate from implementation)

- Establish publication rights for manufacturer media or replace with Orbit-owned photography.
- Confirm contact details, payload configurations and editorial copy before public release.
- Review the privacy addendum for optional Sketchfab viewing; existing policy meaning stays intact. No analytics or submission backend added.
- Public deployment requires a separate explicit publishing instruction. No external accounts, credentials or hosting changes are part of this task.
- Deployment routing must retain the existing protected `/log-in` system on the live domain; the static build only preserves its destination link and does not migrate that system.
