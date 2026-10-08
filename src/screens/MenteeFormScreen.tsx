import { YStack } from "@fundacja-peryskop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUser } from "../modules/auth/components/AuthProvider";
import MenteeForm from "../modules/forms/components/MenteeForm";
import { getCanUserSendFormQueryOptions } from "../modules/forms/queries/getCanUserSendFormQueryOptions";
import sendFormMutation from "../modules/forms/queries/sendFormMutation";
import { formTypes, MenteeForm as MenteeFormType, MenteeFormValues } from "../modules/forms/types";
import Loader from "../modules/shared/components/Loader";

const MenteeFormScreen = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const queryClient = useQueryClient();

    const { data: canSendMenteeForm, isLoading: isFormStatusLoading } = useQuery(
        getCanUserSendFormQueryOptions({ form_type: formTypes.MENTEE }, { enabled: !!user })
    );

    const { mutateAsync } = useMutation({
        mutationFn: sendFormMutation,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["can-user-send-form", { form_type: formTypes.MENTEE }] }),
        onError: () =>
            toast.error(t("form.submit_error", { defaultValue: "Nie udało się wysłać formularza. Spróbuj ponownie." })),
    });

    // The wizard awaits this; throwing keeps the user on the last step to retry.
    // `tos` and `email` are intentionally not sent (consent + account email).
    const handleSubmit = async (values: MenteeFormValues) => {
        const fields: MenteeFormType = {
            name: values.name,
            age: values.age,
            description: values.description,
            source: values.source,
            contact_preference: values.contact_preference as MenteeFormType["contact_preference"],
            contacts: values.contacts.map((contact) => ({ name: contact, value: contact })),
            phone: values.phone !== "" ? values.phone : "0",
        };
        await mutateAsync({ fields, form_type: formTypes.MENTEE });
    };

    if (isFormStatusLoading) {
        return (
            <YStack style={{ minHeight: "100dvh" }} alignItems="center" justifyContent="center">
                <Loader />
            </YStack>
        );
    }

    return <MenteeForm onSubmit={handleSubmit} startCompleted={canSendMenteeForm?.can_send_form === false} />;
};

export default MenteeFormScreen;
