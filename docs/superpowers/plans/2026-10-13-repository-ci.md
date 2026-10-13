# Orbit repository and CI implementation plan

**Goal:** Connect the existing website to `Synapsekw/Orbit_Web` and prepare a tested pull request for manual review and merging.

**Architecture:** The remote is empty and public. Create an empty baseline commit on `main`, then import the working site on `codex/orbit-website`. CI runs without provider credentials; Netlify production activation remains a separate deployment step.

**Constraints:** Preserve the running local site and private configuration. Never commit credentials, local test data, source captures or dependencies. Do not merge the pull request or enable automatic merging. Keep required build assets and their attribution.

- [ ] Initialise Git locally, connect the supplied remote, and create an empty baseline for comparison.
- [ ] Exclude local artifacts, inspect staged file sizes and scan staged contents for private values before publishing.
- [ ] Add pinned GitHub Actions for Node 24 install, build, tests, repository scan and public-output scan; add a concise PR template and contributor instructions.
- [ ] Verify the build and tests from the import; push the branch and create the initial website/CI pull request.
- [ ] Inspect GitHub CI results and fix failures. Protect `main` with pull requests and required passing checks; leave all merges manual.
- [ ] Attach the pull request to this chat and report its status and review link.

Review focus: clean clone completeness, cross-platform filenames, secret exclusion, large asset limits, and CI completing without OpenAI/Grok credentials. A solo repository owner authors the PR through the configured account, so protection should require a PR and green checks without requiring an impossible self-approval.
