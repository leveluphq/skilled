# Publishing guides and tools

The public resource library lives at `/learn`. Guides, topic hubs, patterns, language preparation, study plans, references, and tool pages use the same catalog and rendering components. They are readable without an account and do not depend on a running database.

Course lessons retain their existing routes and access configuration. A public resource can link to a lesson without changing that lesson's access level. Permitted problem solutions are included in an accessible disclosure; the learner can choose when to read them.

## Configure a public deployment

Use Node.js 24, as specified in `.nvmrc`, and follow the [local setup documentation](./README.md) for the course backend and code runner. The resource pages themselves are statically generated, while the existing course build still needs its configured backend.

The public deployment settings are documented in `.env.example`:

| Variable | Purpose |
|---|---|
| `ROOT_URL` | Absolute public HTTP(S) origin, such as `https://school.example`. Used for canonical URLs, discovery files, and site identity. Existing auth flows also use it. |
| `SITE_NAME` | Site/publisher name for metadata and the resource header. Defaults to `Skilled.dev`. |
| `SITE_DESCRIPTION` | Default description when a page does not supply one. |
| `SITE_IMAGE` | Absolute or origin-relative social sharing image. Defaults to `/social-share.png` on this deployment. |
| `SITE_LOGO` | Publisher logo. Defaults to `/logo-square.png` on this deployment. |
| `SITE_TWITTER` | Optional social account. The official origin defaults to the existing Skilled account; other origins do not inherit that account. |
| `APP_STAGE` | Indexing requires `production`. Development and staging pages emit `noindex`. |
| `SITE_INDEXABLE` | Set to `false` for a deployment that should remain out of search, including a private mirror. |

Set these values before building. Next.js embeds the public settings into the client and prerendered pages. Changing deployment identity requires a new build. Do not put credentials in public settings.

`ROOT_URL` is normalized to an origin. This application does not add a subdirectory hosting prefix from a path in that URL. Independent deployments should use their own origin and publisher settings. A fork is not forced to canonicalize its content to skilled.dev.

## Add an article

1. Add a record to `src/content/resources/catalog.json` with a section, slug, title, description, publication date, update date, related resource IDs, and course lesson slugs.
2. Write `src/content/resources/<section>/<slug>.mdx`. The catalog supplies the H1, description, dates, and related cards. Begin the MDX with the actual explanation.
3. Use `##` headings for the contents navigation and `###` for subsections. Heading IDs are generated consistently between the contents list and rendered headings.
4. Link to real published pages. Related resource IDs have the form `guides/debounce-vs-throttle`; lesson links retain `/course/<slug>`.
5. Run `npm run contentgen:resources`, then `npm run check:content`.
6. Commit the MDX, catalog, and generated route together. Run the relevant application checks before publishing.

For a programming-language preparation guide, use `interview-prep/<language>` and set its catalog `language` field to that slug. A deeper guide or reference can set the same field to join that language's learning path. The language must have a published preparation guide. The `/interview-prep` index groups those records automatically, and course resources use the selected language to surface its guide and matching deeper material. Languages with no guide link to the index. Add substantive idioms, pitfalls, assumptions, examples, and exercises for each language; a translated code block alone does not justify a separate article.

Language-specific guides keep their own canonical URLs. Programming-language labels do not set HTML language or `hreflang`: the current prose is English. Editor language preferences do not create additional indexable query URLs. A guide's examples can use a portable language version without changing the deployed course runner's configured version or each lesson's available choices.

The catalog is the published inventory. Keep unfinished drafts outside it. To remove a published resource, remove its catalog record and generated route, then update links that referred to it. Use a redirect when a genuine replacement exists.

Every article has its own generated route importing its own MDX. There is no runtime content interpreter or client bundle containing the full text of every article. Resource pages use their own small layout and do not mount the course's code editor, authentication, or GraphQL providers.

## Maintain the complete language curriculum

The 66 published lessons have 596 language reading pages: 28 runnable problems, 23 general concepts, and seven data-structure implementation lessons in ten languages; eight JavaScript-focused lessons in JavaScript and TypeScript. The JavaScript material teaches its runtime and type boundaries without creating unrelated Python or Java copies.

`src/content/lesson-walkthroughs/coverage.json` declares every published lesson's kind and required languages. The generator fails for a new published lesson without a policy, an incomplete language set, a missing page, a duplicate slot, a wrong kind, or an unexpected draft. General lessons require all ten preparation-guide languages; JavaScript-focused lessons require JavaScript and TypeScript. Add real content before publishing a new curriculum entry.

