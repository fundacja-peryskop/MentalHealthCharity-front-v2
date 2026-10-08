import { Typography, XStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { buildForwardedAuthSearch } from "../modules/auth/helpers/authRedirect";
import { AppLink } from "../modules/layout/AppLink";
import { AuthShell } from "../modules/layout/AuthShell";
import { AnimatedStatus } from "../modules/shared/components/AnimatedStatus";

/**
 * Post-registration "check your email" screen. Shares the auth split-screen
 * layout and leads with the reusable animated success mark (account created),
 * then the instruction to confirm via email and the recovery links.
 */
const ConfirmEmailScreen = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const authSearch = buildForwardedAuthSearch(searchParams);

    const footer = (
        <XStack gap="$xs" alignItems="center" flexWrap="wrap" justifyContent="center">
            <Typography variant="smallRegular" muted>
                {t("confirm_email_begin.footer")}
            </Typography>
            <AppLink href={`/auth/register${authSearch}`} variant="smallSemibold" color="$primary">
                {t("confirm_email_begin.change_email")}
            </AppLink>
            <AppLink href={`/login${authSearch}`} variant="smallSemibold" color="$primary">
                {t("confirm_email_begin.login")}
            </AppLink>
        </XStack>
    );

    return (
        <AuthShell footer={footer}>
            <AnimatedStatus title={t("confirm_email_begin.title")}>
                <Typography
                    variant="regularRegular"
                    muted
                    style={{ display: "block", width: "100%", textAlign: "center" }}
                >
                    {t("confirm_email_begin.description")}
                </Typography>
            </AnimatedStatus>
        </AuthShell>
    );
};

export default ConfirmEmailScreen;
