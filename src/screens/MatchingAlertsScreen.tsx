import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, UserCheck, Users } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AdminPageHeader, type Column, DataTable, PillButton, StatusPill } from "../modules/layout/admin";
import { adminAlertsQueryOptions } from "../modules/matching/queries/adminAlertsQueryOptions";
import { AdminAlert } from "../modules/matching/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import formatDate from "../modules/shared/helpers/formatDate";

const getIds = (alert: AdminAlert, key: "waiting_user_ids" | "notified_user_ids") => {
    const value = alert.metadata?.[key];

    return Array.isArray(value) ? value.filter((id): id is number => typeof id === "number") : [];
};

const MatchingAlertsScreen = () => {
    const { t } = useTranslation();
    const { data, isError, isFetching, isLoading, refetch } = useQuery(adminAlertsQueryOptions());
    const alerts = data ?? [];

    const latestAlertAt = useMemo(() => {
        if (!alerts.length) return null;

        return alerts[0].created_at;
    }, [alerts]);

    const columns: Column<AdminAlert>[] = [
        {
            key: "type",
            header: t("common.type", { defaultValue: "Typ" }),
            flex: 2,
            render: (alert) => (
                <YStack gap="$xs" minWidth={0}>
                    <Typography variant="regularSemibold">
                        {t("matching.alert_no_capacity_title", { defaultValue: "Brak wolnych wolontariuszy" })}
                    </Typography>
                    <Typography variant="tinyRegular" muted width="100%">
                        {alert.message}
                    </Typography>
                </YStack>
            ),
        },
        {
            key: "date",
            header: t("common.date", { defaultValue: "Data" }),
            width: 160,
            render: (alert) => (
                <Typography variant="smallRegular" muted>
                    {formatDate(alert.created_at)}
                </Typography>
            ),
        },
        {
            key: "waiting",
            header: t("matching.waiting_mentees", { defaultValue: "Oczekujący" }),
            width: 150,
            render: (alert) => (
                <StatusPill tone="warning">
                    {t("matching.alert_waiting_count", {
                        defaultValue: "{{count}} oczekuje",
                        count: getIds(alert, "waiting_user_ids").length,
                    })}
                </StatusPill>
            ),
        },
        {
            key: "notified",
            header: t("matching.notified_mentees", { defaultValue: "Powiadomieni" }),
            width: 160,
            render: (alert) => {
                const count = getIds(alert, "notified_user_ids").length;
                return (
                    <StatusPill tone={count ? "info" : "neutral"}>
                        {t("matching.alert_notified_count", { defaultValue: "{{count}} powiadomionych", count })}
                    </StatusPill>
                );
            },
        },
        {
            key: "ids",
            header: t("matching.waiting_user_ids", { defaultValue: "ID osób" }),
            flex: 1,
            render: (alert) => {
                const ids = getIds(alert, "waiting_user_ids");
                return (
                    <Typography variant="tinyRegular" muted width="100%">
                        {ids.length ? ids.join(", ") : "-"}
                    </Typography>
                );
            },
        },
    ];

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={AlertTriangle}
                    tone="warning"
                    title={t("matching.alerts_title", { defaultValue: "Alerty parowania" })}
                    subtitle={t("matching.alerts_subtitle", {
                        defaultValue:
                            "Ostatnie alerty automatyzacji, gdy osoby czekają na sparowanie, ale brakuje wolnych wolontariuszy.",
                    })}
                    meta={
                        latestAlertAt
                            ? t("matching.alerts_latest", {
                                  defaultValue: "Ostatni alert: {{date}}",
                                  date: formatDate(latestAlertAt),
                              })
                            : undefined
                    }
                    actions={
                        <>
                            <PillButton icon={UserCheck} to="/admin/matching/mentees">
                                {t("matching.mentees_title", { defaultValue: "Osoby w kryzysie" })}
                            </PillButton>
                            <PillButton icon={Users} to="/admin/matching/volunteers">
                                {t("matching.volunteers_title", { defaultValue: "Wolontariusze" })}
                            </PillButton>
                            <PillButton
                                icon={RefreshCw}
                                onPress={() => refetch()}
                                disabled={isFetching}
                                spinning={isFetching}
                            >
                                {t("common.refresh", { defaultValue: "Odśwież" })}
                            </PillButton>
                        </>
                    }
                />

                <DataTable
                    columns={columns}
                    rows={alerts}
                    rowKey={(alert) => `${alert.created_at}-${alert.message}`}
                    isLoading={isLoading}
                    loadingText={t("common.loading", { defaultValue: "Ładowanie..." })}
                    emptyText={t("matching.no_alerts", { defaultValue: "Brak alertów parowania." })}
                    minWidth={780}
                />

                {isError && (
                    <Typography variant="smallRegular" color="$danger">
                        {t("common.no_data", { defaultValue: "Nie udało się pobrać danych." })}
                    </Typography>
                )}
            </YStack>
        </AdminLayout>
    );
};

export default MatchingAlertsScreen;
