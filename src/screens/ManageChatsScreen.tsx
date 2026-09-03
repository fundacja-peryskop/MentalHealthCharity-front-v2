import { Input, YStack } from "@fundacja-peryskop/ui";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Plus, Search } from "lucide-react";
import { useState } from "react";
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
import { AdminPageHeader, FilterPills, PillButton, StatusPill } from "../modules/layout/admin";
import { useIconColor } from "../modules/layout/useIconColor";
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
    const c = useIconColor();
    const [params, setParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
    const [chatFilter, setChatFilter] = useState<ChatListFilter>(getInitialChatFilter(params.get("filter")));
    const debouncedQuery = useDebounce(searchQuery, 500);
    const [showCreateChatModal, setShowCreateChatModal] = useState(false);
    const [selectedChatToEdit, setSelectedChatToEdit] = useState<Chat | null>(null);
    const [selectedChatToAddParticipant, setSelectedChatToAddParticipant] = useState<Chat | null>(null);
    const { chats, handleLoadChats, handleRefetch } = useChatList(debouncedQuery, chatFilter);

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

    const handleSearch = (query: string) => {
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
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={MessageSquare}
                    tone="primary"
                    title={t("admin_screen.chat_list_title")}
                    subtitle={t("admin_screen.chat_list_subtitle")}
                    actions={
                        <>
                            {chats && <StatusPill tone="neutral">{chats.total}</StatusPill>}
                            <PillButton icon={Plus} variant="solid" onPress={() => setShowCreateChatModal(true)}>
                                {t("chat.create_new_chat")}
                            </PillButton>
                        </>
                    }
                />

                <YStack gap="$md">
                    <Input
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder={t("chat.search_label")}
                        prefix={<Search size={16} color={c.muted} />}
                    />
                    <FilterPills
                        ariaLabel={t("admin_screen.chat_list_title")}
                        value={chatFilter}
                        onChange={(value) => handleFilterChange(value as ChatListFilter)}
                        options={chatListFilters}
                    />
                </YStack>

                {/* Chat list */}
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
                                  name: chat.name,
                              })
                    }
                    onEditChat={(chat) => setSelectedChatToEdit(chat)}
                />
            </YStack>

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
