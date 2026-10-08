import { Button, XStack, YStack } from "@fundacja-peryskop/ui";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { AppLink } from "../../../layout/AppLink";
import { FormTextField } from "../../../layout/form/FormTextField";
import Loader from "../../../shared/components/Loader";
import { LoginFormValues } from "../../types";

interface Props {
    onSubmit: (values: LoginFormValues) => void;
    /** Submission in progress - disables the form and shows a spinner. */
    loading?: boolean;
    initial?: LoginFormValues;
}

const LoginForm = ({ onSubmit, initial, loading = false }: Props) => {
    const { t } = useTranslation();

    const validationSchema = Yup.object({
        email: Yup.string().email(t("validation.invalid_email")).required(t("validation.required")),
        password: Yup.string().min(8, t("validation.incorrect_password_format")).required(t("validation.required")),
    });

    const initialValues: LoginFormValues = { email: "", password: "", ...initial };

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            <Form>
                <YStack gap="$lg">
                    <FormTextField
                        name="email"
                        type="email"
                        label={t("auth.fields.email")}
                        placeholder={t("auth.fields.email_placeholder")}
                        autoFocus
                    />

                    <YStack gap="$sm">
                        <FormTextField
                            name="password"
                            type="password"
                            label={t("auth.fields.password")}
                            placeholder={t("auth.fields.password_placeholder")}
                        />
                        <XStack justifyContent="flex-end">
                            <AppLink href="/auth/forget-password" variant="smallSemibold" color="$primary">
                                {t("auth.login.forgot_password")}
                            </AppLink>
                        </XStack>
                    </YStack>

                    <Button variant="primary" fullWidth disabled={loading}>
                        {loading ? <Loader variant="small" size={20} /> : t("auth.actions.login")}
                    </Button>
                </YStack>
            </Form>
        </Formik>
    );
};

export default LoginForm;
