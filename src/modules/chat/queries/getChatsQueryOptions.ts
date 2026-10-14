import { infiniteQueryOptions, queryOptions, UseQueryOptions } from "@tanstack/react-query";
import { url } from "../../../api";
import { Pagination } from "../../shared/types";
import { Chat, SearchChatQueryOptions } from "../types";
import getAuthHeaders from "../../auth/helpers/getAuthHeaders";
import handleApiError from "../../shared/helpers/handleApiError";

export type ChatPage = Pagination<Chat> & { revision: string };
export class ChatListChangedError extends Error {}

export const fetchChats = async (options: SearchChatQueryOptions, signal?: AbortSignal): Promise<ChatPage> => {
    const response = await fetch(url.chat.readChats(options), { headers: getAuthHeaders(), signal });
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 409 && data.detail === "Chat list changed") {
            throw new ChatListChangedError("Chat list changed");
        }
        throw await handleApiError(data);
    }
    return data;
};

export const getChatsQueryOptions = (
    options: SearchChatQueryOptions,
    additionals?: Omit<UseQueryOptions<ChatPage>, "queryFn">
) =>
    queryOptions({
        queryKey: ["chats", options],
        queryFn: ({ signal }) => fetchChats(options, signal),
        ...additionals,
    });

export const getChatFeedOptions = (
    userId: number | undefined,
    options: Omit<SearchChatQueryOptions, "page" | "revision">
) =>
    infiniteQueryOptions({
        queryKey: ["chats", "feed", userId, options],
        enabled: !!userId,
        initialPageParam: { page: 1, revision: undefined } as { page: number; revision?: string },
        queryFn: ({ pageParam, signal }) => fetchChats({ ...options, ...pageParam }, signal),
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.pages ? { page: lastPage.page + 1, revision: lastPage.revision } : undefined,
        retry: (failures, error) => !(error instanceof ChatListChangedError) && failures < 2,
    });
