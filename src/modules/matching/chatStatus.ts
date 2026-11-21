import { ChatStatusKind, type MyChatStatus } from "./types";

/** Used for staff, for previews and whenever the status cannot be loaded. */
export const NEUTRAL_CHAT_STATUS: MyChatStatus = {
    status: ChatStatusKind.NOT_APPLICABLE,
    has_previous_conversations: false,
    is_rematch: false,
    can_request_support: false,
    declared_capacity: null,
};

const SEARCHING = new Set([ChatStatusKind.MENTEE_SEARCHING, ChatStatusKind.VOLUNTEER_SEARCHING]);

/** Someone is actively being looked for - poll often so the chat shows up quickly. */
export const SEARCHING_POLL_MS = 15_000;
/** Nothing will change without the person acting elsewhere - a slow heartbeat is enough. */
export const IDLE_POLL_MS = 45_000;

/**
 * Whether the person's situation deserves its own empty state (instead of
 * jumping into the first chat): they have no conversation with a counterpart
 * yet, e.g. a volunteer whose list only holds group chats.
 */
export function needsMatchingEmptyState(status: MyChatStatus | undefined): boolean {
    return (
        !!status && status.status !== ChatStatusKind.IN_CONVERSATION && status.status !== ChatStatusKind.NOT_APPLICABLE
    );
}

/** How often to re-check the status; `false` once there is a conversation. */
export function chatStatusPollInterval(status: MyChatStatus | undefined): number | false {
    if (!needsMatchingEmptyState(status)) return false;
    return status && SEARCHING.has(status.status) ? SEARCHING_POLL_MS : IDLE_POLL_MS;
}

/**
 * Pages where a mentee is already dealing with their support themselves: the
 * chat (whose empty state explains a closed chat and links to the help form)
 * and the help form itself. Global "do you want a new volunteer?" prompts stay
 * out of the way there.
 */
export function isSupportFlowRoute(pathname: string): boolean {
    return (
        pathname === "/chat" ||
        pathname.startsWith("/chat/") ||
        pathname === "/form/mentee" ||
        pathname === "/form/mentee-getting-started"
    );
}
