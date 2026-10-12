import { Avatar, Button, Chip, Input, Person, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Loader2, PanelLeftClose, PanelLeftOpen, Plus, Search, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AutoSizer, IndexRange, InfiniteLoader, List as RVList } from "react-virtualized";
import { useUser } from "../../../auth/components/AuthProvider";
import resolveAssetUrl from "../../../shared/helpers/resolveAssetUrl";
import { Pagination } from "../../../shared/types";
import { translatedRoles } from "../../../users/constants";
import { Chat } from "../../types";
import ChatItem from "../ChatItem";
import Skeleton from "../Skeleton";

/** Row heights for the full list and the collapsed avatar rail. */
const ROW_HEIGHT = 80;
const RAIL_ROW_HEIGHT = 60;

/** Round icon button used in the rail + collapse toggles. */
const IconButton = ({ onClick, label, children }: { onClick?: () => void; label: string; children: ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-10 items-center justify-center rounded-full transition-colors"
    >
        {children}
    </button>
);

interface Props {
    data?: Pagination<Chat>;
    currentChatId?: number;
    loadMore?: () => Promise<void>;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    isSearching?: boolean;
    onNewChat?: () => void;
    filter: "active" | "closed";
    onFilterChange: (filter: "active" | "closed") => void;
    /** Fired after a chat is picked - lets the parent react (e.g. mark read). */
    onSelectChat?: (chat: Chat) => void;
    /** Collapsed = narrow avatar rail. Only meaningful on desktop. */
    collapsed?: boolean;
    /** Toggle collapse. When omitted, no collapse control is shown. */
    onToggleCollapsed?: () => void;
}

/**
 * The chat list panel: search, an active/archive filter, an optional "new chat"
 * action, and a virtualized, Messenger-like list of conversations. Chrome is
 * kept light - separation comes from spacing and soft surfaces, not borders.
 *
 * It can collapse into a narrow avatar rail so the conversation (and any open
 * side panel) gets more room on smaller desktop widths.
 */
const ChatSidebar = ({
    data,
    currentChatId,
    loadMore,
    searchQuery,
    onSearchChange,
    isSearching,
    onNewChat,
    filter,
    onFilterChange,
    onSelectChat,
    collapsed = false,
    onToggleCollapsed,
}: Props) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const [readed, setReaded] = useState<{ [key: number]: boolean }>({});

    const handleSelect = (chat: Chat) => {
        setReaded((prev) => ({ ...prev, [chat.id]: true }));
        onSelectChat?.(chat);
    };

    /** Virtualized, paginated list reused by both the full panel and the rail. */
    const renderList = (compact: boolean) => {
        if (!data) {
            return compact ? (
                <YStack gap="$sm" paddingTop="$sm" alignItems="center" role="status" aria-label={t("chat.chat_list")}>
                    {Array.from({ length: 7 }, (_, i) => (
                        <Skeleton key={i} circle width={44} height={44} />
                    ))}
                </YStack>
            ) : (
                <YStack gap="$sm" paddingHorizontal="$lg" role="status" aria-label={t("chat.chat_list")}>
                    {Array.from({ length: 7 }, (_, i) => (
                        <XStack key={i} alignItems="center" gap="$md" paddingVertical="$sm">
                            <Skeleton circle width={48} height={48} />
                            <YStack flex={1} gap="$sm">
                                <Skeleton height={14} width="60%" />
                                <Skeleton height={12} width="85%" />
                            </YStack>
                        </XStack>
                    ))}
                </YStack>
            );
        }

        if (data.items.length === 0) {
            if (compact) return <Stack flex={1} />;
            return (
                <YStack flex={1} alignItems="center" justifyContent="center" padding="$xl" gap="$sm">
                    <Typography
                        variant="regularSemibold"
                        muted
                        style={{ textAlign: "center", display: "block", width: "100%" }}
                    >
                        {searchQuery
                            ? t("chat.no_results", { defaultValue: "Brak wyników" })
                            : t("chat.no_chats", { defaultValue: "Brak rozmów" })}
                    </Typography>
                </YStack>
            );
        }

        return (
            <InfiniteLoader
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
                                rowHeight={compact ? RAIL_ROW_HEIGHT : ROW_HEIGHT}
                                style={{ outline: "none" }}
                                rowRenderer={({ index, key, style }) => {
                                    const chat = data.items[index];
                                    if (!chat) {
                                        return <div key={key} style={style} />;
                                    }
                                    return (
                                        <div key={key} style={style}>
                                            <ChatItem
                                                onClick={() => handleSelect(chat)}
                                                selected={chat.id === currentChatId}
                                                readed={readed[chat.id]}
                                                chat={chat}
                                                compact={compact}
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
        );
    };

    // Collapsed avatar rail.
    if (collapsed) {
        return (
            <YStack height="100%" width="100%" backgroundColor="$background" alignItems="center">
                <YStack paddingTop="$md" gap="$xs" alignItems="center">
                    {onToggleCollapsed && (
                        <IconButton
                            onClick={onToggleCollapsed}
                            label={t("chat.expand_sidebar", { defaultValue: "Rozwiń listę rozmów" })}
                        >
                            <PanelLeftOpen className="size-5" />
                        </IconButton>
                    )}
                    {onNewChat && (
                        <IconButton onClick={onNewChat} label={t("chat.create_new_chat")}>
                            <Plus className="size-5" />
                        </IconButton>
                    )}
                </YStack>

                <Stack flex={1} minHeight={0} width="100%" marginTop="$sm">
                    {renderList(true)}
                </Stack>

                {user && (
                    <Stack paddingVertical="$md">
                        <Link to={`/profile/${user.id}`} aria-label={user.full_name} title={user.full_name}>
                            <Avatar size={40} src={resolveAssetUrl(user.chat_avatar_url)} name={user.full_name} />
                        </Link>
                    </Stack>
                )}
            </YStack>
        );
    }

    return (
        <YStack height="100%" width="100%" backgroundColor="$background">
            {/* Title + search + filters */}
            <YStack paddingHorizontal="$lg" paddingTop="$lg" gap="$md">
                <XStack alignItems="center" justifyContent="space-between" gap="$sm">
                    <Typography variant="title3" tag="h1">
                        {t("chat.conversations_title", { defaultValue: "Rozmowy" })}
                    </Typography>
                    {onToggleCollapsed && (
                        <IconButton
                            onClick={onToggleCollapsed}
                            label={t("chat.collapse_sidebar", { defaultValue: "Zwiń listę rozmów" })}
                        >
                            <PanelLeftClose className="size-5" />
                        </IconButton>
                    )}
                </XStack>

                <Input
                    value={searchQuery}
                    onChangeText={(value: string) => onSearchChange(value)}
                    placeholder={t("chat.search_label")}
                    aria-label={t("common.search")}
                    prefix={
                        isSearching ? (
                            <Loader2 size={18} className="animate-spin" color="#6c7072" aria-hidden />
                        ) : (
                            <Search size={18} color="#6c7072" aria-hidden />
                        )
                    }
                    suffix={
                        searchQuery ? (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                aria-label={t("common.clear", { defaultValue: "Wyczyść" })}
                                style={{ display: "inline-flex", cursor: "pointer", background: "none", border: 0 }}
                            >
                                <X size={16} color="#6c7072" />
                            </button>
                        ) : undefined
                    }
                />

                <XStack gap="$sm">
                    {(["active", "closed"] as const).map((value) => (
                        <Chip
                            key={value}
                            size="md"
                            color={filter === value ? "primary" : "muted"}
                            variant={filter === value ? "filled" : "outlined"}
                            onPress={() => onFilterChange(value)}
                        >
                            {value === "active"
                                ? t("chat.active_chats", { defaultValue: "Aktywne" })
                                : t("chat.archive", { defaultValue: "Archiwum" })}
                        </Chip>
                    ))}
                </XStack>

                {onNewChat && (
                    <Button variant="mutedPrimary" fullWidth onPress={onNewChat}>
                        <XStack alignItems="center" gap="$sm">
                            <Plus size={18} aria-hidden />
                            {t("chat.create_new_chat")}
                        </XStack>
                    </Button>
                )}
            </YStack>

            {/* List */}
            <Stack flex={1} minHeight={0} marginTop="$md">
                {renderList(false)}
            </Stack>

            {/* Current user card (reference layout) - links to the profile. */}
            {user && (
                <Stack paddingHorizontal="$sm" paddingTop="$sm" paddingBottom="$md">
                    <Link
                        to={`/profile/${user.id}`}
                        style={{ textDecoration: "none", display: "block" }}
                        aria-label={user.full_name}
                    >
                        <XStack
                            alignItems="center"
                            paddingHorizontal="$md"
                            paddingVertical="$sm"
                            borderRadius="$lg"
                            hoverStyle={{ backgroundColor: "$backgroundHover" }}
                            pressStyle={{ backgroundColor: "$backgroundPress" }}
                        >
                            <Person
                                name={user.full_name}
                                description={translatedRoles[user.user_role]}
                                avatar={
                                    <Avatar
                                        size={40}
                                        src={resolveAssetUrl(user.chat_avatar_url)}
                                        name={user.full_name}
                                    />
                                }
                            />
                        </XStack>
                    </Link>
                </Stack>
            )}
        </YStack>
    );
};

export default ChatSidebar;
