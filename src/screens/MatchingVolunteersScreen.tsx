import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, UserCheck, UserX, Users } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUser } from "../modules/auth/components/AuthProvider";
import {
    AdminPageHeader,
    type Column,
    DataTable,
    FilterPills,
    type PillTone,
    PillButton,
    StatusPill,
} from "../modules/layout/admin";
import updateUserAutomationExclusionMutation from "../modules/matching/queries/updateUserAutomationExclusionMutation";
import { volunteerCapacityQueryOptions } from "../modules/matching/queries/volunteerCapacityQueryOptions";
import { VolunteerCapacityItem } from "../modules/matching/types";
import AdminLayout from "../modules/shared/components/AdminLayout";
import { isApiDateInFuture } from "../modules/shared/helpers/dateTime";
import formatDate from "../modules/shared/helpers/formatDate";
import { Roles } from "../modules/users/constants";

type ViewMode = "available" | "full";

const isBlocked = isApiDateInFuture;

const isAvailableForMatching = ({ availability }: VolunteerCapacityItem) =>
    availability.declared_capacity !== null &&
    availability.free_slots > 0 &&
    !availability.is_full &&
    !isBlocked(availability.blocked_until);

const MatchingVolunteersScreen = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { user: currentUser } = useUser();
    const [viewMode, setViewMode] = useState<ViewMode>("available");
    const { data, isError, isLoading } = useQuery(volunteerCapacityQueryOptions());
    const canManageAutomationExclusion = currentUser?.user_role === Roles.ADMIN;
    const { mutate: updateAutomationExclusion, isPending: isAutomationExclusionPending } = useMutation({
        mutationFn: updateUserAutomationExclusionMutation,
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ["matching"] });
            toast.success(
                updatedUser.excluded_from_automation
                    ? t("matching.automation_exclusion_enabled_success", {
                          defaultValue: "Konto zostało wykluczone z automatycznego parowania",
                      })
                    : t("matching.automation_exclusion_disabled_success", {
                          defaultValue: "Konto wróciło do automatycznego parowania",
                      })
            );
        },
    });

    const volunteers = data ?? [];
    const availableVolunteers = useMemo(() => volunteers.filter(isAvailableForMatching), [volunteers]);
    const fullVolunteers = useMemo(() => volunteers.filter((item) => !isAvailableForMatching(item)), [volunteers]);
    const items = viewMode === "available" ? availableVolunteers : fullVolunteers;

    const getStatus = ({ availability }: VolunteerCapacityItem): { label: string; tone: PillTone } => {
        if (isBlocked(availability.blocked_until)) {
            return { label: t("matching.volunteer_status.blocked", { defaultValue: "Zablokowany" }), tone: "warning" };
        }
        if (availability.declared_capacity === null) {
            return {
                label: t("matching.volunteer_status.no_declaration", { defaultValue: "Brak deklaracji" }),
                tone: "neutral",
            };
        }
        if (availability.is_full) {
            return { label: t("matching.volunteer_status.full", { defaultValue: "Pełny" }), tone: "danger" };
        }
        return { label: t("matching.volunteer_status.available", { defaultValue: "Dyspozycyjny" }), tone: "success" };
    };

    const columns: Column<VolunteerCapacityItem>[] = [
        {
            key: "name",
            header: t("common.name", { defaultValue: "Imię" }),
            flex: 2,
            render: ({ volunteer }) => (
                <YStack gap="$xs" minWidth={0}>
                    <Typography variant="regularSemibold">{volunteer.full_name || volunteer.email}</Typography>
                    <Typography variant="tinyRegular" muted>
                        ID: {volunteer.id}
                    </Typography>
                </YStack>
            ),
        },
        {
            key: "email",
            header: t("common.email", { defaultValue: "Email" }),
            flex: 2,
            render: ({ volunteer }) => (
                <Typography variant="smallRegular" muted width="100%">
                    {volunteer.email}
                </Typography>
            ),
        },
        {
            key: "status",
            header: t("common.status", { defaultValue: "Status" }),
            width: 150,
            render: (item) => {
                const status = getStatus(item);
                return <StatusPill tone={status.tone}>{status.label}</StatusPill>;
            },
        },
        {
            key: "capacity",
            header: t("matching.declared_capacity", { defaultValue: "Deklaracja" }),
            width: 120,
            align: "center",
            render: ({ availability }) => (
                <Typography variant="smallRegular">{availability.declared_capacity ?? "-"}</Typography>
            ),
        },
        {
            key: "active",
            header: t("matching.active_chats", { defaultValue: "Aktywne czaty" }),
            width: 130,
            align: "center",
            render: ({ availability }) => (
                <Typography variant="smallRegular">{availability.active_chat_count}</Typography>
            ),
        },
        {
            key: "free",
            header: t("matching.free_slots", { defaultValue: "Wolne miejsca" }),
            width: 130,
            align: "center",
            render: ({ availability }) => <Typography variant="smallRegular">{availability.free_slots}</Typography>,
        },
        {
            key: "blocked",
            header: t("matching.blocked_until", { defaultValue: "Blokada do" }),
            width: 150,
            render: ({ availability }) => (
                <Typography variant="smallRegular" muted>
                    {availability.blocked_until && isBlocked(availability.blocked_until)
                        ? formatDate(availability.blocked_until)
                        : "-"}
                </Typography>
            ),
        },
        {
            key: "automation",
            header: t("matching.automation", { defaultValue: "Automatyzacja" }),
            width: 140,
            render: ({ volunteer }) => (
                <StatusPill tone={volunteer.excluded_from_automation ? "danger" : "success"}>
                    {volunteer.excluded_from_automation
                        ? t("matching.excluded", { defaultValue: "Wykluczony" })
                        : t("matching.included", { defaultValue: "Aktywny" })}
                </StatusPill>
            ),
        },
        {
            key: "actions",
            header: t("common.actions", { defaultValue: "Akcje" }),
            width: 230,
            render: ({ volunteer }) => (
                <XStack flexWrap="wrap" alignItems="center" gap="$sm">
                    {canManageAutomationExclusion && (
                        <PillButton
                            icon={isAutomationExclusionPending ? Loader2 : UserX}
                            spinning={isAutomationExclusionPending}
                            disabled={isAutomationExclusionPending}
                            tone={volunteer.excluded_from_automation ? "primary" : "danger"}
                            onPress={() =>
                                updateAutomationExclusion({
                                    userId: volunteer.id,
                                    excluded_from_automation: !volunteer.excluded_from_automation,
                                })
                            }
                        >
                            {volunteer.excluded_from_automation
                                ? t("matching.include_in_automation", { defaultValue: "Przywróć" })
                                : t("matching.exclude_from_automation", { defaultValue: "Wyklucz" })}
                        </PillButton>
                    )}
                    <PillButton to={`/profile/${volunteer.id}`}>
                        {t("common.go_to_profile", { defaultValue: "Profil" })}
                    </PillButton>
                </XStack>
            ),
        },
    ];

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={Users}
                    tone="primary"
                    title={t("matching.volunteers_title", { defaultValue: "Wolontariusze" })}
                    subtitle={t("matching.volunteers_subtitle", {
                        defaultValue: "Dyspozycyjność wolontariuszy w automatycznym parowaniu.",
                    })}
                    actions={
                        <FilterPills
                            ariaLabel={t("matching.volunteers_title", { defaultValue: "Wolontariusze" })}
                            value={viewMode}
                            onChange={(value) => setViewMode(value as ViewMode)}
                            options={[
                                {
                                    value: "available",
                                    label: t("matching.volunteers_available", { defaultValue: "Dyspozycyjni" }),
                                    icon: UserCheck,
                                    count: availableVolunteers.length,
                                },
                                {
                                    value: "full",
                                    label: t("matching.volunteers_full", { defaultValue: "Pełni" }),
                                    icon: AlertTriangle,
                                    count: fullVolunteers.length,
                                },
                            ]}
                        />
                    }
                />

                <DataTable
                    columns={columns}
                    rows={items}
                    rowKey={({ volunteer }) => volunteer.id}
                    isLoading={isLoading}
                    loadingText={t("common.loading", { defaultValue: "Ładowanie..." })}
                    emptyText={
                        viewMode === "available"
                            ? t("matching.no_available_volunteers", {
                                  defaultValue: "Brak dyspozycyjnych wolontariuszy.",
                              })
                            : t("matching.no_full_volunteers", {
                                  defaultValue: "Brak pełnych lub niedostępnych wolontariuszy.",
                              })
                    }
                    minWidth={1180}
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

export default MatchingVolunteersScreen;
