# Homepage Redesign — Research Notes

> Author: implementation agent. Scope: understand both projects before wiring
> `@fundacja-peryskop/ui` (PeryskopUI) into `MentalHealthCharity-front-v2` (MHC)
> and rebuilding the marketing homepage per
> [`peryskop-homepage-implementation-spec.md`](./peryskop-homepage-implementation-spec.md).

## 1. The two projects at a glance

| | PeryskopUI (`@fundacja-peryskop/ui`) | MHC frontend (`my-project`) |
| --- | --- | --- |
| Role | Shared design system (DS) | Consuming web app |
| Rendering | **Tamagui** → semantic HTML on web, native on iOS/Android via `react-native-web` | React DOM SPA |
| React | 19 in dev; peer allows `>=18.2.0` | **18.3.1** |
| Bundler | Vite 6 (for its own build/Storybook) | **Vite 5.4.8** |
| Styling | Tamagui tokens/themes (Sarabun font) | **Tailwind CSS 4** + shadcn-style `@/components/ui/*` |
| Router | — | React Router 6 |
| Package | Published to **GitHub Packages** under `@fundacja-peryskop`, `v0.1.0` | Private app |

The two share brand DNA already: MHC's Tailwind brand teal `--color-primary-brand: #0da69e`
is essentially Peryskop's `primaryBase: #06b7a7`. The redesign unifies on the DS token.

## 2. PeryskopUI — the design system

Built on Tamagui (`createTamagui` in `src/config/tamagui.config.ts`), published with
`dist/` (cjs+esm) + `types/` + `src/` (source ships too, minus stories/tests). The Tamagui
Vite plugin consumes the **source** config, so a consuming web app must point at
`node_modules/@fundacja-peryskop/ui/src/config/tamagui.config.ts`.

### Public API (from `src/index.ts`)

- Re-exported Tamagui primitives: `TamaguiProvider`, `Stack`, `XStack`, `YStack`, `ZStack`,
  `Text`, `View`, `styled`, `useTheme`, `useMedia`, plus `GetProps` / `TamaguiProviderProps` types.
- Config: `PeryskopProvider`, `tamaguiConfig`.
- Tokens: palette, spacing/radius, shadows, typography, themes.
- Components (`src/components/*`): `Article`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`,
  `Chip`, `FormGroup`, `Input`, `Layout` (semantic landmarks), `Link`, `Person`, `Radio`,
  `Select`, `Switch`, `Textarea`, `Typography`.

### Design tokens (what the spec means by "pull the token")

- **Spacing** (`$` space scale, 4-based): `$none 0`, `$xs 4`, `$sm 8`, `$md 12`, `$lg 16`,
  `$xl 24`, `$xxl 32`, `$xxxl 48`. Section gaps → use `$xxxl`; intra-section → smaller steps.
- **Radius**: `$none 0`, `$xs 4`, `$sm 8`, `$md 12`, `$lg 16`, `$full 9999` (pills/avatars).
  "Large/soft corners" in the spec → `$lg`; pill buttons/dots → `$full`.
- **Semantic colour tokens** (auto theme-swap): `$background`, `$backgroundHover`, `$color`,
  `$colorMuted`, `$colorInverse`, `$borderColor`, `$primary` / `$primaryHover` / `$primarySoft` /
  `$primaryText`, `$secondary*` (yellow), `$danger*` (coral/red), `$success*`, `$overlay`.
  Raw palette tokens also exist (`$primaryBase`, `$skyLighter`, `$secondaryLightest`, …) for
  one-off backgrounds — prefer semantic tokens.
- **Spec colour → token map** (for the homepage):
  - teal / turquoise brand primary → `$primary`
  - coral / red secondary accent → `$danger` (this is the DS's red `#ff5247`)
  - pale pink / salmon card bg → `$redLightest` (`#ffe5e5`) or `$dangerSoft`
  - pale mint / teal card bg → `$primaryLightest` (`#c1ede9`) / `$primarySoft`
  - pale yellow / orange (carousel step 1) → `$secondaryLightest` (`#fff0d6`) / `$secondarySoft`
  - dark navy/charcoal text → `$color` (`inkDarkest`)
  - muted gray body text → `$colorMuted` (`inkLight`)
