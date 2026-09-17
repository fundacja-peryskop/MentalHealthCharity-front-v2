import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Plus, Search } from "lucide-react";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import AddParticipantModal from "../modules/chat/components/AddParticipantModal";
import ChatManager from "../modules/chat/components/ChatManager";
import CreateChatModal from "../modules/chat/components/CreateChatModal";
import EditChatModal from "../modules/chat/components/EditChatModal";
import getAllowedParticipantRoles from "../modules/chat/helpers/getAllowedParticipantRoles";
import useChatList from "../modules/chat/hooks/useChatList";
import closeChatMutation from "../modules/chat/queries/closeChatMutation";
import editChatMutation from "../modules/chat/queries/editChatMutation";
import removeParticipantMutation from "../modules/chat/queries/removeParticipantMutation";
import { Chat, ChatListFilter } from "../modules/chat/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import useDebounce from "../modules/shared/hooks/useDebounce";

const chatListFilters: { label: string; value: ChatListFilter }[] = [
    { label: "Wszystkie", value: "all" },
    { label: "Aktywne", value: "active" },
    { label: "Zamknięte", value: "closed" },
    { label: "Superwizyjne", value: "supervisor" },
];

const getInitialChatFilter = (filter: string | null): ChatListFilter => {
    return chatListFilters.some((item) => item.value === filter) ? (filter as ChatListFilter) : "all";
};

const ManageChatsScreen = () => {
    const { t } = useTranslation();
    const [params, setParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
    const [chatFilter, setChatFilter] = useState<ChatListFilter>(getInitialChatFilter(params.get("filter")));
    const debouncedQuery = useDebounce(searchQuery, 500);
    const [showCreateChatModal, setShowCreateChatModal] = useState(false);
    const [selectedChatToEdit, setSelectedChatToEdit] = useState<Chat | null>(null);
    const [selectedChatToAddParticipant, setSelectedChatToAddParticipant] = useState<Chat | null>(null);
    const { chats, isError, handleLoadChats, handleRefetch } = useChatList(debouncedQuery, chatFilter);

    const { mutate: editChat } = useMutation({
        mutationFn: editChatMutation,
        onSuccess: () => {
            toast.success(t("chat.edit_chat_success"));
            handleRefetch();
            setSelectedChatToEdit(null);
        },
    });

    const { mutate: closeChat } = useMutation({
        mutationFn: closeChatMutation,
        onSuccess: () => {
            toast.success(t("chat.close_chat_success", { defaultValue: "Czat został zamknięty" }));
            handleRefetch();
        },
    });

    const { mutate: removeParticipant } = useMutation({
        mutationFn: removeParticipantMutation,
        onSuccess: () => {
            handleRefetch();
            toast.success(t("chat.remove_participant_success"));
        },
    });

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        const nextParams = new URLSearchParams(params);
        if (query) {
            nextParams.set("search", query);
        } else {
            nextParams.delete("search");
        }
        setParams(nextParams);
    };

    const handleFilterChange = (filter: ChatListFilter) => {
        setChatFilter(filter);
        const nextParams = new URLSearchParams(params);
        if (filter === "all") {
            nextParams.delete("filter");
        } else {
            nextParams.set("filter", filter);
        }
        setParams(nextParams);
    };

    return (
        <AdminLayout>
            {/* Header card */}
            <div className="bg-card border-border/50 rounded-xl border p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-brand/10 flex size-11 items-center justify-center rounded-lg">
                            <MessageSquare className="text-primary-brand size-5" />
                        </div>
                        <div>
                            <h1 className="text-foreground text-xl font-bold">{t("admin_screen.chat_list_title")}</h1>
                            <p className="text-muted-foreground text-sm">
                                {t("admin_screen.chat_list_subtitle")}
                                {chats && (
                                    <Badge variant="outline" className="ml-2 align-middle text-xs">
                                        {chats.total}
                                    </Badge>
                                )}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreateChatModal(true)} className="shrink-0">
                        <Plus className="mr-1.5 size-4" />
                        {t("chat.create_new_chat")}
                    </Button>
                </div>

                {/* Search bar */}
                <div className="relative mt-5">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-9"
                        placeholder={t("chat.search_label")}
                    />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {chatListFilters.map((filter) => (
                        <Button
                            key={filter.value}
                            type="button"
                            size="sm"
                            variant={chatFilter === filter.value ? "secondary" : "outline"}
                            onClick={() => handleFilterChange(filter.value)}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Chat list */}
            {isError && (
                <div role="alert" className="my-3 text-sm">
                    <p>{t("chat.list_error")}</p>
                    <button type="button" className="underline" onClick={() => void handleRefetch()}>
                        {t("chat.retry_list")}
                    </button>
                </div>
            )}
            <ChatManager
                onLoadMore={handleLoadChats}
                onAddParticipant={(chat) => setSelectedChatToAddParticipant(chat)}
                onRemoveParticipant={(chat, participant, autoRematch) =>
                    removeParticipant({
                        chat_id: chat.id,
                        participant_id: participant.id,
                        auto_rematch: autoRematch,
                    })
                }
                data={chats ?? undefined}
                onToggleChat={(chat) =>
                    chat.is_active
                        ? closeChat({ id: chat.id })
                        : editChat({
                              id: chat.id,
                              is_active: true,
                              name: chat.name ?? "",
                          })
                }
                onEditChat={(chat) => setSelectedChatToEdit(chat)}
            />

            <CreateChatModal
                onClose={() => setShowCreateChatModal(false)}
                open={showCreateChatModal}
                onSuccess={() => {
                    setShowCreateChatModal(false);
                    handleRefetch();
                    toast.success(t("chat.create_chat_success"));
                }}
            />
            {selectedChatToEdit && (
                <EditChatModal
                    chat={selectedChatToEdit}
                    open={!!selectedChatToEdit}
                    onSubmit={editChat}
                    onClose={() => setSelectedChatToEdit(null)}
                />
            )}
            {selectedChatToAddParticipant && (
                <AddParticipantModal
                    onSuccess={() => {
                        handleRefetch();
                        toast.success(t("chat.add_participant_success"));
                    }}
                    chat={selectedChatToAddParticipant}
                    allowedRoles={getAllowedParticipantRoles(selectedChatToAddParticipant)}
                    open={!!selectedChatToAddParticipant}
                    onClose={() => setSelectedChatToAddParticipant(null)}
                />
            )}
        </AdminLayout>
    );
};

export default ManageChatsScreen;
