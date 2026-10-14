import { Typography, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../modules/auth/components/AuthProvider";
import LoginForm from "../modules/auth/components/LoginForm";
import { buildForwardedAuthSearch, getAuthRedirectTarget } from "../modules/auth/helpers/authRedirect";
import { LoginFormValues } from "../modules/auth/types";
import { AuthShell } from "../modules/layout/AuthShell";
import { AuthDivider } from "../modules/layout/auth/AuthDivider";
import { CtaButton } from "../modules/layout/CtaButton";

const LoginScreen = () => {
    const { login } = useUser();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const authSearch = buildForwardedAuthSearch(searchParams);

    const handleSubmit = (values: LoginFormValues) => {
        login.mutate(values, {
            onSuccess: () => navigate(getAuthRedirectTarget(searchParams)),
            // Errors are surfaced globally by the login mutation (toast).
        });
    };

    const footer = (
        <YStack gap="$lg" width="100%">
            <AuthDivider label={t("common.or")} />
            <YStack gap="$sm" alignItems="center">
                <Typography variant="smallRegular" muted>
                    {t("auth.login.no_account")}
                </Typography>
                <CtaButton href={`/auth/register${authSearch}`} variant="mutedPrimary" fullWidth borderRadius="$md">
                    {t("auth.actions.register")}
                </CtaButton>
            </YStack>
        </YStack>
    );

    return (
        <AuthShell title={t("auth.login.title")} subtitle={t("auth.login.subtitle")} footer={footer}>
            <LoginForm loading={login.isPending} onSubmit={handleSubmit} />
        </AuthShell>
    );
};

export default LoginScreen;
