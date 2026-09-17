import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FileText, History, Loader2, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import type { User } from "../modules/auth/types";
import MenteeFormPreviewModal from "../modules/forms/components/MenteeFormPreviewModal";
import { userTimelineQueryOptions } from "../modules/matching/queries/userTimelineQueryOptions";
import { MenteeMatchingStatus, UserTimelineEvent } from "../modules/matching/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import formatDate from "../modules/shared/helpers/formatDate";
import { ApiError } from "../modules/shared/types";
import SearchUser from "../modules/users/components/SearchUser";
import { Roles } from "../modules/users/constants";

const sourceVariant: Record<UserTimelineEvent["source"], "destructive" | "info" | "outline" | "secondary" | "warning"> =
    {
        automatic: "info",
        manual: "warning",
        mail: "secondary",
        error: "destructive",
        system: "outline",
    };

const statusVariant: Record<MenteeMatchingStatus, "destructive" | "outline" | "secondary" | "success" | "warning"> = {
    [MenteeMatchingStatus.WAITING]: "warning",
    [MenteeMatchingStatus.REMATCH_REQUESTED]: "warning",
    [MenteeMatchingStatus.MATCHED]: "success",
    [MenteeMatchingStatus.PAUSED]: "secondary",
    [MenteeMatchingStatus.DECLINED]: "destructive",
    [MenteeMatchingStatus.CLOSED]: "outline",
};

