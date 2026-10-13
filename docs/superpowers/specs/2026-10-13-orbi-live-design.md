# Orbit polish: live Orbi and maintainable blog

Status: implemented locally using the owner’s confirmed choices; no live connection activated. Prepared 13 October 2026. Later owner instructions specify a read-only blog, maintained by the AI agent, and authorise rewriting both articles for quality and SEO. See `docs/polish-status-2026-10-13.md` for the actual result.

## Intended result

Keep the existing Orbi character and navy/gold website. Replace the prepared-response service guide with a useful conversational assistant: explain Orbit's services and technical drone workflows, help a visitor scope a project, and deliver visitor-confirmed enquiries to the owner's Grok Bot. The owner explicitly selected **OpenAI answers; Grok handles enquiries and handoff**.

Use GPT-6 Luna (`gpt-6-luna`), matching the inspected Aria configuration. This is a supported OpenAI API model, not a model name inferred from the Codex UI. English and Arabic conversations should follow the visitor's language. The owner also requested migration of the current Orbit blog and an ongoing editorial workflow. Text chat, contact handoff, blog migration and Netlify/GitHub deployment preparation are in scope; voice, autonomous aircraft control, bookings and quotes are not. Domain registration and email stay at Hostinger; website releases will run through GitHub to Netlify. No DNS or public release has been performed in this work.

## What exists

- Orbit's `src/site/orbi.js` supplies canned replies to `src/orbi/orbi-widget.js`. Its adapter already accepts a message, history, abort signal and stable retry ID. There is no Orbit backend.
- The primary Synapse checkout contains an older PHP implementation. The newer worktree, `C:/Users/D/.codex/worktrees/aria-netlify/Synapse Solutions Web`, contains the relevant **Node Netlify Functions + managed PostgreSQL** implementation, with encrypted sessions, transactional usage/receipt state and the same visitor-confirmed Grok flow. Reference `netlify/lib/`, `netlify/functions/`, `netlify/database/migrations/`, `site/assets/aria-contact.js` and `NETLIFY-SETUP.md`. Synapse remains unchanged.
- Aria's documented local integration has been tested with real OpenAI conversations and a Grok Bot acknowledgement. That is evidence for reusing its architecture; it does not prove an Orbit connection is working.
- Neither Synapse's private credentials nor visitor records were read or copied for this design.

## Architecture decision

Use the owner's selected **GitHub → Netlify** hosting workflow and adapt Aria's newer Node backend. Publish the Vite build from `dist/`; serve `/api/orbi` with a Netlify Function. Use a separate Orbit database with the existing transactional session/usage/contact-receipt design, encrypted payloads and scheduled cleanup. Keep secrets in private local environment configuration for development and Netlify production runtime variables for hosting. Do not share Synapse's database or session secret.

This follows the actual Aria Netlify architecture. A standalone Node server would add a different hosting requirement; the legacy PHP version would require a separate backend host. Neither is needed. Development should exercise the same Node handler with a local isolated database; keep the preview on port 4174. Production and preview contexts must be distinct, so deploy previews cannot send real bot events or use production session secrets.

Prepare `netlify.toml`, function/database migrations, public-artifact checks and GitHub checks. Repository creation/connection and the final production cutover need the exact repository/site targets. Use reviewed changes and deploy previews before production. Keep Hostinger MX/TXT/email records intact during a later website DNS change. Preserve `/log-in` with an explicit legacy-host route before changing the website domain; linking it to the same future domain without a backend route would break the current employee system.

## Visitor experience

Opening Orbi checks backend status and restores the active conversation from the private session. The welcome screen offers practical starts such as choosing a survey output, inspecting a tank or planning construction capture. The character's existing listening/thinking/happy/error expressions accompany the actual request state. The website's motion preferences remain effective.

Replies should answer the question first, use short paragraphs, and ask one useful follow-up when needed. Technical depth should increase when requested. Relevant service links come from a server-controlled route list. For technical answers, source links are selected by known source IDs from the knowledge registry, not arbitrary model-generated URLs. Render model text safely; never inject model HTML.

The widget supports new conversation, reconnect, retry without duplicate messages, and navigation between Orbit pages without losing an active server session. A clear AI-processing disclosure replaces the current claim that messages stay in the page. If unavailable, show an honest unavailable state and direct contact links; prepared guidance may remain only if clearly labelled as such.

## OpenAI connection

