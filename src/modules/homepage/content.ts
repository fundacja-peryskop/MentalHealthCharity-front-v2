/**
 * Homepage content model.
 *
 * Per the redesign spec (§10), homepage copy lives in a single content source
 * instead of being hardcoded inside components — every section is rendered from
 * the data below. Strings are the Polish marketing copy for the page; keys,
 * types and comments are English. When the team is ready this can be migrated
 * to the app's i18n (`react-i18next`) without touching the section components.
 */

import { brand } from "../layout/content";
import type { TopicId } from "./illustrations/TopicIcon";

/** Re-exported so homepage components can keep importing it from one place. */
export { brand };

/** A navigation or call-to-action target. */
export interface LinkItem {
    label: string;
    /** React Router path, hash anchor, `tel:` or `mailto:` URL. */
    href: string;
    /** Open in a new tab (external destinations). */
    external?: boolean;
}

/** §4.1 — utility/announcement bar. */
export const announcement = {
    message: "W kryzysie? Inne formy pomocy (telefoniczne) - bezpłatne i anonimowe 24/7",
    contacts: [
        { label: "112 (pogotowie)", href: "tel:112" },
        { label: "116 123 (telefon zaufania)", href: "tel:116123" },
    ] satisfies LinkItem[],
} as const;

/** §4.2 — header navigation. */
export const navLinks: LinkItem[] = [
    { label: "Dla firm", href: "/support" },
    { label: "Wesprzyj nas", href: "/donations" },
    { label: "Artykuły", href: "/articles" },
    { label: "O nas", href: "/#about-us" },
];

/** Header primary CTA (shown to signed-out visitors). */
export const headerCta: LinkItem = { label: "Dołącz", href: "/login" };

/** §4.3 — hero. */
export const hero = {
    title: "Cokolwiek chodzi Ci po głowie, jesteśmy tu, żeby wysłuchać",
    subtitle: "Darmowa i w pełni anonimowa pomoc psychologiczna w formie czatu. Rozmawiasz z człowiekiem - nie robotem",
} as const;

/** Visual accent used by the two pitch cards and their circular arrow button. */
export type PitchTone = "help" | "volunteer";

/** §4.4 — dual CTA "pitch" cards. */
export interface PitchCardContent {
    tone: PitchTone;
    title: string;
    subtitle: string;
    cta: LinkItem;
}

export const pitchCards: PitchCardContent[] = [
    {
        tone: "help",
        title: "Potrzebuję pomocy",
        subtitle: "Zapisz się na wymianę wiadomości z wolontariuszem",
        cta: { label: "Dołącz za darmo", href: "/form/mentee-getting-started" },
    },
    {
        tone: "volunteer",
        title: "Chcę pomagać",
        subtitle: "Zostań wolontariuszem",
        cta: { label: "Dołącz za darmo", href: "/form/volunteer" },
    },
];

/** §4.5 — topics grid. */
export interface TopicItem extends LinkItem {
    id: TopicId;
}

export const topicsHeading = "O czym chcesz porozmawiać?";

/**
 * Every topic starts the same intake flow — clicking one takes the visitor to
 * the "getting started" mentee form, where they describe what they need.
 */
const TOPIC_HREF = "/form/mentee-getting-started";

export const topics: TopicItem[] = [
    { id: "relationship", label: "Problemy w związku", href: TOPIC_HREF },
    { id: "negativeThoughts", label: "Negatywne myśli", href: TOPIC_HREF },
    { id: "lowMood", label: "Złe samopoczucie", href: TOPIC_HREF },
    { id: "depression", label: "Depresja", href: TOPIC_HREF },
    { id: "addiction", label: "Alkoholizm", href: TOPIC_HREF },
    { id: "other", label: "Inne / nie wiem", href: TOPIC_HREF },
];

/** Illustration used by a how-it-works step. */
export type StepIllustration = "bubbles" | "chat";

/** §4.6 — "Jak działamy?" carousel steps. */
export interface HowItWorksStep {
    /** 1-based step number rendered as the giant outlined numeral. */
    number: number;
    illustration: StepIllustration;
    title: string;
    subtitle: string;
}

export const howItWorksHeading = "Jak działamy?";

/**
 * The real intake flow is three steps (mirrors the app's existing
 * `homepage.how_it_works` content). The reference screenshot only captured the
 * first two; the carousel itself supports an arbitrary number of slides.
 */
export const howItWorksSteps: HowItWorksStep[] = [
    {
        number: 1,
        illustration: "bubbles",
        title: "Złóż formularz",
        subtitle: "Odpowiedz na kilka pytań, abyśmy mogli poznać Twoje potrzeby",
    },
    {
        number: 2,
        illustration: "chat",
        title: "Dopasujemy wolontariusza",
        subtitle: "Poinformujemy Cię mailowo, gdy utworzymy czat z przydzielonym wolontariuszem",
    },
    {
        number: 3,
        illustration: "chat",
        title: 'Wejdź do zakładki "Rozmowy"',
        subtitle: "Rozpocznij regularną wymianę wiadomości w wygodnej formie czatu online",
    },
];

/** §4.7 — articles section heading. */
export const articlesHeading = "Artykuły";

/** §4.8 — footer. */
export interface FooterColumn {
    heading: string;
    links: LinkItem[];
}

const footerColumns: FooterColumn[] = [
    {
        heading: "Nawigacja",
        links: [
            { label: "O nas", href: "/#about-us" },
            { label: "Artykuły", href: "/articles" },
            { label: "Wesprzyj nas", href: "/donations" },
        ],
    },
    {
        heading: "Pomoc",
        links: [
            { label: "112 (pogotowie)", href: "tel:112" },
            { label: "116 123 (telefon zaufania)", href: "tel:116123" },
            { label: "Regulamin", href: "/tos" },
            { label: "Polityka prywatności", href: "/tos" },
        ],
    },
    {
        heading: "Kontakt",
        links: [
            {
                label: "kontakt@fundacjaperyskop.org",
                href: "mailto:kontakt@fundacjaperyskop.org",
                external: true,
            },
        ],
    },
];

const footerSocials: LinkItem[] = [
    {
        label: "Facebook",
        href: "https://www.facebook.com/groups/1340769720143310",
        external: true,
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/fundacja-peryskop",
        external: true,
    },
];

export const footer = {
    mission:
        "Tworzymy bezpieczną przestrzeń, w której każdy może uzyskać anonimowe wsparcie psychologiczne w formie czatu.",
    columns: footerColumns,
    socials: footerSocials,
    copyright: `© ${new Date().getFullYear()} ${brand.name}`,
};
