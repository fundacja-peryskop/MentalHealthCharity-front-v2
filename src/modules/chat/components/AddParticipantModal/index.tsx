import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { User } from "../../../auth/types";
import Modal from "../../../shared/components/Modal";
import { Roles } from "../../../users/constants";
import SearchUser from "../../../users/components/SearchUser";
import addParticipantMutation from "../../queries/addParticipantMutation";
import { Chat } from "../../types";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    chat: Chat;
    allowedRoles?: Roles[];
}

const AddParticipantModal = ({ chat, onSuccess, allowedRoles, ...props }: Props) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const validationSchema = Yup.object({
        participant: Yup.object().required(t("chat.participant_required")),
        chat_id: Yup.number().required(t("chat.id_required")),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: addParticipantMutation,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["chats"] });
            void queryClient.invalidateQueries({ queryKey: ["chat", { id: chat.id }] });
            onSuccess?.();
            props.onClose();
        },
    });

    const formik = useFormik<{
        participant: User | undefined;
        chat_id: number;
    }>({
        initialValues: {
            participant: undefined,
            chat_id: chat.id,
        },
        validationSchema,
        onSubmit: (values) => {
            if (values.participant && !isPending) {
                mutate({
                    chat_id: chat.id,
                    participant_id: values.participant?.id,
                });
            }
        },
    });

    return (
        <Modal
            {...props}
            hideCloseButton={isPending}
            onClose={() => {
                if (!isPending) props.onClose();
            }}
            title={t("chat.add_participant")}
        >
            <form onSubmit={formik.handleSubmit} noValidate className="flex min-h-[200px] flex-col gap-4">
                <SearchUser
                    onChange={(user) => {
                        formik.setFieldValue("participant", user);
                    }}
                    value={formik.values.participant}
                    allowedRoles={allowedRoles}
                />
                <Button disabled={!formik.dirty || isPending} type="submit">
                    {!formik.dirty ? t("common.make_changes_to_save") : t("common.submit")}
                </Button>
            </form>
        </Modal>
    );
};

export default AddParticipantModal;
