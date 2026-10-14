# CLAUDE.md - Working agreement for agents

Guidance for any AI agent (and human) working in **MentalHealthCharity-front-v2**,
the Fundacja Peryskop front-end. It is a mental-health support site, so hold a
high bar: careful, legible, accessible code, written with _utmost care_.

The app is **React 18 + Vite 5 + TypeScript**, styled with the
**[`@fundacja-peryskop/ui`](https://github.com/fundacja-peryskop) (Tamagui)**
design system (DS), alongside Tailwind in legacy areas that are still being
migrated. Code, comments and identifiers are **English**; all user-facing copy
is **localised** (never hardcoded).

---

## The non-negotiables

### 1. Use the design system's tokens and themes - always

Never hardcode colors, spacing, radii, typography or shadows. Pull everything
from `@fundacja-peryskop/ui`:

- **Spacing:** `$xs $sm $md $lg $xl $xxl $xxxl` (4 · 8 · 12 · 16 · 24 · 32 · 48).
- **Radius:** `$sm $md $lg $full`.
- **Semantic colors (prefer these):** `$primary $primarySoft $danger $dangerSoft
$success $successSoft $secondary $secondarySoft $color $colorMuted
$background $backgroundHover $borderColor` … They adapt to theme/re-branding,
  so reach for them first.
- **Raw palette tokens** (`$secondaryLight`, `$redLighter`, `$primaryLightest`, …)
  exist for one-off decorative art only. Use them deliberately, not as a shortcut
  around a missing semantic token.
- **Shadows:** `shadows.small` etc. **Theme access:** `useTheme()`.
- **Icon colors:** resolve lucide icon colors from tokens with
  `useIconColor()` - don't pass raw hex to icons.

No inline hex, no magic pixel values where a token fits.

### 2. Build from DS components - and grow the DS when something's missing

Before writing a bespoke component, check the DS: `Typography`, `Stack /
XStack / YStack / ZStack`, `Section`, `Input`, `Select`, `List / ListItem`,
`Button`, `Badge`, `Avatar`, `Person`, `Article`, … Compose these.

If a primitive is genuinely missing:

1. **First ask whether it belongs in `@fundacja-peryskop/ui`.** If it is reusable
   (a button variant, a field, a card), add it to the DS library so every app
   benefits - don't fork a private copy here.
2. If it is truly app-specific, keep it local but still built from DS tokens and
   primitives. Shared app-level primitives live in
   [`src/modules/layout/`](src/modules/layout) (e.g. `admin.tsx`, `PageContainer`,
   `CtaButton`) - reuse and extend those rather than reinventing.

A new one-off `<div style={{…}}>` with hardcoded styling is almost always the
wrong answer.

### 3. Every user-facing string goes through i18n - no exceptions

Hardcoded display copy is not acceptable (that includes `aria-label`s and
placeholder text).

- Translations live in [`src/locales/pl.json`](src/locales/pl.json) and
  [`src/locales/en.json`](src/locales/en.json). **Polish (`pl`) is the source of
  truth**; English must stay in sync.
- Read strings with `const { t } = useTranslation();` then `t("namespace.some.key")`.
  Keys are nested dotted paths (e.g. `t("homepage.steps.step1.title")`,
  `t("admin.reports.title")`); arrays are indexed (`t("…cards.0.title")`).
  Interpolate with `t("key", { user: name })`.
- **Content/config files hold keys, not copy.** See
  [`src/modules/homepage/content.ts`](src/modules/homepage/content.ts): it
  describes structure (tones, routes, ids, i18n keys); the component resolves the
  keys with `t()`. Mirror this pattern.
- When you add a key, add it to **both** locales. Empty strings are allowed only
  when a flow intentionally suppresses the text.
- **Gender-neutral copy.** Avoid gendered Polish forms (no `wróciłeś`/`wróciłaś`,
  `zrobiłeś`/`zrobiłaś`, `zalogowany`/`zalogowana`, etc.) - phrase so the text
  reads the same for everyone (e.g. "Miło znów Cię widzieć", "Dziękujemy za
  zaufanie"). The same applies to gendered wording in any other language.
- **Hyphens, not dashes.** Use a short hyphen `-` everywhere - in copy, comments
  and identifiers alike. Never use the long em-dash `—` or en-dash `–`.

### 4. Verify before you call it done

Run, and make green, the checks that apply to your change:

```bash
npm run typecheck     # tsc --noEmit (0 errors)
npm run lint          # eslint . (clean)
npm run i18n:check     # locales consistent - no orphan keys
npm run build         # tsc -b && vite build (production build passes)
```

- When you **add or change translations**, also run the i18n parser in strict
  mode so your new keys exist in every locale:

    ```bash
    npm run i18n:check:strict
    ```

    The strict run fails on any key present in `pl` but missing from `en` (and
    vice-versa). The default `i18n:check` reports the known legacy coverage gap as
    warnings but only **fails on orphans** (keys in `en` with no `pl` source), so
    it stays green for unrelated work - your job is to not add new gaps.

- **Tests:** there is no unit-test runner wired up yet. If you add non-trivial
  logic, set one up (or add tests when a runner exists) and run it. Don't claim
  "tests pass" when none ran - report honestly what you verified.
- **Previewable UI:** verify in the browser (`npm run dev`, port 3000) - check
  the console for errors and the layout at desktop **and** mobile widths. The
  homepage (`/`) is public; most other screens are auth-gated and the production
  API blocks CORS from localhost, so those are verified via typecheck/lint/build
  rather than live data.

The pre-commit hook (`husky` + `lint-staged`) runs `prettier --write` and
`eslint --fix` on staged files, so keep formatting prettier-clean (LF endings,
4-space indent, 120 col).

---

## Architecture & conventions

- **Layout of the code**

    - `src/screens/*` - one screen per route (thin; compose modules).
    - `src/modules/<feature>/*` - feature code (components, queries, types, content).
    - `src/modules/layout/*` - shared app chrome and DS-based primitives.
    - `src/modules/shared/*` - cross-cutting helpers and still-Tailwind legacy bits.
    - **Routing** is centralised in
      [`src/modules/shared/routes.tsx`](src/modules/shared/routes.tsx)
      (`{ url, onRender, requiresAuth, permission, roles }`). Add routes there.

- **Responsive - mind the media quirk.** The DS media breakpoints are max-width
  (`$sm` ≤ 800px, `$md` ≤ 1020px, …) **but they resolve unreliably for layout in
  this app**: because several breakpoints are marked default-active, a narrower
  override such as `$sm={{ width: "48%" }}` tends to win at _every_ width (e.g. an
  article grid meant to be 3-up stays 2-up even at 1440px). **Do not rely on
  `$sm`/`$md` props for something that must change across widths - verify it in
  the browser at several widths.** For a layout that must flip reliably (column
  counts, show/hide), prefer an explicit **min-width** rule via a small scoped
  `<style>` block - see `ArticlesSection` (CSS grid: 1 → 2 → 3 columns) and
  `HowItWorks` (full-bleed carousel). Always test desktop **and** mobile.

- **No Tamagui compiler.** It runs at runtime, so:

    - Pass explicit semantic tags: `<Typography tag="h2">`, `tag="button"`, etc.
      HTML semantics are not inferred.
    - Long paragraphs that must wrap need `width="100%"` on the `Typography`.
    - Decorative elements get `aria-hidden`; images get real `alt` (or `alt=""` +
      `aria-hidden` when decorative).

- **Data layer:** `@tanstack/react-query` (`useQuery` / `useMutation` /
  `useInfiniteQuery`) with colocated `queryOptions`. Forms use Formik; toasts via
  `react-hot-toast`. Respect the rules of hooks - never call a hook inside a loop
  or condition (extract a child component instead).

- **State of the migration:** the homepage, auth and admin areas are on the DS.
  Deep, stateful Tailwind components (rich article editor, data tables, realtime
  chat, users admin, some modals) are tracked in
  [`docs/agents/homescreen_redesign_task/task.md`](docs/agents/homescreen_redesign_task/task.md).
  Keep that changelog updated as you migrate.

- **Commits:** work on a feature branch, commit in small logical chunks, and
  only commit/push when asked. Follow any attribution trailer the task specifies.

---

## Quick checklist for a UI change

1. Built from DS components; missing primitive → consider contributing it to
   `@fundacja-peryskop/ui`.
2. Colors/spacing/radii/typography from DS tokens (semantic first).
3. Every string via `t(...)`, keys added to **both** `pl` and `en`.
4. Semantic `tag`s, `aria-*`, `alt`; responsive checked at desktop **and** mobile.
5. `npm run typecheck && npm run lint && npm run i18n:check:strict` green; build
   passes; previewable UI verified in-browser.
6. Task changelog updated when relevant.
