import getChatName from "../../helpers/getChatName";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlarmClockPlus, BookOpen, Flag, LockKeyhole, Menu, ScrollText, StickyNote, Users } from "lucide-react";
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
import ChatDetails from "../ChatDetails";
import ChatSidebar from "../ChatSidebar";
import CloseChatModal from "../CloseChatModal";
import ContractSidebar from "../ContractModal/ContractModal";
import CustomizeChatModal from "../CustomizeChatModal";
import HelpRulesSidebar from "../HelpRulesSidebar";
import NewChatModal from "../NewChatModal";
import Note from "../Note";
import SnoozeAutoCloseModal from "../SnoozeAutoCloseModal";

const ChatWindow = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const parsedChatId = id ? Number(id) : Number.NaN;
    const chatId = Number.isInteger(parsedChatId) && parsedChatId > 0 ? parsedChatId : undefined;
    const [chatFilter, setChatFilter] = useState<"active" | "closed">("active");
    const {
        data,
        aggregatedData,
        loadNextPage,
        searchQuery,
        setSearchQuery,
        isSearching,
        isError: isListError,
        refetch: refetchList,
    } = useChatListLoader(100, chatFilter);
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
    const [showSidebar, setShowSidebar] = useState(false);
    const { hasPermissions } = usePermissions();

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
        selectedChat.chat_type !== "SUPERVISION" &&
        selectedChat.is_active &&
        selectedChat.status === "ACTIVE" &&
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

    useEffect(() => {
        if (!chatId && effectiveData?.items.length) {
            navigate(`/chat/${effectiveData.items[0].id}`, { replace: true });
        }
    }, [chatId, effectiveData, navigate]);

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
        <div className="flex items-center gap-0.5">
            {canUseChatAttachments && hasPermissions(Permissions.EDIT_CHAT_NOTE) && (
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                onClick={() => setShowNote(!showNote)}
                                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
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
                                        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
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
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
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
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
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
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
                            aria-label={t("chat.show_details", { defaultValue: "Details" })}
                        >
                            <Users className="size-5" />
                        </button>
                    }
                />
                <TooltipContent>{t("chat.show_details", { defaultValue: "Details" })}</TooltipContent>
            </Tooltip>

            {canSnoozeAutoClose && (
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                type="button"
                                disabled={isSnoozingAutoClose}
                                onClick={() => setShowSnoozeAutoCloseModal(true)}
                                className="text-warning-brand hover:bg-warning-brand/10 rounded-lg p-2 transition-colors disabled:opacity-50"
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
                                    className="text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-colors"
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

    return (
        <TooltipProvider>
            <div className="flex h-full flex-1">
                {/* Left: sidebar */}
                <ChatSidebar
                    listVersion={effectiveData?.revision}
                    isError={isListError}
                    onRetry={() => void refetchList()}
                    handleDrawerToggle={() => setShowSidebar((prev) => !prev)}
                    showSidebar={showSidebar}
                    data={effectiveData}
                    loadMore={loadNextPage}
                    currentChatId={chatId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isSearching={isSearching}
                    filter={chatFilter}
                    onFilterChange={handleFilterChange}
                    onNewChat={hasPermissions(Permissions.MANAGE_CHATS) ? () => setShowNewChatModal(true) : undefined}
                />

                {/* Center: header + messages + input */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Header bar */}
                    <div className="border-border/50 bg-card flex h-16 shrink-0 items-center justify-between border-b px-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSidebar((prev) => !prev)}
                                className="text-muted-foreground hover:text-foreground transition-colors md:hidden"
                                aria-label={t("chat.show_more_chats")}
                            >
                                <Menu className="size-6" />
                            </button>
                            {selectedChat ? (
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-brand/20 text-primary-brand flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                        {getChatName(selectedChat).charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-foreground truncate text-sm font-semibold">
                                        {getChatName(selectedChat)}
                                    </h2>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-9 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            )}
                        </div>
                        {headerActions}
                    </div>

                    {/* Chat area */}

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
                </div>

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
