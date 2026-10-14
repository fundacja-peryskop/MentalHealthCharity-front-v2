import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    CircleOff,
    Clock,
    FileText,
    Loader2,
    MessageCircle,
    RotateCw,
    UserCheck,
    UserCog,
    UserPlus,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { User } from "../modules/auth/types";
import {
    AdminPageHeader,
    type Column,
    DataTable,
    FilterPills,
    type PillTone,
    PillButton,
    StatusPill,
} from "../modules/layout/admin";
import MenteeFormPreviewModal from "../modules/forms/components/MenteeFormPreviewModal";
import ManualPairModal from "../modules/matching/components/ManualPairModal";
import adminRematchDecisionMutation from "../modules/matching/queries/adminRematchDecisionMutation";
import manualPairMutation from "../modules/matching/queries/manualPairMutation";
import {
    matchedMenteesQueryOptions,
    pausedMenteesQueryOptions,
    waitingMenteesQueryOptions,
} from "../modules/matching/queries/menteeMatchingQueryOptions";
import { volunteerCapacityQueryOptions } from "../modules/matching/queries/volunteerCapacityQueryOptions";
import { MenteeMatchingItem, MenteeMatchingStatus } from "../modules/matching/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import Modal from "../modules/shared/components/Modal";
import formatDate from "../modules/shared/helpers/formatDate";
import EditUserModal from "../modules/users/components/EditUserModal";
import editUserAsAdminMutation from "../modules/users/queries/editUserAsAdminMutation";

type ViewMode = "waiting" | "matched" | "paused";

const statusTone: Record<MenteeMatchingStatus, PillTone> = {
    [MenteeMatchingStatus.WAITING]: "warning",
    [MenteeMatchingStatus.REMATCH_REQUESTED]: "warning",
    [MenteeMatchingStatus.MATCHED]: "success",
    [MenteeMatchingStatus.PAUSED]: "neutral",
    [MenteeMatchingStatus.DECLINED]: "danger",
    [MenteeMatchingStatus.CLOSED]: "neutral",
};

