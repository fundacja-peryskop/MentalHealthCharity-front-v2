/**
 * Homepage content model.
 *
 * This file describes the *structure* of each homepage section - order, tones,
 * illustrations, routes and ids. All user-facing copy is localised: every text
 * field is an i18n key (resolved with `t(...)` in the rendering component), and
 * the strings themselves live in `src/locales/{pl,en}.json` under `homepage.*`.
 * Never put display copy here - add it to the locale files instead so both
 * languages stay in sync (see `npm run i18n:check`).
 */

import type { TopicId } from "./illustrations/TopicIcon";

/**
 * Hero copy keys. The heading reads as one sentence whose final word rotates
 * through `titleWordsKey` (an i18n array) for a subtle "living" accent; the
 * full, non-animated `titleKey` is used as the heading's accessible name.
 */
export const hero = {
    titleKey: "homepage.hero.title",
    titleLeadKey: "homepage.hero.title_lead",
    titleWordsKey: "homepage.hero.title_words",
    subtitleKey: "homepage.hero.subtitle",
} as const;

/** Visual accent used by the two pitch cards and their circular arrow button. */
export type PitchTone = "help" | "volunteer";

/** Dual CTA "pitch" cards. */
export interface PitchCardContent {
    tone: PitchTone;
    titleKey: string;
    subtitleKey: string;
    cta: { labelKey: string; href: string };
}

export const pitchCards: PitchCardContent[] = [
    {
        tone: "help",
        titleKey: "homepage.pitch.help.title",
        subtitleKey: "homepage.pitch.help.subtitle",
        cta: { labelKey: "homepage.pitch.help.cta", href: "/form/mentee-getting-started" },
    },
    {
        tone: "volunteer",
        titleKey: "homepage.pitch.volunteer.title",
        subtitleKey: "homepage.pitch.volunteer.subtitle",
        cta: { labelKey: "homepage.pitch.volunteer.cta", href: "/form/volunteer" },
    },
];

/** Topics grid. */
export interface TopicItem {
    id: TopicId;
    labelKey: string;
    href: string;
}

export const topicsHeadingKey = "homepage.topics.heading";

/**
 * Every topic starts the same intake flow - clicking one takes the visitor to
 * the "getting started" mentee form, where they describe what they need.
 */
const TOPIC_HREF = "/form/mentee-getting-started";

export const topics: TopicItem[] = [
    { id: "relationship", labelKey: "homepage.topics.relationship", href: TOPIC_HREF },
    { id: "negativeThoughts", labelKey: "homepage.topics.negative_thoughts", href: TOPIC_HREF },
    { id: "lowMood", labelKey: "homepage.topics.low_mood", href: TOPIC_HREF },
    { id: "depression", labelKey: "homepage.topics.depression", href: TOPIC_HREF },
    { id: "addiction", labelKey: "homepage.topics.addiction", href: TOPIC_HREF },
    { id: "other", labelKey: "homepage.topics.other", href: TOPIC_HREF },
];

/** Illustration used by a how-it-works step. */
export type StepIllustration = "bubbles" | "chat";

/** "Jak działamy?" carousel steps. */
export interface HowItWorksStep {
    /** 1-based step number rendered as the giant background numeral. */
    number: number;
    illustration: StepIllustration;
    titleKey: string;
    subtitleKey: string;
}

export const howItWorksHeadingKey = "homepage.steps.heading";

/** The four intake steps. The carousel supports any number of slides. */
export const howItWorksSteps: HowItWorksStep[] = [
    {
        number: 1,
        illustration: "bubbles",
        titleKey: "homepage.steps.step1.title",
        subtitleKey: "homepage.steps.step1.subtitle",
    },
    {
        number: 2,
        illustration: "chat",
        titleKey: "homepage.steps.step2.title",
        subtitleKey: "homepage.steps.step2.subtitle",
    },
    {
        number: 3,
        illustration: "chat",
        titleKey: "homepage.steps.step3.title",
        subtitleKey: "homepage.steps.step3.subtitle",
    },
    {
        number: 4,
        illustration: "bubbles",
        titleKey: "homepage.steps.step4.title",
        subtitleKey: "homepage.steps.step4.subtitle",
    },
];

/** Articles section heading. */
export const articlesHeadingKey = "homepage.articles_section.heading";
