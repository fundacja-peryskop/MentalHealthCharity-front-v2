import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Link } from "react-router-dom";
import { isToday } from "date-fns";
import formatDate from "../../../shared/helpers/formatDate";
import { parseApiDate } from "../../../shared/helpers/dateTime";
import getChatName from "../../helpers/getChatName";
import ChatAvatar from "../ChatAvatar";
import { Chat } from "../../types";

interface Props {
    chat: Chat;
    selected: boolean;
    readed?: boolean;
    onClick?: () => void;
    /** Rail mode: avatar only (used when the sidebar is collapsed). */
    compact?: boolean;
}

/** Compact list timestamp: time for today's messages, date otherwise. */
const formatListTime = (date: string): string => {
    const parsed = parseApiDate(date);
    return isToday(parsed) ? formatDate(date, "HH:mm") : formatDate(date, "dd.MM.yyyy");
};

/**
 * One row in the chat list: a coloured avatar, the chat name, a last-message
 * preview and its time, plus an unread badge. Messenger-like, generously sized
 * and readable. Separation comes from spacing and a soft selected surface
 * rather than borders.
 *
 * In `compact` mode (collapsed sidebar rail) it renders just the avatar with a
 * selected ring and an unread dot; the chat name is exposed via the native
 * tooltip and the link's accessible label.
 */
const ChatItem = ({ chat, selected, readed, onClick, compact = false }: Props) => {
    const showUnreadIndicator = chat.unread_count > 0 && !readed;
    const { is_active } = chat;
    const lastMessage = chat.last_message;
    // Never trust the raw name: null / blank names get a safe "Chat #id" label.
    const name = getChatName(chat);

    if (compact) {
        return (
            <Link
                to={`/chat/${chat.id}`}
                onClick={onClick}
                aria-current={selected ? "true" : undefined}
                aria-label={name}
                title={name}
                style={{ textDecoration: "none", display: "block" }}
            >
                <XStack justifyContent="center" paddingVertical="$xs">
                    <Stack
                        position="relative"
                        padding={3}
                        borderRadius="$full"
                        borderWidth={2}
                        borderColor={selected ? "$primary" : "transparent"}
                    >
                        <ChatAvatar name={name} size={44} dimmed={!is_active} />
                        {showUnreadIndicator && (
                            <Stack
                                position="absolute"
                                top={0}
                                right={0}
                                minWidth={18}
                                height={18}
                                paddingHorizontal={4}
                                borderRadius="$full"
                                backgroundColor="$primary"
                                borderWidth={2}
                                borderColor="$background"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Typography variant="tinyBold" style={{ color: "#ffffff", fontSize: 10 }}>
                                    {chat.unread_count > 9 ? "9+" : chat.unread_count}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </XStack>
            </Link>
        );
    }

    return (
        <Link
            to={`/chat/${chat.id}`}
            onClick={onClick}
            aria-current={selected ? "true" : undefined}
            style={{ textDecoration: "none", display: "block" }}
        >
            <XStack
                alignItems="center"
                gap="$md"
                paddingHorizontal="$lg"
                paddingVertical="$md"
                marginHorizontal="$sm"
                borderRadius="$lg"
                backgroundColor={selected ? "$primarySoft" : "transparent"}
                hoverStyle={selected ? undefined : { backgroundColor: "$backgroundHover" }}
                pressStyle={{ backgroundColor: "$backgroundPress" }}
                animation="quick"
            >
                <ChatAvatar name={name} size={48} dimmed={!is_active} />

                <YStack flex={1} minWidth={0} gap={2}>
                    <XStack alignItems="center" justifyContent="space-between" gap="$sm">
                        <Typography
                            variant={showUnreadIndicator ? "regularBold" : "regularSemibold"}
                            color={is_active ? "$color" : "$colorMuted"}
                            numberOfLines={1}
                            style={{ flex: 1, minWidth: 0 }}
                        >
                            {name}
                        </Typography>
                        {lastMessage && (
                            <Typography variant="tinyRegular" color="$colorMuted" style={{ flexShrink: 0 }}>
                                {formatListTime(lastMessage.creation_date)}
                            </Typography>
                        )}
                    </XStack>

                    <XStack alignItems="center" justifyContent="space-between" gap="$sm">
                        {lastMessage ? (
                            <Typography
                                variant={showUnreadIndicator ? "smallSemibold" : "smallRegular"}
                                color={showUnreadIndicator ? "$color" : "$colorMuted"}
                                numberOfLines={1}
                                style={{ flex: 1, minWidth: 0 }}
                            >
                                {lastMessage.sender.full_name}: {lastMessage.content}
                            </Typography>
                        ) : (
                            <Stack flex={1} />
                        )}

                        {showUnreadIndicator && (
                            <Stack
                                minWidth={22}
                                height={22}
                                paddingHorizontal={6}
                                borderRadius="$full"
                                backgroundColor="$primary"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Typography variant="tinyBold" style={{ color: "#ffffff" }}>
                                    {chat.unread_count > 99 ? "99+" : chat.unread_count}
                                </Typography>
                            </Stack>
                        )}
                    </XStack>
                </YStack>
            </XStack>
        </Link>
    );
};

export default ChatItem;
