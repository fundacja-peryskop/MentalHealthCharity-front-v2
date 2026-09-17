import { useState } from "react";
import useDebounce from "../../shared/hooks/useDebounce";
import { ChatSortByOptions } from "../constants";
import useChatFeed from "./useChatFeed";

export default function useChatListLoader(pageSize = 100, status: "active" | "closed" = "active") {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery.trim(), 400);
    const feed = useChatFeed({
        size: pageSize,
        search: debouncedSearch || undefined,
        status,
        unread_first: true,
        sort_by: ChatSortByOptions.LATEST_MESSAGE_DATE,
    });
    return {
        ...feed,
        aggregatedData: feed.data,
        searchQuery,
        setSearchQuery,
        isSearching: searchQuery.trim() !== debouncedSearch,
    };
}