Thirty runnable pages for Two Sum, Valid Brackets, and Product Array remain bespoke MDX. Other runnable pages compose a reviewed chapter, language commentary, and exact reference code using `curriculum/manifest.json`. Edit the corresponding chapter and language notes there. Fix the actual lesson reference when changing its published implementation.

Concept, implementation, and JavaScript reading pages use `foundations/manifest.json`. Each entry selects reviewed base notes, a chapter from `foundations/chapters`, at least fifty words of implementation-specific commentary per language, and an actual code asset. Concept and JavaScript assets live under `foundations/examples`; full data structures reuse the original lesson's completed source. Keep traces, representation, mutation, absence, numeric/text boundaries, and complexity consistent with that specific code. Put type syntax such as `Option<i32>` in inline code so MDX does not parse it as JSX.

Run `npm run contentgen:walkthroughs` and commit the source, catalog, composed MDX, and generated routes. The generator refuses to replace bespoke files and removes only its own stale generated content. Every page must satisfy the substance and link checks. The word-count floor is an editorial safeguard, not a search-engine ranking requirement.

Normal course URLs remain `/course/<lesson>`. Reading and sibling navigation preserve the saved language and course progress. A supported runnable “Practice in Python” action may save that language before opening the original exercise. Nonexercise pages offer “Open the course lesson” and preserve the existing choice; they do not claim a runnable editor or another progress record.

Run the trusted published-code suites:

```bash
npm run test:content:curriculum -- --runInBand
npm run test:content:foundations -- --runInBand
```

Both default to JavaScript, TypeScript, and Python. Select all languages with `WALKTHROUGH_LANGUAGES=all` for the runnable suite and `FOUNDATION_LANGUAGES=all` for foundations. Comma-separated selections are also accepted. Java, Kotlin, and C# require existing JDK, Kotlin, and .NET 10 installations; `WALKTHROUGH_JAVA_HOME`, `WALKTHROUGH_KOTLINC`, and `WALKTHROUGH_DOTNET` can select them. C++, Go, Rust, and Swift use Linux Docker images and the assembled harness. Optional `WALKTHROUGH_CPP_IMAGE`, `WALKTHROUGH_GO_IMAGE`, `WALKTHROUGH_RUST_IMAGE`, and `WALKTHROUGH_SWIFT_IMAGE` select documented author-verification images. Record differences from deployed compilers.

For foundation examples on macOS, explicitly select the existing Swift compiler with `FOUNDATION_LANGUAGES=swift FOUNDATION_SWIFTC=/usr/bin/swiftc npm run test:content:foundations -- --runInBand`. This author-only path uses a Foundation JSON driver because the production Linux prelude imports Glibc. It executes the published examples and the same behavioral fixtures, including canonically equivalent Unicode hash keys. This option applies to the foundation suite; it does not change the production runner or its compiler pins. Record the local Swift version when using it.

The foundation suite checks the actual published fences against independent concept cases and collection operation models. It also checks strict TypeScript definitions and deterministic JavaScript timing behavior. `python3 test/foundations/generate_cases.py` reproduces the exhaustive concept fixtures. Source-only mode is for authoring before composition; final checks must omit `FOUNDATION_SOURCE_ONLY` so publication parity is verified. CI runs the default foundation languages alongside the application tests. No compiler, fixture, or new runtime dependency is needed by production prebuild.

These suites execute trusted repository examples only and do not replace production security boundaries or runner limits. `npm run test:content:walkthroughs` separately checks the thirty bespoke implementations. Fast application tests verify complete policy coverage and code/source parity across all 596 pages.

Browser review can use `test/foundations/browser.cjs` with an existing Playwright installation selected by `BROWSER_QA_PLAYWRIGHT`. `BROWSER_QA_ORIGIN` selects the built host and `BROWSER_QA_OUTPUT` the report directory. It checks all 316 foundation pages at a narrow width, every foundation family on desktop and without JavaScript, language libraries, sibling keyboard navigation, action styling, and the original lesson handoff.

## Publish a verified video companion

`src/content/videos/catalog.json` lists public free recordings, their actual upload dates and durations, checked chapter ranges, and corrections since recording. Each `/watch/<slug>` centers one iframe and includes a reading companion from the matching MDX file. The iframe is present in initial HTML and does not wait for a click to be created. Chapter links remain usable on YouTube without application JavaScript. The player does not autoplay.