- **Typography**: single family **Sarabun** (weights 400/500/700). The spec mentions a
  "serif-ish display face" — the DS has **no serif**; headings use Sarabun Bold. Use the
  `Typography` component variants: `title1` (48/56 → `<h1>`), `title2` (32/36 → `<h2>`),
  `title3` (24/32 → `<h3>`), `largeRegular/Bold` (18), `regular*` (16, body), `small*` (14),
  `tiny*` (12). `muted` and `align` props available.
- **Shadows**: `shadows.small | medium | large` spread onto a surface.

### Component notes relevant to the homepage

- **Button** — `variant`: `primary` (teal) | `secondary` (yellow) | `danger` (coral/red) |
  `mutedPrimary`; `outlined`; `fullWidth`; `disabled`; `onPress`. Pill look = pass
  `borderRadius="$full"`. Coral CTA = `variant="danger"`; teal CTA = `variant="primary"`.
  Renders `<button>`; a11y label required for icon-only.
- **Card** — compound (`Card.Header/Body/Footer`); `variant` (`elevated` default);
  `clickable`/`onPress` (adds `role="button"`, focus ring); `render` prop for polymorphism
  (`render="article"` or `render={<a href/>}`). Article grid (§4.7) uses this as-is.
- **Article** — compound `<article>`: `Article.Banner` (fixed 320:157 aspect ratio, `<img>`
  inside) + `Article.Content` (vertical stack). Good primitive for the article cards.
- **Typography** — see above; auto-picks semantic tag per variant.
- **Link** — real `<a href>` on web; `external` opens new tab; `variant` inline/standalone.
- **Layout landmarks** — `Section`, `Header`, `Footer`, `Nav`, `Main`, `Aside`, `List`,
  `OrderedList`, `ListItem` (semantic tags on web). Use for the page shell + topics list.
- **Badge / Avatar / Person** — for the article card category label + author row.
- **Not in the DS** (build new per spec §7/§8): the **How-it-works carousel**, the decorative
  **topic "paint-stroke" icons**, the **circular arrow icon-button**, and the illustrations.

## 3. MHC frontend — the consuming app

- Entry: `src/main.tsx` → `App.tsx`. `App` wires `QueryClientProvider` → `UserProvider` →
  `BrowserRouter` → `Layout` → `Navbar` + `RootRouter`. PostHog + GA + a technical-break gate.
- Routing: `src/modules/shared/components/RootRouter`; screens live in `src/screens/*`.
- Homepage: `src/screens/HomepageScreen.tsx` renders 7 provisional Tailwind sections from
  `src/modules/shared/components/`: `Hero`, `HowItWorks`, `ChatMockup`, `ArticlesPreview`,
  `TrustMission`, `DonationsPreview`, `FinalCTA`.
- The current `Hero` already hand-rolls an Embla carousel + chat mockups in Tailwind — it is
  the "very provisional" design the redesign replaces.
- Existing infra we can reuse without touching Tamagui:
  - i18n via `react-i18next` (`src/locales`) — homepage copy currently under `homepage.*` keys.
  - Routing links via `react-router-dom` `<Link to>`.
  - Data: `@tanstack/react-query` query-option factories (e.g. articles, chats, forms).
  - Shared helpers: `resolveAssetUrl`, breakpoint hooks (`useIsMobile`, `useIsTablet`), theme.
- shadcn-style primitives under `src/components/ui/*` (button, card, avatar, badge, …) are the
  **old** system; the redesign supersedes them on the homepage with DS components.

### Illustration assets already present

`src/assets/static/homepage/` already contains the §8 illustrations (no commissioning needed):
`asking_person.png` (person + speech bubbles), `chair.png` (empty office chair),
`iphone-svg.png` (device mockup), `two_people_in_frame.png`. Topic "paint-stroke" icons and the
circular arrow icon are still to be sourced/built.

## 4. Integration strategy & risks

**Chosen approach:** add Tamagui alongside Tailwind, wrap the app in `PeryskopProvider`, and
rebuild only the homepage with DS components. Tailwind stays for every other screen; screens
migrate incrementally later. Tamagui and Tailwind coexist — Tamagui emits scoped atomic CSS via
its Vite plugin; Tailwind emits its own layer. No global reset from the DS overrides Tailwind.

