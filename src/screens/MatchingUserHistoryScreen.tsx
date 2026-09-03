import { Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { FileText, History, Loader2, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { User } from "../modules/auth/types";
import {
    AdminPageHeader,
    type Column,
    DataTable,
    type PillTone,
    PillButton,
    StatusPill,
} from "../modules/layout/admin";
import MenteeFormPreviewModal from "../modules/forms/components/MenteeFormPreviewModal";
import { userTimelineQueryOptions } from "../modules/matching/queries/userTimelineQueryOptions";
import { MenteeMatchingStatus, UserTimelineEvent } from "../modules/matching/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import formatDate from "../modules/shared/helpers/formatDate";
import { ApiError } from "../modules/shared/types";
import SearchUser from "../modules/users/components/SearchUser";
import { Roles } from "../modules/users/constants";

const sourceTone: Record<UserTimelineEvent["source"], PillTone> = {
    automatic: "info",
    manual: "warning",
    mail: "neutral",
    error: "danger",
    system: "neutral",
};

const statusTone: Record<MenteeMatchingStatus, PillTone> = {
    [MenteeMatchingStatus.WAITING]: "warning",
    [MenteeMatchingStatus.REMATCH_REQUESTED]: "warning",
    [MenteeMatchingStatus.MATCHED]: "success",
    [MenteeMatchingStatus.PAUSED]: "neutral",
    [MenteeMatchingStatus.DECLINED]: "danger",
    [MenteeMatchingStatus.CLOSED]: "neutral",
};

const InfoCard = ({ children }: { children: React.ReactNode }) => (
    <YStack padding="$xl" borderRadius="$lg" backgroundColor="$background" {...shadows.small}>
        {children}
    </YStack>
);

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <YStack
        flex={1}
        minWidth={190}
        gap="$xs"
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$backgroundHover"
    >
        <Typography variant="tinyRegular" muted>
            {label}
        </Typography>
        <Typography variant="smallSemibold" numberOfLines={1}>
            {value}
        </Typography>
    </YStack>
);

const MatchingUserHistoryScreen = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedUserId = Number(searchParams.get("user_id") ?? "");
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [previewFormId, setPreviewFormId] = useState<number | null>(null);
    const queryEnabled = Number.isInteger(selectedUserId) && selectedUserId > 0;

    const timelineQuery = useQuery(
        userTimelineQueryOptions(
            {
                user_id: selectedUserId,
            },
            queryEnabled
        )
    );

    const timeline = timelineQuery.data;
    const error = timelineQuery.error;
    const isNotFound = error instanceof ApiError && error.status === 404;
    const isWrongRole = error instanceof ApiError && error.status === 409;

    const sourceLabels: Record<UserTimelineEvent["source"], string> = {
        automatic: t("matching.timeline_source.automatic", { defaultValue: "Automatyczne" }),
        manual: t("matching.timeline_source.manual", { defaultValue: "Ręczne" }),
        mail: t("matching.timeline_source.mail", { defaultValue: "Mail" }),
        error: t("matching.timeline_source.error", { defaultValue: "Błąd" }),
        system: t("matching.timeline_source.system", { defaultValue: "System" }),
    };

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

    const latestVolunteerLabel = useMemo(() => {
        const volunteer = timeline?.summary.latest_volunteer;
        if (!volunteer) return "-";
        return volunteer.full_name ? `${volunteer.full_name} (${volunteer.email})` : volunteer.email;
    }, [timeline?.summary.latest_volunteer]);
    const existingChatIds = useMemo(() => new Set(timeline?.chats.map((chat) => chat.id) ?? []), [timeline?.chats]);

    const handleUserChange = (user?: User) => {
        setSelectedUser(user);
        if (user) {
            setSearchParams({ user_id: String(user.id) });
        } else {
            setSearchParams({});
        }
    };

    const columns: Column<UserTimelineEvent>[] = [
        {
            key: "date",
            header: t("common.date", { defaultValue: "Data" }),
            width: 160,
            render: (event) => (
                <Typography variant="smallRegular" muted>
                    {formatDate(event.occurred_at)}
                </Typography>
            ),
        },
        {
            key: "action",
            header: t("common.action", { defaultValue: "Akcja" }),
            flex: 1,
            render: (event) => (
                <Typography variant="smallSemibold" width="100%">
                    {event.label}
                </Typography>
            ),
        },
        {
            key: "detail",
            header: t("common.details", { defaultValue: "Szczegóły" }),
            flex: 2,
            render: (event) => (
                <Typography variant="smallRegular" muted width="100%">
                    {event.detail}
                </Typography>
            ),
        },
        {
            key: "source",
            header: t("matching.source", { defaultValue: "Źródło" }),
            width: 130,
            render: (event) => <StatusPill tone={sourceTone[event.source]}>{sourceLabels[event.source]}</StatusPill>,
        },
        {
            key: "form",
            header: t("matching.form", { defaultValue: "Formularz" }),
            width: 120,
            render: (event) =>
                event.form_id ? (
                    <PillButton icon={FileText} onPress={() => setPreviewFormId(event.form_id)}>
                        #{event.form_id}
                    </PillButton>
                ) : (
                    <Typography variant="smallRegular" muted>
                        -
                    </Typography>
                ),
        },
        {
            key: "chat",
            header: t("matching.chat", { defaultValue: "Czat" }),
            width: 120,
            render: (event) =>
                event.chat_id && existingChatIds.has(event.chat_id) ? (
                    <PillButton icon={MessageCircle} to={`/chat/${event.chat_id}`}>
                        #{event.chat_id}
                    </PillButton>
                ) : (
                    <Typography variant="smallRegular" muted>
                        {event.chat_id ? `#${event.chat_id}` : "-"}
                    </Typography>
                ),
        },
        {
            key: "volunteer",
            header: t("matching.volunteer", { defaultValue: "Wolontariusz" }),
            flex: 1,
            render: (event) => (
                <Typography variant="smallRegular" muted width="100%">
                    {event.volunteer?.email ?? "-"}
                </Typography>
            ),
        },
        {
            key: "actor",
            header: t("matching.actor", { defaultValue: "Wykonał" }),
            flex: 1,
            render: (event) => (
                <Typography variant="smallRegular" muted width="100%">
                    {event.actor?.email ?? "-"}
                </Typography>
            ),
        },
    ];

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={History}
                    tone="primary"
                    title={t("matching.user_history_title", { defaultValue: "Historia obsługi" })}
                    subtitle={t("matching.user_history_subtitle", {
                        defaultValue:
                            "Wyszukaj osobę w kryzysie po imieniu, nazwisku albo emailu i sprawdź przebieg obsługi.",
                    })}
                />

                <InfoCard>
                    <YStack maxWidth={768} width="100%">
                        <SearchUser
                            value={selectedUser}
                            onChange={handleUserChange}
                            allowedRoles={[Roles.USER]}
                            disabled={timelineQuery.isFetching}
                            hideRoleFilter
                        />
                    </YStack>
                </InfoCard>

                {timelineQuery.isLoading && (
                    <InfoCard>
                        <YStack alignItems="center" gap="$sm" paddingVertical="$lg">
                            <Loader2 className="animate-spin" size={24} />
                            <Typography variant="smallRegular" muted>
                                {t("common.loading", { defaultValue: "Ładowanie..." })}
                            </Typography>
                        </YStack>
                    </InfoCard>
                )}

                {isNotFound && (
                    <InfoCard>
                        <Typography variant="regularSemibold">
                            {t("matching.user_history_not_found", { defaultValue: "Nie znaleziono wybranej osoby." })}
                        </Typography>
                    </InfoCard>
                )}

                {isWrongRole && (
                    <InfoCard>
                        <Typography variant="regularSemibold">
                            {t("matching.user_history_wrong_role", {
                                defaultValue: "Historia obsługi jest dostępna tylko dla osób w kryzysie.",
                            })}
                        </Typography>
                    </InfoCard>
                )}

                {timeline && (
                    <>
                        <InfoCard>
                            <XStack flexWrap="wrap" alignItems="flex-start" justifyContent="space-between" gap="$sm">
                                <YStack gap="$xs" flex={1} minWidth={0}>
                                    <Typography variant="largeBold" tag="h2">
                                        {timeline.user.full_name || timeline.user.email}
                                    </Typography>
                                    <Typography variant="smallRegular" muted>
                                        {timeline.user.email}
                                    </Typography>
                                </YStack>
                                {timeline.summary.matching_status && (
                                    <StatusPill tone={statusTone[timeline.summary.matching_status]}>
                                        {statusLabels[timeline.summary.matching_status]}
                                    </StatusPill>
                                )}
                            </XStack>

                            <XStack flexWrap="wrap" gap="$sm" marginTop="$lg">
                                <SummaryItem
                                    label={t("matching.latest_form", { defaultValue: "Formularz" })}
                                    value={timeline.summary.latest_form ? `#${timeline.summary.latest_form.id}` : "-"}
                                />
                                <SummaryItem
                                    label={t("matching.latest_chat", { defaultValue: "Czat" })}
                                    value={timeline.summary.latest_chat ? `#${timeline.summary.latest_chat.id}` : "-"}
                                />
                                <SummaryItem
                                    label={t("matching.latest_volunteer", { defaultValue: "Wolontariusz" })}
                                    value={latestVolunteerLabel}
                                />
                                <SummaryItem
                                    label={t("matching.chat_closed_at", { defaultValue: "Zamknięcie czatu" })}
                                    value={
                                        timeline.summary.chat_closed_at
                                            ? formatDate(timeline.summary.chat_closed_at)
                                            : "-"
                                    }
                                />
                            </XStack>
                        </InfoCard>

                        <DataTable
                            columns={columns}
                            rows={timeline.events}
                            rowKey={(event) => `${event.event_type}-${event.occurred_at}-${event.chat_id ?? "no-chat"}`}
                            emptyText={t("matching.user_history_no_events", {
                                defaultValue: "Brak historii operacyjnej dla tej osoby.",
                            })}
                            minWidth={1200}
                        />
                    </>
                )}
            </YStack>

            <MenteeFormPreviewModal
                open={Boolean(previewFormId)}
                formId={previewFormId}
                onClose={() => setPreviewFormId(null)}
            />
        </AdminLayout>
    );
};

export default MatchingUserHistoryScreen;
