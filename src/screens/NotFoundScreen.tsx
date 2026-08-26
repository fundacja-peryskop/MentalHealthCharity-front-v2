import { Button, Section, Typography, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../modules/layout/PageContainer";

/**
 * 404 screen, rebuilt on the design system. The app's `Layout` (rendered by
 * `App`) already provides the page chrome, so this screen only owns its content.
 */
const NotFoundScreen = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Section alignItems="center" justifyContent="center" minHeight="70vh" paddingVertical="$xxxl">
            <PageContainer alignItems="center" gap="$lg">
                <Typography
                    tag="span"
                    aria-hidden
                    color="$primary"
                    style={{ fontSize: 96, lineHeight: "96px", fontWeight: 700 }}
                >
                    404
                </Typography>
                <Typography variant="title2" tag="h1" align="center">
                    {t("not_found_screen.title")}
                </Typography>
                <Typography variant="largeRegular" muted align="center" maxWidth={520}>
                    {t("not_found_screen.subtitle")}
                </Typography>
                <YStack paddingTop="$sm">
                    <Button variant="primary" borderRadius="$full" onPress={() => navigate("/")}>
                        {t("common.navigation.home")}
                    </Button>
                </YStack>
            </PageContainer>
        </Section>
    );
};

export default NotFoundScreen;
