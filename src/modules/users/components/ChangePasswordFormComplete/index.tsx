import { Button, YStack } from "@fundacja-peryskop/ui";
import { Form, FormikProvider, useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { FormTextField } from "../../../layout/form/FormTextField";
import { validation } from "../../../shared/constants";

export interface ChangePasswordCompletePayload {
    token: string;
    new_password: string;
}

interface Props {
    onSubmit: (values: ChangePasswordCompletePayload) => void | Promise<void>;
    isLoading?: boolean;
}

interface FormValues {
    password: string;
    confirm_password: string;
    token: string;
}

const ChangePasswordFormComplete = ({ onSubmit, isLoading }: Props) => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const formik = useFormik<FormValues>({
        initialValues: {
            token: token || "",
            password: "",
            confirm_password: "",
        },
        validationSchema: Yup.object({
            token: Yup.string().required(t("validation.required")),
            password: validation.password,
            confirm_password: validation.confirmPassword,
        }),
        onSubmit: (values) => {
            const { token, password } = values;
            return onSubmit({ token, new_password: password });
        },
    });

    return (
        <FormikProvider value={formik}>
            <Form noValidate>
                <YStack gap="$lg">
                    {!token ? <FormTextField name="token" label={t("form.token")} /> : null}
                    <FormTextField
                        name="password"
                        label={t("change_password_form_complete.new_password")}
                        type="password"
                    />
                    <FormTextField name="confirm_password" label={t("common.password_confirmation")} type="password" />
                    <Button variant="primary" fullWidth disabled={isLoading}>
                        {t("form.submit")}
                    </Button>
                </YStack>
            </Form>
        </FormikProvider>
    );
};

export default ChangePasswordFormComplete;
