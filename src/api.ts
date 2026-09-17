import buildQuery from "./helpers/buildQuery";
import {
    ArticleCategoryOptions,
    ReadArticleOptions,
    ReadArticlesOptions,
    ReadPublicArticlesOptions,
    SearchPublicArticlesOptions,
    UpdateArticleOptions,
} from "./modules/articles/types";
import {
    ChatContractOptions,
    ChatNoteOptions,
    ConnectOptions,
    ConnectUnreadMessagesOptions,
    DeleteMessageOptions,
    EditChatOptions,
    GetChatMessagesOptions,
    MarkAsReadMutationOptions,
    ParticipantOptions,
    ReadChatOptions,
    SearchChatQueryOptions,
} from "./modules/chat/types";
import { CanUserSendFormOptions, FormOptions, ReadAllFormOptions } from "./modules/forms/types";
import { UserTimelineOptions } from "./modules/matching/types";
import { ChangeReportStatusPayload } from "./modules/report/types";
import {
    PublicProfileOptions,
    ReadSearchUsersOptions,
    ReadUserByIdOptions,
    ReadUsersReportsOptions,
} from "./modules/users/types";

export const baseUrl = import.meta.env.VITE_BASE_URL as string;
export const websocketUrl = import.meta.env.VITE_BASE_WS_URL as string;
export const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string;

