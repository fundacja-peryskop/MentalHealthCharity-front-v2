import { queryOptions, UseQueryOptions } from "@tanstack/react-query";
import { url } from "../../../api";
import getAuthHeaders from "../../auth/helpers/getAuthHeaders";
import { MyChatStatus } from "../types";

export const MY_CHAT_STATUS_QUERY_KEY = ["matching", "me", "chat-status"] as const;

/**
 * The signed-in person's place in the support journey. It is polled in the
 * background, so a failure is deliberately silent (no toast) - the chat view
 * falls back to its neutral empty state instead.
 */
export const myChatStatusQueryOptions = (additionals?: Omit<UseQueryOptions<MyChatStatus>, "queryKey" | "queryFn">) =>
    queryOptions<MyChatStatus>({
        queryKey: MY_CHAT_STATUS_QUERY_KEY,
        queryFn: async ({ signal }) => {
            const response = await fetch(url.matching.myChatStatus, {
                headers: getAuthHeaders(),
                signal,
            });

            if (!response.ok) {
                throw new Error(`Chat status request failed with ${response.status}`);
            }

            return response.json();
        },
        ...additionals,
    });
