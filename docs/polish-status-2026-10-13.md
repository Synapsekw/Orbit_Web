# Orbit polish — 13 October 2026

## Blog

Recovered two posts from the indexed original site, then substantially rewrote both at the owner's request. Original root URLs are retained. The articles now have distinct purposes: construction-service planning and survey deliverables/accuracy. Removed unsupported market projections, savings percentages, the incorrect 60-fold comparison and overbroad safety claims. Added practical brief guidance, FAQs, comparison tables and three relevant images per article with captions/credits. Images are licensed stock or an attributed demonstration, not claimed Orbit projects or Kuwait locations.

Search metadata includes distinct titles/descriptions, canonical URLs, article-specific social images, BlogPosting and breadcrumb structured data, author/About links, a genuine revision date and sitemap lastmod. The first original date is ambiguous; only the known year is displayed, without inventing a precise publication date. The second source date, 3/3/2023, is unambiguous. Default local and preview builds remain noindex; Netlify production enables indexing.

The old site returned a certificate-date error. Two posts were recovered from the search index, but the full original inventory and original media/reference links could not be verified. Source snapshots are retained privately in `assets-source/blog-migration/`. The three prototype field notes remain unpublished drafts. There is no online editor, CMS or admin interface: the AI agent updates repository content and the owner reviews the website before release.

## Orbi

Adapted the newer Aria Netlify architecture into separate Orbit functions, database tables, cookie and encryption namespace. Added server-owned conversation history, bounded provider calls, strict JSON response validation, route/source allowlists, rate limits, encrypted session/receipt storage and hourly cleanup. The widget now connects/reconnects, restores conversations across page navigation, resets on the server, handles Arabic text, links technical sources and supports visitor-edited/reviewed contact requests.

The owner's existing Grok routine credentials were copied privately into ignored `.env.local`, with a newly generated Orbit session secret. The owner subsequently supplied an OpenAI key through a private loopback form. Local OpenAI chat and reviewed Grok handoffs are now enabled. Real English/Arabic answers and a contextual follow-up passed. One explicitly authorised test enquiry was accepted by Grok (reference `2878c016c1f4`), and the owner confirmed receiving the notification. No public deployment has been performed.

Mock UI checks exercised opening, a first answer, Arabic text, contact editing/review/explicit consent/receipt and reload recovery. The later real handoff was also completed through the widget, and its receipt survived a reload. The owner-confirmed notification establishes live delivery separately from the mocked tests. `NETLIFY-SETUP.md` describes production activation; `orbi-activation-check.md` records the local verification.

## Validation

The build and website/backend tests are run after the final edits. Backend tests use isolated PostgreSQL-compatible PGlite and mocked providers. They cover CSRF/origin rejection, malformed responses, expiry, usage limits, concurrency, encrypted storage, changed-body replay rejection, confirmed-only contact events and ambiguous delivery without automatic resend. Blog checks cover draft exclusion, original URLs, safe Markdown, images, local links, matching structured metadata and obsolete claims. Public build scanning checks private configuration and configured credential exclusion. Dependency audit reports no known vulnerabilities after removing an unnecessary packaging dependency.

Remaining deployment inputs: exact GitHub repository/Netlify site and production configuration. Hosting cutover must also preserve the existing employee backend and Hostinger email records. Sample local OpenAI replies took approximately 3–5 seconds; this is not a production performance guarantee. SEO rankings have not been measured.
