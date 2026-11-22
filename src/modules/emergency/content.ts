import { Roles } from "../users/constants";
import type { SupportContact } from "./types";

export const IMMEDIATE_STEPS_COUNT = 3;

export const EMERGENCY_NUMBER = "112";

/** Anchor of the phone list, so the procedure can point volunteers straight to it. */
export const CONTACTS_SECTION_ID = "emergency-contacts";

/**
 * Who is shown first when phoning. The backend sends a flat list tagged with
 * roles; this fixes the order of the groups (supervisors, then the people to
 * escalate to) and the i18n key of each group title.
 */
export const CONTACT_GROUPS: { role: Roles; titleKey: string }[] = [
    { role: Roles.VOLUNTEERSUPERVISOR, titleKey: "emergency.contacts.groups.supervisors" },
    { role: Roles.ADMIN, titleKey: "emergency.contacts.groups.escalation" },
];

/**
 * Front-end-only labels for specific people on the list. The backend has no
 * notion of a contact's function in the foundation, so a person is matched by
 * first name within their contact group. Contact details (phone numbers) are
 * deliberately kept out of this public code - they live only in the backend.
 */
const CONTACT_TAGS: { labelKey: string; matches: (contact: SupportContact) => boolean }[] = [
    {
        labelKey: "emergency.contacts.tags.president",
        matches: (contact) => contact.user_role === Roles.ADMIN && contact.name.trim() === "Olga",
    },
];

/** i18n keys of the labels to show next to a contact's name. */
export const getContactTagKeys = (contact: SupportContact): string[] =>
    CONTACT_TAGS.filter((tag) => tag.matches(contact)).map((tag) => tag.labelKey);

export const dial = (phone: string) => {
    window.location.href = `tel:${phone.replace(/(?!^\+)\D/g, "")}`;
};
