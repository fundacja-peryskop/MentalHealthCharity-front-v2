# Homepage Redesign — Implementation Status

Live status log for migrating the MHC marketing homepage onto the
`@fundacja-peryskop/ui` (PeryskopUI) design system.

- **Branch:** `redesign/homepage-peryskop-ui`
- **Spec:** [`peryskop-homepage-implementation-spec.md`](./peryskop-homepage-implementation-spec.md)
- **Research:** [`research-notes.md`](./research-notes.md)
- **Legend:** ✅ done · 🔄 in progress · ⬜ todo · ⚠️ blocked / needs input

---

## Phase 0 — Research & docs
- ✅ Explore PeryskopUI (DS API, tokens, components)
- ✅ Explore MHC frontend (app shell, routing, homepage, assets, toolchain)
- ✅ Write `research-notes.md`
- ✅ Create redesign branch `redesign/homepage-peryskop-ui`
- ✅ Create this status log

## Phase 1 — Wire up PeryskopUI (foundation) ✅
- ✅ Add `@fundacja-peryskop` scope + `legacy-peer-deps=true` to `.npmrc`
- ✅ Install `@fundacja-peryskop/ui@0.1.0` + `tamagui@1.144.4` + `@tamagui/vite-plugin` + `react-native-web`
- ✅ Add Tamagui plugin to `vite.config.ts`
- ✅ Wrap app tree with `PeryskopProvider` (in `main.tsx`)
- ✅ Load Sarabun font in `index.html`
- ✅ Smoke test (dev): DS `Button`/`Typography`/`Section` render with correct tokens + Sarabun; Vite 5 + Tamagui plugin OK
- ✅ Production `vite build` passes (`✓ built in ~14s`; Tamagui extraction OK on Vite 5)

## Phase 2 — Homepage sections (per spec §4/§6) ✅
Composed as thin orchestration in `src/modules/homepage/`; one file per section; data-driven
from `content.ts`; DS tokens only. `HomepageScreen` renders `<HomePage />`.
- ✅ Utility / announcement bar (§4.1) — `AnnouncementBar` (`<aside>`, `$primary` strip)
- ✅ Header / navigation (§4.2) — `SiteHeader`, desktop nav + mobile toggle panel; signed-in
  visitors get a "Moje konto" CTA
- ✅ Hero (§4.3) — single `<h1>`, muted subheading
- ✅ Dual CTA cards (§4.4) — one reusable `PitchCard` ×2 (danger/primary tones)
- ✅ Topics grid (§4.5) — data-driven `<ul>`/`<li>` of 6 pill rows with `TopicIcon`
- ✅ How-it-works carousel (§4.6 / §7) — from-scratch `Carousel`, scroll-snap, keyboard + swipe,
  reduced-motion, N slides (3 real steps)
- ✅ Articles grid (§4.7) — DS `Article`/`Badge`/`Person`, real API data (`articlesQueryOptions`)
- ✅ Footer (§4.8) — `SiteFooter` (`<footer>`, `$inkDarkest`), real footer content

## Phase 3 — Custom assets (§8) ✅
- ✅ Illustration wrappers over existing PNGs: `PersonWithBubblesIllustration`, `ChatWindowMockup`,
  `EmptyChairIllustration` (shared `IllustrationImage`)
- ✅ Six topic "paint-stroke" icons — `TopicIcon` (inline SVG, per-topic colour, `aria-hidden`)
- ✅ Circular arrow affordance — `CircleArrowButton` (decorative, `aria-hidden`)

## Phase 4 — Polish & acceptance (spec §11) ✅
- ✅ Responsive pass — verified at 375px (header→hamburger, cards stack, 1-col grids, no h-overflow)
- ✅ a11y — single `<h1>`, `aside`/`header`/`main`/`footer` landmarks, alt text, `aria-hidden` on
  decorative art, focus-visible on carousel/dots, `aria-current` active dot, `aria-expanded` menu
