import { Button, Checkbox, XStack, YStack } from "@fundacja-peryskop/ui";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { AppLink } from "../../../layout/AppLink";
import { FormTextField } from "../../../layout/form/FormTextField";
import { LoginFormValues } from "../../types";

interface Props {
    onSubmit: (values: LoginFormValues) => void;
    disabled?: boolean;
    initial?: LoginFormValues;
}

const LoginForm = ({ onSubmit, initial, disabled }: Props) => {
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
                    <FormTextField name="email" label="Email" type="email" autoFocus />
                    <FormTextField name="password" label="Hasło" type="password" />

                    <XStack alignItems="center" justifyContent="space-between" gap="$md" flexWrap="wrap">
                        <Checkbox defaultChecked size="sm" label="Zapamiętaj mnie" />
                        <AppLink href="/auth/forget-password" variant="smallSemibold" color="$primary">
                            Przypomnij hasło
                        </AppLink>
                    </XStack>

                    <Button variant="primary" fullWidth disabled={disabled}>
                        Zaloguj
                    </Button>
                </YStack>
            </Form>
        </Formik>
    );
};

export default LoginForm;