The Node function calls OpenAI with a private project API key. Start with Aria's known working Chat Completions request shape, `gpt-6-luna`, `reasoning_effort: none` and strict structured output. No model tools or external actions are needed to answer from the curated knowledge pack. The transport can be changed later without changing the visitor interface.

Each request contains server-owned instructions, the approved Orbit knowledge, relevant technical chapters and server-held conversation history. The browser cannot submit system instructions or authoritative assistant history. Bound request/output length, context and timeouts. Return structured fields for reply, approved topic/source IDs and an optional contact draft. Keep analysis/internal prompts private.

Private configuration stays outside `public/` and `dist/`, with ignore rules and packaging exclusions. No API key, bot secret, private endpoint token or transcript enters a browser bundle. Credentials can be entered into private local configuration and then installed in private hosting configuration; they do not need to be pasted into chat.

## Knowledge and technical credibility

Use three explicit evidence categories:

1. **Owner-confirmed Orbit facts:** fleet ownership/operation, company scope, services and supplied customer names. Existing website data remains the source for contact details and routes.
2. **Manufacturer/technical references:** surveying methods, capture outputs, aircraft capabilities, inspection constraints and payload-dependent workflows. Each chapter has source IDs and a last-review date. General manufacturer capability does not establish Orbit ownership of an optional payload.
3. **Project-specific facts:** only what this visitor supplied or the team later confirms. Site permissions, operational feasibility, acceptance accuracy, optional sensors, certifications, prices and schedules cannot be invented.

The initial knowledge review is in `docs/orbi-knowledge-review.md`. Build the business knowledge from shared website data to avoid contradictory service descriptions. Keep authored technical chapters separate and easy to maintain. The initial pack is small enough to supply without introducing a vector database. If the library later grows into manuals and project documents, add retrieval with access controls rather than silently loading private client material.

For technical questions, Orbi explains principles and scoping considerations; he cannot approve flight safety, assess asset fitness for service, certify measurements or replace a qualified inspection/survey professional. He should say what information is missing and offer a useful next step, without repeating a generic disclaimer in every answer.

## Grok Bot handoff

Follow Aria's established flow: **draft → edit → review → explicit send → receipt**. A visitor can start it directly, or Orbi can offer a draft when they ask for human follow-up. A chat reply never independently sends a notification.

Collect name, phone/email, company, project reason, preferred time and time zone; optional service/industry/site context can be incorporated into the reviewed reason. Never infer a phone country code, time zone or contact detail. The visitor sees every field that will be sent. No complete transcript is forwarded.

The owner selected **the same Grok Bot routine as Aria**. Reuse that connection privately, but label Orbit events distinctly with type `orbi.contact.requested` and source `Orbit Aerials website / Orbi`, a stable event ID and explicit visitor confirmation. Verify the shared routine instruction accepts both Aria and Orbi events; a key alone does not establish that its instructions cover a new event type. The endpoint uses the documented authenticated JSON webhook protocol.

Only HTTP 200 means Grok Bot accepted the call and began a run. It does not prove an owner notification, a human response or a booked call. Show those distinctions in receipts. Keep definite rejection, acceptance and uncertain network outcomes separate. Preserve retry IDs and reject mismatched request bodies. Never blindly resend uncertain deliveries. A recipient should deduplicate by event ID and treat submitted text as untrusted data.

The routine instruction will ask the owner's bot to notify the owner with the reviewed project brief and contact details. It must not execute visitor instructions, open visitor links, book work or contact a visitor automatically.

## Session and operational behavior

Adapt the Netlify implementation's same-origin checks, session CSRF token, Secure/HttpOnly/SameSite cookie, encrypted 30-minute idle session, transactional usage limits and duplicate-delivery control. Use a dedicated Orbit cookie/table namespace and encryption secret. Keep contact credentials independent of the OpenAI connection. A missing Grok configuration disables sending but need not disable technical answers.

Use server-held conversation and request state, safe error messages and no transcript/secret logging. Retain only the state necessary for conversation recovery and delivery deduplication. Accepted contact payloads are removed from the sender's receipt record, leaving status/digest metadata. Pending/failed/uncertain contact records follow a seven-day retention period and scheduled cleanup. Netlify branch copies/backups have separate retention; keep encryption secrets restricted to production. Public privacy copy must match actual configured behavior.

