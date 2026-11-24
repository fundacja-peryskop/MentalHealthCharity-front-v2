import { useCallback, useEffect, useState } from "react";
import type { User } from "../../auth/types";
import {
    findFirstOwnMessageId,
    firstMessageNoticeKey,
    hasOwnMessage,
    isFirstMessageNoticeEligible,
} from "../helpers/firstMessageNotice";
import type { Chat, Message } from "../types";

const readFlag = (key: string | null) => {
    if (!key) return false;
    try {
        return localStorage.getItem(key) !== null;
    } catch {
        return false;
    }
};

const writeFlag = (key: string) => {
    try {
        localStorage.setItem(key, new Date().toISOString());
    } catch {
        /* storage unavailable - the notice is a nicety, never fatal */
    }
};

interface Options {
    chat: Chat | undefined;
    user: User | undefined;
    /** Newest first, as rendered by the chat. */
    messages: Message[];
    /** The whole history is loaded, so "no own message yet" can be trusted. */
    isHistoryComplete: boolean;
}

/**
 * After a person's very first message in a support chat, an automatic notice
 * explains that the other side may not answer right away. Returns the id of
 * the message the notice belongs under, and a callback to run before sending.
 */
export function useFirstMessageNotice({ chat, user, messages, isHistoryComplete }: Options) {
    const eligible = isFirstMessageNoticeEligible(chat, user);
    const key = eligible && chat && user ? firstMessageNoticeKey(user.id, chat.id) : null;
    const [isActivated, setIsActivated] = useState(() => readFlag(key));

    useEffect(() => {
        setIsActivated(readFlag(key));
    }, [key]);

    const onBeforeSend = useCallback(() => {
        if (!key || !user || !chat?.is_active || isActivated || !isHistoryComplete) return;
        if (hasOwnMessage(messages, user.id)) return;
        writeFlag(key);
        setIsActivated(true);
    }, [key, user, chat?.is_active, isActivated, isHistoryComplete, messages]);

    const anchorMessageId =
        isActivated && user && isHistoryComplete ? findFirstOwnMessageId(messages, user.id) : undefined;

    return { anchorMessageId, onBeforeSend };
}
