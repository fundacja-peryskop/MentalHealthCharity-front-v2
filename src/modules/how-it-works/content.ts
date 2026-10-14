/**
 * "Jak to działa" content model.
 *
 * Describes the *structure* of the demo conversation - who speaks, in what
 * order, which messages carry a call to action, and the pacing hints. All
 * user-facing copy is localised: every text field is an i18n key, and the
 * strings live in `src/locales/{pl,en}.json` under `how_it_works.*`.
 *
 * The three people are illustrative personas for a sample conversation (the
 * page subtitle says so), not real staff profiles.
 */

export type PersonaId = "ola" | "michal" | "kasia";

/** Avatar tint per persona - DS palette pairs (pale surface + deep initial). */
export interface PersonaTone {
    surface: "$primaryLightest" | "$secondaryLighter" | "$redLightest";
    ink: "$primaryDarker" | "$secondaryDarker" | "$redDarkest";
}

export interface Persona {
    id: PersonaId;
    nameKey: string;
    roleKey: string;
    tone: PersonaTone;
}

export const personas: Record<PersonaId, Persona> = {
    ola: {
        id: "ola",
        nameKey: "how_it_works.personas.ola_name",
        roleKey: "how_it_works.personas.ola_role",
        tone: { surface: "$primaryLightest", ink: "$primaryDarker" },
    },
    michal: {
        id: "michal",
        nameKey: "how_it_works.personas.michal_name",
        roleKey: "how_it_works.personas.michal_role",
        tone: { surface: "$secondaryLighter", ink: "$secondaryDarker" },
    },
    kasia: {
        id: "kasia",
        nameKey: "how_it_works.personas.kasia_name",
        roleKey: "how_it_works.personas.kasia_role",
        tone: { surface: "$redLightest", ink: "$redDarkest" },
    },
};

/** Persona order in the chat header's avatar stack. */
export const personaOrder: PersonaId[] = ["ola", "michal", "kasia"];

/** A call-to-action button rendered inside a message bubble. */
export interface MessageCta {
    labelKey: string;
    href: string;
    /** `primary` = solid brand button; `secondary` = outlined. */
    variant: "primary" | "secondary";
}

export interface ScriptMessage {
    id: string;
    from: PersonaId;
    textKey: string;
    cta?: MessageCta;
    /** Extra pause (ms) before this message starts "typing" - a deliberate beat. */
    pauseBeforeMs?: number;
}

/** Intake entry points - the same targets as the homepage pitch cards. */
export const GET_HELP_HREF = "/form/mentee-getting-started";
export const VOLUNTEER_HREF = "/form/volunteer";

/** The conversation, in order. */
export const script: ScriptMessage[] = [
    { id: "hello", from: "ola", textKey: "how_it_works.script.hello" },
    { id: "what", from: "ola", textKey: "how_it_works.script.what" },
    { id: "form", from: "michal", textKey: "how_it_works.script.form" },
    { id: "match", from: "michal", textKey: "how_it_works.script.match" },
    { id: "talk", from: "kasia", textKey: "how_it_works.script.talk" },
    { id: "safe", from: "kasia", textKey: "how_it_works.script.safe" },
    { id: "pace", from: "ola", textKey: "how_it_works.script.pace" },
    {
        id: "get_help",
        from: "michal",
        textKey: "how_it_works.script.get_help",
        cta: { labelKey: "how_it_works.cta.get_help", href: GET_HELP_HREF, variant: "primary" },
    },
    {
        id: "volunteer",
        from: "kasia",
        textKey: "how_it_works.script.volunteer",
        cta: { labelKey: "how_it_works.cta.volunteer", href: VOLUNTEER_HREF, variant: "secondary" },
        pauseBeforeMs: 1400,
    },
];
