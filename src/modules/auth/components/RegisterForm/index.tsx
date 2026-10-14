import { Button, Typography, YStack } from "@fundacja-peryskop/ui";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { AppLink } from "../../../layout/AppLink";
import { FormCheckboxField } from "../../../layout/form/FormCheckboxField";
import { FormTextField } from "../../../layout/form/FormTextField";
import Loader from "../../../shared/components/Loader";
import { validation } from "../../../shared/constants";
import { LoginFormValues, RegisterFormValues } from "../../types";

interface Props {
    onSubmit: (values: RegisterFormValues) => void;
    /** Submission in progress - disables the form and shows a spinner. */
    loading?: boolean;
    initial?: LoginFormValues;
}

const RegisterForm = ({ onSubmit, initial, loading = false }: Props) => {
    const { t } = useTranslation();

    const validationSchema = Yup.object({
        full_name: Yup.string().required(t("validation.required")),
        email: validation.email,
        password: validation.password,
        confirmPassword: validation.confirmPassword,
        policy_confirm: Yup.boolean()
            .oneOf([true], t("validation.consent.required"))
            .required(t("validation.required")),
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
            {t("auth.register.policy_prefix")}{" "}
            <AppLink href="/tos" variant="smallSemibold" color="$primary">
                {t("auth.register.policy_link")}
            </AppLink>
        </Typography>
    );

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            <Form>
                <YStack gap="$lg">
                    <FormTextField
                        name="full_name"
                        label={t("auth.fields.full_name")}
                        placeholder={t("auth.fields.full_name_placeholder")}
                        autoFocus
                    />
                    <FormTextField
                        name="email"
                        type="email"
                        label={t("auth.fields.email")}
                        placeholder={t("auth.fields.email_placeholder")}
                    />
                    <FormTextField
                        name="password"
                        type="password"
                        label={t("auth.fields.password")}
                        placeholder={t("auth.fields.password_placeholder")}
                    />
                    <FormTextField
                        name="confirmPassword"
                        type="password"
                        label={t("auth.fields.confirm_password")}
                        placeholder={t("auth.fields.confirm_password_placeholder")}
                    />

                    <FormCheckboxField name="policy_confirm" size="sm" label={policyLabel} />

                    <Button variant="primary" fullWidth disabled={loading}>
                        {loading ? <Loader variant="small" size={20} /> : t("auth.actions.register")}
                    </Button>
                </YStack>
            </Form>
        </Formik>
    );
};

export default RegisterForm;
