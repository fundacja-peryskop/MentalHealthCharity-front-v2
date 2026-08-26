import { Button, YStack } from "@fundacja-peryskop/ui";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { resetPasswordMutation } from "../modules/auth/queries/resetPasswordMutation";
import { ResetPasswordPayload } from "../modules/auth/types";
import { AppLink } from "../modules/layout/AppLink";
import { AuthShell } from "../modules/layout/AuthShell";
import { FormTextField } from "../modules/layout/form/FormTextField";
import { validation } from "../modules/shared/constants";

const ForgetPasswordScreen = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { mutate } = useMutation({
        mutationFn: resetPasswordMutation,
        onSuccess() {
            toast.success(t("auth.reset_password.success"));
            navigate("/login");
        },
    });

    const validationSchema = Yup.object({
        email: validation.email,
        token: validation.token,
        new_password: validation.password,
    });

    const handleSubmit = (values: ResetPasswordPayload) => {
        mutate(values);
    };

    const footer = (
        <AppLink href="/login" variant="smallSemibold" color="$primary">
            {t("auth.register.login_link")}
        </AppLink>
    );

    return (
        <AuthShell title={t("auth.reset_password.title")} subtitle={t("auth.reset_password.subtitle")} footer={footer}>
            <Formik<ResetPasswordPayload>
                initialValues={{ email: "", token: "", new_password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                <Form>
                    <YStack gap="$lg">
                        <FormTextField name="email" label="Adres e-mail" type="email" autoFocus />
                        <FormTextField name="token" label="Kod odzyskiwania" />
                        <FormTextField name="new_password" label="Nowe hasło" type="password" />
                        <Button variant="primary" fullWidth>
                            Zresetuj hasło
                        </Button>
                    </YStack>
                </Form>
            </Formik>
        </AuthShell>
    );
};

export default ForgetPasswordScreen;
