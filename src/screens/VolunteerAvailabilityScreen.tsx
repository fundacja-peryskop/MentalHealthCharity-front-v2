import { Section, Select, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
    AVAILABILITY_CAPACITY_OPTIONS,
    AVAILABILITY_WEEKLY_TIME_HINT,
    DEFAULT_AVAILABILITY_CAPACITY,
    LOW_AVAILABILITY_WARNING,
} from "../modules/matching/constants";
import updateVolunteerAvailabilityMutation from "../modules/matching/queries/updateVolunteerAvailabilityMutation";
import { volunteerAvailabilityQueryOptions } from "../modules/matching/queries/volunteerAvailabilityQueryOptions";
import { PageContainer } from "../modules/layout/PageContainer";
import { PillButton, StatusPill, type PillTone } from "../modules/layout/admin";
import { useIconColor } from "../modules/layout/useIconColor";
import formatDate from "../modules/shared/helpers/formatDate";

const MetricTile = ({ label, value }: { label: string; value: string | number }) => (
    <YStack
        flex={1}
        minWidth={180}
        gap="$xs"
        padding="$lg"
        borderRadius="$lg"
        backgroundColor="$background"
        {...shadows.small}
    >
        <Typography variant="smallRegular" muted>
            {label}
        </Typography>
        <Typography variant="title2" tag="span">
            {value}
        </Typography>
    </YStack>
);

const AlertBox = ({ tone, title, children }: { tone: "danger" | "info"; title: string; children: React.ReactNode }) => {
    const c = useIconColor();
    return (
        <XStack
            gap="$sm"
            padding="$lg"
            borderRadius="$md"
            borderWidth={1}
            borderColor={tone === "danger" ? "$danger" : "$borderColor"}
            backgroundColor={tone === "danger" ? "$dangerSoft" : "$backgroundHover"}
        >
            {tone === "danger" ? <AlertTriangle size={18} color={c.danger} /> : null}
            <YStack gap="$xs" flex={1}>
                <Typography variant="regularSemibold" color={tone === "danger" ? "$dangerTextSoft" : "$color"}>
                    {title}
                </Typography>
                <Typography variant="smallRegular" muted width="100%" style={{ whiteSpace: "pre-line" }}>
                    {children}
                </Typography>
            </YStack>
        </XStack>
    );
};

