import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../modules/layout/AuthShell";
import handleApiError from "../modules/shared/helpers/handleApiError";
import ChangePasswordFormComplete from "../modules/users/components/ChangePasswordFormComplete";
import { changePasswordCompleteMutation } from "../modules/users/queries/changePasswordCompleteMutation";

const ChangePasswordCompleteScreen = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { mutate, isPending } = useMutation({
        mutationFn: changePasswordCompleteMutation,
        onSuccess: () => {
            navigate("/login");
            toast.success(t("change_password_complete.success_toast"));
        },
        onError: (err) => {
            handleApiError(err);
        },
    });

    return (
        <AuthShell
            title={t("change_password_form_complete.title")}
            subtitle={t("change_password_form_complete.description")}
        >
            <ChangePasswordFormComplete isLoading={isPending} onSubmit={mutate} />
        </AuthShell>
    );
};

export default ChangePasswordCompleteScreen;
