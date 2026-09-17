import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AutoSizer, IndexRange, InfiniteLoader, List as RVList } from "react-virtualized";
import { useIsMobile } from "../../../../hooks/useBreakpoint";
import { Pagination } from "../../../shared/types";
import { Chat } from "../../types";
import ChatItem from "../ChatItem";

interface Props {
    listVersion?: string;
    isError?: boolean;
    onRetry?: () => void;
    data?: Pagination<Chat>;
    currentChatId?: number;
    showSidebar?: boolean;
    handleDrawerToggle?: () => void;
    loadMore?: () => Promise<void>;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    isSearching?: boolean;
    onNewChat?: () => void;
    filter: "active" | "closed";
    onFilterChange: (filter: "active" | "closed") => void;
}

const ChatSidebar = ({
    data,
    isError,
    listVersion,
    onRetry,
    currentChatId,
    showSidebar,
    handleDrawerToggle,
    loadMore,
    searchQuery,
    onSearchChange,
    isSearching,
    onNewChat,
    filter,
    onFilterChange,
}: Props) => {
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    const [readed, setReaded] = useState<{ [key: number]: boolean }>({});

    const sidebarContent = (
        <div className="bg-card flex h-full w-full flex-col">
            {/* Search */}
            <div className="border-border/50 flex items-center gap-2 border-b px-3 py-3">
                <div className="bg-muted/50 flex flex-1 items-center gap-2 rounded-full px-3 py-2">
                    {isSearching ? (
                        <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
                    ) : (
                        <Search className="text-muted-foreground size-4 shrink-0" />
                    )}
                    <input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t("chat.search_label")}
                        className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base outline-none md:text-sm"
                        aria-label={t("common.search")}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={t("common.clear", { defaultValue: "Clear" })}
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
                {isMobile && (
                    <button
                        onClick={handleDrawerToggle}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={t("common.close", { defaultValue: "Close" })}
                    >
                        <X className="size-5" />
                    </button>
                )}
            </div>

            <div className="border-border/50 grid grid-cols-2 gap-1 border-b p-2">
                {(["active", "closed"] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onFilterChange(value)}
                        className={
                            filter === value
                                ? "bg-primary-brand text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium"
                                : "text-muted-foreground hover:bg-muted rounded-lg px-3 py-2 text-sm font-medium"
                        }
                    >
                        {value === "active"
                            ? t("chat.active_chats", { defaultValue: "Aktywne" })
                            : t("chat.archive", { defaultValue: "Archiwum" })}
                    </button>
                ))}
            </div>

            {/* New Chat button */}
            {onNewChat && (
                <div className="border-border/50 border-b px-3 py-2">
                    <button
                        onClick={onNewChat}
                        className="bg-primary-brand/10 text-primary-brand hover:bg-primary-brand/20 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors"
                    >
                        <Plus className="size-4" />
                        {t("chat.create_new_chat")}
                    </button>
                </div>
            )}

            {isError && (
                <div role="alert" className="p-3 text-sm">
                    <p>{t("chat.list_error")}</p>
                    <button type="button" className="mt-2 underline" onClick={onRetry}>
                        {t("chat.retry_list")}
                    </button>
                </div>
            )}
            {/* Chat list */}
            <nav className="min-h-0 flex-1" aria-label={t("chat.chat_list", { defaultValue: "Chat list" })}>
                {data ? (
                    <InfiniteLoader
                        key={listVersion}
                        isRowLoaded={({ index }) => !!data && index < data.items.length}
                        loadMoreRows={async (range: IndexRange) => {
                            if (!data) return Promise.resolve();
                            if (range.stopIndex < data.items.length) return Promise.resolve();
                            if (data.page < data.pages) {
                                return loadMore ? loadMore() : Promise.resolve();
                            }
                            return Promise.resolve();
                        }}
                        rowCount={data.total}
                    >
                        {({ onRowsRendered, registerChild }) => (
                            <AutoSizer>
                                {({ height, width }) => (
                                    <RVList
                                        ref={registerChild}
                                        height={height}
                                        width={width}
                                        rowCount={data.total}
                                        rowHeight={72}
                                        rowRenderer={({ index, key, style }) => {
                                            const chat = data.items[index];
                                            if (!chat) {
                                                return <div key={key} style={style} />;
                                            }

                                            return (
                                                <div key={key} style={style}>
                                                    <ChatItem
                                                        onClick={() => {
                                                            setReaded((prev) => ({ ...prev, [chat.id]: true }));
                                                            if (isMobile) {
                                                                handleDrawerToggle?.();
                                                            }
                                                        }}
                                                        selected={chat.id === currentChatId}
                                                        readed={readed[chat.id]}
                                                        chat={chat}
                                                    />
                                                </div>
                                            );
                                        }}
                                        onRowsRendered={onRowsRendered}
                                    />
                                )}
                            </AutoSizer>
                        )}
                    </InfiniteLoader>
                ) : !isError ? (
                    <div className="flex flex-col gap-1 p-2" role="status" aria-label="Loading chats">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-3">
                                <Skeleton className="size-10 shrink-0 rounded-full" />
                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </nav>
        </div>
    );

    return (
        <>
            {isMobile ? (
                <Sheet open={showSidebar} onOpenChange={(open) => !open && handleDrawerToggle?.()}>
                    <SheetContent side="left" className="w-full p-0">
                        {sidebarContent}
                    </SheetContent>
                </Sheet>
            ) : (
                <div className="border-border/50 hidden h-full w-[320px] shrink-0 border-r md:flex">
                    {sidebarContent}
                </div>
            )}
        </>
    );
};

export default ChatSidebar;
