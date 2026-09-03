import { Input, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Play, Save, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { chatInactivitySettingsQueryOptions } from "../modules/chat/queries/chatInactivitySettingsQueryOptions";
import updateChatInactivitySettingsMutation from "../modules/chat/queries/updateChatInactivitySettingsMutation";
import { ChatInactivitySettingsUpdate } from "../modules/chat/types";
import { AdminPageHeader, PillButton, StatusPill } from "../modules/layout/admin";
import { useIconColor } from "../modules/layout/useIconColor";
import { matchingSettingsQueryOptions } from "../modules/matching/queries/matchingSettingsQueryOptions";
import runMatchingMutation from "../modules/matching/queries/runMatchingMutation";
import updateMatchingSettingsMutation from "../modules/matching/queries/updateMatchingSettingsMutation";
import AdminLayout from "../modules/shared/components/AdminLayout";
import formatDate from "../modules/shared/helpers/formatDate";

const ToggleSwitch = ({
    checked,
    disabled,
    onToggle,
    label,
}: {
    checked: boolean;
    disabled?: boolean;
    onToggle: () => void;
    label: string;
}) => (
    <Stack
        tag="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onPress={disabled ? undefined : onToggle}
        width={64}
        height={36}
        borderRadius="$full"
        paddingHorizontal={4}
        borderWidth={1}
        borderColor={checked ? "$primary" : "$borderColor"}
        backgroundColor={checked ? "$primary" : "$backgroundHover"}
        justifyContent="center"
        alignItems="flex-start"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
    >
        <Stack
            width={28}
            height={28}
            borderRadius="$full"
            backgroundColor="$background"
            {...shadows.small}
            style={{ transform: `translateX(${checked ? 28 : 0}px)`, transition: "transform 0.18s ease" }}
        />
    </Stack>
);

const AdminSettingsScreen = () => {
    const { t } = useTranslation();
    const c = useIconColor();
    const queryClient = useQueryClient();
    const settingsQuery = useQuery(matchingSettingsQueryOptions());
    const inactivitySettingsQuery = useQuery(chatInactivitySettingsQueryOptions());
    const [inactivitySettings, setInactivitySettings] = useState<ChatInactivitySettingsUpdate>({
        empty_or_starter_timeout_days: 7,
        conversation_timeout_days: 14,
        snooze_extension_days: 7,
    });
    const isAutomaticMatchingEnabled = settingsQuery.data?.automatic_matching_enabled === true;

    useEffect(() => {
        if (!inactivitySettingsQuery.data) return;

        setInactivitySettings({
            empty_or_starter_timeout_days: inactivitySettingsQuery.data.empty_or_starter_timeout_days,
            conversation_timeout_days: inactivitySettingsQuery.data.conversation_timeout_days,
            snooze_extension_days: inactivitySettingsQuery.data.snooze_extension_days,
        });
    }, [inactivitySettingsQuery.data]);

    const updateSettings = useMutation({
        mutationFn: updateMatchingSettingsMutation,
        onSuccess: (settings) => {
            queryClient.invalidateQueries({ queryKey: ["matching"] });
            toast.success(
                settings.automatic_matching_enabled
                    ? t("matching.settings_auto_enabled", {
                          defaultValue: "Automatyczne przydzielanie zostało włączone",
                      })
                    : t("matching.settings_auto_disabled", {
                          defaultValue: "Automatyczne przydzielanie zostało wyłączone",
                      })
            );
        },
    });

    const runMatching = useMutation({
        mutationFn: runMatchingMutation,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["matching"] });
            toast.success(
                t("matching.settings_run_success", {
                    defaultValue: "Utworzono pary: {{count}}",
                    count: result.matched_count,
                })
            );
        },
    });

    const updateInactivitySettings = useMutation({
        mutationFn: updateChatInactivitySettingsMutation,
        onSuccess: (settings) => {
            queryClient.setQueryData(["chat", "inactivity-settings"], settings);
            setInactivitySettings({
                empty_or_starter_timeout_days: settings.empty_or_starter_timeout_days,
                conversation_timeout_days: settings.conversation_timeout_days,
                snooze_extension_days: settings.snooze_extension_days,
            });
            toast.success(
                t("chat.inactivity_settings.saved", {
                    defaultValue: "Ustawienia automatycznego zamykania zostały zapisane",
                })
            );
        },
    });

    const isSaving = updateSettings.isPending || settingsQuery.isFetching;
    const isRunning = runMatching.isPending;
    const inactivityValuesAreValid = Object.values(inactivitySettings).every(
        (value) => Number.isInteger(value) && value >= 1 && value <= 365
    );

    const setInactivitySetting = (field: keyof ChatInactivitySettingsUpdate, value: string) => {
        setInactivitySettings((current) => ({
            ...current,
            [field]: Number(value),
        }));
    };

    const IconTile = ({ icon: Icon }: { icon: LucideIcon }) => (
        <Stack
            width={40}
            height={40}
            borderRadius="$md"
            alignItems="center"
            justifyContent="center"
            backgroundColor="$backgroundHover"
            flexShrink={0}
        >
            <Icon size={20} color={c.muted} />
        </Stack>
    );

    const numberFields: { field: keyof ChatInactivitySettingsUpdate; id: string; label: string; hint: string }[] = [
        {
            field: "empty_or_starter_timeout_days",
            id: "empty-or-starter-timeout",
            label: t("chat.inactivity_settings.empty_or_starter_label", { defaultValue: "Pusty lub tylko startowy" }),
            hint: t("chat.inactivity_settings.days_after_inactivity", { defaultValue: "Dni bez aktywności" }),
        },
        {
            field: "conversation_timeout_days",
            id: "conversation-timeout",
            label: t("chat.inactivity_settings.conversation_label", { defaultValue: "Chat z rozmową" }),
            hint: t("chat.inactivity_settings.days_after_inactivity", { defaultValue: "Dni bez aktywności" }),
        },
        {
            field: "snooze_extension_days",
            id: "snooze-extension",
            label: t("chat.inactivity_settings.snooze_label", { defaultValue: "Jedna drzemka" }),
            hint: t("chat.inactivity_settings.extension_days", { defaultValue: "Dodawane dni" }),
        },
    ];

    return (
        <AdminLayout>
            <YStack width="100%" gap="$lg">
                <AdminPageHeader
                    icon={Settings}
                    tone="primary"
                    title={t("admin.sidebar.settings", { defaultValue: "Ustawienia" })}
                    subtitle={t("matching.settings_subtitle", {
                        defaultValue: "Konfiguracja procesów i ustawień administracyjnych.",
                    })}
                />

                {/* Automatic matching */}
                <YStack gap="$lg" padding="$xl" borderRadius="$lg" backgroundColor="$background" {...shadows.small}>
                    <XStack flexWrap="wrap" alignItems="flex-start" justifyContent="space-between" gap="$lg">
                        <XStack gap="$md" flex={1} minWidth={260}>
                            <IconTile icon={ShieldCheck} />
                            <YStack gap="$xs" flex={1} minWidth={0}>
                                <XStack flexWrap="wrap" alignItems="center" gap="$sm">
                                    <Typography variant="largeBold" tag="h2">
                                        {t("matching.settings_auto_title", {
                                            defaultValue: "Automatyczne przydzielanie",
                                        })}
                                    </Typography>
                                    <StatusPill tone={isAutomaticMatchingEnabled ? "success" : "neutral"}>
                                        {isAutomaticMatchingEnabled
                                            ? t("common.enabled", { defaultValue: "Włączone" })
                                            : t("common.disabled", { defaultValue: "Wyłączone" })}
                                    </StatusPill>
                                </XStack>
                                <Typography variant="smallRegular" muted width="100%">
                                    {isAutomaticMatchingEnabled
                                        ? t("matching.settings_auto_on_description", {
                                              defaultValue:
                                                  "System może automatycznie przydzielać najstarsze oczekujące osoby do dostępnych wolontariuszy.",
                                          })
                                        : t("matching.settings_auto_off_description", {
                                              defaultValue: "Dostępne jest tylko ręczne parowanie.",
                                          })}
                                </Typography>
                                {settingsQuery.data?.updated_at && (
                                    <Typography variant="tinyRegular" muted>
                                        {t("matching.settings_updated_at", {
                                            defaultValue: "Ostatnia zmiana: {{date}}",
                                            date: formatDate(settingsQuery.data.updated_at),
                                        })}
                                    </Typography>
                                )}
                                {settingsQuery.isError && (
                                    <Typography variant="smallRegular" color="$danger">
                                        {t("common.no_data", { defaultValue: "Nie udało się pobrać danych." })}
                                    </Typography>
                                )}
                            </YStack>
                        </XStack>

                        <XStack flexWrap="wrap" alignItems="center" gap="$md">
                            <ToggleSwitch
                                checked={isAutomaticMatchingEnabled}
                                disabled={isSaving}
                                label={t("matching.settings_auto_title", {
                                    defaultValue: "Automatyczne przydzielanie",
                                })}
                                onToggle={() =>
                                    updateSettings.mutate({ automatic_matching_enabled: !isAutomaticMatchingEnabled })
                                }
                            />
                            <PillButton
                                icon={Play}
                                spinning={isRunning}
                                disabled={!isAutomaticMatchingEnabled || isRunning}
                                onPress={() => runMatching.mutate()}
                            >
                                {t("matching.settings_run_now", { defaultValue: "Uruchom parowanie teraz" })}
                            </PillButton>
                        </XStack>
                    </XStack>
                </YStack>

                {/* Chat inactivity */}
                <YStack gap="$lg" padding="$xl" borderRadius="$lg" backgroundColor="$background" {...shadows.small}>
                    <XStack gap="$md">
                        <IconTile icon={Clock3} />
                        <YStack gap="$xs" flex={1} minWidth={0}>
                            <Typography variant="largeBold" tag="h2">
                                {t("chat.inactivity_settings.title", { defaultValue: "Automatyczne zamykanie chatów" })}
                            </Typography>
                            <Typography variant="smallRegular" muted width="100%">
                                {t("chat.inactivity_settings.description", {
                                    defaultValue:
                                        "Terminy są stosowane do nowych chatów oraz przy kolejnej wiadomości lub drzemce. Nie zmieniają już wyznaczonych terminów.",
                                })}
                            </Typography>
                        </YStack>
                    </XStack>

                    <XStack flexWrap="wrap" gap="$md">
                        {numberFields.map(({ field, id, label, hint }) => (
                            <YStack key={id} flex={1} minWidth={200}>
                                <Input
                                    id={id}
                                    label={label}
                                    caption={hint}
                                    keyboardType="number-pad"
                                    value={String(inactivitySettings[field])}
                                    disabled={inactivitySettingsQuery.isLoading || updateInactivitySettings.isPending}
                                    onChangeText={(text) => setInactivitySetting(field, text)}
                                />
                            </YStack>
                        ))}
                    </XStack>

                    <XStack flexWrap="wrap" alignItems="center" justifyContent="space-between" gap="$md">
                        <YStack gap="$xs">
                            {inactivitySettingsQuery.data?.updated_at && (
                                <Typography variant="tinyRegular" muted>
                                    {t("matching.settings_updated_at", {
                                        defaultValue: "Ostatnia zmiana: {{date}}",
                                        date: formatDate(inactivitySettingsQuery.data.updated_at),
                                    })}
                                </Typography>
                            )}
                            {inactivitySettingsQuery.isError && (
                                <Typography variant="smallRegular" color="$danger">
                                    {t("common.no_data", { defaultValue: "Nie udało się pobrać danych." })}
                                </Typography>
                            )}
                        </YStack>

                        <PillButton
                            icon={Save}
                            variant="solid"
                            spinning={updateInactivitySettings.isPending}
                            disabled={
                                inactivitySettingsQuery.isLoading ||
                                updateInactivitySettings.isPending ||
                                !inactivityValuesAreValid
                            }
                            onPress={() => updateInactivitySettings.mutate(inactivitySettings)}
                        >
                            {updateInactivitySettings.isPending
                                ? t("chat.inactivity_settings.saving", { defaultValue: "Zapisywanie..." })
                                : t("common.save", { defaultValue: "Zapisz" })}
                        </PillButton>
                    </XStack>
                </YStack>
            </YStack>
        </AdminLayout>
    );
};

export default AdminSettingsScreen;
