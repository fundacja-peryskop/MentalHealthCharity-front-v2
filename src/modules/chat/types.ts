import { ReadyState } from "react-use-websocket";
import { User } from "../auth/types";
import { DefaultPaginationOptions } from "../shared/types";
import { ChatSortByOptions } from "./constants";

export interface ReadChatOptions {
    id: number | string;
}

export interface ChatNoteOptions {
    id: number | string;
}

export interface EditChatOptions {
    id: number;
}

export interface ChatContractOptions {
    id: number | string;
}

export interface DeleteMessageOptions {
    id: number;
}

export interface MarkAsReadMutationOptions {
    id: number;
}

export interface CreateChatPayload {
    name: string;
    flags: Record<string, string[]>;
}

export interface CreateChatFormValues {
    name: string;
    flags: string[];
    role: string;
}

export interface ParticipantOptions {
    chat_id: number;
    participant_id: number;
    auto_rematch?: boolean;
}

export interface GetChatMessagesOptions extends DefaultPaginationOptions {
    chatId: string | number;
    page?: number;

    // 1 - 100
    size?: number;
}

export interface ConnectOptions {
    token: string;
    chat_id: string;
}

export interface ConnectUnreadMessagesOptions {
    token: string;
}

export interface Message {
    content: string;
    id: number;
    sender: User;
    creation_date: string;
    isPending?: boolean;
    /** Marks a message that failed to send (timed out or connection lost) */
    isFailed?: boolean;
    chat_id: number;
    /** Marks messages loaded from archive (beyond initial page) */
    isArchived?: boolean;
}

export interface Note {
    content: string;
    id: number;
}

export interface SocketMessage {
    id: number;
    content: string;
    creation_date: string;
    sender_id: number;
    is_read: boolean;
    auto_close_at?: string | null;
}

export interface Contract {
    is_confirmed: boolean;
    content: string;
    id: number;
}

export interface Chat {
    name: string | null;
    id: number;
    participants: User[];
    is_active: boolean;
    is_group_chat: boolean;
    is_special_chat: boolean;
    chat_type: "SUPPORT" | "SUPERVISION" | "GROUP" | "DIRECT";
    status: "ACTIVE" | "CLOSED" | "ARCHIVED";
    matching_mode: "AUTO" | "MANUAL";
    matching_source: "AUTO" | "MANUAL" | null;
    closed_at: string | null;
    auto_close_at: string | null;
    creation_date: string;
    last_message?: Message;
    is_supervisor_chat: boolean;
    unread_count: number;
}

export interface SearchChatQueryOptions extends DefaultPaginationOptions {
    revision?: string;
    search?: string;
    unread_first?: boolean;
    sort_by?: ChatSortByOptions;
    status?: "active" | "closed" | "archived";
    supervisor_chat?: boolean;
}

export type ChatListFilter = "all" | "active" | "closed" | "supervisor";

export interface ConnectionStatus {
    text: string;
    isError: boolean;
    isLoading: boolean;
    state: ReadyState;
}

export interface EditNotePayload {
    content: string;
    id: number;
}

export interface AddParticipantPayload {
    participant_id: number;
    chat_id: number;
}

export interface EditChatPayload {
    id: number;
    name: string;
    is_active: boolean;
}

export interface CloseChatPayload {
    id: number;
}

export interface SnoozeAutoClosePayload {
    id: number;
}

export interface ChatInactivitySettings {
    empty_or_starter_timeout_days: number;
    conversation_timeout_days: number;
    snooze_extension_days: number;
    updated_at?: string | null;
    updated_by_id?: number | null;
}

export type ChatInactivitySettingsUpdate = Pick<
    ChatInactivitySettings,
    "empty_or_starter_timeout_days" | "conversation_timeout_days" | "snooze_extension_days"
>;

export enum SocketEventType {
    MESSAGE = "message",
    DELETE = "delete",
}

export interface ChatDeleteEvent {
    id: number;
    event: SocketEventType.DELETE;
    auto_close_at?: string | null;
}
