import { Section, Typography, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { ChatDemo } from "../modules/how-it-works/components/ChatDemo";
import { PageContainer } from "../modules/layout/PageContainer";

/**
 * Two soft, blurred colour fields behind the chat window - a warm, friendly
 * backdrop in the brand tints. Decorative only; the section clips them
 * (`overflow-x: clip`) so they never cause sideways scrolling on phones.
 */
const BLOB_CLASS = "hiw-blob";
const BLOB_STYLE = `
.${BLOB_CLASS}{position:absolute;border-radius:9999px;filter:blur(64px);pointer-events:none;z-index:0;}
.${BLOB_CLASS}--teal{width:420px;height:420px;background:#c1ede9;top:4%;left:calc(50% - 520px);}
.${BLOB_CLASS}--warm{width:380px;height:380px;background:#ffe0ae;bottom:2%;left:calc(50% + 120px);opacity:.75;}
@media (max-width:767.98px){.${BLOB_CLASS}--teal{left:-180px;width:320px;height:320px;}.${BLOB_CLASS}--warm{left:auto;right:-160px;width:300px;height:300px;}}
`;

/**
 * "Jak to działa" - a presentational page. A short heading introduces an
 * animated demo conversation in which three people explain how Peryskop works,
 * ending with the two ways in: getting help, or volunteering.
 */
const HowItWorksScreen = () => {
    const { t } = useTranslation();

    return (
        <YStack backgroundColor="$background">
            <Section alignItems="center" paddingTop="$xxxl" paddingBottom="$xl">
                <PageContainer alignItems="center" gap="$md" maxWidth={720}>
                    <Typography
                        variant="title1"
                        tag="h1"
                        align="center"
                        style={{ fontSize: "clamp(34px, 5vw, 48px)", lineHeight: "1.15" }}
                    >
                        {t("how_it_works.title")}
                    </Typography>
                    <Typography variant="largeRegular" muted align="center" maxWidth={540}>
                        {t("how_it_works.subtitle")}
                    </Typography>
                </PageContainer>
            </Section>

            <Section
                alignItems="center"
                paddingTop="$md"
                paddingBottom="$xxxl"
                position="relative"
                style={{ overflowX: "clip" }}
            >
                <style>{BLOB_STYLE}</style>
                <div className={`${BLOB_CLASS} ${BLOB_CLASS}--teal`} aria-hidden />
                <div className={`${BLOB_CLASS} ${BLOB_CLASS}--warm`} aria-hidden />
                <PageContainer alignItems="center" position="relative" zIndex={1}>
                    <ChatDemo />
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default HowItWorksScreen;
