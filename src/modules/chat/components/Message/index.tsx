import { Avatar, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import resolveAssetUrl from "@/modules/shared/helpers/resolveAssetUrl";
import { t } from "i18next";
import { AlertCircle, Archive, Check, Clock, RotateCcw, Trash2 } from "lucide-react";
import { useUser } from "../../../auth/components/AuthProvider";
import ActionMenu from "../../../shared/components/ActionMenu";
import { Permissions } from "../../../shared/constants";
import formatDate from "../../../shared/helpers/formatDate";
import usePermissions from "../../../shared/hooks/usePermissions";
import { Message } from "../../types";
import MessageContent from "../MessageContent";

interface Props {
    message: Message;
    onDeleteMessage?: (id: number) => void;
    onRetryMessage?: (id: number) => void;
    showArchiveChip?: boolean;
    isNew?: boolean;
}

/** Bubble corner radii - one tight corner gives the "tail" toward the sender. */
const OWN_RADIUS = { borderRadius: 18, borderBottomRightRadius: 6 } as const;
const OTHER_RADIUS = { borderRadius: 18, borderBottomLeftRadius: 6 } as const;

const ChatMessage = ({ message, onDeleteMessage, onRetryMessage, showArchiveChip = false, isNew = false }: Props) => {
    const { user } = useUser();
    const senderIsCurrentUser = user && user.id === message.sender.id;
    const { hasPermissions } = usePermissions();
    const canDeleteMessage = senderIsCurrentUser || hasPermissions(Permissions.DELETE_OTHERS_CHAT_MESSAGES);

    const metaColor = senderIsCurrentUser ? "rgba(255,255,255,0.75)" : "#6c7072";
    const animationClass = isNew ? (senderIsCurrentUser ? "chat-msg-in-right" : "chat-msg-in-left") : "";

    return (
        <XStack
            width="100%"
            gap="$sm"
            alignItems="flex-end"
            className={`chat-msg-row ${animationClass}`.trim()}
            style={{ flexDirection: senderIsCurrentUser ? "row-reverse" : "row" }}
        >
            {!senderIsCurrentUser && (
                <Avatar
                    size={36}
                    src={resolveAssetUrl(message.sender.chat_avatar_url)}
                    name={message.sender.full_name}
                    ring
                />
            )}

            <YStack maxWidth="72%" gap={2} alignItems={senderIsCurrentUser ? "flex-end" : "flex-start"} minWidth={0}>
                {!senderIsCurrentUser && (
                    <Typography variant="tinySemibold" color="$colorMuted" paddingHorizontal="$xs">
                        {message.sender.full_name}
                    </Typography>
                )}

                <YStack
                    paddingHorizontal="$lg"
                    paddingVertical="$sm"
                    maxWidth="100%"
                    backgroundColor={senderIsCurrentUser ? "$primary" : "$backgroundStrong"}
                    style={{
                        ...(senderIsCurrentUser ? OWN_RADIUS : OTHER_RADIUS),
                        color: senderIsCurrentUser ? "#ffffff" : "#090a0a",
                        opacity: message.isPending ? 0.65 : 1,
                        ...(message.isFailed ? { boxShadow: "inset 0 0 0 1px #ff5247" } : null),
                    }}
                >
                    <MessageContent content={message.content} isOwnMessage={!!senderIsCurrentUser} />

                    <XStack alignItems="center" justifyContent="flex-end" gap="$xs" marginTop={4}>
                        {showArchiveChip && (
                            <XStack alignItems="center" gap={3} style={{ opacity: 0.85 }}>
                                <Archive size={11} color={metaColor} aria-hidden />
                                <Typography variant="tinyRegular" style={{ color: metaColor }}>
                                    {t("chat.archive")}
                                </Typography>
                            </XStack>
                        )}

                        <Typography variant="tinyRegular" style={{ color: metaColor }}>
                            {formatDate(message.creation_date, "HH:mm")}
                        </Typography>

                        {/* Outgoing delivery status - only states the system actually supports. */}
                        {senderIsCurrentUser && message.isPending && (
                            <Clock size={12} color={metaColor} aria-hidden aria-label={t("chat.sending")} />
                        )}
                        {senderIsCurrentUser && !message.isPending && !message.isFailed && (
                            <Check size={13} color={metaColor} aria-hidden aria-label={t("chat.sent")} />
                        )}
                    </XStack>

                    {message.isFailed && (
                        <XStack alignItems="center" gap="$xs" marginTop={4}>
                            <AlertCircle size={13} style={{ color: "#ffe5e5" }} aria-hidden />
                            <Typography variant="tinyRegular" style={{ color: "#ffe5e5" }}>
                                {t("chat.send_failed")}
                            </Typography>
                            {onRetryMessage && (
                                <button
                                    type="button"
                                    onClick={() => onRetryMessage(message.id)}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        cursor: "pointer",
                                        background: "none",
                                        border: 0,
                                        color: "#ffffff",
                                        textDecoration: "underline",
                                        textUnderlineOffset: 2,
                                        fontSize: 12,
                                    }}
                                >
                                    <RotateCcw size={11} aria-hidden />
                                    {t("chat.retry")}
                                </button>
                            )}
                        </XStack>
                    )}
                </YStack>
            </YStack>

            {canDeleteMessage && onDeleteMessage && !message.isPending && !message.isFailed && (
                <Stack flexShrink={0} className="chat-msg-actions">
                    <ActionMenu
                        actions={[
                            {
                                label: t("common.remove"),
                                id: "delete",
                                disabled: !canDeleteMessage,
                                variant: "default",
                                onClick: () => onDeleteMessage(message.id),
                                icon: <Trash2 className="size-4" />,
                            },
                        ]}
                    />
                </Stack>
            )}
        </XStack>
    );
};

export default ChatMessage;
