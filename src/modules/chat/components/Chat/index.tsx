import { Button, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useFormik } from "formik";
import { Eye, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReadyState } from "react-use-websocket";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowProps } from "react-virtualized";
import type { CellMeasurerChildProps } from "react-virtualized/dist/es/CellMeasurer";
import * as Yup from "yup";
import { useIsMobile } from "../../../../hooks/useBreakpoint";
import { useUser } from "../../../auth/components/AuthProvider";
import EmojiPicker from "../../../shared/components/EmojiPicker";
import { Permissions } from "../../../shared/constants";
import usePermissions from "../../../shared/hooks/usePermissions";
import { Roles } from "../../../users/constants";
import { translatedConnectionStatus } from "../../constants";
import { messageDayKey } from "../../helpers/chatTime";
import { HistoryPaginationState } from "../../hooks/useChat";
import { Chat as ChatType, ConnectionStatus, Message } from "../../types";
import ChatEmptyState from "../ChatEmptyState";
import ChatMessage from "../Message";
import ConnectionModal from "../ConnectionModal";
import DateDivider from "../DateDivider";
import Skeleton from "../Skeleton";

const LOAD_MORE_THRESHOLD = 200;
const ESTIMATED_ROW_HEIGHT = 100;
const IOS_KEYBOARD_MIN_INSET = 120;
const MAX_MESSAGE_LENGTH = 1500;
/** Draft key so a half-typed message survives navigation / chat switches. */
const draftKey = (chatId?: number) => (chatId ? `chat-draft-${chatId}` : null);

const loadDraft = (chatId?: number): string => {
    const key = draftKey(chatId);
    if (!key) return "";
    try {
        return localStorage.getItem(key) ?? "";
    } catch {
        return "";
    }
};

const saveDraft = (chatId: number | undefined, value: string) => {
    const key = draftKey(chatId);
    if (!key) return;
    try {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    } catch {
        /* storage unavailable - drafting is a convenience, never fatal */
    }
};

interface Props {
    chat?: ChatType;
    isChatInitializing?: boolean;
    onSendMessage: (message: string) => void;
    onDeleteMessage?: (id: number) => void;
    onRetryMessage?: (id: number) => void;
    messages: Message[];
    status: ConnectionStatus;
    onLoadMoreMessages?: () => Promise<void>;
    historyState?: HistoryPaginationState;
}

/** Two left + one right placeholder bubble, matching the real conversation shape. */
const MessagesSkeleton = () => (
    <YStack flex={1} justifyContent="flex-end" gap="$lg" padding="$lg" role="status" aria-label="Loading messages">
        <XStack gap="$sm" alignItems="flex-end">
            <Skeleton circle width={36} height={36} />
            <Skeleton height={56} width={220} borderRadius="$lg" />
        </XStack>
        <XStack gap="$sm" alignItems="flex-end" justifyContent="flex-end">
            <Skeleton height={44} width={180} borderRadius="$lg" />
        </XStack>
        <XStack gap="$sm" alignItems="flex-end">
            <Skeleton circle width={36} height={36} />
            <Skeleton height={72} width={260} borderRadius="$lg" />
        </XStack>
        <XStack gap="$sm" alignItems="flex-end" justifyContent="flex-end">
            <Skeleton height={40} width={140} borderRadius="$lg" />
        </XStack>
    </YStack>
);