export const url = {
    login: {
        loginAccessToken: `${baseUrl}/api/v1/login/access-token`,
        testToken: `${baseUrl}/api/v1/login/test-token`,
    },
    reports: {
        changeStatus({ user_report_id }: ChangeReportStatusPayload) {
            return `${baseUrl}/api/v1/user-report/${user_report_id}/change-status`;
        },
        create: `${baseUrl}/api/v1/user-report/`,
        // get: `${baseUrl}/api/v1/user-report/`,
        get(options: ReadUsersReportsOptions) {
            const query = buildQuery(options);

            return `${baseUrl}/api/v1/user-report/?${query}`;
        },
    },
    users: {
        searchUser(options: ReadSearchUsersOptions) {
            const query = buildQuery(options);

            return `${baseUrl}/api/v1/users/?${query}`;
        },
        readUserById({ id }: ReadUserByIdOptions) {
            return `${baseUrl}/api/v1/users/${id}`;
        },
        updateUser({ id }: ReadUserByIdOptions) {
            return `${baseUrl}/api/v1/users/${id}`;
        },
        updateUserAvatar({ id }: ReadUserByIdOptions) {
            return `${baseUrl}/api/v1/user-public-profile/${id}/avatar`;
        },
        updateUserByAdmin({ id }: ReadUserByIdOptions) {
            return `${baseUrl}/api/v1/users/${id}/edit-as-admin`;
        },
        createUser: `${baseUrl}/api/v1/users/`,
        changePasswordBegin: `${baseUrl}/api/v1/users/reset-password-mail`,
        changePasswordComplete: `${baseUrl}/api/v1/users/change-password`,
        confirmEmailComplete: `${baseUrl}/api/v1/users/confirm`,
        readUsersMe: `${baseUrl}/api/v1/users/me`,
        updateUserMe: `${baseUrl}/api/v1/users/me`,
        createUserOpen: `${baseUrl}/api/v1/users/open`,
        changePassword: `${baseUrl}/api/v1/users/change-password`,
        resetPassword: `${baseUrl}/api/v1/users/reset-password`,
    },
    chat: {
        inactivitySettings: `${baseUrl}/api/v1/chat/inactivity-settings`,
        readChats(options: SearchChatQueryOptions) {
            const query = buildQuery(options);
            return `${baseUrl}/api/v1/chat/?${query}`;
        },
        readChat({ id }: ReadChatOptions) {
            return `${baseUrl}/api/v1/chat/${id}`;
        },
        markAsRead({ id }: MarkAsReadMutationOptions) {
            return `${baseUrl}/api/v1/chat/${id}/mark-as-read`;
        },
        readChatUsers({ id }: ReadChatOptions) {
            return `${baseUrl}/api/v1/chat/${id}/user/`;
        },
        deleteMessage({ id }: DeleteMessageOptions) {
            return `${baseUrl}/api/v1/message/${id}`;
        },
        getNoteForChat({ id }: ChatNoteOptions) {
            return `${baseUrl}/api/v1/chat-note/chat/${id}`;
        },
        editChat({ id }: EditChatOptions) {
            return `${baseUrl}/api/v1/chat/${id}`;
        },
        closeChat({ id }: ReadChatOptions) {
            return `${baseUrl}/api/v1/chat/${id}/deactivate`;
        },
        snoozeAutoClose({ id }: ReadChatOptions) {
            return `${baseUrl}/api/v1/chat/${id}/snooze-auto-close`;
        },
        editNote({ id }: ChatNoteOptions) {
            return `${baseUrl}/api/v1/chat-note/chat/${id}`;
        },
        getContractForChat({ id }: ChatContractOptions) {
            return `${baseUrl}/api/v1/contract/chat/${id}`;
        },
        editContract({ id }: ChatContractOptions) {
            return `${baseUrl}/api/v1/contract/chat/${id}`;
        },
        confirmContract({ id }: ChatContractOptions) {
            return `${baseUrl}/api/v1/contract/chat/${id}/confirm`;
        },
        addParticipant({ chat_id, participant_id }: ParticipantOptions) {
            return `${baseUrl}/api/v1/chat/${chat_id}/participant/${participant_id}`;
        },
        removeParticipant({ chat_id, participant_id, auto_rematch }: ParticipantOptions) {
            const query = auto_rematch === undefined ? "" : `?auto_rematch=${auto_rematch}`;
            return `${baseUrl}/api/v1/chat/${chat_id}/participant/${participant_id}${query}`;
        },
        readMessages({ chatId, ...options }: GetChatMessagesOptions) {
            const query = buildQuery(options);
            return `${baseUrl}/api/v1/message/${chatId}?${query}`;
        },

        connect(options: ConnectOptions) {
            const query = buildQuery(options);
            return `${websocketUrl}/ws-chat?${query}`;
        },
        connectChatList(options: ConnectUnreadMessagesOptions) {
            return `${websocketUrl}/ws-chat-list?${buildQuery(options)}`;
        },
        connectUnreadMessages(options: ConnectUnreadMessagesOptions) {
            const query = buildQuery(options);
            return `${websocketUrl}/ws-unread-chats?${query}`;
        },
        createChat: `${baseUrl}/api/v1/chat/`,
    },
    articles: {
        create: `${baseUrl}/api/v1/article/`,
        readArticles(options: ReadArticlesOptions) {
            const query = buildQuery(options);
            return `${baseUrl}/api/v1/article?${query}`;
        },
        readPublicArticles(options: ReadPublicArticlesOptions) {
            const query = buildQuery(options);
            return `${baseUrl}/api/v1/article/public?${query}`;
        },
        readById({ id }: ReadArticleOptions) {
            return `${baseUrl}/api/v1/article/${id}/detail`;
        },
        searchPublicArticles(options: SearchPublicArticlesOptions) {
            const query = buildQuery(options);
            return `${baseUrl}/api/v1/article/public/search?${query}`;
        },
        readByUser({ author, ...props }: ReadPublicArticlesOptions) {
            const query = buildQuery(props);
            return `${baseUrl}/api/v1/article/public/user/${author}?${query}`;
        },
        update({ id }: UpdateArticleOptions) {
            return `${baseUrl}/api/v1/article/${id}`;
        },
        updateBanner({ id }: UpdateArticleOptions) {
            return `${baseUrl}/api/v1/article/${id}/banner`;
        },
        delete({ id }: UpdateArticleOptions) {
            return `${baseUrl}/api/v1/article/${id}`;
        },
        changeStatus({ id }: UpdateArticleOptions) {
            return `${baseUrl}/api/v1/article/${id}/change-status`;
        },
    },
    articleCategories: {
        update({ id }: ArticleCategoryOptions) {
            return `${baseUrl}/api/v1/article-category/${id}`;
        },
        delete({ id }: ArticleCategoryOptions) {
            return `${baseUrl}/api/v1/article-category/${id}`;
        },
        changeStatus({ id }: ArticleCategoryOptions) {
            return `${baseUrl}/api/v1/article-category/${id}/change-status`;
        },
        read: `${baseUrl}/api/v1/article-category/`,
        create: `${baseUrl}/api/v1/article-category/`,
    },
    publicProfiles: {
        read({ id }: PublicProfileOptions) {
            return `${baseUrl}/api/v1/user-public-profile/${id}`;
        },
        update({ id }: PublicProfileOptions) {
            return `${baseUrl}/api/v1/user-public-profile/${id}`;
        },
    },
    matching: {
        volunteerAvailability: `${baseUrl}/api/v1/matching/volunteer/availability`,
        waitingMentees: `${baseUrl}/api/v1/matching/admin/queue`,
        matchedMentees: `${baseUrl}/api/v1/matching/admin/matched`,
        pausedMentees: `${baseUrl}/api/v1/matching/admin/paused`,
        volunteers: `${baseUrl}/api/v1/matching/admin/volunteers`,
        alerts: `${baseUrl}/api/v1/matching/admin/alerts`,
        settings: `${baseUrl}/api/v1/matching/admin/settings`,
        run: `${baseUrl}/api/v1/matching/admin/run`,
        manualPair: `${baseUrl}/api/v1/matching/admin/manual-pair`,
        queueForm({ id }: FormOptions) {
            return `${baseUrl}/api/v1/matching/admin/forms/${id}/queue`;
        },
        myState: `${baseUrl}/api/v1/matching/me/state`,
        rematchDecision: `${baseUrl}/api/v1/matching/me/rematch-decision`,
        updateUserAutomationExclusion({ id }: ReadUserByIdOptions) {
            return `${baseUrl}/api/v1/matching/admin/users/${id}/automation-exclusion`;
        },
        adminRematchDecision({ id }: ReadUserByIdOptions) {
            return `${baseUrl}/api/v1/matching/admin/users/${id}/rematch-decision`;
        },
        userTimeline(options: UserTimelineOptions) {
            const query = buildQuery(options);
            return `${baseUrl}/api/v1/matching/admin/user-timeline?${query}`;
        },
    },
    form: {
        readById({ id }: FormOptions) {
            return `${baseUrl}/api/v1/form/${id}`;
        },
        update({ id }: FormOptions) {
            return `${baseUrl}/api/v1/form/${id}`;
        },
        delete({ id }: FormOptions) {
            return `${baseUrl}/api/v1/form/${id}`;
        },
        accept({ id }: FormOptions) {
            return `${baseUrl}/api/v1/form/${id}/accept`;
        },
        reject({ id }: FormOptions) {
            return `${baseUrl}/api/v1/form/${id}/reject`;
        },
        read(options: ReadAllFormOptions) {
            const query = buildQuery(options);
            return `${baseUrl}/api/v1/form/?${query}`;
        },
        updateNote({ id }: FormOptions) {
            return `${baseUrl}/api/v1/form/${id}/notes`;
        },
        create: `${baseUrl}/api/v1/form/`,
        canUserSendForm(options?: CanUserSendFormOptions) {
            const query = buildQuery(options ?? {});
            return query ? `${baseUrl}/api/v1/form/can-send-form?${query}` : `${baseUrl}/api/v1/form/can-send-form`;
        },
    },
};
