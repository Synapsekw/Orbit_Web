# Orbit blog migration inventory

13 October 2026. Two recovered posts are now imported and rewritten at the owner’s request. Full original inventory remains unverified. See `docs/polish-status-2026-10-13.md`.

## Sources found

The existing blog is titled **The Orbit Journal**. Its index URL is:

https://www.orbitaerials.com/wwworbitaerialscomdrone-construction-insights

Two published article pages were recovered through the web index:

| Title | Original path | Visible byline/date/read time |
|---|---|---|
| Drones in Construction Industry | `/drones-in-construction-industry` | Orbit Aerials; `3/6/2023`; 1 min read |
| Revolutionizing Construction: The Game-Changing Benefits of Drone Technology | `/revolutionizing-construction-the-game-changing-benefits-of-drone-technology` | Orbit Aerials; `3/3/2023`; 4 min read |

The original homepage, blog index and sitemap are not reliably reachable directly from this environment. Indexed article content was readable, but returned crawl dates are older than today. The article count, complete media set and current publication metadata remain unverified. Do not claim these are all posts or interpret `3/6/2023` as a specific day/month without metadata evidence.

## Preserve during migration

- Original title, byline, body, media/source references and published metadata in a source snapshot.
- The two existing root-level article paths as canonical routes, unless an explicit redirect map is used.
- The old Journal index path with a permanent redirect to `/journal/`; `/blog/` can redirect there too.
- Author and publication/update dates as distinct fields; importing does not reset publication date.
- External source references in the longer article. The visible superscript-like references link to DartDrones, iSky Films and UAV Coach; inspect and preserve their actual destination URLs from the recovered page before rendering.

## Existing prototype content

`src/content.js` contains three authored draft field notes: `planning-your-site-capture`, `choosing-your-site-view` and `from-progress-to-handover`. Their pages explicitly label them editorial drafts. They are not copies of the published posts. Move them into the new content system as drafts, preserving their work, and keep drafts out of public listings/sitemaps by default.

## Editorial review observations

These are observations about the recovered original text, not completed fact checks or edits:

- The short post says drones eliminate the need for workers to access dangerous areas. A revision should distinguish reduced exposure from elimination of all human access.
- The longer post compares five acres/hour with 120 acres/hour but calls it a 60-fold gain; those figures imply 24-fold. Its numerical comparisons need checking against cited sources and their actual conditions.
- The longer post includes market estimates for 2023/2024, growth projections, ROI/inspection savings and general gas-leak/structural-weakness statements. Preserve source history, then verify or qualify these before representing them as current general facts.
- A displayed 2023 publication date alongside later market estimates needs source-metadata review, not an invented correction.
- A dated article can be migrated faithfully without teaching all its claims to Orbi. Only reviewed technical material should enter his grounded knowledge.

## Proposed maintenance workflow

Store posts as individual Markdown documents under `content/journal/`, with a validated metadata schema. Build lists, routes and metadata from these records. Review article changes through GitHub and a Netlify preview, then merge to release. Include draft/published status, category, description, original URL, author, publish/update date, image and alt text. Keep local source snapshots outside the public build. No separate CMS account is required initially.

## Links

- [Original Journal](https://www.orbitaerials.com/wwworbitaerialscomdrone-construction-insights)
- [Drones in Construction Industry](https://www.orbitaerials.com/drones-in-construction-industry)
- [Revolutionizing Construction](https://www.orbitaerials.com/revolutionizing-construction-the-game-changing-benefits-of-drone-technology)
