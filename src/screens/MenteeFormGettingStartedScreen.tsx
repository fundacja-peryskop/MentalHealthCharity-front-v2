import { Section, Stack, Typography, YStack, shadows } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { useUser } from "../modules/auth/components/AuthProvider";
import { buildChatSupportRegisterUrl } from "../modules/auth/helpers/authRedirect";
import { CtaButton } from "../modules/layout/CtaButton";
import { PageContainer } from "../modules/layout/PageContainer";
import ScrollIndicator from "../modules/shared/components/ScrollIndicator";

const TX = "mentee_form_getting_started_screen";

const MenteeFormGettingStartedScreen = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const chatSupportHref = user ? "/form/mentee" : buildChatSupportRegisterUrl("/form/mentee");

    const Paragraph = ({ tx, bold }: { tx: string; bold?: boolean }) => (
        <Typography variant={bold ? "regularBold" : "regularRegular"} width="100%">
            {t(`${TX}.${tx}`)}
        </Typography>
    );

    return (
        <YStack>
            {/* Header */}
            <Section backgroundColor="$primary" paddingTop={112} paddingBottom={96} alignItems="center">
                <PageContainer maxWidth={768} gap="$md">
                    <Typography variant="title2" tag="h1" color="$primaryText" width="100%">
                        {t(`${TX}.header.title`)}
                    </Typography>
                    <Typography variant="largeRegular" color="rgba(255,255,255,0.9)" maxWidth={520} width="100%">
                        {t(`${TX}.header.subtitle`)}
                    </Typography>
                </PageContainer>
            </Section>

            {/* Content */}
            <Section paddingBottom="$xxxl" alignItems="center">
                <PageContainer maxWidth={768} gap="$lg">
                    <YStack
                        marginTop={-48}
                        width="100%"
                        gap="$lg"
                        padding="$xl"
                        borderRadius="$lg"
                        borderWidth={1}
                        borderColor="$borderColor"
                        backgroundColor="$background"
                        {...shadows.small}
                    >
                        <Paragraph tx="content.p1" bold />
                        <Paragraph tx="content.p2" />
                        <Paragraph tx="content.p3" />

                        <YStack gap="$sm" width="100%">
                            <Typography variant="regularBold" width="100%">
                                {t(`${TX}.content.chat_section.title`)}
                            </Typography>
                            <Paragraph tx="content.chat_section.p4" />
                            <Paragraph tx="content.chat_section.p5" />
                            <Paragraph tx="content.chat_section.p6" />
                        </YStack>

                        <Paragraph tx="content.p7" />
                        <Paragraph tx="content.p8" />

                        <Stack borderTopWidth={1} borderColor="$borderColor" paddingTop="$lg" alignItems="center">
                            <CtaButton href={chatSupportHref} variant="primary" fullWidth>
                                {t("homepage.chat_now")}
                            </CtaButton>
                        </Stack>
                    </YStack>

                    <Typography variant="smallRegular" muted align="center" width="100%">
                        {t(`${TX}.content.footer`)}
                    </Typography>

                    <ScrollIndicator />
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default MenteeFormGettingStartedScreen;
