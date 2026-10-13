# Kuwait journal editorial update

13 October 2026. Content scope: four published articles and three unchanged prototype drafts. No rankings, traffic gains, certified accuracy, permissions or optional payload inventory are promised. This document records editorial decisions; it is not a claim that all technical SEO or deployment work is complete.

## Search intent and internal links

| Canonical route | Primary reader need | Related service and article destinations |
| --- | --- | --- |
| `/drones-in-construction-industry/` | Choose construction drone services across the project lifecycle in Kuwait | Progress documentation, mapping, walkthroughs, time-lapse, handover, visual inspection; the three other published articles |
| `/revolutionizing-construction-the-game-changing-benefits-of-drone-technology/` | Use drone maps for construction planning and coordination in Kuwait | Spatial mapping, progress documentation, walkthroughs; technical surveying brief and broad construction guide |
| `/journal/drone-surveying-kuwait-deliverables/` | Specify survey deliverables, accuracy assessment and handover requirements | Spatial mapping and progress documentation; construction mapping use guide |
| `/journal/confined-space-drone-inspection-kuwait/` | Scope a suitable internal inspection with Flyability Elios 3 | Confined-space and visual inspection; surveying guide for separate measurement requirements |

The long recovered construction post previously focused on survey outputs and accuracy. It now covers the use of maps in construction decisions, avoiding a second near-duplicate technical survey guide. The two original root-level paths, `originalUrl`, original displayed date text and known publication metadata are preserved. `originalTitle` is recorded explicitly. The ambiguous `3/6/2023` date has not been converted into an invented ISO publication date.

Both new articles use JSON metadata frontmatter, organisation author `Orbit Aerials`, published/updated date `2026-10-13`, concise SEO titles and descriptions under 165 characters. They do not receive an invented `originalUrl`. Source links occur next to the claims they support. No named expert, project result, customer endorsement or Kuwait-specific legal rule was fabricated.

Kuwait relevance is practical: the commissioning context, heat and dust planning, site access, project coordinate requirements, reporting dates and recipient needs. District names, repeated keyword lists and unsupported local case studies were deliberately excluded.

## Technical sources reviewed

All are primary manufacturer/software-provider sources, reviewed 13 October 2026. The editorial content paraphrases limited technical definitions and adds original commissioning guidance; it does not reproduce vendor marketing claims or claim vendor examples as Orbit results.

- [Flyability Elios 3](https://www.flyability.com/elios-3): cage, indoor use, navigation without GPS, LiDAR/camera/SLAM and map context.
- [Flyability payloads and accessories](https://knowledge.flyability.com/getting-started/start-with-payloads-and-accessories): distinction between the aircraft and additional sensors/payloads.
- [Flyability flammable-gas sensor announcement](https://www.flyability.com/news/flammable-gas-sensor-press-release): adding the sensor does not confer ATEX certification. No claim that Orbit owns this sensor.
- [Flyability Elios 3 warnings](https://knowledge.flyability.com/aircraft/elios-3/elios-3-troubleshooting/elios-3-warning-messages): heat/sensor limits require operational review. The article does not turn a warning threshold into permission to operate.
- [DJI surveying overview](https://enterprise-insights.dji.com/blog/all-about-drone-surveying): output types and construction-model context. Vendor cost, speed and accuracy examples were not carried over as Orbit claims.
- [DJI ground sampling distance](https://enterprise-insights.dji.com/blog/ground-sample-distance): pixel spacing and image detail.
- [DJI RTK and PPK](https://enterprise-insights.dji.com/blog/rtk-real-time-kinematics): when corrections are applied. Vendor assertions that RTK eliminates control were not adopted.
- [Pix4D control and checkpoints](https://support.pix4d.com/hc/en-us/articles/360000276046): checkpoints excluded from processing provide assessment around their locations. No fixed checkpoint count or universal accuracy is asserted.
- [DJI Matrice 400 specifications](https://enterprise.dji.com/matrice-400/specs): aircraft, battery and charging requirements differ. No numeric limit is offered as a site operating recommendation.

## Imagery

Each published article has a local hero plus two inline figures compatible with the journal renderer. Alt text describes visible content. Captions preserve attribution and explicitly identify stock, demonstration or illustrative use.

The new articles use only the already recorded licensed imagery: Ivan Bandura / Unsplash construction image, Sircher CC BY 4.0 stadium model derivative, Sergej Majboroda / Poly Haven CC0 interior panorama and Tom Fisk / Pexels refinery image. No image is labelled as a Kuwait location or Orbit commission. The inspection article's interior panorama is explicitly not an Elios capture or confined-space assessment. The refinery serves as the hero and as a contextual external-overview figure; it is not an internal inspection output.

The existing Flyability and DJI product photographs carry unresolved publication-basis notes in `public/ASSET-SOURCES.md`; this editorial update does not introduce them into the new posts or expand that dependency.

## Integration and verification notes

- Parent integration owns renderer, generated pages/feed/sitemap and tests. No generated output was authored in this task.
- New content expects `/services/visual-inspection/` and `/services/confined-space/` from parent work, alongside existing service routes.
- Previous tests assume two published articles, an `originalUrl` on every post and a DJI source on every post. Update those assertions to distinguish recovered posts from new original articles and accept relevant primary sources such as Flyability.
- Verify source parsing, image variants, internal routes, four published entries in the index/feed/sitemap, per-article schema, canonical URLs and draft exclusions after the parent build.
- No exact publication day was invented for the recovered construction-services article. New articles are dated as new work rather than inheriting the recovered posts' 2023 provenance.

Content-only verification passed using `loadArticles()` without writing generated files: four published articles, three drafts, valid JSON metadata, two rendered inline figures per article, at least five table-of-contents headings, and all referenced full-size/800 px AVIF plus WebP assets present. New inspection and survey articles contain approximately 800 and 806 visible words respectively. All four descriptions are 144–147 characters. Full page rendering and site-wide checks remain part of parent integration.
