import { Section, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { PhoneOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmergencyProcedure from "../modules/emergency/components/EmergencyProcedure";
import SupportContacts from "../modules/emergency/components/SupportContacts";
import { PageContainer } from "../modules/layout/PageContainer";
import { useIconColor } from "../modules/layout/useIconColor";

const EmergencyProcedureScreen = () => {
    const { t } = useTranslation();
    const c = useIconColor();

    return (
        <YStack>
            <Section backgroundColor="$dangerSoft" paddingTop="$xxxl" paddingBottom="$xl" alignItems="center">
                <PageContainer gap="$sm" maxWidth={1200}>
                    <Typography
                        variant="tinyBold"
                        color="$dangerTextSoft"
                        style={{ textTransform: "uppercase", letterSpacing: 3 }}
                    >
                        {t("emergency.eyebrow")}
                    </Typography>
                    <Typography variant="title2" tag="h1">
                        {t("emergency.title")}
                    </Typography>
                    <Typography variant="largeRegular" muted maxWidth={720} width="100%">
                        {t("emergency.subtitle")}
                    </Typography>
                </PageContainer>
            </Section>

            <Section paddingVertical="$xxxl" alignItems="center">
                <PageContainer maxWidth={1200} gap="$xxl">
                    <EmergencyProcedure />
                    <SupportContacts />

                    <XStack
                        role="note"
                        gap="$md"
                        alignItems="flex-start"
                        padding="$lg"
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor="$borderColor"
                        backgroundColor="$backgroundHover"
                    >
                        <PhoneOff size={20} color={c.muted} aria-hidden />
                        <YStack gap="$xs" flex={1}>
                            <Typography variant="regularSemibold">{t("emergency.no_answer.title")}</Typography>
                            <Typography variant="smallRegular" muted width="100%">
                                {t("emergency.no_answer.description")}
                            </Typography>
                        </YStack>
                    </XStack>
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default EmergencyProcedureScreen;