const VolunteerAvailabilityScreen = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [capacity, setCapacity] = useState("2");

    const { data, isLoading, isFetching, isError, refetch } = useQuery(
        volunteerAvailabilityQueryOptions({
            refetchOnWindowFocus: true,
        })
    );

    const { mutate, isPending } = useMutation({
        mutationFn: updateVolunteerAvailabilityMutation,
        onSuccess: (updatedAvailability) => {
            queryClient.setQueryData(["volunteerAvailability"], updatedAvailability);
            setCapacity(String(updatedAvailability.declared_capacity ?? DEFAULT_AVAILABILITY_CAPACITY));
            toast.success(t("matching.availability_saved", { defaultValue: "Dyspozycyjność została zapisana" }));
        },
    });

    useEffect(() => {
        if (!data) return;

        setCapacity(String(data.declared_capacity ?? DEFAULT_AVAILABILITY_CAPACITY));
    }, [data]);

    const activeChatCount = data?.active_chat_count ?? 0;
    const declaredCapacity = data?.declared_capacity ?? null;
    const freeSlots = data?.free_slots ?? 0;
    const selectedCapacity = Number(capacity);
    const selectedBelowCurrentAssignments = selectedCapacity < activeChatCount;
    const blockedUntil = data?.blocked_until ? formatDate(data.blocked_until) : null;

    const status = useMemo<{ tone: PillTone; label: string }>(() => {
        if (!data || declaredCapacity === null) {
            return {
                tone: "warning",
                label: t("matching.availability_not_declared", { defaultValue: "Brak deklaracji" }),
            };
        }
        if (data.is_full) {
            return { tone: "warning", label: t("matching.availability_full", { defaultValue: "Pełny" }) };
        }
        return { tone: "success", label: t("matching.availability_available", { defaultValue: "Dyspozycyjny" }) };
    }, [data, declaredCapacity, t]);

    const handleSave = () => {
        if (!Number.isInteger(selectedCapacity) || isPending) return;
        mutate({ declared_capacity: selectedCapacity });
    };

    if (isLoading) {
        return (
            <Section paddingVertical="$xxxl" alignItems="center" justifyContent="center" minHeight="50vh">
                <Loader2 className="animate-spin" size={28} />
            </Section>
        );
    }

    return (
        <Section paddingVertical="$xxxl" alignItems="center">
            <PageContainer maxWidth={960} gap="$lg">
                <XStack flexWrap="wrap" alignItems="center" gap="$md">
                    <Typography variant="title2" tag="h1">
                        {t("matching.availability_page_title", { defaultValue: "Dyspozycyjność" })}
                    </Typography>
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </XStack>

                {isError && (
                    <AlertBox tone="danger" title={t("common.error", { defaultValue: "Błąd" })}>
                        {t("matching.availability_fetch_error", {
                            defaultValue: "Nie udało się pobrać Twojej dyspozycyjności.",
                        })}
                    </AlertBox>
                )}

                <XStack flexWrap="wrap" gap="$md">
                    <MetricTile
                        label={t("matching.availability_declared_capacity", { defaultValue: "Zadeklarowana liczba" })}
                        value={declaredCapacity ?? "-"}
                    />
                    <MetricTile
                        label={t("matching.availability_active_chats", { defaultValue: "Aktywne rozmowy" })}
                        value={activeChatCount}
                    />
                    <MetricTile
                        label={t("matching.availability_free_slots", { defaultValue: "Wolne miejsca" })}
                        value={Math.max(freeSlots, 0)}
                    />
                </XStack>

                <YStack gap="$lg" padding="$xl" borderRadius="$lg" backgroundColor="$background" {...shadows.small}>
                    <XStack flexWrap="wrap" alignItems="flex-end" justifyContent="space-between" gap="$md">
                        <YStack gap="$xs" width={280} maxWidth="100%">
                            <Select
                                label={t("matching.availability_capacity", { defaultValue: "Liczba osób" })}
                                value={capacity}
                                onValueChange={(value) => {
                                    if (value) setCapacity(value);
                                }}
                                disabled={isPending}
                                options={AVAILABILITY_CAPACITY_OPTIONS.map((option) => ({
                                    value: option,
                                    label: option,
                                }))}
                            />
                        </YStack>

                        <XStack flexWrap="wrap" gap="$sm">
                            <PillButton
                                icon={RefreshCw}
                                spinning={isFetching}
                                disabled={isFetching || isPending}
                                onPress={() => refetch()}
                            >
                                {t("common.refresh", { defaultValue: "Odśwież" })}
                            </PillButton>
                            <PillButton
                                icon={isPending ? Loader2 : Save}
                                spinning={isPending}
                                variant="solid"
                                disabled={isPending}
                                onPress={handleSave}
                            >
                                {t("common.save")}
                            </PillButton>
                        </XStack>
                    </XStack>

                    <Typography variant="smallRegular" muted width="100%">
                        {t("matching.availability_weekly_time_hint", { defaultValue: AVAILABILITY_WEEKLY_TIME_HINT })}
                    </Typography>
                </YStack>

                {(data?.below_current_assignments || selectedBelowCurrentAssignments) && (
                    <AlertBox tone="danger" title={t("matching.availability_warning_title", { defaultValue: "Uwaga" })}>
                        {t("matching.availability_below_assignments_warning", {
                            defaultValue: LOW_AVAILABILITY_WARNING,
                        })}
                    </AlertBox>
                )}

                {blockedUntil && (
                    <AlertBox
                        tone="info"
                        title={t("matching.availability_blocked_title", {
                            defaultValue: "Automatyzacja chwilowo wstrzymana",
                        })}
                    >
                        {t("matching.availability_blocked_description", {
                            defaultValue: "Nowe automatyczne przypisanie będzie możliwe po: {{date}}.",
                            date: blockedUntil,
                        })}
                    </AlertBox>
                )}
            </PageContainer>
        </Section>
    );
};

export default VolunteerAvailabilityScreen;