**Install (published package):**
1. `.npmrc` — add `@fundacja-peryskop:registry=https://npm.pkg.github.com/`. The existing
   registry-wide `//npm.pkg.github.com/:_authToken=…` line already authenticates the whole
   GitHub Packages registry, so no second token is needed. `.npmrc` is gitignored (`*.npmrc`),
   so the token is never committed.
2. App deps: `@fundacja-peryskop/ui` (library) + `tamagui` (peer) + `@tamagui/vite-plugin` (dev).
   `@tamagui/config` is pulled transitively by the library.
3. `vite.config.ts` — add `tamaguiPlugin({ config: '…/ui/src/config/tamagui.config.ts',
   components: ['tamagui', '@fundacja-peryskop/ui'] })` after `react()`.
4. Wrap the tree with `<PeryskopProvider defaultTheme="light">` (in `App.tsx` or `main.tsx`).
5. Load Sarabun in `index.html` via Google Fonts (`wght@400;500;700`).

**Verified on the branch (dev smoke test):** `npm run dev` boots on Vite 5, the Tamagui plugin
loads the DS config (`[tamagui] built config, components, prompt`), and a DS `<Button variant="primary"
borderRadius="$full">` renders with `background rgb(6,183,167)` (`$primary`), `border-radius 9999px`
(`$full`), white text, in **Sarabun** (font loaded). `$primarySoft` (`#c1ede9`) also resolves. No
Tamagui/RN-web fatal errors.

**Two findings that shape the implementation:**
- **Semantic HTML needs explicit `tag` props (no compiler in dev).** The plugin is wired without
  the optimizing compiler (`optimize` off), so a variant-level `tag` (e.g. `Typography` `title2` →
  `h2`) is **not** applied at runtime — `<Typography variant="title2">` rendered a `<span>`. But an
  explicit `tag` **prop** (`<Typography variant="title2" tag="h2">`) and the `Layout` landmark
  components (`<Section>` → `<section>`) **do** render real elements at runtime (verified). So for
  the spec's a11y/SEO requirement: always pass explicit `tag` on headings (`h1`/`h2`/`h3`) and use
  the `Layout` landmarks. This avoids depending on Tamagui extraction.
- **DS `Button` leaks non-DOM props → console warning.** The published `Button` spreads its whole
  appearance object (incl. `hoverBackgroundColor` / `pressBackgroundColor`) onto the frame, so React
  warns "does not recognize the `hoverBackgroundColor` prop on a DOM element". Harmless (renders
  fine) but noisy, and it's in `@fundacja-peryskop/ui`, not this app. → report upstream to the DS.

**Risks / watch-items:**
- **React version:** MHC React 18.3.1 satisfies the DS peer (`>=18.2.0`); no upgrade required.
- **Vite 5 vs Tamagui plugin 1.144:** expected to work; verify `npm run build` + `npm run dev`.
- **`react-native-web`:** Tamagui core renders web without it, but if the build/plugin asks for
  it, add `react-native-web` as a dep. Verify during smoke test.
- **CSS ordering / Tailwind preflight:** if Tamagui components look unstyled or Tailwind resets
  fight them, revisit plugin/CSS insertion order. Keep the homepage self-contained to limit blast
  radius.
- **GitHub Packages auth:** the registry-wide token must have `read:packages` access to the
  `fundacja-peryskop` org. If install 401/403s, fall back to a local install of the sibling
  `PeryskopUI` checkout (needs `npm run build` there first, since no `dist/` is committed).
- **Existing esbuild plugin** (`esbuild-plugin-react-virtualized`) and `@tailwindcss/vite` must
  remain in the plugin array; only append the Tamagui plugin.

## 5. Homepage build plan (per spec)

Compose `HomepageScreen` as thin orchestration over section components (one file each), all
data-driven, all styling from DS tokens. Section order (spec §6):
Utility/announcement bar → Header/nav → Hero → Dual CTA cards → Topics grid → How-it-works
carousel → Articles grid → Footer. New-from-scratch: the carousel (§7) and decorative
icons/illustration wrappers (§8). Open questions to confirm with the design owner remain in
spec §9 (footer content, carousel steps 3–5, whether arrows are needed, real article data).

See [`task.md`](./task.md) for live implementation status.
