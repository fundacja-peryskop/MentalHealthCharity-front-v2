import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useUser } from "../../auth/components/AuthProvider";
import { Roles } from "../../users/constants";
import { chatStatusPollInterval, NEUTRAL_CHAT_STATUS } from "../chatStatus";
import { myChatStatusQueryOptions } from "../queries/myChatStatusQueryOptions";
import { ChatStatusKind, type MyChatStatus } from "../types";

interface Options {
    /** Only query while the status is actually shown (e.g. the "active" chat filter). */
    enabled: boolean;
    /** Chat list revision - any change (a chat appeared or closed) triggers a re-check. */
    listRevision?: string;
}

interface Result {
    status: MyChatStatus;
    /** True until the first answer arrives (so callers can avoid flashing). */
    isLoading: boolean;
}

/** Matching only applies to these roles; staff always get the neutral state. */
const MATCHED_ROLES = new Set([Roles.USER, Roles.VOLUNTEER]);

/**
 * Where the signed-in person stands in the support journey, kept fresh while
 * they look at the chat view: it polls while an empty state is relevant
 * (faster while someone is being searched for), re-checks whenever the chat
 * list changes, and refreshes the list as soon as a conversation starts.
 */
export function useMyChatStatus({ enabled, listRevision }: Options): Result {
    // The real account, not an administrator's role preview - the backend
    // answers for the signed-in person.
    const { actualUser } = useUser();
    const queryClient = useQueryClient();
    const isMatchedRole = !!actualUser && MATCHED_ROLES.has(actualUser.user_role);
    const queryEnabled = enabled && isMatchedRole;

    const { data, isPending, isError, refetch } = useQuery(
        myChatStatusQueryOptions({
            enabled: queryEnabled,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchInterval: (query) => chatStatusPollInterval(query.state.data),
        })
    );

    // A new or closed chat changes the answer - re-check right away.
    const lastRevision = useRef(listRevision);
    useEffect(() => {
        if (!queryEnabled || listRevision === lastRevision.current) return;
        lastRevision.current = listRevision;
        void refetch();
    }, [listRevision, queryEnabled, refetch]);

    // A conversation just started: make sure it shows up in the list.
    const previousKind = useRef<ChatStatusKind | undefined>(undefined);
    useEffect(() => {
        const kind = data?.status;
        if (
            previousKind.current !== undefined &&
            previousKind.current !== ChatStatusKind.IN_CONVERSATION &&
            kind === ChatStatusKind.IN_CONVERSATION
        ) {
            void queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
        previousKind.current = kind;
    }, [data?.status, queryClient]);

    if (!queryEnabled) return { status: NEUTRAL_CHAT_STATUS, isLoading: false };
    // A failed background re-check keeps the last good answer on screen.
    if (data) return { status: data, isLoading: false };
    return { status: NEUTRAL_CHAT_STATUS, isLoading: isPending && !isError };
}