The full course is free. Every published lesson with a recording belongs in this library, including lessons whose seed retains a legacy `SUBSCRIPTION` label. Watch pages are available without an account independently of the normal course's sign-in configuration. Draft lessons and published lessons without recordings do not get watch pages. No seed change or migration is needed to publish them.

Verify the video's playability, embed permission, author, upload date, and duration on its source host before adding it. The author-only command below checks all active recordings through public watch and oEmbed metadata and can download their thumbnails. It needs Python 3 and network access, with no account or API key. Its report contains source metadata, including whether YouTube itself lists each recording. An authorized unlisted recording can still be embedded on its public lesson page; do not change its YouTube visibility as part of publication.

```bash
python3 scripts/verify-lesson-videos.py --report /tmp/course-video-sources.json --write-thumbnails
npm run contentgen:videos
```

Review the report and update the video catalog with the verified metadata. Store stable thumbnails under `public/images/videos/`. Chapter starts come from each lesson's `data.ts`; remove duplicate starts, resolve overlaps, and keep every ending within the verified duration. Carry forward the current lesson's corrections. Keep notes labeled as notes; do not represent a summary as a verbatim transcript.

Twenty-four watch pages reuse the corresponding reviewed algorithm chapter through `src/content/videos/notes-sources.json`. Edit that shared curriculum source and regenerate; their MDX files have an ownership comment. Other notes are separately edited MDX, including the original four companions. `contentgen:videos` composes shared notes and generates one static route per recording, with its own note module. Unpublication removes only generator-owned routes and composed notes. Handwritten watch routes and separately edited notes are preserved.

With the private seed present, `npm run check:content` requires complete coverage of every active recording and checks exact video IDs, regardless of legacy access labels. Build bundles validate the checked-in catalog against the public course inventory without needing the seed or network access. The prebuild runs `contentgen:videos` automatically.

