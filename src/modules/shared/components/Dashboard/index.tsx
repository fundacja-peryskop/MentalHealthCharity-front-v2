import { Skeleton } from "@/components/ui/skeleton";
import { Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import {
    AlertTriangle,
    ArrowRight,
    ClipboardList,
    Clock,
    FileText,
    HeartHandshake,
    Inbox,
    type LucideIcon,
    UserCheck,
    Users,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { useIconColor } from "../../../layout/useIconColor";
import { getFormsQueryOptions } from "../../../forms/queries/getFormsQueryOptions";
import { formStatus, formTypes } from "../../../forms/types";
import { adminAlertsQueryOptions } from "../../../matching/queries/adminAlertsQueryOptions";
import {
    matchedMenteesQueryOptions,
    waitingMenteesQueryOptions,
} from "../../../matching/queries/menteeMatchingQueryOptions";
import { volunteerCapacityQueryOptions } from "../../../matching/queries/volunteerCapacityQueryOptions";
import { MenteeMatchingItem, MenteeMatchingStatus, VolunteerCapacityItem } from "../../../matching/types";
import { getReportsQueryOptions } from "../../../report/queries/getReportsQueryOptions";
import { Report } from "../../../report/types";
import { isApiDateInFuture, parseApiDate } from "../../helpers/dateTime";
import formatDate from "../../helpers/formatDate";

type Tone = "primary" | "warning" | "danger" | "success" | "info";

const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "flex", width: "100%" };
const TILE_BG: Record<Tone, string> = {
    primary: "$primarySoft",
    warning: "$secondarySoft",
    danger: "$dangerSoft",
    success: "$successSoft",
    info: "$primarySoft",
};

type DashboardAction = {
    id: string;
    title: string;
    description: string;
    meta: string;
    to: string;
    action: string;
    icon: LucideIcon;
    tone: "warning" | "danger" | "info";
    sortTime: number;
    priority: number;
};

// --- Pure helpers (unchanged logic) -----------------------------------------

const safeTime = (value?: string | null) => {
    if (!value) return 0;
    const date = parseApiDate(value);
    const time = date.getTime();
    return Number.isNaN(time) ? 0 : time;
};

const getWaitingDuration = (queuedAt?: string | null) => {
    const queuedTime = safeTime(queuedAt);
    if (!queuedTime) return "-";
    const diffMinutes = Math.max(0, Math.floor((Date.now() - queuedTime) / 60000));
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h`;
    return `${Math.floor(diffHours / 24)} d`;
};

const getOldestWaitingItem = (items: MenteeMatchingItem[]) =>
    items.reduce<MenteeMatchingItem | null>((oldestItem, item) => {
        if (!oldestItem) return item;
        return safeTime(item.state.queued_at) < safeTime(oldestItem.state.queued_at) ? item : oldestItem;
    }, null);

const sortByOldestQueue = (items: MenteeMatchingItem[]) =>
    [...items].sort((first, second) => safeTime(first.state.queued_at) - safeTime(second.state.queued_at));

const getVolunteerSummary = (items: VolunteerCapacityItem[]) =>
    items.reduce(
        (summary, item) => {
            const { availability, volunteer } = item;
            const isBlocked = isApiDateInFuture(availability.blocked_until);
            const isAvailable =
                availability.declared_capacity !== null &&
                availability.free_slots > 0 &&
                !availability.is_full &&
                !isBlocked &&
                !volunteer.excluded_from_automation;
            return {
                activeCount: summary.activeCount + availability.active_chat_count,
                availableCount: summary.availableCount + (isAvailable ? 1 : 0),
                blockedCount: summary.blockedCount + (isBlocked ? 1 : 0),
                declaredCapacity: summary.declaredCapacity + (availability.declared_capacity ?? 0),
                excludedCount: summary.excludedCount + (volunteer.excluded_from_automation ? 1 : 0),
                freeSlots: summary.freeSlots + (isAvailable ? Math.max(0, availability.free_slots) : 0),
                fullCount: summary.fullCount + (availability.is_full ? 1 : 0),
            };
        },
        {
            activeCount: 0,
            availableCount: 0,
            blockedCount: 0,
            declaredCapacity: 0,
            excludedCount: 0,
            freeSlots: 0,
            fullCount: 0,
        }
    );

// --- Presentational primitives (DS) -----------------------------------------

function IconTile({
    tone,
    icon: Icon,
    color,
    size = 40,
}: {
    tone: Tone;
    icon: LucideIcon;
    color?: string;
    size?: number;
}) {
    return (
        <Stack
            width={size}
            height={size}
            borderRadius="$md"
            alignItems="center"
            justifyContent="center"
            backgroundColor={TILE_BG[tone] as never}
        >
            <Icon size={size * 0.45} color={color} />
        </Stack>
    );
}

function Panel({
    title,
    subtitle,
    actionLabel,
    actionTo,
    children,
    primaryColor,
}: {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    actionTo?: string;
    children: React.ReactNode;
    primaryColor?: string;
}) {
    return (
        <YStack
            tag="section"
            gap="$lg"
            padding="$xl"
            borderRadius="$lg"
            backgroundColor="$background"
            {...shadows.small}
            flex={1}
        >
            <XStack flexWrap="wrap" alignItems="flex-start" justifyContent="space-between" gap="$sm">
                <YStack gap="$xs" flex={1}>
                    <Typography variant="largeBold" tag="h2">
                        {title}
                    </Typography>
                    {subtitle ? (
                        <Typography variant="smallRegular" muted width="100%">
                            {subtitle}
                        </Typography>
                    ) : null}
                </YStack>
                {actionLabel && actionTo ? (
                    <RouterLink to={actionTo} style={{ textDecoration: "none" }}>
                        <XStack alignItems="center" gap="$xs">
                            <Typography variant="smallSemibold" color="$primary">
                                {actionLabel}
                            </Typography>
                            <ArrowRight size={15} color={primaryColor} />
                        </XStack>
                    </RouterLink>
                ) : null}
            </XStack>
            {children}
        </YStack>
    );
}

function EmptyState({ children }: { children: React.ReactNode }) {
    return (
        <YStack
            padding="$lg"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$backgroundHover"
            style={{ borderStyle: "dashed" }}
        >
            <Typography variant="smallRegular" muted width="100%">
                {children}
            </Typography>
        </YStack>
    );
}

const Dashboard = () => {
    const { t } = useTranslation();
    const c = useIconColor();

    const toneColor: Record<Tone, string | undefined> = {
        primary: c.primary,
        warning: c.secondary,
        danger: c.danger,
        success: c.success,
        info: c.primary,
    };

    const waitingQuery = useQuery(waitingMenteesQueryOptions());
    const matchedQuery = useQuery(matchedMenteesQueryOptions());
    const volunteersQuery = useQuery(volunteerCapacityQueryOptions());
    const alertsQuery = useQuery(adminAlertsQueryOptions());
    const reportsQuery = useQuery(getReportsQueryOptions({ page: 1, size: 5, is_considered: false }));
    const menteeFormsQuery = useQuery(
        getFormsQueryOptions({
            page: 1,
            size: 3,
            form_status: formStatus.WAITED,
            form_type: formTypes.MENTEE,
            sort: "oldest",
        })
    );
    const volunteerFormsQuery = useQuery(
        getFormsQueryOptions({
            page: 1,
            size: 3,
            form_status: formStatus.WAITED,
            form_type: formTypes.VOLUNTEER,
            sort: "oldest",
        })
    );

    const waitingItems = waitingQuery.data ?? [];
    const matchedItems = matchedQuery.data ?? [];
    const volunteers = volunteersQuery.data ?? [];
    const alerts = alertsQuery.data ?? [];
    const reports = reportsQuery.data?.items ?? [];
    const menteeForms = menteeFormsQuery.data?.items ?? [];
    const volunteerForms = volunteerFormsQuery.data?.items ?? [];
    const openReportsCount = reportsQuery.data?.total ?? 0;
    const menteeFormsCount = menteeFormsQuery.data?.total ?? 0;
    const volunteerFormsCount = volunteerFormsQuery.data?.total ?? 0;

    const isLoading =
        waitingQuery.isLoading ||
        matchedQuery.isLoading ||
        volunteersQuery.isLoading ||
        alertsQuery.isLoading ||
        reportsQuery.isLoading ||
        menteeFormsQuery.isLoading ||
        volunteerFormsQuery.isLoading;

    const oldestWaitingItem = useMemo(() => getOldestWaitingItem(waitingItems), [waitingItems]);
    const oldestWaitingDuration = getWaitingDuration(oldestWaitingItem?.state.queued_at);
    const rematchCount = waitingItems.filter(
        (item) => item.state.status === MenteeMatchingStatus.REMATCH_REQUESTED
    ).length;
    const volunteerSummary = useMemo(() => getVolunteerSummary(volunteers), [volunteers]);
    const updatedAt = Math.max(
        waitingQuery.dataUpdatedAt,
        matchedQuery.dataUpdatedAt,
        volunteersQuery.dataUpdatedAt,
        alertsQuery.dataUpdatedAt,
        reportsQuery.dataUpdatedAt,
        menteeFormsQuery.dataUpdatedAt,
        volunteerFormsQuery.dataUpdatedAt
    );

    const actionItems = useMemo<DashboardAction[]>(() => {
        const waitingActions = sortByOldestQueue(waitingItems)
            .slice(0, 4)
            .map((item) => ({
                id: `waiting-${item.state.user_id}`,
                title:
                    item.state.status === MenteeMatchingStatus.REMATCH_REQUESTED
                        ? t("admin.dashboard.actions.rematch_title", { defaultValue: "Prośba o ponowne parowanie" })
                        : t("admin.dashboard.actions.waiting_title", { defaultValue: "Osoba czeka na wsparcie" }),
                description: item.user.full_name || item.user.email,
                meta: t("admin.dashboard.waiting_for", {
                    defaultValue: "Czeka {{duration}}",
                    duration: getWaitingDuration(item.state.queued_at),
                }),
                to: "/admin/matching/mentees",
                action: t("matching.manual_pair_submit", { defaultValue: "Sparuj" }),
                icon: HeartHandshake,
                tone:
                    item.state.status === MenteeMatchingStatus.REMATCH_REQUESTED
                        ? ("danger" as const)
                        : ("warning" as const),
                sortTime: safeTime(item.state.queued_at),
                priority: item.state.status === MenteeMatchingStatus.REMATCH_REQUESTED ? 0 : 1,
            }));

        const noCapacityAction =
            waitingItems.length > 0 && volunteerSummary.availableCount === 0
                ? [
                      {
                          id: "current-no-capacity",
                          title: t("admin.dashboard.actions.no_capacity_title", {
                              defaultValue: "Brak dostępnych wolontariuszy",
                          }),
                          description: t("admin.dashboard.actions.no_capacity_description", {
                              defaultValue:
                                  "W kolejce są osoby oczekujące, ale żaden wolontariusz nie ma teraz dostępnej pojemności.",
                          }),
                          meta: t("matching.alert_waiting_count", {
                              defaultValue: "{{count}} oczekuje",
                              count: waitingItems.length,
                          }),
                          to: "/admin/matching/volunteers",
                          action: t("admin.dashboard.actions.view_volunteers", {
                              defaultValue: "Zobacz wolontariuszy",
                          }),
                          icon: AlertTriangle,
                          tone: "danger" as const,
                          sortTime: 0,
                          priority: 0,
                      },
                  ]
                : [];

        const reportActions = reports.slice(0, 2).map((report: Report) => ({
            id: `report-${report.id}`,
            title: t("admin.dashboard.actions.report_title", { defaultValue: "Otwarte zgłoszenie" }),
            description: report.subject,
            meta: report.created_by.full_name || report.created_by.email,
            to: "/admin/reports",
            action: t("admin.dashboard.resolve", { defaultValue: "Rozpatrz" }),
            icon: FileText,
            tone: "info" as const,
            sortTime: safeTime(report.creation_date),
            priority: 3,
        }));

        return [...noCapacityAction, ...waitingActions, ...reportActions]
            .sort((first, second) => first.priority - second.priority || first.sortTime - second.sortTime)
            .slice(0, 7);
    }, [reports, t, volunteerSummary.availableCount, waitingItems]);

    const metrics = [
        {
            label: t("admin.dashboard.metrics.waiting", { defaultValue: "Osoby czekające" }),
            value: waitingItems.length,
            detail: t("admin.dashboard.metrics.waiting_detail", {
                defaultValue: "{{count}} próśb o ponowne parowanie",
                count: rematchCount,
            }),
            to: "/admin/matching/mentees",
            icon: HeartHandshake,
            tone: (waitingItems.length > 0 ? "warning" : "success") as Tone,
            isLoading: waitingQuery.isLoading,
        },
        {
            label: t("admin.dashboard.metrics.longest_wait", { defaultValue: "Najdłużej czeka" }),
            value: oldestWaitingDuration,
            detail: oldestWaitingItem
                ? oldestWaitingItem.user.full_name || oldestWaitingItem.user.email
                : t("admin.dashboard.metrics.no_waiting", { defaultValue: "Brak osób w kolejce" }),
            to: "/admin/matching/mentees",
            icon: Clock,
            tone: (oldestWaitingItem ? "danger" : "success") as Tone,
            isLoading: waitingQuery.isLoading,
        },
        {
            label: t("admin.dashboard.metrics.free_slots", { defaultValue: "Wolne miejsca" }),
            value: volunteerSummary.freeSlots,
            detail: t("admin.dashboard.metrics.free_slots_detail", {
                defaultValue: "{{count}} dostępnych wolontariuszy",
                count: volunteerSummary.availableCount,
            }),
            to: "/admin/matching/volunteers",
            icon: UserCheck,
            tone: (volunteerSummary.freeSlots > 0 ? "success" : "danger") as Tone,
            isLoading: volunteersQuery.isLoading,
        },
        {
            label: t("admin.dashboard.metrics.alerts", { defaultValue: "Alerty" }),
            value: alerts.length,
            detail: t("admin.dashboard.metrics.alerts_detail", { defaultValue: "Najnowsze sygnały z parowania" }),
            to: "/admin/matching/alerts",
            icon: AlertTriangle,
            tone: (alerts.length > 0 ? "danger" : "success") as Tone,
            isLoading: alertsQuery.isLoading,
        },
        {
            label: t("admin.dashboard.metrics.reports", { defaultValue: "Otwarte zgłoszenia" }),
            value: openReportsCount,
            detail: t("admin.dashboard.metrics.reports_detail", { defaultValue: "Zgłoszenia do rozpatrzenia" }),
            to: "/admin/reports",
            icon: Inbox,
            tone: (openReportsCount > 0 ? "warning" : "success") as Tone,
            isLoading: reportsQuery.isLoading,
        },
    ];

    const capacityPct = Math.min(
        100,
        volunteerSummary.declaredCapacity ? (volunteerSummary.activeCount / volunteerSummary.declaredCapacity) * 100 : 0
    );

    const matchingTiles = [
        { label: t("admin.dashboard.matching.waiting", { defaultValue: "Czeka" }), value: waitingItems.length },
        { label: t("admin.dashboard.matching.matched", { defaultValue: "Sparowani" }), value: matchedItems.length },
        { label: t("admin.dashboard.matching.full", { defaultValue: "Pełni" }), value: volunteerSummary.fullCount },
        {
            label: t("admin.dashboard.matching.blocked", { defaultValue: "Zablokowani" }),
            value: volunteerSummary.blockedCount,
        },
    ];

    return (
        <YStack width="100%" gap="$lg">
            <XStack flexWrap="wrap" alignItems="flex-end" justifyContent="space-between" gap="$sm">
                <YStack gap="$xs">
                    <Typography variant="smallSemibold" color="$primary">
                        {t("admin.dashboard.eyebrow", { defaultValue: "Centrum obsługi" })}
                    </Typography>
                    <Typography variant="title2" tag="h1">
                        {t("admin.dashboard.title", { defaultValue: "Dashboard" })}
                    </Typography>
                </YStack>
                <Typography variant="smallRegular" muted>
                    {updatedAt
                        ? t("admin.dashboard.last_updated", {
                              defaultValue: "Ostatnia aktualizacja: {{date}}",
                              date: formatDate(new Date(updatedAt)),
                          })
                        : t("admin.dashboard.loading_data", { defaultValue: "Ładowanie danych" })}
                </Typography>
            </XStack>

            {/* Metrics */}
            <XStack flexWrap="wrap" gap="$md">
                {metrics.map((m) => (
                    <RouterLink key={m.label} to={m.to} style={{ ...LINK_RESET, flex: "1 1 190px" }}>
                        <YStack
                            flex={1}
                            minHeight={146}
                            padding="$lg"
                            borderRadius="$lg"
                            backgroundColor="$background"
                            justifyContent="space-between"
                            {...shadows.small}
                            hoverStyle={{ borderColor: "$primary" }}
                            borderWidth={1}
                            borderColor="$borderColor"
                        >
                            <XStack alignItems="flex-start" justifyContent="space-between" gap="$sm">
                                <YStack minWidth={0} gap="$xs">
                                    <Typography variant="smallSemibold" muted>
                                        {m.label}
                                    </Typography>
                                    {m.isLoading ? (
                                        <Skeleton className="mt-1 h-9 w-20" />
                                    ) : (
                                        <Typography variant="title2" tag="span">
                                            {m.value}
                                        </Typography>
                                    )}
                                </YStack>
                                <IconTile tone={m.tone} icon={m.icon} color={toneColor[m.tone]} />
                            </XStack>
                            <Typography variant="smallRegular" muted width="100%">
                                {m.detail}
                            </Typography>
                        </YStack>
                    </RouterLink>
                ))}
            </XStack>

            {/* Actions + matching */}
            <XStack flexWrap="wrap" gap="$lg" alignItems="stretch">
                <YStack flex={2} minWidth={320}>
                    <Panel
                        title={t("admin.dashboard.actions.title", { defaultValue: "Do obsłużenia teraz" })}
                        subtitle={t("admin.dashboard.actions.subtitle", {
                            defaultValue: "Najpilniejsze sprawy ułożone według wpływu na proces wsparcia.",
                        })}
                    >
                        {isLoading ? (
                            <YStack gap="$sm">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </YStack>
                        ) : actionItems.length > 0 ? (
                            <YStack>
                                {actionItems.map((item, index) => (
                                    <XStack
                                        key={item.id}
                                        flexWrap="wrap"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap="$md"
                                        paddingVertical="$md"
                                        borderTopWidth={index === 0 ? 0 : 1}
                                        borderColor="$borderColor"
                                    >
                                        <XStack minWidth={0} flex={1} alignItems="flex-start" gap="$sm">
                                            <IconTile
                                                tone={item.tone}
                                                icon={item.icon}
                                                color={toneColor[item.tone]}
                                                size={36}
                                            />
                                            <YStack minWidth={0} gap="$xs" flex={1}>
                                                <XStack flexWrap="wrap" alignItems="center" gap="$sm">
                                                    <Typography variant="regularSemibold">{item.title}</Typography>
                                                    <XStack
                                                        paddingHorizontal="$sm"
                                                        paddingVertical={2}
                                                        borderRadius="$full"
                                                        borderWidth={1}
                                                        borderColor="$borderColor"
                                                    >
                                                        <Typography variant="tinyRegular" muted>
                                                            {item.meta}
                                                        </Typography>
                                                    </XStack>
                                                </XStack>
                                                <Typography variant="smallRegular" muted numberOfLines={2}>
                                                    {item.description}
                                                </Typography>
                                            </YStack>
                                        </XStack>
                                        <RouterLink to={item.to} style={{ textDecoration: "none" }}>
                                            <XStack
                                                alignItems="center"
                                                gap="$xs"
                                                paddingHorizontal="$md"
                                                paddingVertical="$xs"
                                                borderRadius="$full"
                                                borderWidth={1}
                                                borderColor="$borderColor"
                                                hoverStyle={{ backgroundColor: "$backgroundHover" }}
                                            >
                                                <Typography variant="smallSemibold">{item.action}</Typography>
                                                <ArrowRight size={14} color={c.color} />
                                            </XStack>
                                        </RouterLink>
                                    </XStack>
                                ))}
                            </YStack>
                        ) : (
                            <EmptyState>
                                {t("admin.dashboard.actions.empty", {
                                    defaultValue: "Brak pilnych spraw do obsłużenia.",
                                })}
                            </EmptyState>
                        )}
                    </Panel>
                </YStack>

                <YStack flex={1} minWidth={300}>
                    <Panel
                        title={t("admin.dashboard.matching.title", { defaultValue: "Parowanie" })}
                        subtitle={t("admin.dashboard.matching.subtitle", {
                            defaultValue: "Szybki obraz kolejki i pojemności wolontariuszy.",
                        })}
                        actionLabel={t("admin.dashboard.check_more", { defaultValue: "Sprawdź więcej" })}
                        actionTo="/admin/matching/mentees"
                        primaryColor={c.primary}
                    >
                        <XStack flexWrap="wrap" gap="$sm">
                            {matchingTiles.map((tile) => (
                                <YStack
                                    key={tile.label}
                                    flex={1}
                                    minWidth={120}
                                    padding="$md"
                                    borderRadius="$md"
                                    backgroundColor="$backgroundHover"
                                    gap="$xs"
                                >
                                    <Typography variant="smallRegular" muted>
                                        {tile.label}
                                    </Typography>
                                    <Typography variant="title3" tag="span">
                                        {tile.value}
                                    </Typography>
                                </YStack>
                            ))}
                        </XStack>
                        <YStack padding="$md" borderRadius="$md" borderWidth={1} borderColor="$borderColor" gap="$sm">
                            <XStack justifyContent="space-between" gap="$sm">
                                <Typography variant="smallRegular" muted>
                                    {t("admin.dashboard.matching.capacity", { defaultValue: "Wykorzystane miejsca" })}
                                </Typography>
                                <Typography variant="smallSemibold">
                                    {volunteerSummary.activeCount}/{volunteerSummary.declaredCapacity || 0}
                                </Typography>
                            </XStack>
                            <Stack height={8} borderRadius="$full" backgroundColor="$backgroundHover" overflow="hidden">
                                <Stack
                                    height="100%"
                                    borderRadius="$full"
                                    backgroundColor="$primary"
                                    width={`${capacityPct}%`}
                                />
                            </Stack>
                        </YStack>
                    </Panel>
                </YStack>
            </XStack>

            {/* Alerts / reports / forms */}
            <XStack flexWrap="wrap" gap="$lg" alignItems="stretch">
                <YStack flex={1} minWidth={280}>
                    <Panel
                        title={t("admin.dashboard.alerts.title", { defaultValue: "Alerty" })}
                        actionLabel={t("admin.dashboard.check_more", { defaultValue: "Sprawdź więcej" })}
                        actionTo="/admin/matching/alerts"
                        primaryColor={c.primary}
                    >
                        {alerts.length > 0 ? (
                            <YStack gap="$sm">
                                {alerts.slice(0, 4).map((alert, index) => (
                                    <YStack
                                        key={`${alert.created_at}-${index}`}
                                        padding="$md"
                                        borderRadius="$md"
                                        borderWidth={1}
                                        borderColor="$borderColor"
                                        gap="$xs"
                                    >
                                        <Typography variant="smallSemibold" numberOfLines={2}>
                                            {alert.message}
                                        </Typography>
                                        <Typography variant="tinyRegular" muted>
                                            {formatDate(alert.created_at)}
                                        </Typography>
                                    </YStack>
                                ))}
                            </YStack>
                        ) : (
                            <EmptyState>
                                {t("admin.dashboard.alerts.empty", { defaultValue: "Brak alertów parowania." })}
                            </EmptyState>
                        )}
                    </Panel>
                </YStack>

                <YStack flex={1} minWidth={280}>
                    <Panel
                        title={t("admin.dashboard.reports.title", { defaultValue: "Zgłoszenia" })}
                        actionLabel={t("admin.dashboard.check_more", { defaultValue: "Sprawdź więcej" })}
                        actionTo="/admin/reports"
                        primaryColor={c.primary}
                    >
                        {reports.length > 0 ? (
                            <YStack gap="$sm">
                                {reports.slice(0, 3).map((report) => (
                                    <RouterLink key={report.id} to="/admin/reports" style={LINK_RESET}>
                                        <YStack
                                            width="100%"
                                            padding="$md"
                                            borderRadius="$md"
                                            borderWidth={1}
                                            borderColor="$borderColor"
                                            gap="$xs"
                                            hoverStyle={{ borderColor: "$primary" }}
                                        >
                                            <Typography variant="smallSemibold" numberOfLines={1}>
                                                {report.subject}
                                            </Typography>
                                            <Typography variant="tinyRegular" muted numberOfLines={2}>
                                                {report.description}
                                            </Typography>
                                            <Typography variant="tinyRegular" muted>
                                                {report.created_by.full_name || report.created_by.email}
                                            </Typography>
                                        </YStack>
                                    </RouterLink>
                                ))}
                            </YStack>
                        ) : (
                            <EmptyState>
                                {t("admin.dashboard.reports.empty", { defaultValue: "Brak otwartych zgłoszeń." })}
                            </EmptyState>
                        )}
                    </Panel>
                </YStack>

                <YStack flex={1} minWidth={280}>
                    <Panel title={t("admin.dashboard.forms.title", { defaultValue: "Formularze" })}>
                        <YStack gap="$sm">
                            {[
                                {
                                    to: "/admin/forms/mentee",
                                    icon: ClipboardList,
                                    tone: "primary" as Tone,
                                    label: t("admin.dashboard.forms.mentees", {
                                        defaultValue: "Formularze osób w kryzysie",
                                    }),
                                    detail:
                                        menteeForms[0]?.created_by.email ??
                                        t("admin.dashboard.forms.no_oldest", { defaultValue: "Brak oczekujących" }),
                                    count: menteeFormsCount,
                                },
                                {
                                    to: "/admin/forms/volunteer",
                                    icon: Users,
                                    tone: "success" as Tone,
                                    label: t("admin.dashboard.forms.volunteers", {
                                        defaultValue: "Formularze wolontariuszy",
                                    }),
                                    detail:
                                        volunteerForms[0]?.created_by.email ??
                                        t("admin.dashboard.forms.no_oldest", { defaultValue: "Brak oczekujących" }),
                                    count: volunteerFormsCount,
                                },
                            ].map((row) => (
                                <RouterLink key={row.to} to={row.to} style={LINK_RESET}>
                                    <XStack
                                        width="100%"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap="$sm"
                                        padding="$md"
                                        borderRadius="$md"
                                        borderWidth={1}
                                        borderColor="$borderColor"
                                        hoverStyle={{ borderColor: "$primary" }}
                                    >
                                        <XStack minWidth={0} alignItems="center" gap="$sm" flex={1}>
                                            <IconTile
                                                tone={row.tone}
                                                icon={row.icon}
                                                color={toneColor[row.tone]}
                                                size={36}
                                            />
                                            <YStack minWidth={0} gap="$xs">
                                                <Typography variant="smallSemibold" numberOfLines={1}>
                                                    {row.label}
                                                </Typography>
                                                <Typography variant="tinyRegular" muted numberOfLines={1}>
                                                    {row.detail}
                                                </Typography>
                                            </YStack>
                                        </XStack>
                                        <Typography variant="title3" tag="span">
                                            {row.count}
                                        </Typography>
                                    </XStack>
                                </RouterLink>
                            ))}
                        </YStack>
                    </Panel>
                </YStack>
            </XStack>
        </YStack>
    );
};

export default Dashboard;
