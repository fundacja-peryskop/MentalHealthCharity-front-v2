import { Typography, XStack } from "@fundacja-peryskop/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../modules/auth/components/AuthProvider";
import LoginForm from "../modules/auth/components/LoginForm";
import { buildForwardedAuthSearch, getAuthRedirectTarget } from "../modules/auth/helpers/authRedirect";
import { LoginFormValues } from "../modules/auth/types";
import { AppLink } from "../modules/layout/AppLink";
import { AuthShell } from "../modules/layout/AuthShell";

const LoginScreen = () => {
    const { login } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const authSearch = buildForwardedAuthSearch(searchParams);

    const handleSubmit = (values: LoginFormValues) => {
        setLoading(true);
        login.mutate(values, {
            onSuccess: () => {
                navigate(getAuthRedirectTarget(searchParams));
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    const footer = (
        <XStack gap="$xs" alignItems="center" flexWrap="wrap" justifyContent="center">
            <Typography variant="smallRegular" muted>
                {t("auth.login.no_account")}
            </Typography>
            <AppLink href={`/auth/register${authSearch}`} variant="smallSemibold" color="$primary">
                {t("auth.login.register_link")}
            </AppLink>
        </XStack>
    );

    return (
        <AuthShell title={t("auth.login.title")} subtitle={t("auth.login.subtitle")} footer={footer}>
            <LoginForm disabled={loading} onSubmit={handleSubmit} />
        </AuthShell>
    );
};

export default LoginScreen;
