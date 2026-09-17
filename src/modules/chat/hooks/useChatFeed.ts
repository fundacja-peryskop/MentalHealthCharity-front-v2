import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useUser } from "../../auth/components/AuthProvider";
import { ChatListChangedError, getChatFeedOptions } from "../queries/getChatsQueryOptions";
import { SearchChatQueryOptions } from "../types";

export default function useChatFeed(options: Omit<SearchChatQueryOptions, "page" | "revision">) {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const queryOptions = getChatFeedOptions(user?.id, options);
    const query = useInfiniteQuery(queryOptions);
    const key = JSON.stringify(queryOptions.queryKey);
    const activeKey = useRef<string | undefined>(key);
    activeKey.current = key;
    const nextRequest = useRef<{ key: string; promise: Promise<void> }>();
    useEffect(() => {
        activeKey.current = key;
        return () => {
            activeKey.current = undefined;
        };
    }, [key]);
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
        loadNextPage: () => {
            if (nextRequest.current?.key === key) return nextRequest.current.promise;
            const promise = (async () => {
                const cached = queryClient.getQueryCache().find({ queryKey: queryOptions.queryKey, exact: true });
                if (!cached) return;
                const alreadyLoadingNext =
                    cached.state.fetchStatus !== "idle" && cached.state.fetchMeta?.fetchMore?.direction === "forward";
                // InfiniteLoader needs this promise to cover the requested page, not
                // merely the background refresh that happens to be running now.
                while (cached.state.fetchStatus === "fetching") {
                    try {
                        await cached.promise;
                    } catch {
                        break;
                    }
                    if (activeKey.current !== key) return;
                }
                if (activeKey.current !== key || alreadyLoadingNext) return;
                const pages = queryClient.getQueryData(queryOptions.queryKey)?.pages;
                const last = pages?.[pages.length - 1];
                if (last && last.page < last.pages) await query.fetchNextPage({ cancelRefetch: false });
            })();
            nextRequest.current = { key, promise };
            void promise.finally(() => {
                if (nextRequest.current?.promise === promise) nextRequest.current = undefined;
            });
            return promise;
        },
    };
}
