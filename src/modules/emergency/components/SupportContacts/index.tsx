import { Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, PhoneForwarded, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PillButton } from "../../../layout/admin";
import { useIconColor } from "../../../layout/useIconColor";
import { CONTACT_GROUPS } from "../../content";
import { supportContactsQueryOptions } from "../../queries/supportContactsQueryOptions";
import ContactCard from "../ContactCard";

const SupportContacts = () => {
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

export default SupportContacts;
