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

## Phase 2 — Homepage sections (per spec §4/§6)
Compose `HomepageScreen` as thin orchestration; one file per section; data-driven; DS tokens only.
- ⬜ Utility / announcement bar (§4.1)
- ⬜ Header / navigation (§4.2) — desktop + mobile drawer
- ⬜ Hero (§4.3)
- ⬜ Dual CTA cards — one reusable "pitch card" ×2 (§4.4)
- ⬜ Topics grid — data-driven list (§4.5)
- ⬜ How-it-works carousel — build from scratch, N slides, a11y (§4.6 / §7)
- ⬜ Articles grid — DS `Card`/`Article`, real data (§4.7)
- ⬜ Footer (§4.8) ⚠️ content not in reference — needs design owner

## Phase 3 — Custom assets (§8)
- ⬜ Illustration wrapper components (assets already in `src/assets/static/homepage/`)
- ⬜ Six topic "paint-stroke" icons (per topic)
- ⬜ Circular arrow icon-button

## Phase 4 — Polish & acceptance (spec §11)
- ⬜ Responsive pass (mobile / tablet / desktop)
- ⬜ a11y pass (heading hierarchy, landmarks, focus, alt text)
- ⬜ Remove placeholder copy; wire real article data
- ⬜ No hardcoded design values — all from DS tokens
- ⬜ Typecheck + lint clean

---

## Open questions (spec §9 — need design owner)
1. Footer content (only a teal strip visible in the reference).
2. Carousel steps 3–5 content (5 dots, only 2 slides captured).
3. Whether the carousel needs visible prev/next arrows in addition to dots + swipe.
4. Real article data/imagery (reference uses lorem-ipsum placeholders).

## Decisions log
- Keep Tailwind for the rest of the app; add Tamagui alongside and rebuild only the homepage.
- Unify brand teal on DS `$primary` (`#06b7a7`), replacing MHC's `#0da69e`.
- Coral/red CTA = Button `variant="danger"`; teal CTA = `variant="primary"`; pill = `borderRadius="$full"`.
- Install the published GitHub Packages build (auth OK); no local fallback needed.
- `legacy-peer-deps=true` required in `.npmrc` (optional native peer). `.npmrc` is gitignored, so
  teammates/CI must add the same line to their own `.npmrc` alongside their GitHub token.
- Semantic HTML: pass explicit `tag` props on `Typography` + use `Layout` landmarks (compiler off).

## Known issues to report upstream (PeryskopUI)
- DS `Button` spreads non-DOM appearance keys (`hoverBackgroundColor`, `pressBackgroundColor`) onto
  the `<button>`, producing a React "unknown prop" console warning on every Button. Harmless but noisy.

## Changelog
- _(setup)_ Branch `redesign/homepage-peryskop-ui` created; research notes + status log added.
- _(setup)_ Wired `@fundacja-peryskop/ui` (Tamagui) into MHC: `.npmrc` scope + `legacy-peer-deps`,
  installed library + `tamagui` + `@tamagui/vite-plugin` + `react-native-web`, added Tamagui Vite
  plugin, `PeryskopProvider` at root, Sarabun font. Verified dev render + prod build. **Uncommitted.**