Adapt relevant Aria mechanisms rather than copying its unused legacy transcript-reporting subsystem. Inspect reset/retry behavior, concurrent requests and request-body conflicts specifically for Orbit. Limits and daily call ceilings are configurable on the server.

## Blog migration and ongoing editing

The current prototype contains three new editorial drafts, not a migration of the published Orbit blog. Two actual published articles were recovered from indexed source pages: **Drones in Construction Industry** and **Revolutionizing Construction: The Game-Changing Benefits of Drone Technology**. The live blog index and sitemap could not be fetched reliably, so this is not yet a proven full inventory. Source and migration notes are in `docs/orbit-blog-migration.md`.

Keep the Orbit Journal identity and expose it clearly as Blog in navigation. Use one Markdown file per article with metadata for title, excerpt, original URL, author, category, publication/update dates, image/alt text and draft/published status. Generate article pages, related posts, metadata and sitemap entries from that source. Maintain the actual existing article paths where feasible; redirect the old index path to the new Journal index and provide a `/blog/` alias. Do not silently replace published posts with the prototype's invented drafts.

Preserve a source snapshot before making editorial changes. Keep existing bylines, source references and dates; resolve ambiguous date formatting from source metadata rather than guessing. Existing posts contain dated numerical claims and some broad safety/accuracy statements. Flag those for editorial review and retain a distinction between faithful migration and revised copy. They do not become authoritative Orbi technical knowledge merely because they are published on the blog.

Start with the repository as the content source: edits and new articles flow through GitHub review and Netlify deploy previews. Drafts stay out of public lists, feeds and sitemaps. This supports ongoing work without adding a separate CMS immediately; a browser editor can be added if later requested.

## Verification and completion criteria

- Unit and loopback integration tests use mocked OpenAI/Grok endpoints, with no real notifications or billable calls.
- Test status, sessions, origin/CSRF rejection, response validation, request-size and usage limits, cancellation, new conversation, replay/retry IDs, changed-body conflict, provider refusal/malformed response and expiry recovery.
- Test contact review and consent, invalid fields, acceptance, rejection, unknown delivery, duplicate retries and private credential exclusion from all public artifacts.
- Browser-test the real Orbi widget on desktop/mobile: opening, asking a question, follow-up context, related pages, Arabic direction, session restoration, failed request recovery and contact review/receipt using mocks.
- Evaluate representative service/technical questions, unsupported payload claims, GSD versus accuracy, DSM/DTM, GNSS-denied inspection, hazardous-atmosphere questions, prompt injection and false booking requests. Source IDs must resolve.
- Run existing website tests and production build; preserve current aircraft interactions and Orbi motion/accessibility behavior.
- Test blog metadata/route generation, original URLs, redirects, draft exclusion, internal links and long-article/mobile reading layouts. Verify the recovered article content and provenance; do not call the migration complete without resolving the source inventory.
- After credentials are privately configured, validate a real English/Arabic conversation and follow-up. A single clearly marked bot test requires explicit instruction to send it; record webhook acknowledgement separately from owner receipt.
- No public deployment is implied. Deliver local functionality, private/public installation artifacts and clear activation instructions.

## Confirmed choices and activation inputs

- Confirmed: GitHub-connected Netlify website/functions; domain ownership and email remain at Hostinger.
- Confirmed: reuse the same Grok Bot routine as Aria, with clear Orbit source labels.
- Orbit OpenAI API key installed privately; live local replies verified. The shared Grok handoff was tested with explicit authorisation and the owner confirmed receipt.
- Privately configure the existing bot connection and verify its routine instruction covers Orbit events.
- Exact Orbit GitHub repository and Netlify site targets when ready to connect and deploy.
- Complete original blog inventory/export if direct/indexed discovery remains incomplete.

Optional knowledge improvements can follow without blocking the initial assistant: exact payload inventory, approved example projects/reports, actual certifications, survey acceptance policies and reporting templates.

## Implementation references

- [OpenAI GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [OpenAI API overview](https://developers.openai.com/api/reference/overview)
- [Grok Bot routine webhook protocol](https://cursor.com/help/grok-bot/routines)
- [Netlify Functions](https://docs.netlify.com/build/functions/overview/), [Database setup](https://docs.netlify.com/build/data-and-storage/netlify-database/getting-started/) and [runtime environment variables](https://docs.netlify.com/build/functions/environment-variables/).
- Local Synapse implementation and setup documentation listed above.
