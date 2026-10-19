import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../auth/components/AuthProvider";
import Modal from "../../../shared/components/Modal";
import { Roles } from "../../../users/constants";
import { MenteeMatchingStatus } from "../../types";
import { myMatchingStateQueryOptions } from "../../queries/myMatchingStateQueryOptions";
import rematchDecisionMutation from "../../queries/rematchDecisionMutation";

const REMATCH_PROMPT_REMINDER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

const getReminderStorageKey = (userId: number) => `matching_rematch_prompt_next_at_${userId}`;

const getStoredReminderAt = (userId: number) => {
    const rawValue = localStorage.getItem(getReminderStorageKey(userId));
    const timestamp = rawValue ? Number(rawValue) : null;

    return timestamp && Number.isFinite(timestamp) ? timestamp : null;
};

const setStoredReminderAt = (userId: number, reminderAt: number) => {
    localStorage.setItem(getReminderStorageKey(userId), String(reminderAt));
};

const clearStoredReminderAt = (userId: number) => {
    localStorage.removeItem(getReminderStorageKey(userId));
};

const MenteeRematchPrompt = () => {
    const { t } = useTranslation();
    // The real role, not an administrator's role preview: this prompt sends a
    // rematch request for the signed-in account.
    const { actualUser: user } = useUser();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [reminderAt, setReminderAt] = useState<number | null>(null);
    const isMentee = user?.user_role === Roles.USER;

    const { data } = useQuery(
        myMatchingStateQueryOptions({
            enabled: isMentee,
            retry: false,
            refetchOnWindowFocus: true,
        })
    );

    const { mutate, isPending } = useMutation({
        mutationFn: rematchDecisionMutation,
        onSuccess: (state, variables) => {
            setOpen(false);
            clearStoredReminderAt(state.user_id);
            setReminderAt(null);
            queryClient.setQueryData(["matching", "me", "state"], state);
            queryClient.invalidateQueries({ queryKey: ["chat"] });
            toast.success(
                variables.wants_rematch
                    ? t("matching.rematch_requested_success", {
                          defaultValue: "Zgłoszenie do ponownego sparowania zostało zapisane.",
                      })
                    : t("matching.rematch_declined_success", {
                          defaultValue: "Dziękujemy za odpowiedź.",
                      })
            );
        },
    });

    const isWaitingForRematchDecision =
        isMentee && data?.status === MenteeMatchingStatus.PAUSED && !data.current_chat_id;

    useEffect(() => {
        if (!isMentee || !data) return;

        if (!isWaitingForRematchDecision) {
            clearStoredReminderAt(data.user_id);
            setReminderAt(null);
            setOpen(false);
            return;
        }

        setReminderAt(getStoredReminderAt(data.user_id));
    }, [data, isMentee, isWaitingForRematchDecision]);

    useEffect(() => {
        if (!data || !isWaitingForRematchDecision) return;

        const now = Date.now();

        if (!reminderAt || reminderAt <= now) {
            setOpen(true);
            return;
        }

        setOpen(false);
        const timeout = window.setTimeout(() => setOpen(true), reminderAt - now);

        return () => window.clearTimeout(timeout);
    }, [data, isWaitingForRematchDecision, reminderAt]);

    const handleClose = () => {
        if (isPending) return;

        if (data && isWaitingForRematchDecision) {
            const nextReminderAt = Date.now() + REMATCH_PROMPT_REMINDER_INTERVAL_MS;
            setStoredReminderAt(data.user_id, nextReminderAt);
            setReminderAt(nextReminderAt);
        }

        setOpen(false);
    };

    if (!isMentee) return null;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={t("matching.rematch_prompt_title", { defaultValue: "Czat został zamknięty" })}
        >
            <div className="flex flex-col gap-5">
                <p className="text-muted-foreground text-sm">
                    {t("matching.rematch_prompt_description", {
                        defaultValue:
                            "Ten czat został zamknięty. Czy chcesz byśmy utworzyli dla Ciebie czat z innym wolontariuszem?",
                    })}
                </p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                    <Button type="button" variant="ghost" disabled={isPending} onClick={handleClose}>
                        {t("matching.rematch_remind_later", { defaultValue: "Przypomnij za tydzień" })}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => mutate({ wants_rematch: false })}
                    >
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                        {t("common.no", { defaultValue: "Nie" })}
                    </Button>
                    <Button type="button" disabled={isPending} onClick={() => mutate({ wants_rematch: true })}>
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                        {t("common.yes", { defaultValue: "Tak" })}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default MenteeRematchPrompt;
