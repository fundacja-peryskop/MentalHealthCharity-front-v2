import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useUser } from "../../auth/components/AuthProvider";
import { ChatListChangedError, getChatFeedOptions } from "../queries/getChatsQueryOptions";
import { SearchChatQueryOptions } from "../types";

export default function useChatFeed(options: Omit<SearchChatQueryOptions, "page" | "revision">) {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const queryOptions = getChatFeedOptions(user?.id, options);
    const query = useInfiniteQuery(queryOptions);
    const key = JSON.stringify(queryOptions.queryKey);
    const changed = query.error instanceof ChatListChangedError;
    useEffect(() => {
        if (changed) void queryClient.resetQueries({ queryKey: JSON.parse(key), exact: true });
    }, [changed, key, queryClient]);

    const data = useMemo(() => {
        const pages = query.data?.pages;
        if (!pages?.length) return undefined;
        return { ...pages[0], page: pages[pages.length - 1].page, items: pages.flatMap((page) => page.items) };
    }, [query.data]);
    return {
        data,
        isLoading: query.isPending || changed,
        isFetching: query.isFetching,
        isError: query.isError && !changed,
        error: query.error,
        refetch: () => (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()),
        loadNextPage: async () => {
            if (!query.isFetching && query.hasNextPage) await query.fetchNextPage({ cancelRefetch: false });
        },
    };
}