- ✅ Real article data (no placeholder copy); articles section hides itself when empty
- ✅ All design values from DS tokens (verified computed colours match tokens)
- ✅ Typecheck clean (0 errors) · homepage lint clean · production `vite build` passes

---

## Open questions (spec §9) — resolved from existing app content
1. **Footer content** — the app already had a real footer; mirrored it (nav / help / contact /
   socials / copyright). _Confirm with design owner if the new footer should differ._
2. **Carousel steps** — the real intake flow is **3 steps** (from `homepage.how_it_works`), not the
   5 dots in the reference. Used the 3 real steps. _Confirm copy._
3. **Carousel arrows** — shipped dots + swipe + keyboard, no visible arrows (matches reference).
4. **Article data** — wired to the real public-articles API (unreachable from localhost via CORS,
   so the section renders empty in local dev; works against the deployed API).

## Decisions log
- Keep Tailwind for the rest of the app; add Tamagui alongside and rebuild only the homepage.
- Unify brand teal on DS `$primary` (`#06b7a7`), replacing MHC's `#0da69e`.
- Coral/red CTA = Button `variant="danger"`; teal CTA = `variant="primary"`; pill = `borderRadius="$full"`.
- Install the published GitHub Packages build (auth OK); no local fallback needed.
- `legacy-peer-deps=true` required in `.npmrc` (optional native peer). `.npmrc` is gitignored, so
  teammates/CI must add the same line to their own `.npmrc` alongside their GitHub token.
- **`@types/react-native` (devDep) is required**: `@tamagui/web` sources `ViewStyle` from
  `react-native`; without it, newer style props (`gap`) are missing from Tamagui prop types.
- **App-level Tamagui augmentation** (`src/tamagui-env.d.ts`) registers the DS config so custom
  tokens and media queries type-check.
- **Config media is min-width / mobile-first** (`$sm`≥640, `$md`≥768, `$maxMd`≤768); there is **no
  `$gtMd`**. Responsive props use `$sm`/`$md`.
- Semantic HTML: pass explicit `tag` props on `Typography` + use `Layout` landmarks (compiler off).
- **Global chrome suppressed on `/`**: `Layout` hides `CrisisBar`/`Footer` and `Navbar` self-hides
  on the homepage, so `HomePage` owns the full announcement→header→…→footer composition. _Trade-off:
  signed-in users see the marketing header (with a "Moje konto" CTA) instead of the full app nav
  (theme toggle, admin/volunteer menus) on `/` only — flag for follow-up if undesired._

## Migration gotchas (learned)
- **Long body text in a flex column overflows**: a DS `Typography` (react-native-web `Text`) sized
  by min-content refuses to wrap and widens its flex-column parent past the container. Fix: put
  `width="100%"` on the long-text `Typography` and its wrapping `YStack`. Apply to any paragraph-heavy view.
- DS `Input` forwards layout props to its inner field, not its wrapper — to stretch it in a row,
  wrap it in a `YStack flex={1}` (stretch fills width).

## Known issues to report upstream (PeryskopUI)
- DS `Button` spreads non-DOM appearance keys (`hoverBackgroundColor`, `pressBackgroundColor`) onto
  the `<button>`, producing a React "unknown prop" console warning on every Button. Harmless but noisy.

## Follow-ups / not in scope
- `<header>`/`<footer>` render inside the app's `<main>` (Layout wraps children in `main`); minor
  landmark nesting nit — improve by lifting the homepage chrome out of `main` if desired.
- Migrate homepage copy from `content.ts` to i18n if the app should keep one content source.

---

# Phase 5 — App-wide migration (in progress)

Extend the DS beyond the homepage, one view at a time. The shared DS foundation lives in
`src/modules/layout/`: `PageContainer`, `AppLink`, `CtaButton`, `useIconColor`, `content.brand`,
`AuthShell`, and Formik fields `form/FormTextField` + `form/FormCheckboxField` (reused by every
migrated form). App views reuse the app's existing i18n (`react-i18next`) rather than a local
content file.

