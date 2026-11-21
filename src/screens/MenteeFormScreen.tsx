import { YStack } from "@fundacja-peryskop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../modules/auth/components/AuthProvider";
import MenteeForm from "../modules/forms/components/MenteeForm";
import { getCanUserSendFormQueryOptions } from "../modules/forms/queries/getCanUserSendFormQueryOptions";
import sendFormMutation from "../modules/forms/queries/sendFormMutation";
import { formTypes, MenteeForm as MenteeFormType, MenteeFormValues } from "../modules/forms/types";
import { MY_CHAT_STATUS_QUERY_KEY } from "../modules/matching/queries/myChatStatusQueryOptions";
import Loader from "../modules/shared/components/Loader";

/** Where the person follows their request: the chat explains what happens next. */
const CHAT_HREF = "/chat";

const MenteeFormScreen = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: canSendMenteeForm, isLoading: isFormStatusLoading } = useQuery(
        getCanUserSendFormQueryOptions({ form_type: formTypes.MENTEE }, { enabled: !!user })
    );

    const { mutateAsync } = useMutation({
        mutationFn: sendFormMutation,
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

    // Sent: go straight to the chat. Matching runs while the form is saved, so
    // the conversation may already be there; otherwise the chat's empty state
    // explains that we are looking for a volunteer.
    const goToChat = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ["can-user-send-form"] });
        void queryClient.invalidateQueries({ queryKey: MY_CHAT_STATUS_QUERY_KEY });
        void queryClient.invalidateQueries({ queryKey: ["chats"] });
        navigate(CHAT_HREF, { replace: true });
    }, [navigate, queryClient]);

    if (isFormStatusLoading) {
        return (
            <YStack style={{ minHeight: "100dvh" }} alignItems="center" justifyContent="center">
                <Loader />
            </YStack>
        );
    }

    // Already in a conversation or waiting for one - the chat shows where things stand.
    if (canSendMenteeForm?.can_send_form === false) {
        return <Navigate to={CHAT_HREF} replace />;
    }

    return <MenteeForm onSubmit={handleSubmit} onSubmitted={goToChat} />;
};

export default MenteeFormScreen;