const Chat = ({
    chat,
    isChatInitializing = false,
    messages,
    onSendMessage,
    status,
    onDeleteMessage,
    onRetryMessage,
    onLoadMoreMessages,
    historyState,
}: Props) => {
    const { t } = useTranslation();
    const chatRootRef = useRef<HTMLDivElement | null>(null);
    const { user } = useUser();
    const textFieldRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<List | null>(null);
    const isMobile = useIsMobile();
    const validationSchema = Yup.object({
        message: Yup.string().max(MAX_MESSAGE_LENGTH).required(),
    });
    const { hasPermissions } = usePermissions();

    const canReadChatHistory = hasPermissions(Permissions.CAN_READ_CHAT_HISTORY);

    const shouldScrollToBottomRef = useRef(true);
    const prevMessagesLengthRef = useRef(0);
    const isEditableFocusedRef = useRef(false);
    const keyboardOpenRef = useRef(false);
    const keyboardResetTimersRef = useRef<number[]>([]);

    const [initialScrollDone, setInitialScrollDone] = useState(false);
    const [isNearTop, setIsNearTop] = useState(false);

    const knownMessageIdsRef = useRef<Set<number>>(new Set());
    const initialLoadDoneRef = useRef(false);

    const scrollPositionRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null);

    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    const newMessageIds = useMemo(() => {
        const ids = new Set<number>();
        if (!initialLoadDoneRef.current) {
            for (const m of messages) {
                knownMessageIdsRef.current.add(m.id);
            }
            if (messages.length > 0) {
                initialLoadDoneRef.current = true;
            }
        } else {
            for (const m of messages) {
                if (!knownMessageIdsRef.current.has(m.id) && !m.isArchived) {
                    ids.add(m.id);
                }
                knownMessageIdsRef.current.add(m.id);
            }
        }
        return ids;
    }, [messages]);

    const hasHiddenArchive = !canReadChatHistory && historyState && historyState.hasMore && isNearTop;

    const cacheRef = useRef(
        new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: ESTIMATED_ROW_HEIGHT,
        })
    );

    const isConnected = status.state === ReadyState.OPEN;
    const isParticipant = chat && user && chat.participants.some((p) => p.id === user.id);
    const canSendMessage = isConnected && !!chat?.is_active && !!user && !!isParticipant;
    const showConnectionBanner = !isChatInitializing && !!chat?.is_active && status.state !== ReadyState.OPEN;
    const isPrivileged = !!user && user.user_role !== Roles.USER;
    // The user can see the conversation but isn't allowed to write in it (e.g. an
    // admin/supervisor observing a chat they don't participate in).
    const isReadOnlyObserver = !!chat && chat.is_active && !!user && !isParticipant;

    // Show skeleton bubbles while the FIRST page of history is loading, so we
    // never flash the "no messages" empty state before messages arrive. A
    // load-more (pagination) keeps the messages on screen and shows only the
    // small top spinner instead - that's a refresh, not an initial load.
    const isLoadingInitialMessages = reversedMessages.length === 0 && !!historyState?.isLoadingHistory;
    const showMessagesSkeleton = isChatInitializing || isLoadingInitialMessages;

    const formik = useFormik({
        initialValues: {
            message: "",
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            onSendMessage(values.message);
            resetForm();
            saveDraft(chat?.id, "");
            shouldScrollToBottomRef.current = true;
        },
    });

    // Restore any saved draft when the chat changes, and reset scroll bookkeeping.
    useEffect(() => {
        if (chat?.id) {
            cacheRef.current.clearAll();
            shouldScrollToBottomRef.current = true;
            setInitialScrollDone(false);
            prevMessagesLengthRef.current = 0;
            knownMessageIdsRef.current = new Set();
            initialLoadDoneRef.current = false;
            formik.setFieldValue("message", loadDraft(chat.id));
        }
    }, [chat?.id]);

    useEffect(() => {
        const target = chatRootRef.current;
        if (!target) {
            return;
        }

        const isEditableElement = (element: EventTarget | null): boolean => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            return element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable;
        };

        const clearKeyboardResetTimers = () => {
            for (const timerId of keyboardResetTimersRef.current) {
                window.clearTimeout(timerId);
            }
            keyboardResetTimersRef.current = [];
        };

        const normalizeViewportAfterKeyboardClose = () => {
            keyboardOpenRef.current = false;
            target.style.setProperty("--chat-keyboard-inset", "0px");

            const resetScroll = () => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            };

            requestAnimationFrame(resetScroll);
            clearKeyboardResetTimers();
            keyboardResetTimersRef.current.push(window.setTimeout(resetScroll, 80));
            keyboardResetTimersRef.current.push(window.setTimeout(resetScroll, 220));
        };

        const updateKeyboardInset = () => {
            const visualViewport = window.visualViewport;
            const shouldApplyInset = isMobile && isEditableFocusedRef.current;

            if (!visualViewport || !shouldApplyInset) {
                target.style.setProperty("--chat-keyboard-inset", "0px");
                return;
            }

            const rawKeyboardInset = Math.max(
                0,
                Math.round(window.innerHeight - visualViewport.height - visualViewport.offsetTop)
            );

            const keyboardInset = rawKeyboardInset >= IOS_KEYBOARD_MIN_INSET ? rawKeyboardInset : 0;

            if (keyboardOpenRef.current && keyboardInset === 0) {
                normalizeViewportAfterKeyboardClose();
                return;
            }

            keyboardOpenRef.current = keyboardInset > 0;

            target.style.setProperty("--chat-keyboard-inset", `${keyboardInset}px`);
        };

        const handleFocusIn = (event: FocusEvent) => {
            if (isEditableElement(event.target)) {
                isEditableFocusedRef.current = true;
                updateKeyboardInset();
            }
        };

        const handleFocusOut = () => {
            setTimeout(() => {
                const activeElement = document.activeElement;
                const stillInsideChat = activeElement instanceof Node ? target.contains(activeElement) : false;
                const stillFocusedEditable = stillInsideChat && isEditableElement(activeElement);

                if (!stillFocusedEditable) {
                    isEditableFocusedRef.current = false;
                    normalizeViewportAfterKeyboardClose();
                    return;
                }

                updateKeyboardInset();
            }, 100);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !isEditableElement(document.activeElement)) {
                isEditableFocusedRef.current = false;
                normalizeViewportAfterKeyboardClose();
            }
        };

        const handlePageShow = () => {
            if (!isEditableElement(document.activeElement)) {
                isEditableFocusedRef.current = false;
                normalizeViewportAfterKeyboardClose();
            }
        };

        updateKeyboardInset();
        window.addEventListener("resize", updateKeyboardInset);
        window.addEventListener("orientationchange", normalizeViewportAfterKeyboardClose);
        window.addEventListener("pageshow", handlePageShow);
        window.visualViewport?.addEventListener("resize", updateKeyboardInset);
        window.visualViewport?.addEventListener("scroll", updateKeyboardInset);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        target.addEventListener("focusin", handleFocusIn);
        target.addEventListener("focusout", handleFocusOut);

        return () => {
            window.removeEventListener("resize", updateKeyboardInset);
            window.removeEventListener("orientationchange", normalizeViewportAfterKeyboardClose);
            window.removeEventListener("pageshow", handlePageShow);
            window.visualViewport?.removeEventListener("resize", updateKeyboardInset);
            window.visualViewport?.removeEventListener("scroll", updateKeyboardInset);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            target.removeEventListener("focusin", handleFocusIn);
            target.removeEventListener("focusout", handleFocusOut);
            clearKeyboardResetTimers();
        };
    }, [isMobile]);

    useEffect(() => {
        if (listRef.current && reversedMessages.length > 0) {
            const prevLength = prevMessagesLengthRef.current;
            const newLength = reversedMessages.length;

            cacheRef.current.clearAll();
            listRef.current.recomputeRowHeights();

            if (newLength > prevLength && prevLength > 0) {
                const addedCount = newLength - prevLength;

                if (shouldScrollToBottomRef.current) {
                    listRef.current.scrollToRow(reversedMessages.length - 1);
                } else {
                    listRef.current.scrollToRow(addedCount);
                }
            } else if (prevLength === 0 && newLength > 0) {
                setTimeout(() => {
                    if (listRef.current) {
                        listRef.current.scrollToRow(reversedMessages.length - 1);
                        setInitialScrollDone(true);
                    }
                }, 50);
            }

            prevMessagesLengthRef.current = newLength;
        }
    }, [reversedMessages.length]);

    const handleScroll = useCallback(
        ({
            scrollTop,
            scrollHeight,
            clientHeight,
        }: {
            scrollTop: number;
            scrollHeight: number;
            clientHeight: number;
        }) => {
            scrollPositionRef.current = { scrollTop, scrollHeight };
            setIsNearTop(scrollTop < LOAD_MORE_THRESHOLD);

            if (scrollTop < LOAD_MORE_THRESHOLD && canReadChatHistory) {
                if (onLoadMoreMessages && historyState && !historyState.isLoadingHistory && historyState.hasMore) {
                    onLoadMoreMessages().catch((error) => {
                        console.error("Failed to load more messages:", error);
                    });
                }
            }

            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            shouldScrollToBottomRef.current = distanceFromBottom < 100;
        },
        [onLoadMoreMessages, historyState, canReadChatHistory]
    );

    const focusMessageInput = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const interactiveParent = target.closest("button, a, [role='button']");

        if (interactiveParent) {
            return;
        }

        textFieldRef.current?.focus({ preventScroll: true });
    }, []);

    const rowRenderer = useCallback(
        ({ index, key, parent, style }: ListRowProps) => {
            const message = reversedMessages[index];

            if (!message) {
                return null;
            }

            const showArchiveChip = message.isArchived === true;

            // Date separator above the first message of each calendar day.
            const previous = reversedMessages[index - 1];
            const showDayDivider =
                index === 0 ||
                (!!previous && messageDayKey(previous.creation_date) !== messageDayKey(message.creation_date));

            return (
                <CellMeasurer cache={cacheRef.current} columnIndex={0} key={key} parent={parent} rowIndex={index}>
                    {({ registerChild, measure }: CellMeasurerChildProps) => (
                        <div
                            ref={(el) => {
                                if (el) registerChild?.(el);
                            }}
                            style={{
                                ...style,
                                paddingBottom: "14px",
                            }}
                            onLoad={measure}
                        >
                            {showDayDivider && <DateDivider date={message.creation_date} />}
                            <ChatMessage
                                onDeleteMessage={onDeleteMessage}
                                onRetryMessage={onRetryMessage}
                                message={message}
                                showArchiveChip={showArchiveChip}
                                isNew={newMessageIds.has(message.id) || !!message.isPending}
                            />
                        </div>
                    )}
                </CellMeasurer>
            );
        },
        [reversedMessages, onDeleteMessage, onRetryMessage, newMessageIds]
    );

    const renderLoadingIndicator = () => {
        // Only during a load-more (older messages). The initial load is covered
        // by the full-height skeleton, so we don't also show this top spinner.
        if (!historyState?.isLoadingHistory || reversedMessages.length === 0) {
            return null;
        }

        return (
            <Stack position="absolute" top={0} left={0} right={0} zIndex={10} alignItems="center" paddingVertical="$md">
                <Stack
                    width={36}
                    height={36}
                    borderRadius="$full"
                    backgroundColor="$background"
                    alignItems="center"
                    justifyContent="center"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                >
                    <Loader2 size={20} color="#6c7072" className="animate-spin" aria-hidden />
                </Stack>
            </Stack>
        );
    };

    const renderArchiveNotice = () => {
        if (!hasHiddenArchive) {
            return null;
        }

        return (
            <Stack position="absolute" top={0} left={0} right={0} zIndex={10} alignItems="center" paddingVertical="$md">
                <XStack
                    alignItems="center"
                    gap="$sm"
                    paddingHorizontal="$lg"
                    paddingVertical="$sm"
                    borderRadius="$full"
                    backgroundColor="$secondarySoft"
                >
                    <Typography variant="smallSemibold" color="$secondaryTextSoft">
                        {t("chat.archived_messages_notice")}
                    </Typography>
                </XStack>
            </Stack>
        );
    };

    return (
        <div
            ref={chatRootRef}
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                backgroundColor: "#ffffff",
                ["--chat-keyboard-inset" as string]: "0px",
            }}
        >
            {/* Connection status banner */}
            {showConnectionBanner && (
                <XStack
                    alignItems="center"
                    gap="$sm"
                    paddingHorizontal="$lg"
                    paddingVertical="$sm"
                    backgroundColor={status.state === ReadyState.CONNECTING ? "$primarySoft" : "$dangerSoft"}
                    role="status"
                    aria-live="polite"
                >
                    <Typography
                        variant="smallSemibold"
                        color={status.state === ReadyState.CONNECTING ? "$primaryTextSoft" : "$dangerTextSoft"}
                    >
                        {translatedConnectionStatus[status.state]}
                    </Typography>
                </XStack>
            )}

            {/* Messages area */}
            <Stack position="relative" flex={1} minHeight={0} role="log" aria-label={t("chat.messages")}>
                {renderLoadingIndicator()}
                {renderArchiveNotice()}
                {showMessagesSkeleton ? (
                    <MessagesSkeleton />
                ) : reversedMessages.length > 0 ? (
                    <AutoSizer>
                        {({ height, width }: { height: number; width: number }) => (
                            <List
                                ref={listRef}
                                height={height}
                                width={width}
                                rowCount={reversedMessages.length}
                                rowHeight={cacheRef.current.rowHeight}
                                rowRenderer={rowRenderer}
                                deferredMeasurementCache={cacheRef.current}
                                onScroll={handleScroll}
                                overscanRowCount={5}
                                scrollToIndex={!initialScrollDone ? reversedMessages.length - 1 : undefined}
                                scrollToAlignment={!initialScrollDone ? "end" : undefined}
                                style={{
                                    outline: "none",
                                    padding: isMobile ? "12px 12px" : "20px 24px",
                                }}
                            />
                        )}
                    </AutoSizer>
                ) : (
                    <ChatEmptyState canSend={canSendMessage} isPrivileged={isPrivileged} />
                )}
            </Stack>

            {/* Input region */}
            {isChatInitializing ? (
                <Stack
                    paddingHorizontal="$lg"
                    paddingTop="$md"
                    style={{
                        paddingBottom:
                            "max(env(safe-area-inset-bottom), calc(0.75rem + var(--chat-keyboard-inset, 0px)))",
                    }}
                >
                    <Skeleton height={56} borderRadius="$lg" />
                </Stack>
            ) : chat && !chat.is_active ? (
                <Stack
                    paddingHorizontal="$lg"
                    paddingTop="$md"
                    style={{
                        paddingBottom:
                            "max(env(safe-area-inset-bottom), calc(0.75rem + var(--chat-keyboard-inset, 0px)))",
                    }}
                >
                    <Stack backgroundColor="$dangerSoft" borderRadius="$lg" paddingVertical="$md" alignItems="center">
                        <Typography variant="regularSemibold" color="$dangerTextSoft">
                            {t("chat.chat_closed")}
                        </Typography>
                    </Stack>
                </Stack>
            ) : isReadOnlyObserver ? (
                <Stack
                    paddingHorizontal="$lg"
                    paddingTop="$md"
                    style={{
                        paddingBottom:
                            "max(env(safe-area-inset-bottom), calc(0.75rem + var(--chat-keyboard-inset, 0px)))",
                    }}
                >
                    <XStack
                        gap="$sm"
                        alignItems="center"
                        justifyContent="center"
                        paddingVertical="$md"
                        paddingHorizontal="$lg"
                        borderRadius="$lg"
                        backgroundColor="$backgroundStrong"
                    >
                        <Eye size={18} color="#6c7072" aria-hidden />
                        <Typography variant="regularRegular" color="$colorMuted" style={{ textAlign: "center" }}>
                            {t("chat.read_only_notice")}
                        </Typography>
                    </XStack>
                </Stack>
            ) : (
                <XStack
                    alignItems="flex-end"
                    gap="$sm"
                    paddingHorizontal={isMobile ? "$md" : "$lg"}
                    paddingTop="$md"
                    style={{
                        paddingBottom:
                            "max(env(safe-area-inset-bottom), calc(0.75rem + var(--chat-keyboard-inset, 0px)))",
                    }}
                >
                    <XStack
                        flex={1}
                        minHeight={56}
                        alignItems="center"
                        gap="$sm"
                        paddingHorizontal="$lg"
                        borderRadius="$lg"
                        backgroundColor="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                        onPress={focusMessageInput as never}
                        style={{ cursor: "text", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                    >
                        <input
                            maxLength={MAX_MESSAGE_LENGTH}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                fontSize: 16,
                                color: "#090a0a",
                                paddingTop: 14,
                                paddingBottom: 14,
                            }}
                            disabled={!canSendMessage}
                            placeholder={
                                isConnected
                                    ? t("chat.enter_message_label")
                                    : t("chat.disconnected_placeholder", { defaultValue: "Łączenie..." })
                            }
                            aria-label={t("chat.enter_message_label")}
                            name="message"
                            value={formik.values.message}
                            onChange={(e) => {
                                formik.setFieldValue("message", e.target.value);
                                saveDraft(chat?.id, e.target.value);
                            }}
                            onBlur={formik.handleBlur}
                            ref={textFieldRef}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    formik.handleSubmit();
                                    event.preventDefault();
                                }
                            }}
                        />
                        {!isMobile && (
                            <EmojiPicker
                                onChange={(val) => {
                                    formik.setFieldValue("message", val);
                                    saveDraft(chat?.id, val);
                                }}
                                textFieldRef={textFieldRef}
                            />
                        )}
                    </XStack>

                    <Button
                        variant="primary"
                        disabled={!canSendMessage || !formik.values.message.trim()}
                        onPress={() => formik.handleSubmit()}
                        aria-label={t("chat.send")}
                        width={56}
                        height={56}
                        padding={0}
                        borderRadius="$full"
                        flexShrink={0}
                    >
                        <Send size={22} aria-hidden />
                    </Button>
                </XStack>
            )}
            <ConnectionModal status={status} disabled={isChatInitializing || !chat?.is_active} />
        </div>
    );
};

export default Chat;
