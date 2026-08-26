import { Button, Checkbox, Typography, YStack } from "@fundacja-peryskop/ui";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { AppLink } from "../../../layout/AppLink";
import { FormCheckboxField } from "../../../layout/form/FormCheckboxField";
import { FormTextField } from "../../../layout/form/FormTextField";
import { validation } from "../../../shared/constants";
import { LoginFormValues, RegisterFormValues } from "../../types";

interface Props {
    onSubmit: (values: RegisterFormValues) => void;
    initial?: LoginFormValues;
}

const RegisterForm = ({ onSubmit, initial }: Props) => {
    const { t } = useTranslation();

    const validationSchema = Yup.object({
        full_name: Yup.string().required(t("validation.required")),
        email: validation.email,
        password: validation.password,
        confirmPassword: validation.confirmPassword,
        policy_confirm: Yup.boolean().oneOf([true], t("validation.required")).required(t("validation.required")),
    });

    const initialValues: RegisterFormValues = {
        email: "",
        password: "",
        confirmPassword: "",
        policy_confirm: false,
        full_name: "",
        ...initial,
    };

    const policyLabel = (
        <Typography variant="smallRegular">
            Rejestrując się, akceptuję{" "}
            <AppLink href="/tos" variant="smallSemibold" color="$primary">
                warunki użytkowania i politykę prywatności
            </AppLink>
        </Typography>
    );

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
                <Form>
                    <YStack gap="$lg">
                        <FormTextField name="full_name" label="Imię lub ksywka" autoFocus />
                        <FormTextField name="email" label="Email" type="email" />
                        <FormTextField name="password" label="Hasło" type="password" />
                        <FormTextField name="confirmPassword" label="Potwierdź hasło" type="password" />

                        <YStack gap="$md">
                            <Checkbox defaultChecked size="sm" label="Zapamiętaj mnie" />
                            <FormCheckboxField name="policy_confirm" size="sm" label={policyLabel} />
                        </YStack>

                        <Button variant="primary" fullWidth disabled={isSubmitting}>
                            Zarejestruj
                        </Button>
                    </YStack>
                </Form>
            )}
        </Formik>
    );
};

export default RegisterForm;
