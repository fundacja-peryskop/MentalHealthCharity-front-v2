import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildForwardedAuthSearch } from "../modules/auth/helpers/authRedirect";
import { AppLink } from "../modules/layout/AppLink";
import { AuthShell } from "../modules/layout/AuthShell";
import { AnimatedStatus } from "../modules/shared/components/AnimatedStatus";
import Loader from "../modules/shared/components/Loader";
import { confirmEmailCompleteQueryOptions } from "../modules/users/queries/confirmEmailCompleteQueryOptions";

/** Time the success animation is shown before redirecting to login. */
const REDIRECT_DELAY_MS = 2600;

/** Whether the failure is the (common) expired/invalid-token case, for tailored copy. */
const isExpiredTokenError = (error: Error | null) => !!error && /invalid|expired|token/i.test(error.message);

/**
 * Finalises email confirmation from the `/confirm?token=...` link. Shows a
 * satisfying animated success (then auto-redirects to login) or a clear error
 * state - including the common "invalid or expired token" case - in the auth
 * split-screen style.
 */
const ConfirmEmailCompleteScreen = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const authSearch = buildForwardedAuthSearch(searchParams);
    const token = searchParams.get("token");

    const { isSuccess, isError, error } = useQuery(confirmEmailCompleteQueryOptions({ token: token || "" }));

    // A missing token is an invalid link.
    const failed = isError || !token;

    useEffect(() => {
        if (!isSuccess) return;
        const id = window.setTimeout(() => navigate(`/login${authSearch}`, { replace: true }), REDIRECT_DELAY_MS);
        return () => window.clearTimeout(id);
    }, [isSuccess, authSearch, navigate]);

    if (isSuccess) {
        return (
            <AuthShell>
                <AnimatedStatus variant="success" title={t("confirm_email_complete.success_title")}>
                    <YStack gap="$md" alignItems="center">
                        <Typography
                            variant="regularRegular"
                            muted
                            style={{ display: "block", width: "100%", textAlign: "center" }}
                        >
                            {t("confirm_email_complete.success_description")}
                        </Typography>
                        <Loader size={22} />
                    </YStack>
                </AnimatedStatus>
            </AuthShell>
        );
    }

    if (failed) {
        // A missing token, or an "invalid/expired token" response, is a bad link.
        const description =
            !token || isExpiredTokenError(error ?? null)
                ? t("confirm_email_complete.error_expired")
                : t("confirm_email_complete.error_description");

        const footer = (
            <YStack gap="$sm" alignItems="center" width="100%">
                <AppLink href={`/auth/register${authSearch}`} variant="regularSemibold" color="$primary">
                    {t("confirm_email_complete.register_again")}
                </AppLink>
                <AppLink href={`/login${authSearch}`} variant="smallSemibold" color="$colorMuted">
                    {t("auth.actions.login")}
                </AppLink>
            </YStack>
        );

        return (
            <AuthShell footer={footer}>
                <AnimatedStatus variant="error" title={t("confirm_email_complete.error_title")}>
                    <Typography
                        variant="regularRegular"
                        muted
                        style={{ display: "block", width: "100%", textAlign: "center" }}
                    >
                        {description}
                    </Typography>
                </AnimatedStatus>
            </AuthShell>
        );
    }

    return (
        <AuthShell>
            <YStack alignItems="center" gap="$md">
                <Loader size={44} />
                <Typography variant="title3" tag="h1" align="center">
                    {t("confirm_email_complete.loading_title")}
                </Typography>
                <Typography variant="regularRegular" muted align="center">
                    {t("confirm_email_complete.loading_text")}
                </Typography>
            </YStack>
        </AuthShell>
    );
};

export default ConfirmEmailCompleteScreen;