**Done:**
- ✅ Extracted the shared `layout` module (helpers moved out of `homepage`).
- ✅ DS Formik fields: `FormTextField`, `FormCheckboxField`.
- ✅ `NotFoundScreen` — DS (also removed a double-`Layout` wrap bug).
- ✅ Auth: `LoginScreen` + `RegisterScreen` + their forms, via a shared branded `AuthShell`.
  Verified: fields render, formik validation fires (required errors), native submit works.

**Done (cont.):**
- ✅ Password flows: `ForgetPasswordScreen`, `ChangePasswordScreen` (+ email-sent), `ChangePasswordCompleteScreen`
  (+ `ChangePasswordFormBegin` / `ChangePasswordFormComplete`); email confirm: `ConfirmEmailScreen`,
  `ConfirmEmailCompleteScreen` (via `InfoScreen`).
- ✅ Articles list (`ArticlesScreen`) + shared `articles/components/DsArticleCard` + `ArticlesHeading` (DS search).
- ✅ Static: `AboutChatScreen`, `TosScreen`.
- ✅ Article detail (`ArticleView`) — DS hero/meta/related; keeps Markdown + Videoplayer body.
- ✅ `DonationsScreen` — full marketing page (hero, mission, goals grid, how-we-work, donate CTA).
- ✅ DS Formik fields `FormTextareaField` + `FormSelectField` (unblock intake forms).
- ✅ `MenteeFormGettingStartedScreen` — DS content landing page.
- ✅ **Intake forms**: `MenteeForm` (5-step) + `VolunteerForm` (7-step) + shared `FormWrapper`
  (DS card + framer-motion progress + step-keyed slide). Verified wizards end-to-end.

**Roadmap (priority order):**
- ⬜ `SupportUsScreen` (external iframe widget + share/copy).
- ⬜ `LeavingScreen` — security-critical external-link interstitial (multiple states); careful pass.
- ⬜ `ProfileScreen`.
- ⬜ Authenticated features: Chat, Dashboards & admin (`Manage*`, `Matching*`, Reports, Users) — large; last.
- ⬜ **Chrome unification** (global DS header/footer/announcement) — dedicated, higher-risk pass;
  the `Navbar` carries auth/permissions/dropdowns/drawer/theme/chat logic. Until then, migrated
  non-home views keep the existing global chrome (DS body sandwiched in the Tailwind chrome).

## Changelog
- _(setup)_ Branch `redesign/homepage-peryskop-ui` created; research notes + status log added.
- _(commit a2b2796)_ Wired `@fundacja-peryskop/ui` (Tamagui) into MHC: `.npmrc` scope +
  `legacy-peer-deps`, installed library + `tamagui` + `@tamagui/vite-plugin` + `react-native-web`,
  added Tamagui Vite plugin, `PeryskopProvider` at root, Sarabun font.
- _(commit 1d7192f)_ Built the full DS homepage (`src/modules/homepage/*`), added
  `@types/react-native` + `src/tamagui-env.d.ts`, suppressed global chrome on `/`. Typecheck +
  lint + prod build green; verified in-browser (tokens, semantics, responsive, carousel, mobile menu).
- _(push)_ Pushed `redesign/homepage-peryskop-ui` to origin. Final verifications: articles grid
  renders correctly with data (DS `Article`/`Badge`/`Person`/`Avatar`, banner + initials fallback);
  all illustration PNGs load; exactly one `header`/`footer`/`aside`/`main`/`h1` (no duplicate chrome).
- _(phase 5)_ Extracted shared `layout` module; added DS Formik fields + `AuthShell`; migrated
  `NotFoundScreen`, `LoginScreen`, `RegisterScreen` (+ forms) to the DS. Typecheck 0 errors,
  lint clean; verified in-browser.
