import { Button, XStack } from "@fundacja-peryskop/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EmailIcon from "../assets/static/email_icon.svg";
import { AuthShell } from "../modules/layout/AuthShell";
import { InfoScreen } from "../modules/layout/InfoScreen";
import handleApiError from "../modules/shared/helpers/handleApiError";
import ChangePasswordBeginFormBegin from "../modules/users/components/ChangePasswordFormBegin";
import { changePasswordBegin } from "../modules/users/queries/changePasswordBeginMutation";

const ChangePasswordScreen = () => {
    const [isCodeSent, setIsCodeSent] = useState(false);
    const { t } = useTranslation();

    const { mutate: beginMutation, isPending } = useMutation({
        mutationFn: changePasswordBegin,
        onSuccess: () => {
            setIsCodeSent(true);
        },
        onError: (err) => {
            handleApiError(err);
        },
    });

    if (isCodeSent) {
        return (
            <InfoScreen
                icon={<img src={EmailIcon} alt="" width={180} height={180} />}
                title={t("change_password_screen.email_sent_title")}
                description={t("change_password_screen.email_sent_description")}
            >
                <XStack gap="$xs" alignItems="center">
                    <Button variant="mutedPrimary" onPress={() => setIsCodeSent(false)}>
                        {t("common.try_again")}
                    </Button>
                </XStack>
            </InfoScreen>
        );
    }

    return (
        <AuthShell title={t("change_password_screen.title")} subtitle={t("change_password_screen.description")}>
            <ChangePasswordBeginFormBegin isLoading={isPending} onSubmit={beginMutation} />
        </AuthShell>
    );
};

export default ChangePasswordScreen;
