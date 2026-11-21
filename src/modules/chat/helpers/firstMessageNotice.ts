import { Roles } from "../../users/constants";
import type { Chat, Message } from "../types";

/**
 * Rules for the one-off "the other person may not reply right away" notice
 * shown after someone's first message in a support chat. It is remembered per
 * person and chat in localStorage, so it appears once and stays in place under
 * that first message.
 */

const STORAGE_PREFIX = "peryskop:chat:first-message-notice:v1";

export const firstMessageNoticeKey = (userId: number, chatId: number) => `${STORAGE_PREFIX}:${userId}:${chatId}`;

/**
 * Only people seeking support, in a one-to-one support chat they belong to.
 * (It can only be triggered by sending, i.e. in an open chat, but once shown
 * it stays under that message even after the chat is closed.)
 */
export function isFirstMessageNoticeEligible(
    chat: Pick<Chat, "chat_type" | "participants"> | undefined,
    user: { id: number; user_role: Roles } | undefined
): boolean {
    return (
        !!chat &&
        !!user &&
        user.user_role === Roles.USER &&
        chat.chat_type === "SUPPORT" &&
        chat.participants.some((participant) => participant.id === user.id)
    );
}

/** `messages` are newest first; failed sends don't count as a message. */
export function findFirstOwnMessageId(messages: Message[], userId: number): number | undefined {
    for (let index = messages.length - 1; index >= 0; index--) {
        const message = messages[index];
        if (message.sender.id === userId && !message.isFailed) return message.id;
    }
    return undefined;
}

export function hasOwnMessage(messages: Message[], userId: number): boolean {
    return messages.some((message) => message.sender.id === userId);
}
