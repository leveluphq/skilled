# Operating a public learning site

The application can publish useful HTML, structured data, and discovery files. A public operator must also deploy the intended release, verify the host's behavior, inspect indexing, and measure whether search visitors use the learning material. This guide applies to independent deployments as well as the official site.

## Before deployment

Configure ROOT_URL as the deployment's public origin. Use that same identity in canonicals, publisher metadata, sitemap locations, and public links. Configure the site name, description, logo, and social metadata through the documented site settings. A fork should identify its own operator rather than inherit an unrelated publisher's identity.

Choose indexing deliberately. Production eligibility requires APP_STAGE=production and an indexing policy that permits it. Development, previews, and private teaching instances should retain noindex and blocked crawling. Keep account, checkout, API, and generated session routes outside public discovery. Robots blocking and noindex have different effects; do not treat one as proof of the other.

Record the source commit and deployment timestamp. Keep the course's published inventory and deployment database aligned, using the normal release process. This SEO work does not require a database migration. Existing access rules continue to determine which course modules a visitor can use; public articles and reading walkthroughs are independent of course completion.

Run content generation, integrity checks, typecheck, and the relevant tests before building. New executable article examples should be checked from the actual MDX source, using the author tools described in [Publishing Guides and Tools](./publishing-resources.md). Do not update dates automatically across the whole library when only deployment configuration changed.

## Verify the public responses

After deployment, run the source-inventory audit from the checkout that was deployed:

```bash
npm run check:seo -- \
  --base-url https://school.example \
  --canonical-origin https://school.example \
  --report /tmp/public-seo.json
```

Replace the example origin with the real host. The script sends anonymous GET requests without a session cookie and compares the deployment with this checkout's complete inventory. It must not silently accept an older, smaller sitemap. A failed check exits with status one; the report preserves every finding.

Inspect missing resources before requesting indexing. A 404 for a newly added article usually means the release has not reached the expected host or the route was not built. A 200 response containing a login wall is still an accessibility failure for a resource intended to be public. An unexpected canonical origin points to configuration or an older deployment.

Check robots.txt, sitemap.xml, and llms.txt separately. The sitemap should contain published human pages and exclude drafts, account routes, and per-session state. Sitemap modification dates should describe substantive content changes when maintained. Google does not use sitemap priority or change-frequency values. [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

The llms.txt response is a text navigation asset and deliberately carries a noindex header. Its linked HTML pages must follow their own eligibility policy. A successful llms.txt request does not establish search indexing or AI citations.

## Review real learner journeys

Open the site in a fresh browser context without signing in. Read a guide, use a tool, follow a practice link, and return through related material. Disable JavaScript and confirm that public article explanations and code remain readable. Interactive controls need JavaScript, while their explanatory content should not depend on finishing an interaction.

On an ordinary exercise, change the editor's programming language and move to the next lesson. The URL should remain the normal course route, and the preference should persist according to the course's existing behavior. Reading language-specific walkthroughs should not change that preference. An explicit practice action may save a supported choice before opening the ordinary exercise. Concept and implementation pages link to the original course lesson while preserving that choice. Check language subjects, reading links, and membership for all 66 published lessons; JavaScript-focused lessons correctly list only JavaScript and TypeScript.

Try narrow viewports, keyboard navigation, reference tables, and printable worksheets. A diagram can scroll inside its panel without widening the entire page. Controls need visible focus, clear labels, and a readable result. Check malformed tool inputs, empty structures, a missing graph path, and a paused rehearsal timer. The public audit does not replace this interaction review.

## Inspect indexing with Search Console

Use the Search Console property that covers the real canonical host and verify ownership through the owner's normal process. Submit or inspect the sitemap for that property. Representative URLs should cover the homepage, course index, a free exercise, a restricted exercise preview, a language guide, a tool, and a language-specific walkthrough.

For each sample, compare the live test with the indexed version. The live test checks current retrieval and eligibility; it does not prove the URL is already indexed. The indexed record can show Google's selected canonical and an older crawl. Inspect the rendered page and relevant page-indexing details when they disagree with the current release. [URL Inspection documentation](https://support.google.com/webmasters/answer/9012289)

Request indexing selectively after fixing a meaningful problem. Do not repeatedly submit every page as a substitute for discovery and useful content. Keep links, redirects, canonicals, and sitemap locations consistent. A canonical annotation expresses a preference; Google's actual selection needs indexed-state evidence.

A public HTTP audit cannot reproduce every CDN or protection rule applied to a verified Google crawler. Investigate a Search Console retrieval failure alongside host logs and crawler verification rather than assuming that a request with a Googlebot-looking user-agent proves Google's access.

## Measure use after acquisition

Establish a baseline of landing pages and queries, separating branded searches from nonbranded learning queries. Compare complete time windows with similar weekdays. Group pages by purpose: topics, patterns, languages, tools, references, course lessons, and walkthroughs. Small impression counts should not drive confident conclusions.

Useful subsequent actions include opening an exercise, requesting a code run, returning for another session, and progressing through the course. A requested run is not the same as a successful run. A first tool interaction is not evidence of mastery. The optional data-layer events are documented in [Publishing Guides and Tools](./publishing-resources.md); operators configure their own analytics tags and reporting.

Keep raw code, answers, notes, and arbitrary query parameters out of learning events. The built-in event helper accepts only known published paths. Browser-local review schedules and rehearsal notes do not become public pages. A self-hosted learner can use the application without configuring growth analytics.

Review field performance by page family and device when enough data is available. Current Core Web Vitals use LCP, INP, and CLS, with good thresholds assessed at the seventy-fifth percentile of visits. Good values are LCP at most 2.5 seconds, INP at most 200 milliseconds, and CLS at most 0.1. A page with insufficient field data has not thereby passed. [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)

Use a synthetic run to investigate a concrete issue, then verify the effect in an appropriate environment. Do not present a build's JavaScript size, a deterministic sorting counter, or one local Lighthouse run as a field performance result.

## Keep the release observable

CI validates the built application under preview indexing controls. The Public SEO audit workflow can inspect a deployed origin manually. Weekly checks are enabled only when the repository's PUBLIC_SITE_URL Actions variable is set, so forks choose their own target. Reports are uploaded even when checks fail.

Set the variable after the matching release is public. A main branch ahead of production can correctly fail the source-inventory audit until deployment catches up. Review the commit, host, and publication timestamp before treating missing new pages as a route-generation regression.

After launch, inspect indexing cohorts around the first week, then compare complete search and learning windows over subsequent weeks. These are review intervals, not deadlines by which Google must index or rank content. Fix demonstrated access, rendering, canonical, or content errors before adding more pages.

Maintain examples when a language or contract changes, remove references to unpublished routes, and review recommendations against real learner questions. New content should answer a distinct need with original explanation and verified examples. The repository provides publishing infrastructure; continued search performance depends on the public service and its ongoing editorial work.
