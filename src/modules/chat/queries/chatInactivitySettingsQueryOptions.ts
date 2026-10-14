import { queryOptions } from "@tanstack/react-query";
import { url } from "../../../api";
import getAuthHeaders from "../../auth/helpers/getAuthHeaders";
import handleApiError from "../../shared/helpers/handleApiError";
import { ChatInactivitySettings } from "../types";

/**
 * The server refused the settings request with a 4xx. Retrying cannot help -
 * e.g. a backend deployed before this endpoint existed answers 422, because the
 * path falls through to `/chat/{chat_id}`.
 */
export class ChatInactivitySettingsUnavailableError extends Error {
    constructor(readonly status: number) {
        super(`Chat inactivity settings unavailable (HTTP ${status})`);
    }
}

/** Admin-tuned values that rarely change; no need to refetch on every chat visit. */
const SETTINGS_STALE_TIME = 5 * 60 * 1000;

/**
 * Chat auto-close settings. Optional for the chat screen, which falls back to
 * defaults (and hides "snooze") without them, so a 4xx is not retried and does
 * not raise a toast; the admin settings screen shows its own inline error.
 * Network and 5xx failures still go through the shared error handling.
 */
export const chatInactivitySettingsQueryOptions = () =>
    queryOptions<ChatInactivitySettings>({
        queryKey: ["chat", "inactivity-settings"],
        queryFn: async () => {
            const response = await fetch(url.chat.inactivitySettings, {
                headers: getAuthHeaders(),
            });

            if (response.status >= 400 && response.status < 500) {
                throw new ChatInactivitySettingsUnavailableError(response.status);
            }

            const data = await response.json();

            if (!response.ok) {
                await handleApiError(data);
            }

            return data;
        },
        staleTime: SETTINGS_STALE_TIME,
        retry: (failures, error) => !(error instanceof ChatInactivitySettingsUnavailableError) && failures < 2,
    });