const MatchingUserHistoryScreen = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedUserId = Number(searchParams.get("user_id") ?? "");
    const [previewFormId, setPreviewFormId] = useState<number | null>(null);
    const queryEnabled = Number.isInteger(selectedUserId) && selectedUserId > 0;

    const timelineQuery = useInfiniteQuery(
        userTimelineQueryOptions(
            {
                user_id: selectedUserId,
            },
            queryEnabled
        )
    );

    const timeline = timelineQuery.data?.pages[0];
    const events = useMemo(() => timelineQuery.data?.pages.flatMap((page) => page.events) ?? [], [timelineQuery.data]);
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
        setPreviewFormId(null);
        if (user) {
            setSearchParams({ user_id: String(user.id) });
        } else {
            setSearchParams({});
        }
    };

    return (
        <AdminLayout>
            <div className="bg-card border-border/50 rounded-xl border p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-brand/10 flex size-11 items-center justify-center rounded-lg">
                            <History className="text-primary-brand size-5" />
                        </div>
                        <div>
                            <h1 className="text-foreground text-xl font-bold">
                                {t("matching.user_history_title", { defaultValue: "Historia obsługi" })}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {t("matching.user_history_subtitle", {
                                    defaultValue:
                                        "Wyszukaj osobę w kryzysie po imieniu, nazwisku albo emailu i sprawdź przebieg obsługi.",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 max-w-3xl">
                    <SearchUser
                        key={selectedUserId}
                        value={timeline?.user}
                        onChange={handleUserChange}
                        allowedRoles={[Roles.USER]}
                        hideRoleFilter
                    />
                </div>
            </div>

            {timelineQuery.isLoading && (
                <div className="border-border/50 bg-card mt-5 rounded-xl border p-8 text-center">
                    <Loader2 className="text-primary-brand mx-auto mb-3 size-6 animate-spin" />
                    <p className="text-muted-foreground text-sm">
                        {t("common.loading", { defaultValue: "Ładowanie..." })}
                    </p>
                </div>
            )}

            {isNotFound && (
                <div className="border-border/50 bg-card mt-5 rounded-xl border p-6">
                    <p className="text-foreground font-medium">
                        {t("matching.user_history_not_found", {
                            defaultValue: "Nie znaleziono wybranej osoby.",
                        })}
                    </p>
                </div>
            )}

            {isWrongRole && (
                <div className="border-border/50 bg-card mt-5 rounded-xl border p-6">
                    <p className="text-foreground font-medium">
                        {t("matching.user_history_wrong_role", {
                            defaultValue: "Historia obsługi jest dostępna tylko dla osób w kryzysie.",
                        })}
                    </p>
                </div>
            )}

            {timelineQuery.isError && !isNotFound && !isWrongRole && (
                <div role="alert" className="border-border/50 bg-card mt-5 rounded-xl border p-6">
                    <p>{t("matching.user_history_load_error", { defaultValue: "Nie udało się pobrać historii." })}</p>
                    <Button
                        className="mt-3"
                        variant="outline"
                        disabled={timelineQuery.isFetching}
                        onClick={() =>
                            timelineQuery.isFetchNextPageError ? timelineQuery.fetchNextPage() : timelineQuery.refetch()
                        }
                    >
                        {t("matching.user_history_retry", { defaultValue: "Spróbuj ponownie" })}
                    </Button>
                </div>
            )}

            {timeline && !isNotFound && !isWrongRole && (
                <>
                    <div className="border-border/50 bg-card mt-5 rounded-xl border p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2 className="text-foreground text-lg font-semibold">
                                    {timeline.user.full_name || timeline.user.email}
                                </h2>
                                <p className="text-muted-foreground text-sm">{timeline.user.email}</p>
                            </div>
                            <Button
                                variant="outline"
                                disabled={timelineQuery.isFetching}
                                onClick={() => timelineQuery.refetch()}
                            >
                                {t("matching.user_history_refresh", { defaultValue: "Odśwież" })}
                            </Button>
                            {timeline.summary.matching_status && (
                                <Badge variant={statusVariant[timeline.summary.matching_status]}>
                                    {statusLabels[timeline.summary.matching_status]}
                                </Badge>
                            )}
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                                    timeline.summary.chat_closed_at ? formatDate(timeline.summary.chat_closed_at) : "-"
                                }
                            />
                        </div>
                    </div>

                    <details className="border-border/50 bg-card mt-5 rounded-xl border p-6">
                        <summary className="cursor-pointer font-medium">
                            {t("matching.user_history_records", { defaultValue: "Formularze i rozmowy" })}
                        </summary>
                        <div className="mt-4 grid gap-6 md:grid-cols-2">
                            <ul className="space-y-2">
                                {timeline.forms.map((form) => (
                                    <li key={form.id}>
                                        <Button variant="outline" size="sm" onClick={() => setPreviewFormId(form.id)}>
                                            <FileText className="size-4" />#{form.id} ·{" "}
                                            {formatDate(form.creation_date, "dd/MM/yyyy")}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-2">
                                {timeline.chats.map((chat) => (
                                    <li key={chat.id}>
                                        <Link
                                            to={`/chat/${chat.id}`}
                                            className={buttonVariants({ variant: "outline", size: "sm" })}
                                        >
                                            <MessageCircle className="size-4" />#{chat.id} ·{" "}
                                            {formatDate(chat.creation_date, "dd/MM/yyyy")}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </details>

                    <div className="mt-5 w-full min-w-0">
                        <div className="border-border/50 bg-card overflow-hidden rounded-xl border shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("common.date", { defaultValue: "Data" })}</TableHead>
                                        <TableHead>{t("common.action", { defaultValue: "Akcja" })}</TableHead>
                                        <TableHead>{t("common.details", { defaultValue: "Szczegóły" })}</TableHead>
                                        <TableHead>{t("matching.source", { defaultValue: "Źródło" })}</TableHead>
                                        <TableHead>{t("matching.form", { defaultValue: "Formularz" })}</TableHead>
                                        <TableHead>{t("matching.chat", { defaultValue: "Czat" })}</TableHead>
                                        <TableHead>
                                            {t("matching.volunteer", { defaultValue: "Wolontariusz" })}
                                        </TableHead>
                                        <TableHead>{t("matching.actor", { defaultValue: "Wykonał" })}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.length > 0 ? (
                                        events.map((event) => (
                                            <TableRow key={event.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDate(event.occurred_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-foreground font-medium">{event.label}</span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground min-w-[240px] text-sm">
                                                    {event.detail}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={sourceVariant[event.source]}>
                                                        {sourceLabels[event.source]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {event.form_id ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setPreviewFormId(event.form_id)}
                                                        >
                                                            <FileText className="size-4" />#{event.form_id}
                                                        </Button>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {event.chat_id && existingChatIds.has(event.chat_id) ? (
                                                        <Link
                                                            to={`/chat/${event.chat_id}`}
                                                            className={cn(
                                                                buttonVariants({ variant: "outline", size: "sm" }),
                                                                "no-underline"
                                                            )}
                                                        >
                                                            <MessageCircle className="size-4" />#{event.chat_id}
                                                        </Link>
                                                    ) : event.chat_id ? (
                                                        <span className="text-muted-foreground text-sm">
                                                            #{event.chat_id}
                                                        </span>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell>{event.volunteer?.email ?? "-"}</TableCell>
                                                <TableCell>{event.actor?.email ?? "-"}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                                                {t("matching.user_history_no_events", {
                                                    defaultValue: "Brak historii operacyjnej dla tej osoby.",
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {timelineQuery.hasNextPage && (
                                <div className="border-border border-t p-4 text-center">
                                    <Button
                                        variant="outline"
                                        disabled={timelineQuery.isFetching}
                                        onClick={() => timelineQuery.fetchNextPage()}
                                    >
                                        {timelineQuery.isFetchingNextPage ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            t("matching.user_history_load_more", { defaultValue: "Pokaż więcej" })
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <MenteeFormPreviewModal
                open={Boolean(previewFormId)}
                formId={previewFormId}
                onClose={() => setPreviewFormId(null)}
            />
        </AdminLayout>
    );
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground mt-1 truncate text-sm font-medium" title={value}>
            {value}
        </p>
    </div>
);

export default MatchingUserHistoryScreen;
