import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlarmClockPlus,
    ArrowLeft,
    BookOpen,
    Flag,
    LockKeyhole,
    MessagesSquare,
    ScrollText,
    StickyNote,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useIsMobile } from "../../../../hooks/useBreakpoint";
import { useUser } from "../../../auth/components/AuthProvider";
import ReportModal from "../../../report/components/ReportModal";
import { Permissions } from "../../../shared/constants";
import usePermissions from "../../../shared/hooks/usePermissions";
import { Roles } from "../../../users/constants";
import getAllowedParticipantRoles from "../../helpers/getAllowedParticipantRoles";
import useChat from "../../hooks/useChat";
import useChatListLoader from "../../hooks/useChatListLoader";
import { chatInactivitySettingsQueryOptions } from "../../queries/chatInactivitySettingsQueryOptions";
import snoozeAutoCloseMutation from "../../queries/snoozeAutoCloseMutation";
import { Chat as ChatType } from "../../types";
import AddParticipantModal from "../AddParticipantModal";
import Chat from "../Chat";
import ChatAvatar from "../ChatAvatar";
import ChatDetails from "../ChatDetails";
import ChatSidebar from "../ChatSidebar";
import CloseChatModal from "../CloseChatModal";
import ContractSidebar from "../ContractModal/ContractModal";
import CustomizeChatModal from "../CustomizeChatModal";
import HelpRulesSidebar from "../HelpRulesSidebar";
import NewChatModal from "../NewChatModal";
import Note from "../Note";
import Skeleton from "../Skeleton";
import SnoozeAutoCloseModal from "../SnoozeAutoCloseModal";

/** Shared classes for the header icon-buttons so they stay large + easy to tap. */
const HEADER_BTN =
    "text-muted-foreground hover:bg-muted hover:text-foreground flex size-10 items-center justify-center rounded-full transition-colors";

