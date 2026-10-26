import { Roles } from "../users/constants";

export const IMMEDIATE_STEPS_COUNT = 3;

export const EMERGENCY_NUMBER = "112";

/**
 * Who is shown first when phoning. The backend sends a flat list tagged with
 * roles; this fixes the order of the groups (supervisors, then the people to
 * escalate to) and the i18n key of each group title.
 */
export const CONTACT_GROUPS: { role: Roles; titleKey: string }[] = [
    { role: Roles.VOLUNTEERSUPERVISOR, titleKey: "emergency.contacts.groups.supervisors" },
    { role: Roles.ADMIN, titleKey: "emergency.contacts.groups.escalation" },
];

export const dial = (phone: string) => {
    window.location.href = `tel:${phone.replace(/(?!^\+)\D/g, "")}`;
};