const MatchingMenteesScreen = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<ViewMode>("waiting");
    const [selectedMentee, setSelectedMentee] = useState<MenteeMatchingItem | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [previewFormId, setPreviewFormId] = useState<number | null>(null);
    const [pausedDecision, setPausedDecision] = useState<{
        item: MenteeMatchingItem;
        wantsRematch: boolean;
    } | null>(null);

    const waitingQuery = useQuery(waitingMenteesQueryOptions());
    const matchedQuery = useQuery(matchedMenteesQueryOptions());
    const pausedQuery = useQuery(pausedMenteesQueryOptions());
    const volunteersQuery = useQuery(volunteerCapacityQueryOptions());

    const { mutate: manualPair, isPending: isManualPairPending } = useMutation({
        mutationFn: manualPairMutation,
        onSuccess: (data) => {
            setSelectedMentee(null);
            queryClient.invalidateQueries({ queryKey: ["matching"] });
            toast.success(
                data.warning
                    ? t("matching.manual_pair_success_with_warning", {
                          defaultValue: "{{warning}} Czat ID: {{chatId}}",
                          warning: data.warning,
                          chatId: data.chat_id,
                      })
                    : t("matching.manual_pair_success", {
                          defaultValue: "Utworzono ręczne sparowanie. Czat ID: {{chatId}}",
                          chatId: data.chat_id,
                      })
            );
        },
    });
    const { mutate: editUserAsAdmin } = useMutation({
        mutationFn: editUserAsAdminMutation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matching"] });
            queryClient.invalidateQueries({ queryKey: ["forms"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success(t("common.success"));
        },
    });
    const { mutate: adminRematchDecision, isPending: isAdminRematchDecisionPending } = useMutation({
        mutationFn: adminRematchDecisionMutation,
        onSuccess: (_state, variables) => {
            setPausedDecision(null);
            queryClient.invalidateQueries({ queryKey: ["matching"] });
            toast.success(
                variables.wants_rematch
                    ? t("matching.admin_rematch_restored_success", {
                          defaultValue: "Osoba została przywrócona do kolejki parowania",
                      })
                    : t("matching.admin_rematch_closed_success", {
                          defaultValue: "Obsługa osoby została oznaczona jako zakończona",
                      })
            );
        },
    });

    const confirmPausedDecision = () => {
        if (!pausedDecision) {
            return;
        }

        adminRematchDecision({
            userId: pausedDecision.item.user.id,
            wants_rematch: pausedDecision.wantsRematch,
        });
    };

    const activeQuery = viewMode === "waiting" ? waitingQuery : viewMode === "matched" ? matchedQuery : pausedQuery;
    const items = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);

    const emptyStateText =
        viewMode === "waiting"
            ? t("matching.no_waiting_mentees", { defaultValue: "Brak osób oczekujących na sparowanie." })
            : viewMode === "matched"
              ? t("matching.no_matched_mentees", { defaultValue: "Brak sparowanych osób w kryzysie." })
              : t("matching.no_paused_mentees", { defaultValue: "Brak wstrzymanych osób po zamknięciu czatu." });

    const statusLabels: Record<MenteeMatchingStatus, string> = {
        [MenteeMatchingStatus.WAITING]: t("matching.mentee_status.waiting", { defaultValue: "Do sparowania" }),
        [MenteeMatchingStatus.REMATCH_REQUESTED]: t("matching.mentee_status.rematch_requested", {
            defaultValue: "Do ponownego sparowania",
        }),
        [MenteeMatchingStatus.MATCHED]: t("matching.mentee_status.matched", { defaultValue: "Sparowany" }),
        [MenteeMatchingStatus.PAUSED]: t("matching.mentee_status.paused", { defaultValue: "Wstrzymany" }),
        [MenteeMatchingStatus.DECLINED]: t("matching.mentee_status.declined", { defaultValue: "Zrezygnował" }),
        [MenteeMatchingStatus.CLOSED]: t("matching.mentee_status.closed", { defaultValue: "Zamknięty" }),
    };

    const getAutomation = (item: MenteeMatchingItem): { tone: PillTone; label: string } => {
        const { state } = item;
        const isManualRematch =
            state.status === MenteeMatchingStatus.REMATCH_REQUESTED &&
            !state.auto_matching_enabled &&
            !state.excluded_from_automation;
        if (state.excluded_from_automation) {
            return { tone: "danger", label: t("matching.excluded", { defaultValue: "Wykluczony" }) };
        }
        if (isManualRematch) {
            return { tone: "neutral", label: t("matching.manual_rematch", { defaultValue: "Ręczny rematch" }) };
        }
        if (state.status === MenteeMatchingStatus.MATCHED) {
            return { tone: "success", label: t("matching.active_pair", { defaultValue: "Aktywna para" }) };
        }
        if (state.auto_matching_enabled) {
            return { tone: "info", label: t("common.enabled", { defaultValue: "Włączona" }) };
        }
        return { tone: "neutral", label: t("common.disabled", { defaultValue: "Wyłączona" }) };
    };

    const columns: Column<MenteeMatchingItem>[] = [
        {
            key: "name",
            header: t("common.name", { defaultValue: "Imię" }),
            flex: 2,
            render: ({ user }) => (
                <YStack gap="$xs" minWidth={0}>
                    <Typography variant="regularSemibold">{user.full_name || user.email}</Typography>
                    <Typography variant="tinyRegular" muted>
                        ID: {user.id}
                    </Typography>
                </YStack>
            ),
        },
        {
            key: "email",
            header: t("common.email", { defaultValue: "Email" }),
            flex: 2,
            render: ({ user }) => (
                <Typography variant="smallRegular" muted width="100%">
                    {user.email}
                </Typography>
            ),
        },
        {
            key: "status",
            header: t("common.status", { defaultValue: "Status" }),
            width: 180,
            render: ({ state }) => (
                <StatusPill tone={statusTone[state.status]}>{statusLabels[state.status]}</StatusPill>
            ),
        },
        {
            key: "queued",
            header: t("matching.queued_at", { defaultValue: "W kolejce od" }),
            width: 150,
            render: ({ state }) => (
                <Typography variant="smallRegular" muted>
                    {formatDate(state.queued_at)}
                </Typography>
            ),
        },
        {
            key: "matched",
            header: t("matching.matched_at", { defaultValue: "Sparowany od" }),
            width: 150,
            render: ({ state }) => (
                <Typography variant="smallRegular" muted>
                    {state.matched_at ? formatDate(state.matched_at) : "-"}
                </Typography>
            ),
        },
        {
            key: "automation",
            header: t("matching.automation", { defaultValue: "Automatyzacja" }),
            width: 150,
            render: (item) => {
                const automation = getAutomation(item);
                return <StatusPill tone={automation.tone}>{automation.label}</StatusPill>;
            },
        },
        {
            key: "actions",
            header: t("common.actions", { defaultValue: "Akcje" }),
            width: 380,
            render: (item) => {
                const { user, state } = item;
                const canManualPair =
                    viewMode === "waiting" &&
                    !state.current_chat_id &&
                    !state.excluded_from_automation &&
                    [MenteeMatchingStatus.WAITING, MenteeMatchingStatus.REMATCH_REQUESTED].includes(state.status);
                const canResolvePaused = viewMode === "paused" && state.status === MenteeMatchingStatus.PAUSED;
                const isManualRematch =
                    state.status === MenteeMatchingStatus.REMATCH_REQUESTED &&
                    !state.auto_matching_enabled &&
                    !state.excluded_from_automation;
                const canPreviewForm = Boolean(state.help_form_id);

                return (
                    <XStack flexWrap="wrap" alignItems="center" gap="$sm">
                        {state.current_chat_id && (
                            <PillButton icon={MessageCircle} variant="solid" to={`/chat/${state.current_chat_id}`}>
                                {t("chat.go_to_chat")}
                            </PillButton>
                        )}
                        <PillButton
                            icon={FileText}
                            disabled={!canPreviewForm}
                            onPress={() => state.help_form_id && setPreviewFormId(state.help_form_id)}
                        >
                            {canPreviewForm
                                ? t("matching.view_form", { defaultValue: "Zobacz formularz" })
                                : t("matching.no_form_available", { defaultValue: "Brak formularza" })}
                        </PillButton>
                        <PillButton icon={UserCog} onPress={() => setUserToEdit(user)}>
                            {t("users.edit_user", { defaultValue: "Edytuj użytkownika" })}
                        </PillButton>
                        {canManualPair && (
                            <PillButton
                                icon={UserPlus}
                                disabled={volunteersQuery.isLoading}
                                onPress={() => setSelectedMentee(item)}
                            >
                                {isManualRematch
                                    ? t("matching.manual_rematch_pair_submit", { defaultValue: "Sparuj ręcznie" })
                                    : t("matching.manual_pair_submit", { defaultValue: "Sparuj" })}
                            </PillButton>
                        )}
                        {canResolvePaused && (
                            <>
                                <PillButton
                                    icon={isAdminRematchDecisionPending ? Loader2 : RotateCw}
                                    spinning={isAdminRematchDecisionPending}
                                    disabled={isAdminRematchDecisionPending}
                                    onPress={() => setPausedDecision({ item, wantsRematch: true })}
                                >
                                    {t("matching.restore_to_queue", { defaultValue: "Przywróć do kolejki" })}
                                </PillButton>
                                <PillButton
                                    icon={isAdminRematchDecisionPending ? Loader2 : CircleOff}
                                    spinning={isAdminRematchDecisionPending}
                                    disabled={isAdminRematchDecisionPending}
                                    tone="danger"
                                    onPress={() => setPausedDecision({ item, wantsRematch: false })}
                                >
                                    {t("matching.mark_support_closed", { defaultValue: "Zakończ obsługę" })}
                                </PillButton>
                            </>
                        )}
                    </XStack>
                );
            },
        },
    ];

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={Users}
                    tone="primary"
                    title={t("matching.mentees_title", { defaultValue: "Osoby w kryzysie" })}
                    subtitle={t("matching.mentees_subtitle", {
                        defaultValue: "Status osób w kryzysie w automatycznym parowaniu.",
                    })}
                    actions={
                        <FilterPills
                            ariaLabel={t("matching.mentees_title", { defaultValue: "Osoby w kryzysie" })}
                            value={viewMode}
                            onChange={(value) => setViewMode(value as ViewMode)}
                            options={[
                                {
                                    value: "waiting",
                                    label: t("matching.mentees_waiting", { defaultValue: "Do sparowania" }),
                                    icon: Clock,
                                    count: waitingQuery.data?.length ?? 0,
                                },
                                {
                                    value: "matched",
                                    label: t("matching.mentees_matched", { defaultValue: "Sparowani" }),
                                    icon: UserCheck,
                                    count: matchedQuery.data?.length ?? 0,
                                },
                                {
                                    value: "paused",
                                    label: t("matching.mentees_paused", { defaultValue: "Wstrzymane" }),
                                    icon: CircleOff,
                                    count: pausedQuery.data?.length ?? 0,
                                },
                            ]}
                        />
                    }
                />

                <DataTable
                    columns={columns}
                    rows={items}
                    rowKey={({ state }) => `${state.user_id}-${state.status}`}
                    isLoading={activeQuery.isLoading}
                    loadingText={t("common.loading", { defaultValue: "Ładowanie..." })}
                    emptyText={emptyStateText}
                    minWidth={1340}
                />

                {activeQuery.isError && (
                    <Typography variant="smallRegular" color="$danger">
                        {t("common.no_data", { defaultValue: "Nie udało się pobrać danych." })}
                    </Typography>
                )}
            </YStack>

            {selectedMentee && (
                <ManualPairModal
                    open={!!selectedMentee}
                    onClose={() => setSelectedMentee(null)}
                    mentee={selectedMentee}
                    volunteers={volunteersQuery.data ?? []}
                    isPending={isManualPairPending}
                    onSubmit={(volunteer, ignoreCapacity) =>
                        manualPair({
                            user_id: selectedMentee.user.id,
                            volunteer_id: volunteer.volunteer.id,
                            ignore_capacity: ignoreCapacity,
                        })
                    }
                />
            )}

            <MenteeFormPreviewModal
                open={Boolean(previewFormId)}
                formId={previewFormId}
                onClose={() => setPreviewFormId(null)}
            />

            {userToEdit && (
                <EditUserModal
                    open={Boolean(userToEdit)}
                    user={userToEdit}
                    onClose={() => setUserToEdit(null)}
                    onSubmit={(values) =>
                        editUserAsAdmin({
                            id: userToEdit.id,
                            payload: values,
                        })
                    }
                />
            )}

            {pausedDecision && (
                <Modal
                    open={Boolean(pausedDecision)}
                    onClose={() => {
                        if (!isAdminRematchDecisionPending) {
                            setPausedDecision(null);
                        }
                    }}
                    title={
                        pausedDecision.wantsRematch
                            ? t("matching.restore_to_queue_confirm_title", {
                                  defaultValue: "Przywrócić osobę do kolejki?",
                              })
                            : t("matching.mark_support_closed_confirm_title", {
                                  defaultValue: "Zakończyć obsługę tej osoby?",
                              })
                    }
                    className="sm:max-w-xl"
                >
                    <YStack gap="$lg">
                        <YStack
                            gap="$xs"
                            padding="$md"
                            borderRadius="$md"
                            borderWidth={1}
                            borderColor="$borderColor"
                            backgroundColor="$backgroundHover"
                        >
                            <Typography variant="smallSemibold">
                                {pausedDecision.item.user.full_name || pausedDecision.item.user.email}
                            </Typography>
                            <Typography variant="tinyRegular" muted>
                                {pausedDecision.item.user.email}
                            </Typography>
                        </YStack>

                        <Typography variant="smallRegular" muted width="100%">
                            {pausedDecision.wantsRematch
                                ? t("matching.restore_to_queue_description", {
                                      defaultValue:
                                          "Osoba wróci do kolejki parowania i może zostać ponownie połączona z wolontariuszem.",
                                  })
                                : t("matching.mark_support_closed_description", {
                                      defaultValue:
                                          "Osoba nie wróci do kolejki parowania. Przypadek zostanie oznaczony jako zakończony.",
                                  })}
                        </Typography>

                        <XStack justifyContent="flex-end" gap="$sm" flexWrap="wrap">
                            <PillButton
                                disabled={isAdminRematchDecisionPending}
                                onPress={() => setPausedDecision(null)}
                            >
                                {t("common.cancel", { defaultValue: "Anuluj" })}
                            </PillButton>
                            <PillButton
                                variant="solid"
                                tone={pausedDecision.wantsRematch ? "primary" : "danger"}
                                icon={isAdminRematchDecisionPending ? Loader2 : undefined}
                                spinning={isAdminRematchDecisionPending}
                                disabled={isAdminRematchDecisionPending}
                                onPress={confirmPausedDecision}
                            >
                                {pausedDecision.wantsRematch
                                    ? t("matching.restore_to_queue", { defaultValue: "Przywróć do kolejki" })
                                    : t("matching.mark_support_closed", { defaultValue: "Zakończ obsługę" })}
                            </PillButton>
                        </XStack>
                    </YStack>
                </Modal>
            )}
        </AdminLayout>
    );
};

export default MatchingMenteesScreen;
