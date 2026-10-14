import { Section, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { HandHeart, Heart, MessageCircle } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../modules/auth/components/AuthProvider";
import { buildChatSupportRegisterUrl } from "../modules/auth/helpers/authRedirect";
import { CtaButton } from "../modules/layout/CtaButton";
import { PageContainer } from "../modules/layout/PageContainer";
import { ScrollHint } from "../modules/layout/ScrollHint";
import { useIconColor } from "../modules/layout/useIconColor";

const TX = "mentee_form_getting_started_screen";

/** Comfortable reading measure; the column starts on the shared page edge. */
const COLUMN_MAX_WIDTH = 680;
/** Generous line spacing for calm, easy reading. */
const BODY_LINE_HEIGHT = "1.8";

/**
 * Two soft, blurred brand-colour fields on the right - the only decoration,
 * matching "Jak to działa". The teal one starts well below the section top so
 * its blur fades out before reaching the header. The section clips them
 * (`overflow-x: clip`) so they never cause sideways scrolling on phones.
 */
const BLOB_CLASS = "mfgs-blob";
const BLOB_STYLE = `
.${BLOB_CLASS}{position:absolute;border-radius:9999px;filter:blur(72px);pointer-events:none;z-index:0;}
.${BLOB_CLASS}--teal{width:440px;height:440px;background:#c1ede9;top:180px;right:-120px;opacity:.8;}
.${BLOB_CLASS}--warm{width:360px;height:360px;background:#ffe0ae;bottom:8%;right:6%;opacity:.55;}
@media (max-width:767.98px){.${BLOB_CLASS}--teal{width:300px;height:300px;right:-170px;}.${BLOB_CLASS}--warm{width:260px;height:260px;right:-150px;}}
`;

function Paragraph({ children }: { children: ReactNode }) {
    return (
        <Typography variant="largeRegular" tag="p" width="100%" style={{ lineHeight: BODY_LINE_HEIGHT }}>
            {children}
        </Typography>
    );
}

/** A tiny three-dot ornament in the brand teal scale, used as a soft divider. */
function Ornament() {
    return (
        <XStack gap={6} aria-hidden>
            <Stack width={6} height={6} borderRadius="$full" backgroundColor="$primary" />
            <Stack width={6} height={6} borderRadius="$full" backgroundColor="$primaryLight" />
            <Stack width={6} height={6} borderRadius="$full" backgroundColor="$primaryLighter" />
        </XStack>
    );
}

/**
 * Pre-form briefing for people seeking support: a calm, minimal message read
 * top to bottom on the shared page edge, ending with a single "Kontynuuj"
 * action that starts the intake form (unauthenticated visitors go through
 * sign-up first). A floating hint invites scrolling while the button is still
 * below the fold.
 */
const MenteeFormGettingStartedScreen = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const icon = useIconColor();
    const ctaRef = useRef<HTMLDivElement>(null);
    const chatSupportHref = user ? "/form/mentee" : buildChatSupportRegisterUrl("/form/mentee");

    return (
        <Section
            paddingTop="$xxxl"
            paddingBottom="$xxxl"
            alignItems="center"
            position="relative"
            style={{ overflowX: "clip" }}
        >
            <style>{BLOB_STYLE}</style>
            <div className={`${BLOB_CLASS} ${BLOB_CLASS}--teal`} aria-hidden />
            <div className={`${BLOB_CLASS} ${BLOB_CLASS}--warm`} aria-hidden />

            <PageContainer position="relative" zIndex={1}>
                <YStack width="100%" maxWidth={COLUMN_MAX_WIDTH} gap="$xxl">
                    {/* Heading */}
                    <YStack gap="$md">
                        <Stack
                            width={52}
                            height={52}
                            borderRadius="$md"
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor="$primarySoft"
                            marginBottom="$sm"
                            aria-hidden
                        >
                            <HandHeart size={26} color={icon.primary} />
                        </Stack>
                        <Typography
                            variant="title1"
                            tag="h1"
                            width="100%"
                            style={{ fontSize: "clamp(34px, 5vw, 48px)", lineHeight: "1.15" }}
                        >
                            {t(`${TX}.header.title`)}
                        </Typography>
                        <Typography variant="largeRegular" muted width="100%" style={{ lineHeight: "1.6" }}>
                            {t(`${TX}.header.subtitle`)}
                        </Typography>
                    </YStack>

                    {/* Lead */}
                    <Typography variant="title3" tag="p" width="100%" style={{ lineHeight: "1.5", fontWeight: 600 }}>
                        {t(`${TX}.content.p1`)}
                    </Typography>

                    <Ornament />

                    {/* Body */}
                    <YStack gap="$lg" width="100%">
                        <Paragraph>{t(`${TX}.content.p2`)}</Paragraph>
                        <Paragraph>{t(`${TX}.content.p3`)}</Paragraph>
                    </YStack>

                    <YStack gap="$lg" width="100%">
                        <XStack alignItems="center" gap="$sm">
                            <Stack
                                width={32}
                                height={32}
                                borderRadius="$full"
                                alignItems="center"
                                justifyContent="center"
                                backgroundColor="$primarySoft"
                                flexShrink={0}
                                aria-hidden
                            >
                                <MessageCircle size={16} color={icon.primary} />
                            </Stack>
                            <Typography variant="title3" tag="h2">
                                {t(`${TX}.content.chat_section.title`)}
                            </Typography>
                        </XStack>
                        <Paragraph>{t(`${TX}.content.chat_section.p4`)}</Paragraph>
                        <Paragraph>{t(`${TX}.content.chat_section.p5`)}</Paragraph>
                        <Paragraph>{t(`${TX}.content.chat_section.p6`)}</Paragraph>
                    </YStack>

                    <YStack gap="$lg" width="100%">
                        <Paragraph>{t(`${TX}.content.p7`)}</Paragraph>
                        <Paragraph>{t(`${TX}.content.p8`)}</Paragraph>
                    </YStack>

                    <Ornament />

                    {/* Closing + CTA */}
                    <YStack gap="$xl" width="100%">
                        <XStack alignItems="center" gap="$sm">
                            <Heart size={20} color={icon.primary} fill={icon.primary} aria-hidden />
                            <Typography variant="title3" tag="p" color="$primaryTextSoft">
                                {t(`${TX}.content.footer`)}
                            </Typography>
                        </XStack>
                        <div ref={ctaRef} style={{ alignSelf: "flex-start" }}>
                            <CtaButton href={chatSupportHref} variant="primary">
                                {t(`${TX}.continue`, { defaultValue: "Kontynuuj" })}
                            </CtaButton>
                        </div>
                    </YStack>
                </YStack>
            </PageContainer>

            <ScrollHint target={ctaRef} label={t(`${TX}.footer.scroll_hint`)} />
        </Section>
    );
};

export default MenteeFormGettingStartedScreen;
