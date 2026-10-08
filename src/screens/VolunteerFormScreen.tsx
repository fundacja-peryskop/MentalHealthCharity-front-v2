import { YStack } from "@fundacja-peryskop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUser } from "../modules/auth/components/AuthProvider";
import VolunteerForm from "../modules/forms/components/VolunteerForm";
import { getCanUserSendFormQueryOptions } from "../modules/forms/queries/getCanUserSendFormQueryOptions";
import sendFormMutation from "../modules/forms/queries/sendFormMutation";
import { formTypes, VolunteerForm as VolunteerFormType, VolunteerFormValues } from "../modules/forms/types";
import Loader from "../modules/shared/components/Loader";

const VolunteerFormScreen = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const queryClient = useQueryClient();

    const { data: canSendVolunteerForm, isLoading: isFormStatusLoading } = useQuery(
        getCanUserSendFormQueryOptions({ form_type: formTypes.VOLUNTEER }, { enabled: !!user })
    );
    const hasSubmittedVolunteerForm = canSendVolunteerForm?.can_send_form === false;

    const { mutateAsync } = useMutation({
        mutationFn: sendFormMutation,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["can-user-send-form", { form_type: formTypes.VOLUNTEER }] }),
        onError: () =>
            toast.error(t("form.submit_error", { defaultValue: "Nie udało się wysłać formularza. Spróbuj ponownie." })),
    });

    // The wizard awaits this; throwing keeps the user on the last step to retry.
    const handleSubmit = async (values: VolunteerFormValues) => {
        const fields: VolunteerFormType = {
            ...values,
            contacts: values.contacts.map((contact) => ({ name: contact, value: contact })),
            themes: values.themes.map((theme) => ({ name: theme, value: theme })),
        };
        await mutateAsync({ fields, form_type: formTypes.VOLUNTEER });
    };

    if (isFormStatusLoading) {
        return (
            <YStack style={{ minHeight: "100dvh" }} alignItems="center" justifyContent="center">
                <Loader />
            </YStack>
        );
    }

    return <VolunteerForm onSubmit={handleSubmit} startCompleted={hasSubmittedVolunteerForm} />;
};

export default VolunteerFormScreen;
