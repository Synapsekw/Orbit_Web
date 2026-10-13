# Changes and manual review

Use Node.js 24 and install dependencies with `npm ci`. Create a feature branch from current `main`, make the change, and open a pull request. The owner reviews and merges manually. Do not enable auto-merge or push application changes directly to `main`.

Before opening a pull request:

```sh
npm run build
npm test
npm run check:public
git add <the changed files>
npm run check:repo
```

`check:repo` inspects the Git index, including the actual staged contents, for excluded private paths, oversized assets and common credential patterns. It supplements review; it cannot recognise every possible secret. On the owner's workstation, `node --env-file=.env.local scripts/check-repository.mjs` also checks for the exact configured private values without displaying them.

GitHub Actions runs the `Website validation` check on pull requests and on `main`. It uses Node 24, the lockfile, the build and complete Node test suite, and both repository/public-output checks. CI has read-only repository permission and no OpenAI or Grok credentials. Backend tests use an isolated database and simulated providers. Live provider tests are local and deliberately separate.

Keep `.env.local`, `.local/`, captured source assets and test visitor data on the workstation. Optimised public assets and their provenance belong in Git. Update article Markdown in `content/journal/`; build regenerates the static pages. Public deployment and Netlify secrets are described in `NETLIFY-SETUP.md` and are not activated by the CI workflow itself.

The repository owner currently creates PRs using the same GitHub account that performs the final review. GitHub does not allow authors to approve their own PRs, so `main` protection requires a pull request and the passing validation check, without requiring another approving account. Manual merging remains an explicit owner action.
