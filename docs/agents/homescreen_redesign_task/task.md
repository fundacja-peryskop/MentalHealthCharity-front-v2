# Homepage Redesign - Implementation Status

Live status log for migrating the MHC marketing homepage onto the
`@fundacja-peryskop/ui` (PeryskopUI) design system.

- **Branch:** `redesign/homepage-peryskop-ui`
- **Spec:** [`peryskop-homepage-implementation-spec.md`](./peryskop-homepage-implementation-spec.md)
- **Research:** [`research-notes.md`](./research-notes.md)
- **Legend:** ✅ done · 🔄 in progress · ⬜ todo · ⚠️ blocked / needs input

---

## Phase 0 - Research & docs
- ✅ Explore PeryskopUI (DS API, tokens, components)
- ✅ Explore MHC frontend (app shell, routing, homepage, assets, toolchain)
- ✅ Write `research-notes.md`
- ✅ Create redesign branch `redesign/homepage-peryskop-ui`
- ✅ Create this status log

## Phase 1 - Wire up PeryskopUI (foundation) ✅
- ✅ Add `@fundacja-peryskop` scope + `legacy-peer-deps=true` to `.npmrc`
- ✅ Install `@fundacja-peryskop/ui@0.1.0` + `tamagui@1.144.4` + `@tamagui/vite-plugin` + `react-native-web`
- ✅ Add Tamagui plugin to `vite.config.ts`
- ✅ Wrap app tree with `PeryskopProvider` (in `main.tsx`)
- ✅ Load Sarabun font in `index.html`
- ✅ Smoke test (dev): DS `Button`/`Typography`/`Section` render with correct tokens + Sarabun; Vite 5 + Tamagui plugin OK
- ✅ Production `vite build` passes (`✓ built in ~14s`; Tamagui extraction OK on Vite 5)

## Phase 2 - Homepage sections (per spec §4/§6) ✅
Composed as thin orchestration in `src/modules/homepage/`; one file per section; data-driven
from `content.ts`; DS tokens only. `HomepageScreen` renders `<HomePage />`.
- ✅ Utility / announcement bar (§4.1) - `AnnouncementBar` (`<aside>`, `$primary` strip)
- ✅ Header / navigation (§4.2) - `SiteHeader`, desktop nav + mobile toggle panel; signed-in
  visitors get a "Moje konto" CTA
- ✅ Hero (§4.3) - single `<h1>`, muted subheading
- ✅ Dual CTA cards (§4.4) - one reusable `PitchCard` ×2 (danger/primary tones)
- ✅ Topics grid (§4.5) - data-driven `<ul>`/`<li>` of 6 pill rows with `TopicIcon`
- ✅ How-it-works carousel (§4.6 / §7) - from-scratch `Carousel`, scroll-snap, keyboard + swipe,
  reduced-motion, N slides (3 real steps)
- ✅ Articles grid (§4.7) - DS `Article`/`Badge`/`Person`, real API data (`articlesQueryOptions`)
- ✅ Footer (§4.8) - `SiteFooter` (`<footer>`, `$inkDarkest`), real footer content

## Phase 3 - Custom assets (§8) ✅
- ✅ Illustration wrappers over existing PNGs: `PersonWithBubblesIllustration`, `ChatWindowMockup`,
  `EmptyChairIllustration` (shared `IllustrationImage`)
- ✅ Six topic "paint-stroke" icons - `TopicIcon` (inline SVG, per-topic colour, `aria-hidden`)
- ✅ Circular arrow affordance - `CircleArrowButton` (decorative, `aria-hidden`)

## Phase 4 - Polish & acceptance (spec §11) ✅
- ✅ Responsive pass - verified at 375px (header→hamburger, cards stack, 1-col grids, no h-overflow)
- ✅ a11y - single `<h1>`, `aside`/`header`/`main`/`footer` landmarks, alt text, `aria-hidden` on
  decorative art, focus-visible on carousel/dots, `aria-current` active dot, `aria-expanded` menu
- ✅ Real article data (no placeholder copy); articles section hides itself when empty
- ✅ All design values from DS tokens (verified computed colours match tokens)
- ✅ Typecheck clean (0 errors) · homepage lint clean · production `vite build` passes

---