The video catalog supplies VideoObject JSON-LD, sitemap video entries, the watch index, and llms.txt links. The anonymous audit checks player presence, notes, metadata consistency, and thumbnail retrieval. A valid watch page is eligible for discovery, not a promise that Google will index its video. See [Google's video guidance](https://developers.google.com/search/docs/appearance/video).

The reviewed chapters also supply `Clip` entities and same-page links such as `/watch/debounce?t=176`. The browser selects that whole-second offset, preserves it through history navigation, and carries it into the YouTube fallback. Invalid, repeated, fractional, negative, or out-of-range time values start at zero. The player does not autoplay. Keep each chapter's exact name and bounds consistent with the recording; the check requires matching visible links and metadata. Time variants canonicalize to the clean watch page and stay out of the sitemap. This markup does not guarantee search-result key moments.

## Edit for substance

Write for someone trying to solve or understand a specific problem. Include the contract, worked examples, reasoning, useful failure cases, and next exercises. Explain assumptions such as sorted input, a fixed alphabet, expected hash costs, or output-space conventions.

The generator has prose-depth checks: 400 words for curated topic hubs, 650 for tool explanations, and 950 for longer guides, patterns, language preparation, plans, and references. Code fences and HTML tags do not supply those prose counts. These are publishing guards for this library, not search-engine requirements. Edit for substance if a draft falls short; adding filler does not improve it.

Apply the project's humanizer and no-ai-slop editorial skills when available. Keep supported facts, concrete examples, and technical qualifications. Avoid invented personal experience, author credentials, hiring statistics, testimonials, or guarantees. Current articles identify the publishing organization rather than claiming an individual reviewed them.

Publication and update dates are editorial fields. Change an update date when the content changes substantially; do not rewrite every date on each build. Course URLs omit sitemap modification dates until reliable per-lesson modification history is maintained.

The MDX setup does not enable GitHub-flavored Markdown tables. Use semantic HTML tables in MDX; the resource layout makes them scrollable on narrow screens. Fenced JavaScript and TypeScript examples receive syntax highlighting through the existing MDX pipeline.

Use native SVG or other reviewed assets for explanatory figures. Give each image meaningful alternative text, intrinsic dimensions, and a visible caption where it adds context. An optional catalog `images` list supplies article image metadata and image-sitemap locations; the publishing check verifies local assets, and the HTTP audit checks their visible markup and public retrieval. Images inside articles resize to their container. Keep large diagrams available through a full-size link as well.

Original lesson diagrams use `content/blocks/Image`. Supply `src`, an explanatory `alt`, and numeric `width`/`height` matching the actual PNG, GIF, or JPEG. The wrapper keeps the image proportional as its container narrows and preserves its attribution. `check:content` validates every authored lesson image, including explanation modules that anonymous visitors cannot see. It rejects missing alternatives, missing assets, and incorrect intrinsic dimensions. Describe the relationship or operation in the figure rather than repeating its filename. Keep the surrounding explanation for details that cannot fit a concise alternative.

## Keep course metadata in sync

`hasura/seeds/course.json` is the source for lesson status, titles, and editorial metadata. Update `metaTitle` and `metaDescription` there. Use the seed serializer when editing it programmatically so it keeps the repository's canonical format:

```javascript
const fs = require('fs');
const seed = require('./scripts/course-seed');
const filename = 'hasura/seeds/course.json';
const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
// Apply the intended edits to data.
fs.writeFileSync(filename, seed.serialize(data));
```

`npm run contentgen:resources` exports a public course inventory and lesson metadata under `src/content/resources/`. The inventory includes published lesson/category identities, ordering, descriptions, and access labels; it contains no user data or database credentials. Anonymous course lists and sidebars render from this inventory, so the initial HTML includes every published lesson and category target without an API request. Signed-in views retain their existing progress query. Commit the generated files with seed changes. The build upload intentionally excludes the Hasura directory, so production resource generation can use the checked-in public inventory without that seed file.

The generated metadata is also used by lesson pages. Applying the course seed to a database updates its metadata fields through the normal seed workflow. Regenerating resources does not contact or mutate a database.

## Add an interactive tool

Add an ordinary React component under `src/components/pages/Resources/tools/`. Map its slug to its component name in `src/scripts/generateResources.js`, then add its catalog entry and explanatory MDX. Regenerate its route.

Keep deterministic algorithm logic in `src/utils/shared/learningTools.ts` or a similarly focused module. Test boundary behavior and invalid inputs independently of the drawing. Use explicit labels, keyboard-accessible controls, text output or tables, and accessible SVG titles/descriptions.

User-entered examples stay within the browser. They do not create new public URLs. The current tools do not run arbitrary pasted programs or send inputs to an external service. The graph and tree editors have size limits to keep their drawings usable.

The study-plan builder uses `src/utils/shared/studyPlan.ts` for curated tracks and scheduling. Each 30-minute block allocates 25 minutes of work and five minutes of notes; every fifth block reviews a previously practiced topic when one is available. After initial coverage, remaining blocks rotate through review. A plan may leave topics unfinished, which the page and Markdown export state explicitly. These allocations are not measured lesson completion times. Update a track's objectives and destinations together when course coverage changes.

The planner stores one current plan and completion marks in browser local storage under a versioned key. It validates restored settings and filters unknown completion IDs. It works without persistent storage and can export the current checklist. A changed schedule resets its marks; rebuilding identical settings preserves them. It does not sync with course progress or an account.

Pattern questions live in `src/utils/shared/patternQuiz.ts`. Each prompt needs concrete constraints, one best choice under those constraints, an explanation for each alternative, a follow-up, and a published guide link. Keep the complete answer reference readable in the page. Quiz answers are session state and reset on reload. Scores describe the selected prompts, not interview readiness. Add questions for a distinct reasoning exercise rather than making lightly reworded duplicates.

JavaScript output questions live in `src/utils/shared/javascriptOutputQuiz.ts`. Each snippet runs independently inside a strict-mode function for verification. Use primitive log arguments or explicit serialization so console object presentation does not determine an answer. State asynchronous completion assumptions; the current questions use promise jobs without timers or host-specific scheduling. Give every alternative its own reason, add a follow-up change, and link to a published guide and primary language reference. The application displays snippet text and does not evaluate it. Jest executes the actual strings in an isolated Node VM, waits for their promise jobs, and compares the output with the published answer. Keep the complete reference in the initial HTML, including wrong-choice explanations.

## Sitemaps, robots, and metadata

`/sitemap.xml` and `/robots.txt` are application routes, not checked-in static files. Their responses use the configured site origin and the published resource/course inventory. Do not add files with those names under `public`, which would conflict with the routes.

`/manifest.json` is an application route too. It uses the configured site name, description, and origin, with existing files under `public/icons`. Replace those files when branding a public fork. Do not add a static manifest with the same path. The machine-readable response carries HTTP noindex and is not a human sitemap entry.

To preview the sitemap locally:

```bash
npm run contentgen:sitemaps
```

Production robots allows public pages, identifies the sitemap, and excludes operational paths. Development/staging or `SITE_INDEXABLE=false` returns a disallow-all robots policy, and the shared head emits `noindex`. Robots blocking and a page's indexing instruction serve different purposes; check the actual deployment settings when enabling public discovery.

Canonical URLs remove fragments and query state. Resources representing a distinct language or subject have their own paths. An `og:url` value is not a substitute for the canonical link element.

## JSON-LD coverage

The shared `StructuredData` component emits `<script type="application/ld+json">` in server-rendered HTML. Its serializer escapes HTML delimiters and Unicode line separators so content cannot break out of the JSON script. URLs and entity identities use the configured deployment origin.

| Location | Entities |
|---|---|
| Application document | `WebSite` and `Organization`, once per response |
| Homepage | `WebPage` with the programming-language subjects and linked companion guides |
| Course index | `Course` with a publisher reference, learning topics, and companion language resources |
| Published course lessons | `LearningResource` and `BreadcrumbList`, linked to the course's stable entity ID |
| Guides, patterns, language preparation, plans, and references | `TechArticle` and `BreadcrumbList` |
| Topic resources | `CollectionPage` and `BreadcrumbList` |
| Library and section indexes | `CollectionPage` with the resources displayed on that index |
| Interactive tool resources | `WebPage` and `BreadcrumbList`, with the actual tool described by `mainEntity: WebApplication` |

The resource page links to the site entity through `isPartOf`. A tool entity has a stable `#application` ID, its visible name and description, public URL, educational application category, browser requirements, free-access status, and publisher reference. The component emits that entity only when a tool component is actually supplied. The page and application are separate entities on the same canonical URL.

Article authorship identifies the publishing organization; it does not invent an individual author or reviewer. No ratings, testimonials, offers, or FAQ entities are manufactured. JSON-LD describes visible content. Schema.org's [WebApplication definition](https://schema.org/WebApplication) supports the tool classification; Google's [structured-data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) explains its search use. Valid vocabulary alone does not establish eligibility for a particular rich result, and markup does not guarantee that search engines will show one.

Lesson markup uses the checked-in published inventory and the same editorial metadata as the lesson head. It contains the public title, description, lesson/question type, course membership, and course-to-lesson breadcrumb. It pairs `WebPage` with [LearningResource](https://schema.org/LearningResource), following the vocabulary's use of that type alongside a primary creative-work type. It does not include solutions, user progress, access claims, or fabricated update dates. An unpublished or unknown slug has no lesson entity. This metadata does not change the lesson's actual access checks.

Programming-language subjects come from the published language guides and the application's language names. Language-tagged resources use `about: ComputerLanguage`; the language index and homepage describe all published language subjects. The homepage and course also link to each guide using visible language names, and the course identifies its companion guides as learning resources. The human text remains `inLanguage: en`. Schema.org's [programmingLanguage property](https://schema.org/programmingLanguage) describes source code, so the application does not assign it to an article or course. Programming languages also do not create `hreflang` variants.

## Public access and llms.txt

Catalog resources are public without a session, regardless of `OPEN_ALL_LESSONS`. That setting controls course lesson access. A course URL can expose its public title and preview while requiring an account for the explanation or solution; inclusion in the sitemap does not override that policy. Changing indexing settings also does not grant lesson access.

An operator who wants every course explanation and solution available anonymously can set `OPEN_ALL_LESSONS=true` before building. This is a content-access decision separate from publishing the public resource library. Public availability makes content crawlable; actual indexing remains a search-engine decision.

`/llms.txt` is a generated navigation map using the current published catalog, configured site name, and canonical origin. It links to the free public resources and the course overview. It includes no private documentation, user data, or restricted solution content. It is served as UTF-8 plain text, discovered through the shared head's `describedby` link, and kept out of search results with an HTTP `X-Robots-Tag: noindex` header. The linked HTML pages keep their own indexing policy. Do not add a conflicting static file under `public/` or manually maintain another copy of the catalog.

This is an optional convenience described by the [llms.txt proposal](https://llmstxt.org/). Google's [AI-features guidance](https://developers.google.com/search/docs/appearance/ai-features) says no special AI text files are needed. The map does not change robots permissions, guarantee use by an agent, or establish a search-ranking benefit.

## Audit a public deployment

Build with the intended production origin, `APP_STAGE=production`, and `SITE_INDEXABLE=true`. For checking that resources remain public independently of lesson access, use `OPEN_ALL_LESSONS=false`. Start that build, then run:

```bash
npm run check:seo -- --base-url http://localhost:3000 --report /tmp/skilled-seo-report.json
npm run test:seo-audit
```

The author audit requires Python 3 and this checkout's public catalog, course inventory, and resource MDX. It makes anonymous GET requests, sends no session cookie, and does not change a database or deployment. Its expected URL set comes from this checkout, so an older deployment with a smaller sitemap fails rather than silently reducing the pages checked. The script lives outside the production upload and is separate from the prebuild.

For a deployed site, use its public origin as `--base-url`. If a local server was built with an external canonical origin, add `--canonical-origin https://school.example`. Use `--expect-noindex` to require preview noindex and blocked crawling instead of production indexing eligibility. A failing audit exits with status 1; `--report` saves all findings, while the console shows a summary.

The audit checks the complete expected inventory against the served sitemap, robots access for Googlebot, statuses and redirects, titles/descriptions/H1s, canonicals, indexing directives, parseable JSON-LD, public resource metadata, the opening and ending prose from each resource, HTML-link reachability from the homepage, language-subject coverage, and llms.txt links. It also requires every published lesson and category target in the course index's initial HTML and validates internal fragment destinations across the public pages. Tests include a login wall that preserves the article introduction, a stale sitemap, whitespace in sitemap locations, a success response redirecting to authentication, and unexpected noindex.

A passing audit establishes public response behavior and technical eligibility under those settings. It does not prove Google has crawled or indexed the URLs, reproduce every hosting/CDN rule applied to a verified Googlebot, or replace Search Console URL Inspection. Check the live domain after deployment; a successful local build is not evidence that its pages have been published.

For a browser check against that build, supply an existing Playwright installation and run `BROWSER_QA_PLAYWRIGHT=/path/to/playwright node test/seo/browser-course.cjs`. `BROWSER_QA_ORIGIN` selects the server, and `BROWSER_QA_OUTPUT` selects the screenshot/report directory. The check covers the complete course inventory at 320, 375, 768, 1024, 1060, and 1440 pixels, with and without JavaScript, homepage category navigation, mobile menu bounds, and course-sidebar links. Third-party requests are blocked during this layout review.

`node test/seo/browser-media.cjs` accepts the same environment variables. It checks every recording's direct chapter link, selection, browser-back restoration, clean canonical, and timestamped fallback. It also checks public lesson images for accurate dimensions and proportional scaling at 320 pixels, with selected tablet/desktop screenshots. Player requests are blocked during this review; an assigned iframe start time is not proof of external playback.

## Verify a change

### Programming-language lesson walkthroughs

Optional reading pages use `/course/<lesson>/<language>`. The normal exercise keeps `/course/<lesson>`, including previous/next links, editor language selection, drafts, and completion. Reading or switching walkthrough pages does not set a course preference. An explicit “Practice in Python” action saves that choice in the browser and opens the ordinary exercise URL. If the configured runner cannot execute that language, the page explains the available choices and links to the exercise without forcing an unavailable language.

Publication is controlled by the complete coverage policy and the two composition manifests described above, with the resulting entries in `src/content/lesson-walkthroughs/catalog.json`. Bespoke prose lives in matching `<lesson>/<language>.mdx` files. Write a complete explanation that follows the actual lesson contract and language implementation. Public reading pages do not create a second lesson record or progress model. Existing course access settings remain separate.

Reading pages offer previous/next walkthroughs within the same course topic and programming language. The sequence follows published lesson positions and omits unavailable pages; a topic with only one lesson has no sequence links. These anchors never set the editor preference. Language-specific resource cards keep their ordinary course action and offer a separate matching reading link. Watch pages link to every available written language companion, with copy that distinguishes those examples from the English recording.

Course video panels offer the public watch page when a private playback URL is unavailable. Matching chapter controls then link to the public recording's timestamp; chapters without a playable destination are disabled. Failed lookups settle rather than leaving a permanent loading state, and responses from an earlier lesson cannot replace the current recording. Exercise question/video buttons remain available on mobile. When rendering more than one video loader, give each panel a distinct stable `uniqueKey` so its SVG IDs do not collide.

Run `npm run contentgen:walkthroughs` after editing. The production prebuild runs it automatically. The generator checks publication, language assets, metadata, internal links, headings, examples, and an editorial substance threshold; the threshold is an authoring safeguard, not a Google word-count requirement. It also removes unpublished routes carrying its own generated marker. Each published page gets a self-referencing canonical, an English prose language, the appropriate ComputerLanguage subject, and a breadcrumb back to its exercise. The catalog drives sibling links, lesson links, language-guide cards, sitemap entries, llms.txt, and the anonymous SEO audit. Code-language labels on runnable lessons come from the starter/reference inventory. Other published lessons use their required reading-language inventory, with matching subjects and reading links in initial HTML.

Execute the actual examples with local compilers before publishing:

```bash
npm run test:content:walkthroughs
npm run test:content:walkthroughs -- --java-home /path/to/existing/jdk
npm run test:content:walkthroughs -- --languages javascript typescript python
npm run test:content:walkthroughs -- --java-home /path/to/jdk --kotlinc /path/to/kotlinc --dotnet /path/to/dotnet
```

The default check covers all ten programming languages and requires their existing local compilers: Python, Node/TypeScript, a JDK, C++17, Go, Rust, Kotlin/JVM, Swift, and the .NET 10 SDK. It installs nothing and uses temporary files. Use `--languages` for an explicit subset; a missing requested compiler fails rather than counting as passed. The checker runs every published code block and independent bounded-input comparisons for all-pairs Two Sum, bracket nesting, and products. It includes input preservation where exposed by the API, index zero, numeric boundaries, zeros, Unicode combining marks, ignored text, and deep nesting. TypeScript uses strict indexing checks, C++ uses undefined-behavior sanitization, and Rust enables overflow checks. Compilers are author tools and are not required by the production prebuild.

Two Sum, Valid Brackets, and Product Array each retain ten bespoke walkthroughs. Other published lessons use the reviewed composition sources and complete language policy. Adding an implementation asset alone does not publish a reading page; composition, commentary, coverage, and verification are all required. The footers share grouped navigation, and walkthrough actions use button styling with no underline. Language links remain real anchors and use a predictable grid on mobile.

For browser review, open a walkthrough without JavaScript and check the complete explanation and code. With JavaScript, use a practice link, change the editor language, follow the next lesson, and reload: normal exercise URLs should stay unchanged and the preference should persist. Check that reading another walkthrough does not silently change that preference. A walkthrough's course link must retain the original lesson slug, and no language-specific lesson rows should appear in the curriculum.

The additional language-example check extracts the actual code fences and compiles or executes them with behavioral cases:

```bash
npm run test:content:languages
python3 scripts/check-resource-examples.py --languages python typescript java cpp go rust csharp kotlin swift
```

The npm command defaults to Python and TypeScript, requiring Python 3 and the installed project dependencies. Other languages are explicit opt-ins and require their local compilers. A missing requested compiler fails the check; it is not reported as a pass. Use `--java-home /path/to/jdk`, `--kotlinc /path/to/kotlinc`, and `--dotnet /path/to/dotnet` for compilers outside PATH without changing machine configuration. Kotlin targets JVM 17; C# uses the .NET 10 SDK; Swift uses language mode 6. The .NET check disables telemetry and certificate generation, uses a temporary CLI home, and restores from local SDK packs with package sources cleared. The checker uses temporary build directories and does not install packages or call a course service. Additional behavioral cases live in `test/resource-examples/`. JavaScript queue examples are executed by Jest, including long histories that trigger compaction. This author check is separate from the deployment prebuild, which does not need all of these compilers, test fixtures, or the root scripts directory.

The checks cover Python preparation and collections, every small grid against an independent union-find reference, in-place mutation and aliased rows, strict TypeScript compilation and missing-value behavior, numeric boundaries across languages, Go byte/rune windows against an exhaustive reference, Rust shortest routes against all-pairs distances, C++ search boundaries against scans, and Java stable priorities/top-K against independent ordering. C#, Kotlin, and Swift introduction examples also check presence, traversal, and their value/copy contracts. Add behavioral checks alongside a new published implementation so the article and the checked code cannot drift apart.

```bash
npm run contentgen:resources
npm run check:content
npm run ts
npm test -- --runInBand
npm run build
```

The production build regenerates resources and checks their integrity before compiling. `check:content` checks the published inventory, route references, lesson links, heading policy, draft placeholders, and JavaScript example syntax. Behavioral tests execute selected published code examples against independent cases, including a brute-force DP reference and controlled promise completion order.

For browser review, exercise the actual controls: change timing edges, enter invalid graph JSON, compare a BFS shortest route with a longer DFS discovery path, inspect tree input with missing children, and try large complexity estimates. Build a short study plan, mark a block, reload to check restoration, and download its checklist. Complete a quiz round with a wrong answer and retry only that prompt. Check narrow screens for horizontal page overflow, usable diagrams/tables, and working contents links. Confirm there are no uncaught browser errors or hydration warnings.

Inspect the initial HTML for a guide's title, description, canonical, H1, body, and structured data. Verify an unpublished lesson returns HTTP 404. Check discovery responses and production indexing settings separately from the local development policy.

## Public lesson approaches and language discovery

`src/content/resources/lesson-overviews.json` contains an original public approach, three test prompts, and a cost model for every published runnable exercise. The course renders these in an optional disclosure using the existing exercise URL. Content is included in initial HTML for anonymous visitors; it does not depend on completion or expose the existing restricted solution modules. The content check requires coverage for every published runnable lesson and rejects overviews for drafts.

Every runnable lesson lists its actual starter/reference languages from the generated inventory and links each to its preparation guide. Lesson JSON-LD uses those languages as ComputerLanguage subjects and describes the visible approach through `teaches`. This does not assert that every deployment enables execution in all those languages. The public audit verifies the overview body, subjects, teaching focus, and preparation links over anonymous HTTP.

A resource can use `language` for one programming language or `languages` for a reviewed collection. The cross-language operations reference uses the latter and appears in every matching language path. The schema subjects follow the same catalog data. Programming languages remain subjects of English content rather than human translations or hreflang locales.

## Learning tools and printable references

The library includes pointer, sorting, recursion, and dynamic-programming traces, plus edge-case and complexity reasoning practice, flashcards, and interview rehearsal. Deterministic counters describe the actual modeled operations; they are not elapsed-time benchmarks. Trace histories add memory beyond the algorithms being illustrated. Keep those boundaries explicit when adding another demonstration.

The review deck stores only known card IDs, review levels, and due timestamps in local storage. Corrupt records are discarded. Rehearsal notes remain in the current page's memory until the learner downloads them. No tool state becomes a public route, and neither notes nor review records change course progress.

References have a print action and print styles. The problem-solving worksheet, mock-interview rubric, complexity table, selection guide, and language-operation comparison remain useful HTML without a download form. The study planner and rehearsal create Markdown downloads in the browser.

## Optional learning events

When `GOOGLE_TAG_MANAGER_ID` is configured and a data layer is present, the application can push these events:

| Event | Trigger | Data |
|---|---|---|
| `learning_tool_interaction` | First button interaction on a mounted tool page | Allowlisted resource path |
| `learning_practice_open` | Practice card or walkthrough practice action | Allowlisted source and exercise paths |
| `learning_code_run_requested` | A real code submission is about to be requested | Allowlisted exercise path |
| `learning_rehearsal_started` | A rehearsal starts | Rehearsal page path |
| `learning_rehearsal_completed` | The learner explicitly finishes a rehearsal | Rehearsal page path |

These are optional data-layer messages, not a new analytics service or network client. They contain no code, answers, notes, names, IDs, query strings, or referrers. Unconfigured deployments do nothing. A deployment owns its tag configuration, consent handling, page-view measurement, and downstream reporting. A requested run is not a successful run; an interaction is not course completion. Timer expiry is visible to the learner but does not emit the explicit-finish event.

To use the events, create a custom-event trigger for each desired event in the deployment's GTM container. Map `learning_page` and, where present, `learning_target` as data-layer variables. Validate in the container's preview mode before publishing its configuration. Compare relevant organic landing-page cohorts with practice opens and run requests; do not count every control click as a conversion. This repository change does not configure or publish a GTM container. See [Google's data-layer documentation](https://developers.google.com/tag-platform/tag-manager/datalayer).

## Continuous public checks

CI runs the audit's Python tests and checks the locally built app with `--expect-noindex`, preserving preview crawl blocking. The `Public SEO audit` GitHub Actions workflow also supports a manual public origin. It needs no database or account credential and uploads the JSON report even when a check fails.

A weekly run is enabled only when the repository has a `PUBLIC_SITE_URL` Actions variable. Forks choose their own target; no official-site URL is inherited. Configure that variable after the intended build has been deployed. The audit compares the current checkout with the deployment, so a newer main branch can correctly report publication differences until deployment catches up.

A passing run proves the checked public responses, not Google indexing or a search-traffic outcome. Use [Operating a Public Learning Site](./seo-operations.md) for Search Console inspection and longitudinal measurement. Operators should review meaningful query changes, broken links, field performance, and content accuracy over time rather than treating a green build as the end of maintenance.
