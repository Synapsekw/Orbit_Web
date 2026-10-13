# Mobile polish and Kuwait search implementation plan

**Goal:** Remove emoji arrows and the photo-to-model flash, then strengthen the site's useful Kuwait search coverage without changing the approved visual direction.

**Architecture:** Keep the generated static HTML/Vite/Netlify setup. Use a shared SVG icon helper and explicit per-aircraft loading state. Extend existing service and Markdown article data, with centralized metadata and structured-data generation.

**Constraints:** Manual owner merge; no production deploy or DNS changes. No credentials in Git. Preserve original article URLs. Do not invent ratings, licences, project results, payload ownership or rankings. Keep dark navy/gold, keyboard controls and reduced motion.

## Work

- [x] Replace visible arrow characters in site templates, dynamic controls and Orbi with currentColor SVGs; verify the rendered pages contain no emoji-capable arrow text.
- [x] Keep hero photography hidden while loading, render the actual model before revealing it, and use a quiet reserved-space loading state. Start the selected hero immediately; lazy-load below-fold models. Verify switching while loading and graceful failure.
- [x] Add substantive visual inspection and confined-space service pages, clear Kuwait descriptions and contextual service/article links.
- [x] Audit metadata, canonical URLs, social previews, business/service/article/breadcrumb schema, sitemap, robots and true missing-page behavior. Protect preview indexing.
- [x] Improve the existing two articles and add two distinct sourced Kuwait guides, preserving original routes and truthful media captions.
- [x] Make closed Orbi visibly playful with a leap, full turn, rebound and hover; preserve a fixed click target, pause while targeted or open, and respect device/page motion settings.
- [x] Run appropriate regression tests, production/preview build checks, credential scans, desktop/mobile browser checks, and independent final review.
- Release through a PR with CI; leave merge to the owner.

## Ownership and review focus

Parent: icons, model loading, rendering, service content and integration. Technical SEO agent: build metadata, routes, SEO invariants and launch checklist. Editorial agent: Markdown articles and sources. Shared generated output is rebuilt only after integration.

Review slow/failed model loading, switching before a model resolves, reduced motion, source-vs-production indexing, schema-to-visible-content agreement, old inbound article paths and new blog/service links.

## Verification record

- Production and preview Vite builds passed; production output contains 20 canonical sitemap URLs and preview output carries noindex headers.
- Full test suite: 80 passing, covering motion lifecycle, loading-state races, SEO deployment contexts, internal links, journal content and existing Orbi backend behavior.
- Browser checks: desktop and 390px layouts; vector arrow rendering; delayed model download and failed download; M350 selection; Elios inline viewer; new article/service layout; Orbi opens reliably and obeys page motion pause. Physical iPhone Chrome remains an owner device check.
- Public-output credential scan passed against configured local credentials. Nothing was sent to OpenAI or Grok during these regression checks.
- Independent source review found no confirmed material issues. Search Console, Business Profile and post-merge live-domain checks remain owner launch tasks in `docs/seo-launch.md`.
