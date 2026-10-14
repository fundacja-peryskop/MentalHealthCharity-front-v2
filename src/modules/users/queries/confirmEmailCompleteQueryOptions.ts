import { queryOptions } from "@tanstack/react-query";
import { url } from "../../../api";
import { ConfirmEmailCompletePayload, PublicProfile } from "../types";

/**
 * Confirm a new account from the email link token.
 *
 * The token is single-use, so `retry: false` - retrying a failed confirmation
 * never succeeds and only delays the error feedback (and would re-toast). The
 * screen renders its own success/error UI, so we surface the server's error
 * `detail` (e.g. "Invalid or expired confirmation token.") on the thrown error
 * instead of going through the global toast handler.
 */
export const confirmEmailCompleteQueryOptions = (options: ConfirmEmailCompletePayload) =>
    queryOptions<PublicProfile, Error>({
        queryKey: ["confirmEmailComplete", options.token],
        enabled: !!options.token,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        gcTime: 0,
        queryFn: async () => {
            const response = await fetch(url.users.confirmEmailComplete, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(options),
            });

            if (!response.ok) {
                const detail = await response
                    .json()
                    .then((body: unknown) =>
                        body && typeof body === "object" && typeof (body as { detail?: unknown }).detail === "string"
                            ? (body as { detail: string }).detail
                            : ""
                    )
                    .catch(() => "");
                throw new Error(detail || `confirm_failed_${response.status}`);
            }

            return response.json();
        },
    });
