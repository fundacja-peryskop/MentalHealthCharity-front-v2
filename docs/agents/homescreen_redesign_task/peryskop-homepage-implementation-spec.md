# Fundacja Peryskop — Homepage Implementation Spec

## 1. Purpose of this document

This is a build spec for the marketing homepage of Fundacja Peryskop, a free anonymous chat-based psychological support service. It describes layout, structure, content and component boundaries so the page can be implemented against the `peryskop/ui` design system.

**Design tokens (color, type scale, spacing, radii, shadows) are not hardcoded anywhere in this document.** Every color, font, and spacing value mentioned below is a *visual description* of the reference screenshot only, to help you locate the right token — not a value to copy into code. Before building each section, search `peryskop/ui` for the matching token/component and use that instead of a literal value. Do not introduce new hex codes, px values, or ad-hoc font sizes if an equivalent already exists in the library.

Two reference screenshots were provided; they show the same page state (same carousel position), so treat them as a single source of truth.

## 2. Component sourcing strategy

Before writing any section, do a pass over `peryskop/ui` and confirm what exists. Expected candidates to look for:

- Layout primitives: `Container`/`Section`, grid/stack utilities, responsive breakpoint helpers.
- Typography: heading and body text components/tokens (the design uses one large serif-ish display face for headings and a plain sans body face — confirm actual families in the library, don't guess).
- `Button` (pill-shaped, filled) — used for the two "Dołącz za darmo" CTAs and the header "Dołącz" CTA. Check for color-variant props (coral/red vs. teal) rather than styling a one-off button.
- `Card` — the article grid already has a ready-made card component per the brief; use it as-is for the "Artykuły" section, only supplying data.
- `Badge`/`Tag` — for the small "Alkoholizm" category label with the colored dot on article cards (likely bundled inside the article `Card` itself — verify before rebuilding it).
- `Avatar` — the round "J" author avatar on article cards (likely also bundled in the `Card`).
- Icon set — check for a phone icon (top utility bar), an arrow-right icon (topic pills), and a circular arrow-button affordance (used twice on the hero CTA cards). If a "circular icon button" component exists, reuse it instead of building bespoke markup.
- Color tokens for: teal/turquoise (brand primary), coral/red (secondary accent), pale pink, pale mint, pale yellow/orange backgrounds, dark navy/charcoal text, muted gray body text.

Anything not found in the library (illustrations, the carousel, decorative blob/paint-stroke icons) is called out explicitly in §7 and §8 — build those as new, isolated components rather than improvising a substitute inside `peryskop/ui`.

## 3. Global layout

- Centered content container with a max width, consistent horizontal gutters, generous vertical rhythm between sections (the reference shows large section-to-section spacing — use the library's largest spacing scale step for section gaps, and a smaller one for intra-section gaps).
- All major sections are stacked vertically, full-bleed background where noted, content constrained to the container width.
- Section headings are centered except the "Artykuły" heading, which is left-aligned to the container.
- Corner radii throughout are large/soft (cards, pills, buttons) — pull the "large" radius token, don't invent a value.
- Build mobile-first with a responsive breakpoint strategy even though only a desktop view was captured; call out per-section responsive behavior below since it's an inference, not something shown in the screenshots.

## 4. Section-by-section breakdown

### 4.1 Utility bar (top strip)

Full-width teal/brand-colored strip above the header.

- Left: short reassurance line — `W kryzysie? Inne formy pomocy (telefoniczne) - bezpłatne i anonimowe 24/7`
- Right: two contact affordances, each with a phone icon: `112 (pogotowie)` and `116 123 (telefon zaufania)`.
- Small text size, single line, no wrapping on desktop. On mobile, decide between stacking or truncating — flag as an open question if the library has no existing pattern for this (see §9).
- This is likely a distinct, reusable "announcement bar" — check `peryskop/ui` before building a bespoke one.

### 4.2 Header / navigation

- Left: logo mark + wordmark "Fundacja Peryskop".
- Center-right: text nav links — `Dla firm`, `Wesprzyj nas`, `Artykuły`, `O nas`.
- Far right: primary pill `Button` — `Dołącz` (teal fill).
- White background, sits directly under the utility bar, no visible shadow/border in the reference (confirm against the library's default header/divider treatment).
- Needs a mobile nav strategy (hamburger/drawer) since none is visible in the desktop-only reference — check for an existing nav/drawer component before building one.

### 4.3 Hero

- Centered display heading, two lines: `Cokolwiek chodzi Ci po głowie, jesteśmy tu, żeby wysłuchać`
- Centered subheading below, narrower measure, muted gray: `Darmowa i w pełni anonimowa pomoc psychologiczna w formie czatu. Rozmawiasz z człowiekiem - nie robotem`
- No image/illustration in the hero itself — the illustrations live in the two cards directly below it.

### 4.4 Dual CTA cards ("Potrzebuję pomocy" / "Chcę pomagać")

Two large rounded cards side by side, equal width, roughly square-ish aspect ratio, each acting as a big clickable entry point.

**Left card — pale pink/salmon background:**
- Heading: `Potrzebuje pomocy`
- Subtext: `Zapisz się na wymianę wiadomości z wolontariuszem`
- Coral/red pill button: `Dołącz za darmo`
- Bottom-right: a small circular arrow-icon button (coral fill) — secondary click affordance echoing the main CTA, likely indicating "the whole card is clickable."
- Custom illustration (see §7): a person surrounded by speech bubbles and floating question marks, plus two small stylized chat-window mockups tucked into the bottom of the card.

**Right card — pale mint/teal background:**
- Heading: `Chcę pomagać`
- Subtext: `Zostań wolontariuszem`
- Teal pill button: `Dołącz za darmo`
- Bottom-right: same circular arrow-icon button pattern, in teal.
- Custom illustration (see §7): an empty office chair plus a tablet/phone device mockup.

Implementation note: this is one reusable "pitch card" component instantiated twice with different color, copy, illustration, and href — don't duplicate the markup.

Responsive: stack to a single column on narrow viewports.

### 4.5 Topics grid ("O czym chcesz porozmawiać?")

Centered section heading, followed by a 3-column × 2-row grid (6 items) of pill-shaped list items:

1. Problemy w związku
2. Negatywne myśli
3. Złe samopoczucie
4. Depresja
5. Alkoholizm
6. Inne / nie wiem

Each item: white/outlined rounded rectangle, a small colorful abstract "paint stroke" icon on the left (each item has a distinct color/shape — treat as decorative per-topic icon), the label text, and a small arrow-right icon on the right edge indicating it's a link/action. Subtle border, minimal or no shadow.

This is a data-driven list (label + icon + href) — model it as such rather than six hand-written blocks. Grid collapses to 1 or 2 columns on smaller viewports.

### 4.6 "Jak działamy?" — carousel

Centered section heading: `Jak działamy?`

Below it, a carousel showing large step cards, two visible at a time in the captured state:

- **Slide "1" — yellow/orange card:** giant outlined numeral `1` in the top-left, heading `Złóż formularz`, subtext `Zapisz się na wymianę wiadomości z wolontariuszem`, and the "person with speech bubbles" illustration reused/adapted from §4.4.
- **Slide "2" — pink card:** giant outlined numeral `2`, heading `Wejdź do zakładki "Rozmowy"`, subtext `Aby zacząć wymianę wiadomości z przydzielonym wolontariuszem`, and a "chat window mockups" illustration.

Below the two cards, a row of **5 pagination dots**, the first one active/filled (teal), the rest neutral/empty. Since only steps 1 and 2 are visible in the captured screenshot, treat steps 3–5 as unknown content to confirm with the design owner before shipping (see §9) — but build the carousel to support an arbitrary number of slides, not just two.

Full carousel behavior and API are specified in §7 — this is the one piece of UI in this page that must be built from scratch and does not come from `peryskop/ui`.

### 4.7 Articles ("Artykuły")

Left-aligned section heading: `Artykuły`. Below it, a 3-column × 2-row grid of article cards, all currently showing repeated placeholder content:

- Category badge with colored dot: `Alkoholizm`
- Thumbnail image
- Title: `Jak pomagać`
- Excerpt (lorem-ipsum-style placeholder in the reference — replace with real copy at content time, don't ship the placeholder text)
- Author row: avatar `J`, name `Joe Doe`, role `Volunteer`

Use the existing `peryskop/ui` article `Card` component as-is; this section is purely a data-mapping exercise (fetch/receive an article list, render one `Card` per item). Do not rebuild card markup/styling here.

### 4.8 Footer

Only a thin full-width teal strip is visible at the very bottom of the captured screenshot — its content is cut off / not visible. Do not invent footer content. Flag this as missing input (see §9) and either reuse an existing `peryskop/ui` footer component if one exists, or request the real footer content/design before building it.

## 5. Content inventory (verbatim Polish copy captured from the reference)

Utility bar: `W kryzysie? Inne formy pomocy (telefoniczne) - bezpłatne i anonimowe 24/7`, `112 (pogotowie)`, `116 123 (telefon zaufania)`

Nav: `Dla firm`, `Wesprzyj nas`, `Artykuły`, `O nas`, `Dołącz`

Hero: `Cokolwiek chodzi Ci po głowie, jesteśmy tu, żeby wysłuchać`, `Darmowa i w pełni anonimowa pomoc psychologiczna w formie czatu. Rozmawiasz z człowiekiem - nie robotem`

CTA cards: `Potrzebuje pomocy` / `Zapisz się na wymianę wiadomości z wolontariuszem` / `Dołącz za darmo`; `Chcę pomagać` / `Zostań wolontariuszem` / `Dołącz za darmo`

Topics: `Problemy w związku`, `Negatywne myśli`, `Złe samopoczucie`, `Depresja`, `Alkoholizm`, `Inne / nie wiem`

How it works: `Jak działamy?`, `Złóż formularz` / `Zapisz się na wymianę wiadomości z wolontariuszem`, `Wejdź do zakładki "Rozmowy"` / `Aby zacząć wymianę wiadomości z przydzielonym wolontariuszem`

Articles: `Artykuły`, `Alkoholizm`, `Jak pomagać`, `Joe Doe` / `Volunteer` (excerpt and image are placeholders — do not ship as final copy)

## 6. Page composition order

1. Utility bar
2. Header
3. Hero
4. Dual CTA cards
5. Topics grid
6. How-it-works carousel
7. Articles grid
8. Footer

Compose the page as a thin orchestration component that renders these sections in order and passes data in — no business logic or markup should live at the page level itself; each section is its own component with its own file.

## 7. Carousel component — build from scratch

This does not exist in `peryskop/ui` and needs a clean, self-contained implementation.

**Responsibilities**
- Renders an arbitrary number of slides (here: step cards), not hardcoded to 2.
- Desktop shows roughly two cards at once (partial reveal of the next card is acceptable/likely intentional, to hint there's more content); collapse to a single visible card per view on mobile.
- Pagination dots reflect slide position; the active dot uses the brand teal fill, inactive dots are neutral/outline.
- Supports pointer drag / touch swipe, and exposes prev/next control (even if no arrow buttons are visible in the static reference — confirm whether arrows are needed or dots + swipe are sufficient before adding UI that wasn't in the design).
- Keyboard accessible: focusable container, arrow-key navigation, dots are real buttons with `aria-label`/`aria-current` for the active slide, respects `prefers-reduced-motion` for any transition.
- Snap-based scrolling (e.g. CSS scroll-snap) is preferable to a JS-animated transform if it gets equivalent behavior with less code — pick whichever keeps the implementation smaller and dependency-free.

**Suggested API shape** (adjust to match `peryskop/ui`'s existing prop-naming conventions if it already has conventions for other collection components):

```
<Carousel items={steps} renderItem={(step) => <StepCard {...step} />} visibleCount={{ base: 1, md: 2 }} />
```

Keep the carousel's own logic (index state, drag handling, dot generation) fully decoupled from what it renders — it should not know anything about "step cards" specifically, so it can be reused elsewhere if needed.

## 8. Custom assets to build (not available in peryskop/ui)

These are hand-drawn/decorative illustrations and must be sourced as static SVG assets (commissioned, exported from a design file, or otherwise provided) — do not attempt to recreate them procedurally in code:

- "Person with speech bubbles and question marks" illustration (used in the "Potrzebuje pomocy" card and reused/adapted in carousel step 1).
- Small stylized chat-window mockup graphics (used in the "Potrzebuje pomocy" card and carousel step 2).
- "Empty office chair" + tablet/phone mockup illustration (used in the "Chcę pomagać" card).
- Six abstract colored "paint stroke" icons for the topics grid (one distinct shape/color per topic).
- Circular arrow-icon button graphic (if not already a generic icon-button pattern in the library, confirm the icon itself — a right-pointing arrow — exists in the icon set).

Treat each as a self-contained, named asset/component (e.g. `PersonWithBubblesIllustration`, `ChatWindowMockup`, `EmptyChairIllustration`) so they can be swapped or reused without touching the layout components that place them.

## 9. Open questions / assumptions to confirm before finishing

- Footer content is not visible in the reference screenshots — needs real content or an existing `peryskop/ui` footer component.
- Carousel shows 5 pagination dots but only 2 slides' content was captured — steps 3, 4, 5 content is unknown.
- Mobile/tablet behavior throughout is inferred, not shown (utility bar wrapping, header nav collapse, CTA card stacking, grid column collapse) — reasonable default responsive behavior is proposed per section above, but should be checked against any existing responsive patterns in `peryskop/ui` before finalizing.
- Article excerpt/image content in the reference is placeholder ("It is a long established fact that a reader will be distracted...", generic hand-reaching-for-sky stock photo, repeated identically 6 times) — do not ship this copy; wire the section to real article data instead.
- Whether the carousel needs visible prev/next arrow controls in addition to dots and swipe.

## 10. Code quality guidelines

- One component per file, colocated with its own styles/types; no god-components. Page-level component only orchestrates section order and data-fetching, never markup details.
- No hardcoded copy, colors, spacing, or breakpoints inline — copy comes from a content/data source (even if just a local constants file for now), styling comes from `peryskop/ui` tokens.
- Data-driven rendering wherever content repeats (topics grid, articles grid, carousel steps) — never six/three hand-duplicated JSX blocks.
- Reuse `peryskop/ui` primitives (`Button`, `Card`, `Badge`, `Avatar`, layout/typography components) instead of re-implementing their visual style; only build net-new components for the carousel and the illustrations/icons called out in §8.
- Semantic HTML and accessibility: proper heading hierarchy (single `h1` in the hero), landmark elements (`header`, `nav`, `main`, `footer`), alt text on illustrations, accessible names on icon-only buttons, focus-visible states.
- No unused props, no dead code paths, no commented-out experiments left in the final diff.
- Keep the carousel dependency-free if at all achievable with scroll-snap + minimal JS; only reach for a carousel library if hand-rolling it would clearly cost more than it's worth.

## 11. Acceptance checklist

- [ ] All colors/typography/spacing pulled from `peryskop/ui` tokens — zero hardcoded design values.
- [ ] Article grid uses the existing `peryskop/ui` `Card` component, fed real data.
- [ ] Carousel supports N slides, is keyboard- and touch-accessible, and matches the dot-pagination look from the reference.
- [ ] All custom illustrations are isolated, named components/assets, not inlined into layout components.
- [ ] Page renders correctly at mobile, tablet, and desktop widths with sensible collapse behavior per §4.
- [ ] No placeholder copy ("lorem ipsum"-style article excerpts) shipped to production.
- [ ] Footer content confirmed and implemented (not left as an empty teal strip).
