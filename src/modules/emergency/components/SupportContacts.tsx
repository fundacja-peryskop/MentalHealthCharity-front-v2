import { Button, Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Phone, PhoneForwarded, RefreshCw, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PillButton } from "../../layout/admin";
import { useIconColor } from "../../layout/useIconColor";
import { CONTACT_GROUPS, dial } from "../content";
import { supportContactsQueryOptions } from "../queries/supportContactsQueryOptions";
import type { SupportContact } from "../types";

const ContactCard = ({ contact }: { contact: SupportContact }) => {
    const { t } = useTranslation();
    const c = useIconColor();

    return (
        <XStack
            tag="li"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="space-between"
            gap="$md"
            padding="$lg"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$background"
        >
            <XStack alignItems="center" gap="$md" flex={1} minWidth={160}>
                <Stack
                    width={40}
                    height={40}
                    flexShrink={0}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$primarySoft"
                    aria-hidden
                >
                    <UserRound size={20} color={c.primary} />
                </Stack>
                <Typography variant="regularSemibold" tag="span">
                    {contact.name}
                </Typography>
            </XStack>
            <Button
                variant="primary"
                outlined
                aria-label={t("emergency.contacts.call", { name: contact.name })}
                onPress={() => dial(contact.phone)}
            >
                <Phone size={16} color={c.primary} aria-hidden />
                <Typography variant="regularSemibold" color="$primary">
                    {contact.phone}
                </Typography>
            </Button>
        </XStack>
    );
};

export const SupportContacts = () => {
    const { t } = useTranslation();
    const c = useIconColor();
    const { data, isLoading, isFetching, isError, refetch } = useQuery(supportContactsQueryOptions());

    const groups = CONTACT_GROUPS.map((group) => ({
        ...group,
        contacts: (data ?? []).filter((contact) => contact.user_role === group.role),
    })).filter((group) => group.contacts.length > 0);

    return (
        <YStack tag="section" aria-labelledby="emergency-contacts" gap="$lg">
            <XStack alignItems="center" gap="$sm">
                <PhoneForwarded size={22} color={c.primary} aria-hidden />
                <Typography variant="title3" tag="h2" id="emergency-contacts">
                    {t("emergency.contacts.title")}
                </Typography>
            </XStack>

            {isLoading ? (
                <XStack paddingVertical="$xl" justifyContent="center" role="status" aria-label={t("common.loading")}>
                    <Loader2 className="animate-spin" size={28} />
                </XStack>
            ) : isError ? (
                <XStack
                    flexWrap="wrap"
                    alignItems="center"
                    gap="$md"
                    padding="$lg"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$danger"
                    backgroundColor="$dangerSoft"
                    role="alert"
                >
                    <AlertTriangle size={18} color={c.danger} aria-hidden />
                    <Typography variant="smallRegular" color="$dangerTextSoft" flex={1} minWidth={200}>
                        {t("emergency.contacts.fetch_error")}
                    </Typography>
                    <PillButton icon={RefreshCw} spinning={isFetching} disabled={isFetching} onPress={() => refetch()}>
                        {t("common.try_again")}
                    </PillButton>
                </XStack>
            ) : groups.length === 0 ? (
                <Typography variant="regularRegular" muted>
                    {t("common.no_data")}
                </Typography>
            ) : (
                <XStack flexWrap="wrap" gap="$xl" alignItems="flex-start">
                    {groups.map((group) => (
                        <YStack
                            key={group.role}
                            tag="section"
                            aria-label={t(group.titleKey)}
                            flex={1}
                            minWidth={300}
                            gap="$md"
                            padding="$xl"
                            borderRadius="$lg"
                            backgroundColor="$backgroundHover"
                            {...shadows.small}
                        >
                            <Typography
                                variant="tinyBold"
                                tag="h3"
                                color="$primary"
                                style={{ textTransform: "uppercase", letterSpacing: 2 }}
                            >
                                {t(group.titleKey)}
                            </Typography>
                            <YStack tag="ul" gap="$sm" margin={0} padding={0} style={{ listStyle: "none" }}>
                                {group.contacts.map((contact) => (
                                    <ContactCard key={`${contact.name}-${contact.phone}`} contact={contact} />
                                ))}
                            </YStack>
                        </YStack>
                    ))}
                </XStack>
            )}
        </YStack>
    );
};
