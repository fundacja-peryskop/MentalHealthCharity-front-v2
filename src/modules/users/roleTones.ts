import type { BadgeTone, ChipColor } from "@fundacja-peryskop/ui";
import { Roles } from "./constants";

/**
 * How a role is colour-coded across the app. `chip` is the filled `Chip`
 * colour (role pills in lists); `dot` is the `Badge` dot colour (role labels
 * next to names). The two are separate because the DS uses different tone
 * names for the neutral grey (`Chip` "default" vs `Badge` "muted").
 */
export interface RoleTone {
    chip: ChipColor;
    dot: BadgeTone;
}

/** Neutral grey - for mentees and for any role without its own colour. */
export const FALLBACK_ROLE_TONE: RoleTone = { chip: "default", dot: "muted" };

/**
 * Colour per role. Roles missing here (including ones the backend adds later)
 * fall back to `FALLBACK_ROLE_TONE`, so a new role never renders uncoloured.
 */
export const ROLE_TONES: Partial<Record<Roles, RoleTone>> = {
    [Roles.ADMIN]: { chip: "danger", dot: "danger" },
    [Roles.VOLUNTEERSUPERVISOR]: { chip: "secondary", dot: "secondary" },
    [Roles.VOLUNTEER]: { chip: "primary", dot: "primary" },
    [Roles.REDACTOR]: { chip: "success", dot: "success" },
    [Roles.USER]: FALLBACK_ROLE_TONE,
};

/** Colour-coding for `role`, falling back to grey for unknown or missing roles. */
export const getRoleTone = (role: Roles | string | null | undefined): RoleTone =>
    (role ? ROLE_TONES[role as Roles] : undefined) ?? FALLBACK_ROLE_TONE;