## Open questions (spec §9) - resolved from existing app content
1. **Footer content** - the app already had a real footer; mirrored it (nav / help / contact /
   socials / copyright). _Confirm with design owner if the new footer should differ._
2. **Carousel steps** - the real intake flow is **3 steps** (from `homepage.how_it_works`), not the
   5 dots in the reference. Used the 3 real steps. _Confirm copy._
3. **Carousel arrows** - shipped dots + swipe + keyboard, no visible arrows (matches reference).
4. **Article data** - wired to the real public-articles API (unreachable from localhost via CORS,
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
  (theme toggle, admin/volunteer menus) on `/` only - flag for follow-up if undesired._

## Migration gotchas (learned)
- **Long body text in a flex column overflows**: a DS `Typography` (react-native-web `Text`) sized
  by min-content refuses to wrap and widens its flex-column parent past the container. Fix: put
  `width="100%"` on the long-text `Typography` and its wrapping `YStack`. Apply to any paragraph-heavy view.
- DS `Input` forwards layout props to its inner field, not its wrapper - to stretch it in a row,
  wrap it in a `YStack flex={1}` (stretch fills width).

## Known issues to report upstream (PeryskopUI)
- DS `Button` spreads non-DOM appearance keys (`hoverBackgroundColor`, `pressBackgroundColor`) onto
  the `<button>`, producing a React "unknown prop" console warning on every Button. Harmless but noisy.

## Follow-ups / not in scope
- `<header>`/`<footer>` render inside the app's `<main>` (Layout wraps children in `main`); minor
  landmark nesting nit - improve by lifting the homepage chrome out of `main` if desired.
- Migrate homepage copy from `content.ts` to i18n if the app should keep one content source.

---

# Phase 5 - App-wide migration (in progress)

Extend the DS beyond the homepage, one view at a time. The shared DS foundation lives in
`src/modules/layout/`: `PageContainer`, `AppLink`, `CtaButton`, `useIconColor`, `content.brand`,
`AuthShell`, and Formik fields `form/FormTextField` + `form/FormCheckboxField` (reused by every
migrated form). App views reuse the app's existing i18n (`react-i18next`) rather than a local
content file.

**Done:**
- ✅ Extracted the shared `layout` module (helpers moved out of `homepage`).
- ✅ DS Formik fields: `FormTextField`, `FormCheckboxField`.
- ✅ `NotFoundScreen` - DS (also removed a double-`Layout` wrap bug).
- ✅ Auth: `LoginScreen` + `RegisterScreen` + their forms, via a shared branded `AuthShell`.
  Verified: fields render, formik validation fires (required errors), native submit works.

**Done (cont.):**
- ✅ Password flows: `ForgetPasswordScreen`, `ChangePasswordScreen` (+ email-sent), `ChangePasswordCompleteScreen`
  (+ `ChangePasswordFormBegin` / `ChangePasswordFormComplete`); email confirm: `ConfirmEmailScreen`,
  `ConfirmEmailCompleteScreen` (via `InfoScreen`).
- ✅ Articles list (`ArticlesScreen`) + shared `articles/components/DsArticleCard` + `ArticlesHeading` (DS search).
- ✅ Static: `AboutChatScreen`, `TosScreen`.
- ✅ Article detail (`ArticleView`) - DS hero/meta/related; keeps Markdown + Videoplayer body.
- ✅ `DonationsScreen` - full marketing page (hero, mission, goals grid, how-we-work, donate CTA).
- ✅ DS Formik fields `FormTextareaField` + `FormSelectField` (unblock intake forms).
- ✅ `MenteeFormGettingStartedScreen` - DS content landing page.
- ✅ **Intake forms**: `MenteeForm` (5-step) + `VolunteerForm` (7-step) + shared `FormWrapper`
  (DS card + framer-motion progress + step-keyed slide). Verified wizards end-to-end.
- ✅ `LeavingScreen` - external-link safety interstitial (invalid / blocked / donation / normal),
  restyled to clean DS with all safety logic intact (blocked links offer no "proceed"). Verified.
- ✅ `SupportUsScreen` - clean DS layout (heading, pomagam widget, share + bank-transfer cards).
- ✅ `ProfileScreen` + sub-components (`Profile` heading, `UserProfileArticles` → DsArticleCard,
  `UserProfileDescription`) and the shared `SimpleCard` → minimalist DS surfaces.
- ✅ **Global chrome unification**: DS `AppHeader` (auth/permission-aware, **sticky**, theme toggle,
  account + logout / Dołącz, mobile drawer, chat unread dot) + global DS `AnnouncementBar` +
  `SiteFooter`, wired in `Layout` for all non-admin/non-chat routes. Removed the old Tailwind
  `Navbar`/`CrisisBar`/`Footer` and the homepage-only chrome. Verified: one sticky header everywhere,
  sticks on scroll, no double chrome, prod build green.

**Done (admin area):**
- ✅ Shared DS admin primitives in `src/modules/layout/admin.tsx`: `AdminPageHeader`,
  `FilterPills`, `StatusPill`, `PillButton`, `DataTable` (scrollable flex-grid table on DS tokens).
- ✅ `TrainingsScreen` - DS resource grid.
- ✅ Admin `Dashboard` - DS metric cards, action list, matching summary + capacity bar,
  alerts/reports/forms panels (all query/compute logic preserved; `useIconColor` gained `success`).
- ✅ Matching screens: `MatchingMenteesScreen` (+ DS paused-decision modal content),
  `MatchingVolunteersScreen`, `MatchingAlertsScreen`, `MatchingUserHistoryScreen` - all on `DataTable`.
- ✅ `ManageMenteeFormsScreen`, `ManageVolunteerFormsScreen`, `ManageArticlesScreen` - DS header +
  `FilterPills` + DS `Select` toolbars (data tables themselves left intact).
- ✅ `ReportsScreen` + `ReportItem` - DS card + DS modal content (fixed a no-op modal Cancel button).
- ✅ `AdminSettingsScreen` - DS toggle switch + DS number inputs.
- ✅ `VolunteerAvailabilityScreen` - DS metric tiles, `Select`, alert boxes.
- ✅ `ManageChatsScreen` - DS header/search/`FilterPills` (chat list + modals unchanged).
- ✅ `ArticlesDashboardScreen` - DS layout; also fixed a rules-of-hooks violation (per-status
  `useQuery` extracted into `ArticleStatusSection` instead of being called inside a `.map()`).

**Remaining (deep shared components - Tailwind bodies, large & data-heavy):**
- ⬜ Rich editor host: `ArticleEditor` (+ thin `CreateArticleScreen`/`EditArticleScreen` wrappers),
  `ArticleCard`, `ArticlesManager`.
- ⬜ Data tables: `MenteeFormsTable`, `FormsTable`.
- ⬜ Real-time chat: `ChatWindow`, `ChatManager`, `ChatScreen`, `ChatInfoModal`.
- ⬜ Users admin: `UserEditorScreen` → `UsersList`, `EditUserModal`, `SearchUser`.
- ⬜ Misc modals: `ManualPairModal`, `MenteeFormPreviewModal`, `CreateChatModal`, `EditChatModal`,
  `AddParticipantModal`.

> Note: the admin/matching/settings/chat screens are auth-gated and their API is CORS-blocked from
> localhost, so they can't be exercised in the local browser preview. They were migrated against the
> proven DS patterns and verified via `tsc` (0 errors) + `eslint` (clean) rather than in-browser.

Aesthetic direction: minimalist, friendly, clear ("Google-ish") - generous whitespace, soft
surfaces, minimal borders, one brand accent, strong type hierarchy.

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
- _(admin sweep)_ Added `src/modules/layout/admin.tsx` DS primitives and migrated the whole admin
  area: Dashboard, all four Matching screens, the Manage-forms/articles toolbars, Reports (+ card),
  Settings (toggle + number inputs), Volunteer availability, Manage-chats header, and the Articles
  dashboard (also fixing its rules-of-hooks bug). Each step: `tsc` 0 errors + `eslint` clean, then
  committed and pushed. Deep shared components (rich editor, data tables, real-time chat, users
  admin, misc modals) remain on Tailwind - tracked above.
- _(homepage art)_ Swapped the homepage illustrations from PNG to the new SVG assets
  (`person_questions`, `chair`, `phone`, `two_people_in_frame`); removed the combined
  `EmptyChairIllustration` in favour of dedicated `ChairIllustration` / `PhoneIllustration`.
  Pitch cards now anchor art in both bottom corners (help: asking-person + framed-people;
  volunteer: chair tilted left + phone tilted right) with the tone-coloured circle arrow in the
  bottom-right. "Jak działamy?" is now a 4-step flow (new copy) whose carousel starts on the
  left measure and bleeds past the right edge, with each step's illustration centred at the
  bottom. Topic rows now use the recolourable `deco_marker-highlight.svg` (CSS mask) instead of
  the blob dots. Typecheck 0 errors, lint clean; verified in-browser at desktop/tablet/mobile.
- _(step cards)_ Reworked `StepCard` to the reference: a giant filled numeral sits in the card
  background with the heading/subtext centred over it and the illustration shown large and centred
  along the bottom. Per-tone palette - secondary: `Secondary/Light` numeral on `Secondary/Lighter`;
  danger: `Red/Lighter` on `Red/Lightest`; primary: `Primary/Lighter` on `Primary/Lightest`.
  Typecheck 0 errors, lint clean; verified in-browser.
- _(i18n + CLAUDE.md)_ Removed hardcoded copy from `homepage/content.ts` - it now holds i18n
  keys + structure only; every homepage component resolves strings via `t(...)`. Added the
  `homepage.{hero,pitch,topics,steps,articles_section}` keys to both `pl.json` and `en.json`
  (and filled the 3 en-only orphan keys in `pl.json`). Added a dependency-free i18n consistency
  parser (`scripts/check-i18n.js`) with `npm run i18n:check` / `i18n:check:strict`, plus a
  `typecheck` script and an eslint block for `scripts/`. Authored `CLAUDE.md` (agent working
  agreement: DS tokens/components, i18n, verification workflow, architecture). Typecheck 0,
  lint clean, `i18n:check` green, new keys pass strict; homepage renders localised copy in-browser.
- _(articles grid)_ Homepage "Artykuły" now renders **3 per row** at the capped measure. Root
  cause: the `$sm`/`$md` percentage pattern is unreliable (the default-active media config makes
  the `sm` 48% override win at every width → always 2-up). Replaced it with a scoped CSS grid
  (1 → 2 → 3 columns at 640/1000px, verified in-browser) and set `MAX_ARTICLES` to 3 (one row).
  Cards stay the DS `Article` compound via `DsArticleCard`. Updated CLAUDE.md's responsive note
  to document the media quirk. Typecheck 0, lint clean.
- _(homepage polish)_ Five refinements:
  (1) **Article tags** - `DsArticleCard` now shows the category as a colour-coded pill *above*
  the card; `articles/helpers/categoryColor.ts` maps a category string → a light, on-palette
  tint/ink pair via a stable djb2 hash (same category always same colour). (2) **Carousel** -
  rewrote the hand-rolled `Carousel` on `embla-carousel-react` (already a dependency): accessible
  region, pointer/touch drag, arrow/Home/End keys, snap-mapped dot buttons, `prefers-reduced-motion`
  aware. (3) **Pitch cards** - the whole card is one link now; on hover a brand-colour blob grows
  from the cursor to flood the card (one step up from the soft tint = the CTA's colour), text/CTA/
  arrow invert to read on the fill, and the art lifts slightly - all CSS-driven (compositor only),
  reduced-motion aware. Dropped the now-unused `CircleArrowButton`. (4) **Hero** - the heading's
  last word rotates through warm synonyms (`title_words` i18n array) in brand teal via a small
  `RotatingWord` (framer-motion, reduced-motion aware); the `<h1>` keeps a stable `aria-label`.
  (5) **Theme toggle** - removed from the header; the product is light-only, so `useTheme` now
  defaults to light and the dead `ThemeToggle` component was deleted. Typecheck 0, lint clean,
  `i18n:check` green; verified in-browser (hero rotation, pitch-card blob fill, embla carousel +
  dots) at desktop and mobile. Article tag not visually verifiable locally (articles API is
  CORS-blocked from localhost) - covered by typecheck instead.
- _(articles page)_ Redesigned the public `/articles` page as a creative magazine
  **bento**: a tinted header band (title, search, colour-coded category filter chips) over
  a lead **poster** card (`FeaturedArticleCard` - full-bleed banner, gradient scrim, white
  title/excerpt/author, "Najnowszy" eyebrow) beside a stacked column of compact headline
  cards (`CompactArticleCard` - thumbnail + tag + title + date) that share the poster's
  height; further articles flow into a uniform 1→2→3 grid ("Więcej artykułów"). Layout is
  tuned to look intentional with exactly three articles, and falls back to a plain grid for
  1–2. Extracted the shared `CategoryTag` component and `excerpt` helper (reused by all card
  types); added `CategoryFilter` (client-side, palette-coloured active pills). New i18n keys
  `articles.{featured,all_categories,filter_label}` in pl + en. Responsive grids use scoped
  min-width CSS (DS media quirk). Typecheck 0, lint clean, `i18n:check` green. Bento layout
  validated at desktop + mobile via a faithful static mock (the articles API is CORS-blocked
  from localhost, so the live grid can't be populated here); the `/articles` route itself
  mounts cleanly (header/search render, no runtime errors).
- _(donations page)_ Creatively redesigned the public `/donations` page in the homepage's
  language - trust-forward, minimalist, friendly, interactive. New `donations` module with
  atomic components: `IconBadge` (icon motif), `StatCounter` (count-up on scroll-into-view,
  reduced-motion aware), `ReadMoreProse` (long "about" copy folded behind a read-more toggle,
  framer-motion reveal), and the interactive centrepiece `DonationBox` (suggested-amount chips
  that drive the CTA label, a Pomagam.pl / bank-transfer segmented control, and a one-tap
  copy-account with a "copied" state). Screen recomposed as thin section orchestration: tinted
  hero with trust chips + smooth-scroll CTA, a trust-stats strip, a 2×2 goals grid (hover lift,
  scoped CSS), the about + how-we-work prose, and a teal donate band housing the DonationBox.
  New i18n keys under `donations.{trust,stats,read_more,read_less}` and
  `donations.donate.{cta_amount,choose_amount,custom_amount,method_online,method_transfer}` in
  pl + en. Typecheck 0, lint clean, `i18n:check` green. Fully verified in-browser (it's a public,
  static route): hero/stats/goals/read-more and the DonationBox amount + method toggling all work,
  no console errors, at desktop and mobile.
- _(forms refactor)_ Rebuilt the mentee & volunteer intake forms on a shared, headless wizard
  engine. New `forms/wizard/` module: `useFormWizard` (step state, per-step Yup validation via
  Formik, submit→success lifecycle, progress) + `persistence.ts` (localStorage save/restore/clear,
  try/caught, consent omitted) + presentational `FormWizard` (full-screen, distraction-free shell:
  slim brand top-bar, QuickExit, animated step transitions, Back/Continue, calm success swap) +
  `FormProgressBar` (2px line fixed to the bottom edge of the screen, fills L→R) + `FormSuccess`
  (spring icon + drawn checkmark + staggered fade, reduced-motion aware) + shared field atoms
  `ChoiceCardGroup` / `ChipMultiSelect` / `ConsentField` / `DateField` (plus the existing
  Formik-bound `FormTextField`/`FormSelectField`/`FormTextareaField`, with a new optional
  `sanitize` on the text field for digits-only age). Both forms are now thin step definitions;
  all chrome/animation/persistence is shared. Progress persists to localStorage per form and
  clears on submit. Behaviour preserved (no regressions): mentee 5 steps + under-18 hard-stop +
  user prefill + already-applied state + submit transform; volunteer 7 steps + date picker +
  themes + already-applied state + submit transform. Submit is now awaited (shows a loader, and
  on failure keeps answers + shows an error toast instead of falsely advancing). `/form/mentee`
  and `/form/volunteer` are full-screen (Layout hides global chrome); Confetti/Container removed.
  Redesigned `/form/mentee-getting-started` as a clean document (no card, no tinted banner, big
  title, "Kontynuuj" button). Deleted the old `FormWrapper`. Typecheck 0, lint clean, i18n green,
  production build green. Getting-started verified in-browser; the auth-gated wizard's full-screen
  layout + bottom progress bar + success state validated via a faithful served mock (the forms
  need auth + API, so they can't run on localhost).
- _(forms follow-up)_ Kept the global navbar on `/form/mentee` and `/form/volunteer` (reverted the
  full-screen chrome-hiding); the wizard now sits inside normal page chrome, so its own brand
  top-bar + QuickExit were dropped and the step area centres in the viewport below the navbar (the
  2px bottom progress bar stays). Added permissive international phone validation: shared
  `phoneRegex` (optional leading `+<country>`, e.g. `+48`) and `sanitizePhone` in shared constants,
  wired into the volunteer phone step (regex + input sanitize + `+48 600 700 800` placeholder).
  Typecheck 0, lint clean, build green.
- _(auth redesign)_ Rebuilt the login/register (and shared forget/reset) screens on a split-screen
  layout matching the provided reference, adapted to our brand/DS. Rewrote `AuthShell` into a
  full-bleed two-column layout: left column (brand mark linking home, large heading, subtitle,
  form, secondary-action footer) that fades/slides in on mount; right column is the new atomic
  `auth/AuthCover` - the `/assets/static/auth_cover.webp` image with a dark scrim, a warm overlay
  headline, and a slow Ken-Burns zoom (all reduced-motion aware, hidden on mobile). Added the
  `auth/AuthDivider` ("or") atom. Auth routes now hide the global chrome (standalone pages) via a
  Layout path set. Hardened the forms (enterprise/secure): moved every hardcoded Polish string to
  i18n (`auth.fields.*`, `auth.actions.*`, `auth.cover.*`, `auth.login.forgot_password`,
  `auth.register.policy_*`, `common.or`) in pl + en; removed the dead "Zapamiętaj mnie" checkbox
  (wired to nothing); added placeholders; wired real loading spinners (`login.isPending` /
  `register.isPending`) and a register-failure toast. No OAuth backend exists, so no fake social
  buttons - the reference's "primary → divider → secondary" structure is realised with a genuine
  "Create account" button instead. Typecheck 0, lint clean, i18n green, production build green;
  verified login + register in-browser at desktop and mobile (no new console errors).
- _(copy style)_ Made the login subtitle gender-neutral ("Zaloguj sie, aby kontynuowac. Milo
  znow Cie widziec!" - no "wrociles"). Replaced every em-dash (-) with a short hyphen across the
  whole project (266 occurrences in 63 files: src, docs, CLAUDE.md, scripts) - zero em-dashes
  remain. Added two copy-style rules to CLAUDE.md under the i18n non-negotiable: gender-neutral
  Polish copy, and hyphens-not-dashes. Typecheck 0, i18n green.
- _(confirm-email)_ Restyled `/auth/confirm-email-begin` to the new auth split-screen. Promoted the
  form's animated success mark to a shared `shared/components/AnimatedSuccess` atom (drawn-in check
  + staggered fade, reduced-motion aware); `FormWizard` now uses it and the old `FormSuccess` was
  deleted. The confirm screen leads with that success mark (account created) + "Sprawdz swoj email"
  + instructions + recovery links inside `AuthShell` (title made optional so a screen can lead with
  content). Added the route to the Layout auth full-screen set. Typecheck 0, lint clean, build
  green; verified in-browser.
- _(confirm-complete)_ Reworked `/confirm?token=...` (`ConfirmEmailCompleteScreen`) to give real
  feedback in the auth split-screen style. Success shows the animated success mark + "Email
  potwierdzony!" and auto-redirects to login after ~2.6s; failure shows an animated error mark with
  tailored copy - the common "invalid or expired token" case (from the API `detail`) gets its own
  message - plus "register again" / "sign in" actions. Fixed the retry storm: the confirm query now
  sets `retry: false` (+ `enabled` on token, no window-focus refetch) and surfaces the server's
  error `detail` directly instead of the global toast handler, so a bad token fails once, instantly,
  with no toast spam. Generalised the shared success mark into `AnimatedStatus` (success/error
  variants; replaces `AnimatedSuccess`, used by the forms, confirm-begin and confirm-complete).
  Added `/confirm` to the Layout auth full-screen set. New pl i18n under `confirm_email_complete.*`.
  Typecheck 0, lint clean, i18n green, build green; error + invalid-link states verified in-browser.
