import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Modal from "../../../shared/components/Modal";
import { Roles } from "../../../users/constants";
import convertToCreateChatPayload from "../../helpers/convertToCreateChatPayload";
import createChatMutation from "../../queries/createChatMutation";
import { CreateChatFormValues } from "../../types";
import CreateChatForm from "../CreateChatForm";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const allowedAutoGroupRoles = [Roles.ADMIN, Roles.VOLUNTEER, Roles.VOLUNTEERSUPERVISOR, Roles.REDACTOR];

const CreateChatModal = ({ onSuccess, ...props }: Props) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: createChatMutation,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["chats"] });
            onSuccess?.();
            props.onClose();
        },
    });

    const handleCreateChat = async (values: CreateChatFormValues) => {
        if (!isPending) mutate(convertToCreateChatPayload(values));
    };

    return (
        <Modal
            {...props}
            hideCloseButton={isPending}
            onClose={() => {
                if (!isPending) props.onClose();
            }}
            title={t("chat.create_new_chat")}
        >
            <CreateChatForm
                isPending={isPending}
                onSubmit={handleCreateChat}
                allowedAutoGroupRoles={allowedAutoGroupRoles}
            />
        </Modal>
    );
};

export default CreateChatModal;
