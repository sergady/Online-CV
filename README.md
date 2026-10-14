# Sergio García Díaz — Online CV

A multilingual professional CV built with Astro. English is the default; Spanish
and French have separate URLs. Content is independent of layout and CSS.

## Status

Publication is enabled. The CV includes the visible career facts from the supplied
LinkedIn PDF and your requested degree labels and public email. Three blank
responsibility slots per role and editable study descriptions are ready for
updates. Empty slots are hidden on the website and in the PDFs.

To preview future unfinished changes without deployment, set `publishReady: false`.
A valid draft build passes CI and skips deployment; invalid content still fails.

## Editing content

Edit content files in GitHub's web editor, proposing a branch and pull request.

- `content/profile.yaml`: name, public contact links, shared dates, company names,
  official degree titles, universities, and stable entry IDs.
- `content/locales/en.yaml`, `es.yaml`, `fr.yaml`: summaries, skills, translated
  role titles and achievements, degree descriptions, and UI labels.
- `src/components` and `src/styles`: presentation only.

Experience entries require `id`, `company`, `start`, and `end`. Dates are quoted
`YYYY` or `YYYY-MM`; `end: null` means current. Each language file must contain
that ID with a `role` and an `achievements` list (three blank strings are provided; fill them with responsibilities or achievements, and leave unused slots blank). Degree entries require `id`,
`university`, `officialTitle`, `start`, and `end`, plus a matching localized
`description` (which may be empty). Preserve official degree titles exactly.

```yaml
skills:
  - group: A skill category
    items:
      - A verified skill
```

The build rejects malformed content, invalid dates, duplicate IDs, and missing or
unexpected translation IDs. Review all languages after changes; translations do
not update automatically. PDFs regenerate from the same content every build.

All committed content is public, including Git history. GitHub permissions protect
editing. LinkedIn is a profile link and a manual source for supplied exports/text.

## Local development

Use Node.js 24 and pnpm 11.25.0:

```sh
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Open `http://127.0.0.1:4321/Online-CV/`. Verification commands:

```sh
pnpm check
pnpm test
pnpm build
pnpm test:browser
```

The build generates HTML and three selectable-text A4 PDFs. Chromium is required
for PDF generation. Browser checks cover direct language URLs, accessibility,
mobile overflow, PDF downloads, and navigation without JavaScript.

## Publishing

1. Populate your career details and review all three versions.
2. Set `publishReady: true` in `content/profile.yaml`.
3. In repository Settings → Pages, select GitHub Actions as the source.
4. Merge reviewed changes to `main`.

Successful checks deploy to `https://sergady.github.io/Online-CV/`. Incomplete
content prevents deployment. Pull requests provide a downloadable `cv-preview`
artifact rather than a hosted preview URL. Verify all live language pages and
PDF downloads after launch. Revert a faulty commit and merge the revert to `main`
to rebuild the previous working content.

## Agent guidance

Root `AGENTS.md` and `.agents/skills/critique/SKILL.md` were copied from
`sergady/AI-files`, source commit `d3bb876`. Run the staged-change critique before
committing. This is an agent workflow, not an installed Git hook.