const ChatWindow = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const parsedChatId = id ? Number(id) : Number.NaN;
    const chatId = Number.isInteger(parsedChatId) && parsedChatId > 0 ? parsedChatId : undefined;
    const [chatFilter, setChatFilter] = useState<"active" | "closed">("active");
    const { data, aggregatedData, loadNextPage, searchQuery, setSearchQuery, isSearching } = useChatListLoader(
        100,
        chatFilter
    );
    const effectiveData = aggregatedData || data;
    const isMobile = useIsMobile();
    const [showDetails, setShowDetails] = useState(!isMobile);
    const [showNote, setShowNote] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const { user } = useUser();
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [showHelpRules, setShowHelpRules] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [showCloseChatModal, setShowCloseChatModal] = useState(false);
    const [showSnoozeAutoCloseModal, setShowSnoozeAutoCloseModal] = useState(false);
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data: inactivitySettings } = useQuery(chatInactivitySettingsQueryOptions());
    const snoozeExtensionDays = inactivitySettings?.snooze_extension_days ?? 7;
    const { hasPermissions } = usePermissions();

    // Mobile follows a Messenger-like model: the list and the conversation are
    // separate full-screen views, driven by the URL (so browser Back works and
    // deep links keep working). Desktop shows both side by side.
    const showList = !isMobile || !chatId;
    const showConversation = !isMobile || !!chatId;

    // Collapsible sidebar (desktop only) - remembered across sessions. Collapsed
    // it becomes a narrow avatar rail, freeing width for the conversation and
    // any open side panel.
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem("chat-sidebar-collapsed") === "1";
        } catch {
            return false;
        }
    });
    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem("chat-sidebar-collapsed", next ? "1" : "0");
            } catch {
                /* storage unavailable - collapse is a convenience, never fatal */
            }
            return next;
        });
    }, []);
    const isRail = !isMobile && sidebarCollapsed;

    // Use a ref-based shouldReconnect to avoid stale closure over selectedChat
    const selectedChatRef = useRef<ChatType | undefined>(undefined);

    const {
        messages,
        connectionStatus,
        send,
        retrySend,
        selectedChat,
        isSelectedChatLoading,
        handleDeleteMessage,
        handleCloseChat,
        reloadChat,
        loadBackHistory,
        historyState,
    } = useChat(chatId, {
        shouldReconnect: () => {
            if (!chatId || !user) {
                return false;
            }

            const chat = selectedChatRef.current;
            if (!chat) {
                // Keep reconnecting while chat metadata is still loading.
                return true;
            }

            return chat.is_active && chat.status === "ACTIVE" && chat.participants.some((p) => p.id === user.id);
        },
        reconnectAttempts: Infinity,
        reconnectInterval: (attemptNumber) => Math.min(1000 * 2 ** attemptNumber, 30000),
    });

    // Keep the ref in sync
    selectedChatRef.current = selectedChat;

    const closeChat = useCallback(
        (chat: ChatType) => {
            handleCloseChat(chat);
            setShowDetails(false);
        },
        [handleCloseChat]
    );

    const canCloseChat =
        selectedChat &&
        !selectedChat.is_supervisor_chat &&
        selectedChat.is_active &&
        (hasPermissions(Permissions.EDIT_CHAT_DATA) || hasPermissions(Permissions.MANAGE_CHATS));
    const canUseChatAttachments = selectedChat ? !selectedChat.is_group_chat : false;
    const canSnoozeAutoClose = Boolean(
        inactivitySettings &&
            selectedChat?.is_active &&
            selectedChat.chat_type === "SUPPORT" &&
            selectedChat.auto_close_at &&
            user?.user_role === Roles.VOLUNTEER &&
            selectedChat.participants.some((participant) => participant.id === user.id)
    );

    const { mutate: snoozeAutoClose, isPending: isSnoozingAutoClose } = useMutation({
        mutationFn: snoozeAutoCloseMutation,
        onSuccess: async () => {
            await Promise.all([reloadChat(), queryClient.invalidateQueries({ queryKey: ["chats"] })]);
            setShowSnoozeAutoCloseModal(false);
            toast.success(
                t("chat.snooze_success", {
                    defaultValue: "Termin zamknięcia przesunięto o {{count}} dni",
                    count: snoozeExtensionDays,
                })
            );
        },
    });

    const handleFilterChange = (filter: "active" | "closed") => {
        setChatFilter(filter);
        navigate("/chat");
    };

    // Auto-open the first chat only on desktop; on mobile we intentionally land
    // on the list first so the user chooses a conversation (requirement #11).
    useEffect(() => {
        if (!isMobile && !chatId && effectiveData?.items.length) {
            navigate(`/chat/${effectiveData.items[0].id}`, { replace: true });
        }
    }, [chatId, effectiveData, navigate, isMobile]);

    useEffect(() => {
        if (!chatId || !selectedChat) return;
        const selectedChatFilter = selectedChat.is_active && selectedChat.status === "ACTIVE" ? "active" : "closed";
        setChatFilter((current) => (current === selectedChatFilter ? current : selectedChatFilter));
    }, [chatId, selectedChat]);

    useEffect(() => {
        setShowSnoozeAutoCloseModal(false);
    }, [selectedChat?.id]);

    useEffect(() => {
        if (selectedChat?.is_group_chat) {
            setShowNote(false);
            setShowReportModal(false);
            setShowContractModal(false);
        }
    }, [selectedChat?.id, selectedChat?.is_group_chat]);

    const headerActions = (
        <div className="flex shrink-0 items-center gap-0.5">
            {canUseChatAttachments && hasPermissions(Permissions.EDIT_CHAT_NOTE) && (
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                onClick={() => setShowNote(!showNote)}
                                className={HEADER_BTN}
                                aria-label={t("chat.notes")}
                            >
                                <StickyNote className="size-5" />
                            </button>
                        }
                    />
                    <TooltipContent>{t("chat.notes")}</TooltipContent>
                </Tooltip>
            )}

            {canUseChatAttachments && (
                <>
                    {selectedChat?.is_active && (
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <button
                                        onClick={() => setShowReportModal(!showReportModal)}
                                        className={HEADER_BTN}
                                        aria-label={t("chat.report")}
                                    >
                                        <Flag className="size-5" />
                                    </button>
                                }
                            />
                            <TooltipContent>{t("chat.report")}</TooltipContent>
                        </Tooltip>
                    )}

                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <button
                                    onClick={() => setShowContractModal(!showContractModal)}
                                    className={HEADER_BTN}
                                    aria-label={t("chat.contract")}
                                >
                                    <BookOpen className="size-5" />
                                </button>
                            }
                        />
                        <TooltipContent>{t("chat.contract")}</TooltipContent>
                    </Tooltip>
                </>
            )}

            <Tooltip>
                <TooltipTrigger
                    render={
                        <button
                            onClick={() => setShowHelpRules(!showHelpRules)}
                            className={HEADER_BTN}
                            aria-label={t("chat.help_rules")}
                        >
                            <ScrollText className="size-5" />
                        </button>
                    }
                />
                <TooltipContent>{t("chat.help_rules")}</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger
                    render={
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className={HEADER_BTN}
                            aria-label={t("chat.show_details", { defaultValue: "Szczegóły" })}
                        >
                            <Users className="size-5" />
                        </button>
                    }
                />
                <TooltipContent>{t("chat.show_details", { defaultValue: "Szczegóły" })}</TooltipContent>
            </Tooltip>

            {canSnoozeAutoClose && (
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                type="button"
                                disabled={isSnoozingAutoClose}
                                onClick={() => setShowSnoozeAutoCloseModal(true)}
                                className="text-warning-brand hover:bg-warning-brand/10 flex size-10 items-center justify-center rounded-full transition-colors disabled:opacity-50"
                                aria-label={t("chat.snooze_auto_close", {
                                    defaultValue: "Drzemka +{{count}} dni",
                                    count: snoozeExtensionDays,
                                })}
                            >
                                <AlarmClockPlus className="size-5" />
                            </button>
                        }
                    />
                    <TooltipContent>
                        {t("chat.snooze_auto_close", {
                            defaultValue: "Drzemka +{{count}} dni",
                            count: snoozeExtensionDays,
                        })}
                    </TooltipContent>
                </Tooltip>
            )}

            {canCloseChat && (
                <>
                    <div className="bg-border/60 mx-1 h-5 w-px" />
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <button
                                    onClick={() => setShowCloseChatModal(true)}
                                    className="text-destructive hover:bg-destructive/10 flex size-10 items-center justify-center rounded-full transition-colors"
                                    aria-label={t("chat.close_chat")}
                                >
                                    <LockKeyhole className="size-5" />
                                </button>
                            }
                        />
                        <TooltipContent>{t("chat.close_chat")}</TooltipContent>
                    </Tooltip>
                </>
            )}
        </div>
    );

    // App-shell: on desktop the list and conversation sit as rounded white
    // panels on a soft canvas (reference layout, Peryskop tokens); on mobile
    // they go full-bleed so the conversation uses every pixel.
    const PANEL_SHADOW = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
    const canvasStyle: React.CSSProperties = {
        height: "100%",
        display: "flex",
        flex: 1,
        minHeight: 0,
        gap: isMobile ? 0 : 16,
        padding: isMobile ? 0 : 16,
        backgroundColor: isMobile ? "#ffffff" : "#f2f4f5",
    };
    const panelBase: React.CSSProperties = {
        borderRadius: isMobile ? 0 : 16,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        ...(isMobile ? null : { boxShadow: PANEL_SHADOW }),
    };

    return (
        <TooltipProvider>
            <div style={canvasStyle}>
                {/* Left: chat list */}
                {showList && (
                    <div
                        style={{
                            display: "flex",
                            ...(isMobile ? { flex: 1, minWidth: 0 } : { width: isRail ? 72 : 360, flexShrink: 0 }),
                            ...panelBase,
                        }}
                    >
                        <ChatSidebar
                            data={effectiveData}
                            loadMore={loadNextPage}
                            currentChatId={chatId}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            isSearching={isSearching}
                            filter={chatFilter}
                            onFilterChange={handleFilterChange}
                            onNewChat={
                                hasPermissions(Permissions.MANAGE_CHATS) ? () => setShowNewChatModal(true) : undefined
                            }
                            collapsed={isRail}
                            onToggleCollapsed={isMobile ? undefined : toggleSidebar}
                        />
                    </div>
                )}

                {/* Center: header + messages + input */}
                {showConversation && (
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, ...panelBase }}>
                        {/* Header bar */}
                        <XStack
                            height={64}
                            flexShrink={0}
                            alignItems="center"
                            justifyContent="space-between"
                            gap="$sm"
                            paddingHorizontal="$lg"
                            backgroundColor="$background"
                            borderBottomWidth={1}
                            borderColor="$borderColor"
                        >
                            <XStack alignItems="center" gap="$md" flex={1} minWidth={0}>
                                {isMobile && chatId && (
                                    <button
                                        onClick={() => navigate("/chat")}
                                        className="text-foreground -ml-2 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[#f2f4f5]"
                                        aria-label={t("chat.back_to_list", { defaultValue: "Wróć do listy rozmów" })}
                                    >
                                        <ArrowLeft className="size-6" />
                                    </button>
                                )}
                                {selectedChat ? (
                                    <XStack alignItems="center" gap="$md" flex={1} minWidth={0}>
                                        <ChatAvatar
                                            name={selectedChat.name}
                                            size={40}
                                            dimmed={!selectedChat.is_active}
                                        />
                                        <Typography
                                            variant="regularBold"
                                            tag="h2"
                                            numberOfLines={1}
                                            style={{ minWidth: 0 }}
                                        >
                                            {selectedChat.name}
                                        </Typography>
                                    </XStack>
                                ) : chatId ? (
                                    <XStack alignItems="center" gap="$md">
                                        <Skeleton circle width={40} height={40} />
                                        <Skeleton height={16} width={160} />
                                    </XStack>
                                ) : null}
                            </XStack>
                            {selectedChat && headerActions}
                        </XStack>

                        {/* Chat area */}
                        {chatId ? (
                            <Chat
                                onDeleteMessage={selectedChat?.is_active ? handleDeleteMessage : undefined}
                                onRetryMessage={retrySend}
                                status={connectionStatus}
                                messages={messages}
                                onSendMessage={send}
                                chat={selectedChat}
                                isChatInitializing={isSelectedChatLoading}
                                onLoadMoreMessages={loadBackHistory}
                                historyState={historyState}
                            />
                        ) : (
                            // Desktop, nothing selected yet (e.g. no chats at all).
                            <YStack flex={1} alignItems="center" justifyContent="center" padding="$xl" gap="$md">
                                <MessagesSquare size={48} color="#83dbd3" aria-hidden />
                                <Typography
                                    variant="largeRegular"
                                    muted
                                    style={{ textAlign: "center", display: "block", width: "100%" }}
                                >
                                    {t("chat.select_conversation", { defaultValue: "Wybierz rozmowę z listy" })}
                                </Typography>
                            </YStack>
                        )}
                    </div>
                )}

                {/* Right: note sidebar */}
                {showNote && selectedChat && canUseChatAttachments && (
                    <Note key={selectedChat.id} onClose={() => setShowNote(false)} chat={selectedChat} />
                )}

                {/* Right: contract sidebar */}
                {showContractModal && selectedChat && canUseChatAttachments && (
                    <ContractSidebar
                        key={`contract-${selectedChat.id}`}
                        chatId={selectedChat.id.toString()}
                        readonly={!selectedChat.is_active}
                        onClose={() => setShowContractModal(false)}
                    />
                )}

                {showHelpRules && selectedChat && <HelpRulesSidebar onClose={() => setShowHelpRules(false)} />}

                {/* Right: details panel */}
                {showDetails && selectedChat && (
                    <ChatDetails
                        onClose={() => setShowDetails(false)}
                        chat={selectedChat}
                        onAddParticipant={
                            selectedChat.is_active && hasPermissions(Permissions.MANAGE_CHATS)
                                ? () => setShowAddParticipant(true)
                                : undefined
                        }
                        canManageParticipants={selectedChat.is_active && hasPermissions(Permissions.MANAGE_CHATS)}
                        onParticipantRemoved={reloadChat}
                        onCloseChat={canCloseChat ? () => setShowCloseChatModal(true) : undefined}
                    />
                )}
            </div>

            {showReportModal && selectedChat?.is_active && canUseChatAttachments && (
                <ReportModal open={showReportModal} onClose={() => setShowReportModal(false)} />
            )}
            {showCustomizeModal && (
                <CustomizeChatModal open={showCustomizeModal} onClose={() => setShowCustomizeModal(false)} />
            )}
            {showNewChatModal && (
                <NewChatModal
                    open={showNewChatModal}
                    onClose={() => setShowNewChatModal(false)}
                    onSuccess={(chat) => navigate(`/chat/${chat.id}`)}
                />
            )}
            {showAddParticipant && selectedChat && (
                <AddParticipantModal
                    open={showAddParticipant}
                    onClose={() => setShowAddParticipant(false)}
                    chat={selectedChat}
                    allowedRoles={getAllowedParticipantRoles(selectedChat)}
                    onSuccess={reloadChat}
                />
            )}
            {selectedChat && (
                <CloseChatModal
                    open={showCloseChatModal}
                    onClose={() => setShowCloseChatModal(false)}
                    onConfirm={() => {
                        closeChat(selectedChat);
                        setShowCloseChatModal(false);
                    }}
                />
            )}
            {selectedChat?.auto_close_at && (
                <SnoozeAutoCloseModal
                    open={showSnoozeAutoCloseModal}
                    currentAutoCloseAt={selectedChat.auto_close_at}
                    extensionDays={snoozeExtensionDays}
                    isPending={isSnoozingAutoClose}
                    onClose={() => setShowSnoozeAutoCloseModal(false)}
                    onConfirm={() => snoozeAutoClose({ id: selectedChat.id })}
                />
            )}
        </TooltipProvider>
    );
};

export default ChatWindow;
