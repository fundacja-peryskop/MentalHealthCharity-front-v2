import { ChatSortByOptions } from "../constants";
import { ChatListFilter } from "../types";
import useChatFeed from "./useChatFeed";

export default function useChatList(searchQuery?: string, filter: ChatListFilter = "all") {
    const feed = useChatFeed({
        size: 100,
        search: searchQuery?.trim() || undefined,
        unread_first: true,
        sort_by: ChatSortByOptions.LATEST_MESSAGE_DATE,
        ...(filter === "active" || filter === "closed" ? { status: filter } : {}),
        ...(filter === "supervisor" ? { supervisor_chat: true } : {}),
    });
    return {
        chats: feed.data ?? null,
        isLoadingChats: feed.isFetching,
        isError: feed.isError,
        handleLoadChats: feed.loadNextPage,
        handleRefetch: feed.refetch,
    };
}
