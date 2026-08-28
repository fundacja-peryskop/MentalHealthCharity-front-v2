/**
 * Homepage content model.
 *
 * Per the redesign spec (§10), homepage copy lives in a single content source
 * instead of being hardcoded inside components — every section is rendered from
 * the data below. Strings are the Polish marketing copy for the page; keys,
 * types and comments are English. Shared chrome content (brand, announcement
 * bar, footer) lives in `../layout/content`.
 */

import type { LinkItem } from "../layout/content";
import type { TopicId } from "./illustrations/TopicIcon";

/** Hero. */
export const hero = {
    title: "Cokolwiek chodzi Ci po głowie, jesteśmy tu, żeby wysłuchać",
    subtitle: "Darmowa i w pełni anonimowa pomoc psychologiczna w formie czatu. Rozmawiasz z człowiekiem - nie robotem",
} as const;

/** Visual accent used by the two pitch cards and their circular arrow button. */
export type PitchTone = "help" | "volunteer";

/** Dual CTA "pitch" cards. */
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

/** Topics grid. */
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

/** "Jak działamy?" carousel steps. */
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

/** Articles section heading. */
export const articlesHeading = "Artykuły";
