import { Section, Stack, Typography, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { useUser } from "../modules/auth/components/AuthProvider";
import { buildChatSupportRegisterUrl } from "../modules/auth/helpers/authRedirect";
import { CtaButton } from "../modules/layout/CtaButton";
import { PageContainer } from "../modules/layout/PageContainer";

const TX = "mentee_form_getting_started_screen";

/** Comfortable reading line-height for the longer body copy. */
const BODY_LINE_HEIGHT = "1.75";

/**
 * Pre-form briefing for people seeking support. A calm, generous document - no
 * card, no tinted banner - with a large title, an emphasised lead line, airy
 * body copy and a single "Kontynuuj" action that starts the intake form
 * (sending unauthenticated visitors through sign-up).
 */
const MenteeFormGettingStartedScreen = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const chatSupportHref = user ? "/form/mentee" : buildChatSupportRegisterUrl("/form/mentee");

    const Body = ({ tx }: { tx: string }) => (
        <Typography variant="largeRegular" tag="p" width="100%" style={{ lineHeight: BODY_LINE_HEIGHT }}>
            {t(`${TX}.${tx}`)}
        </Typography>
    );

    return (
        <Section paddingTop="$xxxl" paddingBottom="$xxxl" alignItems="center">
            <PageContainer maxWidth={860} gap="$xxl">
                {/* Heading */}
                <YStack gap="$md">
                    <Typography
                        variant="title1"
                        tag="h1"
                        width="100%"
                        style={{ fontSize: "clamp(36px, 5vw, 52px)", lineHeight: "1.1" }}
                    >
                        {t(`${TX}.header.title`)}
                    </Typography>
                    <Typography variant="largeRegular" muted maxWidth={640} width="100%" style={{ lineHeight: "1.6" }}>
                        {t(`${TX}.header.subtitle`)}
                    </Typography>
                </YStack>

                {/* Lead line */}
                <Typography variant="title3" tag="p" width="100%" style={{ lineHeight: "1.35" }}>
                    {t(`${TX}.content.p1`)}
                </Typography>

                {/* Body */}
                <YStack gap="$xl" width="100%">
                    <Body tx="content.p2" />
                    <Body tx="content.p3" />

                    <YStack gap="$md" width="100%" paddingLeft="$lg" borderLeftWidth={3} borderColor="$primaryBorder">
                        <Typography variant="title3" tag="h2" width="100%">
                            {t(`${TX}.content.chat_section.title`)}
                        </Typography>
                        <Body tx="content.chat_section.p4" />
                        <Body tx="content.chat_section.p5" />
                        <Body tx="content.chat_section.p6" />
                    </YStack>

                    <Body tx="content.p7" />
                    <Body tx="content.p8" />
                </YStack>

                {/* Closing + CTA */}
                <YStack gap="$xl" width="100%">
                    <Typography variant="title3" tag="p" color="$primary" width="100%">
                        {t(`${TX}.content.footer`)}
                    </Typography>
                    <Stack alignSelf="flex-start">
                        <CtaButton href={chatSupportHref} variant="primary">
                            {t(`${TX}.continue`, { defaultValue: "Kontynuuj" })}
                        </CtaButton>
                    </Stack>
                </YStack>
            </PageContainer>
        </Section>
    );
};

export default MenteeFormGettingStartedScreen;
