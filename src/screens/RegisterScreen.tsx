import { Stack, Typography, XStack } from "@fundacja-peryskop/ui";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../modules/auth/components/AuthProvider";
import RegisterForm from "../modules/auth/components/RegisterForm";
import {
    buildForwardedAuthSearch,
    CHAT_SUPPORT_INTENT,
    getAuthRedirectContext,
} from "../modules/auth/helpers/authRedirect";
import { RegisterFormValues } from "../modules/auth/types";
import { AppLink } from "../modules/layout/AppLink";
import { AuthShell } from "../modules/layout/AuthShell";
import { useIconColor } from "../modules/layout/useIconColor";

const RegisterScreen = () => {
    const { register } = useUser();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const icon = useIconColor();
    const authRedirect = getAuthRedirectContext(searchParams);
    const authSearch = buildForwardedAuthSearch(searchParams);
    const isChatSupportIntent = authRedirect.intent === CHAT_SUPPORT_INTENT;
    const subtitle = t(isChatSupportIntent ? "auth.register_chat_support.subtitle" : "auth.register.subtitle");

    const handleSubmit = (values: RegisterFormValues) => {
        register.mutate(
            {
                ...values,
                ...(authRedirect.intent ? { intent: authRedirect.intent } : {}),
                ...(authRedirect.next ? { next: authRedirect.next } : {}),
            },
            {
                onSuccess: () => {
                    navigate(`/auth/confirm-email-begin${authSearch}`);
                },
            }
        );
    };

    const notice = isChatSupportIntent ? (
        <XStack
            alignItems="flex-start"
            gap="$sm"
            marginTop="$md"
            paddingHorizontal="$md"
            paddingVertical="$sm"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$primaryBorder"
            backgroundColor="$primarySoft"
        >
            <Stack marginTop={2}>
                <ShieldCheck size={18} color={icon.primary} />
            </Stack>
            <Typography variant="smallRegular" color="$primaryTextSoft" align="left">
                {t("auth.register_chat_support.notice")}
            </Typography>
        </XStack>
    ) : undefined;

    const footer = (
        <XStack gap="$xs" alignItems="center" flexWrap="wrap" justifyContent="center">
            <Typography variant="smallRegular" muted>
                {t(isChatSupportIntent ? "auth.register_chat_support.has_account" : "auth.register.has_account")}
            </Typography>
            <AppLink href={`/login${authSearch}`} variant="smallSemibold" color="$primary">
                {t("auth.register.login_link")}
            </AppLink>
        </XStack>
    );

    return (
        <AuthShell
            title={t(isChatSupportIntent ? "auth.register_chat_support.title" : "auth.register.title")}
            subtitle={subtitle || undefined}
            notice={notice}
            footer={footer}
        >
            <RegisterForm onSubmit={handleSubmit} />
        </AuthShell>
    );
};

export default RegisterScreen;
