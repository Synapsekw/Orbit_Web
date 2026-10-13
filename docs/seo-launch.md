# Orbit Aerials SEO launch notes

The implementation prepares the site for organic discovery in Kuwait. Rankings, indexing and rich results still depend on Google’s systems and the site’s wider reputation; structured data does not guarantee a search feature. [Google structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## What the build provides

- Distinct titles and descriptions for each route, with Kuwait intent on commercial landing pages. Article titles retain their specific topic. [Google title guidance](https://developers.google.com/search/docs/appearance/title-link)
- One HTTPS canonical per page on `https://www.orbitaerials.com`, used consistently in page metadata, Open Graph, schema and the production sitemap. Recovered articles retain their original top-level URLs. [Canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- Organization/LocalBusiness, WebSite and WebPage identity; Service markup on service pages; BlogPosting markup on published articles; breadcrumbs matching the visible navigation. Company details come from the site’s existing contact information. No reviews, ratings, prices, certifications, coordinates or unconfirmed payload capabilities are invented. [LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- Open Graph and Twitter summaries with absolute image URLs, image descriptions and actual source image dimensions. Only the small homepage aircraft manifest is preloaded.
- A production sitemap containing public canonical routes and genuine article publication/update dates. Draft articles, prototype pages and the 404 page are excluded; build time is not presented as a content update date. [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- A bundled root `404.html` without a homepage canonical or schema. Netlify uses the file for missing static URLs; no blanket `200` SPA rewrite is added. A live HTTP check remains necessary on the final host. [Netlify custom 404 guidance](https://docs.netlify.com/manage/routing/redirects/redirect-options/), [Google HTTP status guidance](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes)

## Production and preview behavior

`ORBIT_PUBLIC_BUILD=1` enables indexing only when any supplied `CONTEXT` and `VERCEL_ENV` values are `production`. Netlify already sets the public flag in its production context. Deploy previews, branch deploys and development remain `noindex` even if they inherit that flag. Builds without the flag also remain `noindex`.

Production pages allow indexing. Preview HTML uses `noindex,nofollow`, preview responses receive a site-wide `X-Robots-Tag`, and preview sitemaps contain no page URLs. Canonicals always identify the public domain; a preview host is never advertised as canonical.

`robots.txt` allows page crawling so Google can actually read `noindex`; `Disallow` alone cannot prevent a URL appearing in search. In production, the build generates `noindex` headers for `/design-concepts/*`, `/orbi-preview/*`, `/orbi/*` and `/404.html`, with HTML noindex on the prototype pages. API paths remain excluded from crawling. These settings control indexing, not access. [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

Run `node --test tests/seo.test.js` for isolated production and deploy-preview generation checks. Run `npm test`, the production build and `npm run check:public` for the integrated release. The deployment must publish the generated `dist` output, including `_headers`, `_redirects`, `robots.txt`, `sitemap.xml` and `404.html`.

## Owner actions at launch

1. Confirm the public phone number, address, office hours and linked social profiles are current. They appear in both visible content and schema. If these change, update `src/site/data.js`, `src/site/seo.js` and the public business listings together. Add a precise office location or Business Profile link only after it is confirmed.
2. Set the production primary domain to `www.orbitaerials.com` and verify HTTP/apex alternatives redirect to the matching HTTPS `www` URL. Check both recovered article URLs return `200`, legacy `/blog/` returns `301` to `/journal/`, and a random missing URL returns `404` rather than the homepage. Confirm production pages have no inherited `X-Robots-Tag: noindex`, while previews still do.
3. Verify a domain property in Google Search Console using the owner’s DNS access. Submit `https://www.orbitaerials.com/sitemap.xml`, inspect the homepage, both inspection pages, the mapping page and one article, then review Page Indexing for blocking or canonical issues. Request indexing of important changed pages once they are live. [Search Console setup and monitoring](https://developers.google.com/search/docs/monitor-debug/search-console-start)
4. Test the live homepage, service page and article in Google’s Rich Results Test. Then check real mobile performance in PageSpeed Insights and Search Console as field data becomes available. Local test success does not verify Google’s crawl or the host’s HTTP behavior. [Structured data validation workflow](https://developers.google.com/search/docs/appearance/structured-data/local-business)
5. Claim or verify Orbit’s eligible Google Business Profile through the owner account. Use the real business name, appropriate category, accurate Kuwait service areas, current contact details and authentic work photography. Confirm whether the office receives customers before displaying it as a customer-facing address. [Business Profile setup](https://support.google.com/business/answer/7039811), [address guidance](https://support.google.com/business/answer/2853879)
6. Track non-brand Kuwait search impressions, clicks and enquiries by service page in Search Console. Publish approved Kuwait project case studies with useful context, actual outputs and client permission; request genuine customer reviews without inventing testimonials. Local results consider relevance, distance and prominence, so a technically correct website is one part of the work. [Local ranking guidance](https://support.google.com/business/answer/7091)

Future Arabic pages should be professionally written, separately addressable and useful on their own before adding reciprocal language annotations. No Arabic locale or `hreflang` is advertised for English-only pages.
