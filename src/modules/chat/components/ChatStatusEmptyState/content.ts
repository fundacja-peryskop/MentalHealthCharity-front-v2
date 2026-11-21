import { ChatStatusKind, type MyChatStatus } from "../../../matching/types";

/**
 * Structure of the chat empty states - which scene, which copy (i18n keys,
 * resolved by the component) and which actions - for every status the backend
 * reports. Copy lives in `src/locales/*` under `chat.status_empty.*`.
 */

export type IllustrationKind = "periscope" | "heart-searching" | "heart" | "typing" | "resting";

export type NoticeIcon = "mail" | "history";

export interface EmptyStateAction {
    labelKey: string;
    href: string;
}

export interface EmptyStateContent {
    illustration: IllustrationKind;
    titleKey: string;
    bodyKey: string;
    /** Interpolation values for the body / meta copy. */
    values?: Record<string, string | number>;
    /** Small muted line under the body (e.g. the declared availability). */
    metaKey?: string;
    /** "Zgłoszenie → szukamy → rozmowa" tracker for people waiting for help. */
    showProgress?: boolean;
    notice?: { icon: NoticeIcon; titleKey: string; bodyKey: string };
    action?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    /** People in crisis always see where to call in an emergency. */
    showCrisisLine?: boolean;
}

const K = "chat.status_empty";

export const MENTEE_FORM_HREF = "/form/mentee";
export const AVAILABILITY_HREF = "/volunteer/availability";

/** Shown when nothing more specific applies (staff, or no status yet). */
export const NEUTRAL_CONTENT: EmptyStateContent = {
    illustration: "typing",
    titleKey: `${K}.neutral.title`,
    bodyKey: `${K}.neutral.body`,
};

const emailNotice = (group: string) => ({
    icon: "mail" as const,
    titleKey: `${K}.${group}.notice.title`,
    bodyKey: `${K}.${group}.notice.body`,
});

export function getEmptyStateContent(status: MyChatStatus | undefined): EmptyStateContent {
    switch (status?.status) {
        case ChatStatusKind.MENTEE_SEARCHING: {
            const group = status.is_rematch ? "mentee_rematch" : "mentee_searching";
            return {
                illustration: "periscope",
                titleKey: `${K}.${group}.title`,
                bodyKey: `${K}.${group}.body`,
                showProgress: true,
                notice: emailNotice("mentee_searching"),
                showCrisisLine: true,
            };
        }
        case ChatStatusKind.MENTEE_IDLE:
            return {
                illustration: "heart",
                titleKey: `${K}.mentee_idle.title`,
                bodyKey: status.can_request_support ? `${K}.mentee_idle.body` : `${K}.mentee_idle.body_contact`,
                action: status.can_request_support
                    ? { labelKey: `${K}.mentee_idle.action`, href: MENTEE_FORM_HREF }
                    : undefined,
                notice: status.has_previous_conversations
                    ? {
                          icon: "history",
                          titleKey: `${K}.mentee_idle.history.title`,
                          bodyKey: `${K}.mentee_idle.history.body`,
                      }
                    : undefined,
                showCrisisLine: true,
            };
        case ChatStatusKind.VOLUNTEER_SEARCHING:
            return {
                illustration: "heart-searching",
                titleKey: status.has_previous_conversations
                    ? `${K}.volunteer_searching.title`
                    : `${K}.volunteer_searching.title_first`,
                bodyKey: `${K}.volunteer_searching.body`,
                values: { count: status.declared_capacity ?? 0 },
                metaKey: `${K}.volunteer_searching.meta`,
                notice: emailNotice("volunteer_searching"),
                secondaryAction: { labelKey: `${K}.change_availability`, href: AVAILABILITY_HREF },
            };
        case ChatStatusKind.VOLUNTEER_UNAVAILABLE:
            return {
                illustration: "resting",
                titleKey: `${K}.volunteer_unavailable.title`,
                bodyKey: `${K}.volunteer_unavailable.body`,
                action: { labelKey: `${K}.change_availability`, href: AVAILABILITY_HREF },
            };
        case ChatStatusKind.VOLUNTEER_AVAILABILITY_MISSING:
            return {
                illustration: "resting",
                titleKey: `${K}.volunteer_availability_missing.title`,
                bodyKey: `${K}.volunteer_availability_missing.body`,
                action: { labelKey: `${K}.set_availability`, href: AVAILABILITY_HREF },
            };
        case ChatStatusKind.VOLUNTEER_PAUSED:
            return {
                illustration: "resting",
                titleKey: `${K}.volunteer_paused.title`,
                bodyKey: `${K}.volunteer_paused.body`,
            };
        default:
            return NEUTRAL_CONTENT;
    }
}
