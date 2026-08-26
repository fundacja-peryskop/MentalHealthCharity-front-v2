import { Button, YStack } from "@fundacja-peryskop/ui";
import { Form, FormikProvider, useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { FormTextField } from "../../../layout/form/FormTextField";
import { validation } from "../../../shared/constants";
import { ChangePasswordBeginPayload } from "../../types";

interface Props {
    onSubmit: (values: ChangePasswordBeginPayload) => void | Promise<void>;
    isLoading?: boolean;
}

const ChangePasswordBeginFormBegin = ({ onSubmit, isLoading }: Props) => {
    const { t } = useTranslation();

    const formik = useFormik<ChangePasswordBeginPayload>({
        initialValues: { email: "" },
        validationSchema: Yup.object({ email: validation.email }),
        onSubmit,
    });

    return (
        <FormikProvider value={formik}>
            <Form noValidate>
                <YStack gap="$lg">
                    <FormTextField name="email" label={t("form.email")} type="email" />
                    <Button variant="primary" fullWidth disabled={isLoading}>
                        {t("form.submit")}
                    </Button>
                </YStack>
            </Form>
        </FormikProvider>
    );
};

export default ChangePasswordBeginFormBegin;
